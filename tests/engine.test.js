import test from 'node:test';
import assert from 'node:assert/strict';
import { createUniverse, simulateNextEvent, simulateSeason, simulateWeeks } from '../src/engine.js';
import { renderPageForTest } from '../src/app.js';

test('creates the intended modern cycling world', () => {
  const state = createUniverse({ seed: 42 });
  assert.equal(state.teams.filter(team => team.status === 'active' && team.tier === 'worldtour').length, 18);
  assert.equal(state.teams.filter(team => team.status === 'active' && team.tier === 'proseries').length, 16);
  assert.ok(state.teams.filter(team => team.tier === 'u23').length >= 15);
  assert.ok(state.riders.length > 1000);
  assert.ok(state.directors.length > state.teams.length);
  assert.ok(state.events.some(event => event.tier === 'u23'));
  assert.ok(state.events.some(event => event.tier === 'continental'));
});

test('advances the universe by weeks and resolves every due race', () => {
  const state = createUniverse({ seed: 88 });
  const output = simulateWeeks(state, 4);
  assert.equal(state.currentDay, 29);
  assert.ok(output.results.length >= 1);
  assert.equal(state.eventIndex, output.results.length);
  assert.ok(output.results.every(result => result.year === 2026));
});

test('simulates a race with stages, classification and visible jerseys', () => {
  const state = createUniverse({ seed: 99 });
  let result;
  while (!result?.stages?.length || result.stages.length === 1) result = simulateNextEvent(state).result;
  assert.ok(result.stages.length > 1);
  assert.ok(result.classification.length >= 10);
  assert.ok(result.jerseys.points);
  assert.ok(result.jerseys.mountains);
  assert.ok(result.jerseys.young);
});


test('renders the reworked Chronicle navigation without missing data', () => {
  const state = createUniverse({ seed: 5150 });
  const results = renderPageForTest(state, 'results');
  const calendar = renderPageForTest(state, 'calendar');
  const races = renderPageForTest(state, 'races');
  const riders = renderPageForTest(state, 'riders');
  const teams = renderPageForTest(state, 'teams');
  const directors = renderPageForTest(state, 'directors');
  const stats = renderPageForTest(state, 'stats');
  assert.match(results, /results-browser/);
  assert.match(results, /data-action="simulate-1"/);
  assert.match(results, /data-action="simulate-4"/);
  assert.match(calendar, /data-tier="u23"/);
  assert.match(races, /race-card-grid/);
  assert.match(riders, /Rider career dossier|rider-grid/);
  assert.match(teams, /team-grid/);
  assert.match(directors, /director-grid/);
  assert.match(stats, /Grand Tours won/);
  assert.doesNotMatch(results + calendar + races + riders + teams + directors + stats, />undefined</);
});
test('completes a season and creates the statistical archive', () => {
  const state = createUniverse({ seed: 7 });
  simulateSeason(state);
  assert.equal(state.year, 2027);
  assert.equal(state.archives.length, 1);
  assert.ok(state.archives[0].raceWinners.length > 40);
  assert.ok(state.archives[0].directorRanking.length > 0);
  assert.ok(state.archives[0].summary.topRider);
  assert.equal(state.eventIndex, 0);
});

test('keeps a five-season chronicle structurally valid', () => {
  const state = createUniverse({ seed: 314159 });
  for (let year = 0; year < 5; year += 1) simulateSeason(state);
  const active = state.riders.filter(rider => !rider.retired);
  const rosterIds = state.teams.filter(team => team.status === 'active').flatMap(team => team.roster);
  assert.equal(state.year, 2031);
  assert.equal(state.archives.length, 5);
  assert.equal(state.teams.filter(team => team.status === 'active' && team.tier === 'worldtour').length, 18);
  assert.equal(state.teams.filter(team => team.status === 'active' && team.tier === 'proseries').length, 16);
  assert.equal(new Set(rosterIds).size, rosterIds.length);
  assert.equal(active.length, rosterIds.length);
  assert.equal(active.filter(rider => rider.tier === 'u23' && rider.age > 22).length, 0);
  assert.ok(JSON.stringify(state).length < 12_000_000);
});
