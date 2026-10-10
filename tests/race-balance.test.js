// Race balance guard: one simulated season in each of ten universes, covering one-day races,
// stage races and Grand Tours.
// These ranges describe how one-day racing should feel. If a change pushes a number out of
// its range, the test fails and names the number, so balance cannot drift unnoticed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createUniverse, simulateSeason } from '../src/engine.js';

const SEEDS = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1010];
// Rider types that can plausibly win each race.
const FIT = {
  sanremo: ['sprinter', 'puncheur', 'all-rounder', 'rouleur'],
  flanders: ['cobbles', 'rouleur', 'puncheur', 'all-rounder', 'time-trialist'],
  roubaix: ['cobbles', 'rouleur', 'time-trialist', 'all-rounder'],
  liege: ['puncheur', 'climber', 'all-rounder'],
  lombardia: ['climber', 'all-rounder', 'puncheur'],
  amstel: ['puncheur', 'all-rounder', 'climber'],
  fleche: ['puncheur', 'climber', 'all-rounder'],
  'san-sebastian': ['climber', 'puncheur', 'all-rounder'],
  e3: ['cobbles', 'rouleur', 'puncheur', 'all-rounder', 'time-trialist'],
  gent: ['sprinter', 'cobbles', 'rouleur', 'all-rounder'],
  copenhagen: ['sprinter', 'rouleur', 'all-rounder'],
  cyclassics: ['sprinter', 'rouleur', 'all-rounder'],
  'sprint-classic': ['sprinter', 'rouleur', 'all-rounder'],
  eschborn: ['sprinter', 'puncheur', 'all-rounder', 'rouleur']
};
const SPRINT_RACES = ['copenhagen', 'cyclassics', 'sprint-classic', 'eschborn', 'gent', 'kuurne'];

const races = [], stageRaces = [], worlds = [];
for (const seed of SEEDS) {
  const state = createUniverse({ seed });
  simulateSeason(state);
  worlds.push(state);
  const byId = new Map(state.riders.map((rider) => [rider.id, rider]));
  for (const result of state.eventResults) {
    if (result.race && result.race.winningMove !== 'itt') races.push({ result, winner: byId.get(result.winnerId) });
    if (result.stages.length > 1) stageRaces.push({ result, rider: (id) => byId.get(id) });
  }
}
const grandTours = stageRaces.filter(({ result }) => result.kind === 'grand-tour');
const median = (list) => { const sorted = [...list].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; };
const quantile = (list, q) => { const sorted = [...list].sort((a, b) => a - b); return sorted[Math.floor(q * (sorted.length - 1))]; };
const share = (list, predicate) => list.filter(predicate).length / Math.max(1, list.length);
const inRange = (label, value, min, max) => assert.ok(value >= min && value <= max, `${label} = ${value.toFixed(3)}, expected ${min}–${max}`);

test('one-day races are simulated over real routes with a coherent record', () => {
  assert.ok(races.length >= 250, `only ${races.length} one-day races simulated`);
  for (const { result } of races) {
    const { race, classification } = result;
    assert.equal(classification[0].riderId, result.winnerId);
    for (let i = 1; i < classification.length; i += 1) {
      assert.ok(Number.isInteger(classification[i].gap), `${result.eventName}: non-integer gap`);
      assert.ok(classification[i].gap >= classification[i - 1].gap, `${result.eventName}: gaps out of order`);
    }
    assert.equal(race.timeline.at(-1).kind, 'finish');
    assert.equal(race.timeline.at(-1).riderIds[0], result.winnerId, `${result.eventName}: story names a different winner`);
    for (let i = 1; i < race.snapshots.length; i += 1) assert.ok(race.snapshots[i].km >= race.snapshots[i - 1].km, `${result.eventName}: snapshots out of order`);
    assert.equal(race.snapshots.at(-1).km, race.distance);
    if (race.winningMove === 'break') assert.ok(race.breakaway.riderIds.includes(result.winnerId), `${result.eventName}: break winner was not in the break`);
  }
});

