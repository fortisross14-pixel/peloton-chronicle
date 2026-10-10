import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRiderSkills, compactUniverseForSave, createUniverse, currentAbility, dayOfYear, ELITE_TARGETS, ELITE_LIMITS, facilityUpgradeCost, hallScore, openNextSeason, simulateNextEvent, simulateSeason, simulateWeeks, SPECIALTY_CORE_SKILLS, stageSkillRating, uciRankings, upgradeUniverse } from '../src/engine.js';
import { RARITIES } from '../src/data.js';
import { renderDirectorPageForTest, renderFilteredResultsForTest, renderPageForTest, renderRiderPageForTest, renderRidersForTest, renderTeamPageForTest, renderTeamsForTest } from '../src/app.js';

test('keeps a five-season chronicle structurally valid', () => {
  const state = createUniverse({ seed: 314159 });
  const openingBaseSkills = new Map(state.riders.map(rider => [rider.id, rider.baseSkill]));
  for (let year = 0; year < 5; year += 1) {
    simulateSeason(state);
    openNextSeason(state);
  }
  const active = state.riders.filter(rider => !rider.retired);
  const rosterIds = state.teams.filter(team => team.status === 'active').flatMap(team => team.roster);
  assert.equal(state.year, 2031);
  assert.equal(state.archives.length, 5);
  assert.equal(state.teams.filter(team => team.status === 'active' && team.tier === 'worldtour').length, 18);
  assert.equal(state.teams.filter(team => team.status === 'active' && team.tier === 'proseries').length, 16);
  assert.equal(new Set(rosterIds).size, rosterIds.length);
  assert.equal(active.length, rosterIds.length);
  assert.equal(active.filter(rider => rider.tier === 'u23' && rider.age > 22).length, 0);
  for (const [id, baseSkill] of openingBaseSkills) assert.equal(state.riders.find(rider => rider.id === id)?.baseSkill, baseSkill);
  for (const [rarity, limits] of Object.entries(ELITE_LIMITS)) { const count=active.filter(rider=>rider.rarity===rarity).length; assert.ok(count>=limits.min&&count<=limits.max, `${rarity} count ${count} outside ${limits.min}-${limits.max}`); }
  assert.equal(active.filter(rider => rider.potential >= 90 && rider.age >= 23 && rider.tier !== 'worldtour').length, 0);
  for (const team of state.teams.filter(team => team.status === 'active')) {
    assert.ok(team.primarySponsor?.name && team.secondarySponsor?.name);
    assert.ok(team.facilities >= 1 && team.facilities <= 10);
  }
  const yearsByDirector = new Map();
  for (const move of [...state.directorMoves].reverse()) {
    const years = yearsByDirector.get(move.directorId) || [];
    years.push(move.year);
    yearsByDirector.set(move.directorId, years);
  }
  for (const years of yearsByDirector.values()) for (let index = 1; index < years.length; index += 1) assert.ok(years[index] - years[index - 1] >= 2);
  assert.ok(state.sponsorLog.length > 0);
  assert.ok(state.tierChanges.length > 0);
  for (let year = 2027; year <= 2031; year += 1) {
    const eliteMoves = state.transfers.filter(move => move.year === year && ['generational', 'legend', 'epic'].includes(move.rarity));
    assert.ok(eliteMoves.length <= 6, `elite market should remain selective in ${year}`);
    assert.equal(eliteMoves.filter(move => move.fromTier === 'worldtour' && move.toTier !== 'worldtour').length, 0);
  }
  assert.ok(JSON.stringify(state).length < 16_000_000);
  // Competitive balance: no WorldTeam hoards stars once the market has run.
  for (const team of state.teams.filter(team => team.status === 'active' && team.tier === 'worldtour')) {
    const stars = team.roster.map(id => state.riders.find(rider => rider.id === id)).filter(rider => rider && ['generational', 'legend', 'epic'].includes(rider.rarity)).length;
    assert.ok(stars <= 3, `${team.name} holds ${stars} elite riders`);
  }

  // Saves are compacted, and a compacted save loads back to the same chronicle.
  const saved = JSON.stringify(compactUniverseForSave(state));
  assert.ok(saved.length < 10_000_000, `five-season save is ${(saved.length / 1e6).toFixed(1)} MB`);
  const loaded = upgradeUniverse(JSON.parse(saved));
  for (const rider of state.riders) {
    const copy = loaded.riders.find(item => item.id === rider.id);
    assert.equal(copy.career.raceWins, rider.career.raceWins, `${rider.name}: career wins changed through a save`);
    assert.equal(copy.career.uciPoints, rider.career.uciPoints);
    assert.equal(copy.career.stageWinDetails.length, rider.career.stageWinDetails.length);
    assert.equal(copy.career.seasons.length, rider.career.seasons.length);
  }
  const retiredStar = loaded.riders.filter(rider => rider.retired).sort((a, b) => b.career.raceWins - a.career.raceWins)[0];
  const retiredDomestique = loaded.riders.find(rider => rider.retired && rider.slimArchive);
  for (const rider of [retiredStar, retiredDomestique].filter(Boolean)) {
    for (const tab of ['overview', 'season', 'career', 'development', 'records']) {
      const html = renderRiderPageForTest(loaded, rider.id, tab);
      assert.ok(html.includes(rider.name), `${rider.name}'s ${tab} tab renders from a loaded save`);
      assert.ok(!html.includes('undefined') && !html.includes('NaN'), `${rider.name}'s ${tab} tab shows missing values`);
    }
  }
  if (retiredStar.career.raceWinDetails.length) assert.ok(retiredStar.career.raceWinDetails[0].event, 'race names are restored on load');
  simulateNextEvent(loaded);
  assert.ok(loaded.eventResults.length >= 1, 'a loaded save keeps simulating');
});

