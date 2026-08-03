import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRiderSkills, createUniverse, currentAbility, dayOfYear, ELITE_TARGETS, facilityUpgradeCost, hallScore, openNextSeason, simulateNextEvent, simulateSeason, simulateWeeks, SPECIALTY_CORE_SKILLS, stageSkillRating, uciRankings, upgradeUniverse } from '../src/engine.js';
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
  for (const [rarity, target] of Object.entries(ELITE_TARGETS)) assert.equal(active.filter(rider => rider.rarity === rarity).length, target);
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
});