test('favourites usually win, but not always', () => {
  inRange('top favourite win share', share(races, ({ result }) => result.race.favorites[0] === result.winnerId), 0.25, 0.6);
  inRange('winner among top-3 favourites', share(races, ({ result }) => result.race.favorites.slice(0, 3).includes(result.winnerId)), 0.5, 0.85);
  inRange('winner outside top-6 favourites', share(races, ({ result }) => !result.race.favorites.includes(result.winnerId)), 0.05, 0.3);
});

test('races are won in different ways', () => {
  inRange('breakaway survives', share(races, ({ result }) => result.race.winningMove === 'break'), 0.02, 0.15);
  inRange('won from an attack in the finale', share(races, ({ result }) => result.race.winningMove === 'lead'), 0.2, 0.65);
  inRange('won from the main group', share(races, ({ result }) => result.race.winningMove === 'front'), 0.2, 0.6);
  const margins = races.map(({ result }) => result.classification[1]?.gap ?? 0).sort((a, b) => a - b);
  inRange('median winning margin (s)', margins[Math.floor(margins.length / 2)], 0, 20);
  inRange('90th percentile winning margin (s)', margins[Math.floor(margins.length * 0.9)], 20, 180);
});

test('the right kind of rider wins each race', () => {
  const judged = races.filter(({ result }) => FIT[result.eventId]);
  inRange('winners suited to the terrain', share(judged, ({ result, winner }) => FIT[result.eventId].includes(winner.terrain)), 0.7, 1);
  inRange('sprinters winning sprint classics', share(races.filter(({ result }) => SPRINT_RACES.includes(result.eventId)), ({ winner }) => winner.terrain === 'sprinter'), 0.45, 0.95);
  inRange('climbers winning flat sprint races', share(races.filter(({ result }) => ['copenhagen', 'cyclassics', 'sprint-classic'].includes(result.eventId)), ({ winner }) => winner.terrain === 'climber'), 0, 0.08);
});

// ---- Stage races ---------------------------------------------------------------------
test('stage races keep one consistent record from stage to stage', () => {
  assert.equal(grandTours.length, 30);
  for (const { result } of stageRaces) {
    assert.equal(result.gcProgress.length, result.stages.length);
    assert.deepEqual(result.gcProgress.at(-1).top10.map((row) => row.riderId), result.classification.slice(0, 10).map((row) => row.riderId), `${result.eventName}: final GC differs from the last stage`);
    for (const stage of result.stages) {
      assert.equal(stage.winnerId, stage.top5[0].riderId);
      assert.equal(stage.jerseys.gc, result.gcProgress[stage.number - 1].top10[0].riderId, `${result.eventName} stage ${stage.number}: leader's jersey on the wrong rider`);
      assert.equal(stage.race.timeline.filter((e) => e.kind === 'finish').at(-1).riderIds[0], stage.winnerId);
      if (stage.type === 'itt') assert.equal(stage.race.winningMove, 'itt');
    }
  }
});

test('Grand Tours start with full fields and are won by stage racers', () => {
  for (const { result } of grandTours) assert.ok(result.participantIds.length >= (result.eventId === 'vuelta' ? 110 : 150), `${result.eventName} ${result.year}: only ${result.participantIds.length} starters`);
  inRange('GT won by an Epic or better rider', share(grandTours, ({ result, rider }) => ['generational', 'legend', 'epic'].includes(rider(result.winnerId).rarity)), 0.55, 1);
  inRange('GT won by a climber, all-rounder, puncheur or time-triallist', share(grandTours, ({ result, rider }) => ['climber', 'all-rounder', 'puncheur', 'time-trialist'].includes(rider(result.winnerId).terrain)), 0.8, 1);
  inRange('median GT winning margin (s)', median(grandTours.map(({ result }) => result.classification[1].gap)), 40, 300);
  inRange('90th percentile GT winning margin (s)', quantile(grandTours.map(({ result }) => result.classification[1].gap), 0.9), 120, 600);
  inRange('median leader changes per GT', median(grandTours.map(({ result }) => result.stages.filter((s) => s.leaderChange).length)), 1, 5);
});

test('breakaways grow stronger as a Grand Tour wears on', () => {
  const weekShare = (from, to) => { const stages = grandTours.flatMap(({ result }) => result.stages.filter((s) => s.number >= from && s.number <= to && s.type !== 'itt')); return share(stages, (s) => s.race.winningMove === 'break'); };
  const week1 = weekShare(1, 9), week3 = weekShare(16, 21);
  inRange('breakaway stage wins, week 1', week1, 0.08, 0.35);
  inRange('breakaway stage wins, week 3', week3, 0.25, 0.6);
  assert.ok(week3 > week1, 'breakaways should succeed more often in the third week');
});

test('jerseys and stages go to the right kind of rider', () => {
  inRange('mountains jersey to a climber, puncheur or all-rounder', share(grandTours, ({ result, rider }) => ['climber', 'puncheur', 'all-rounder'].includes(rider(result.jerseys.mountains)?.terrain)), 0.75, 1);
  inRange('points jersey to a sprinter, puncheur, all-rounder or rouleur', share(grandTours, ({ result, rider }) => ['sprinter', 'puncheur', 'all-rounder', 'rouleur'].includes(rider(result.jerseys.points)?.terrain)), 0.75, 1);
  inRange('points and mountains won by the same rider', share(grandTours, ({ result }) => result.jerseys.points === result.jerseys.mountains), 0, 0.25);
  inRange('median most stage wins by one rider in a GT', median(grandTours.map(({ result }) => Math.max(...Object.values(result.stages.reduce((map, s) => ({ ...map, [s.winnerId]: (map[s.winnerId] || 0) + 1 }), {}))))), 2, 6);
  const stagesOf = (type) => grandTours.flatMap(({ result, rider }) => result.stages.filter((s) => s.type === type).map((s) => rider(s.winnerId).terrain));
  inRange('mountain stages won by climbers', share(stagesOf('mountain'), (t) => t === 'climber'), 0.5, 0.95);
  inRange('flat stages won by sprinters', share(stagesOf('flat'), (t) => t === 'sprinter'), 0.45, 0.95);
  inRange('time trials won by time-triallists, rouleurs or all-rounders', share(stagesOf('itt'), (t) => ['time-trialist', 'rouleur', 'all-rounder', 'cobbles'].includes(t)), 0.6, 1);
});

// ---- Crashes, illness and injuries ----------------------------------------------------
test('riders crash, fall ill and abandon at realistic rates', () => {
  inRange('median abandons per Grand Tour', median(grandTours.map(({ result }) => result.abandons.length)), 5, 25);
  for (const { result } of stageRaces) {
    const finishers = new Set(result.classification.map((row) => row.riderId));
    for (const abandon of result.abandons) {
      assert.ok(!finishers.has(abandon.riderId), `${result.eventName}: a rider who abandoned is in the final classification`);
      assert.ok(abandon.cause && abandon.stage >= 1, `${result.eventName}: abandon without a cause`);
    }
  }
  const crashes = races.reduce((sum, { result }) => sum + result.race.timeline.filter((e) => e.kind === 'crash').length, 0) / races.length;
  inRange('crashes per one-day race', crashes, 0.1, 0.8);
});

test('injured riders sit out until they have recovered', () => {
  let injured = 0;
  for (const state of worlds) {
    for (const rider of state.riders.filter((r) => r.injury && r.injury.weeks >= 2)) {
      injured += 1;
      const until = rider.injury.day + rider.injury.weeks * 7 - 1;
      const raced = (rider.raceLoadLog || []).filter((row) => row.year === rider.injury.year && row.start > rider.injury.day && row.start < until);
      assert.equal(raced.length, 0, `${rider.name} raced while injured (${rider.injury.cause})`);
    }
  }
  assert.ok(injured > 30, 'injuries should happen every season');
});
