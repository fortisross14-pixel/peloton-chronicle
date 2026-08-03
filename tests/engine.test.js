import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRiderSkills, createUniverse, currentAbility, ELITE_TARGETS, facilityUpgradeCost, hallScore, openNextSeason, simulateNextEvent, simulateSeason, simulateWeeks, stageSkillRating, uciRankings, upgradeUniverse } from '../src/engine.js';
import { RARITIES } from '../src/data.js';
import { renderDirectorPageForTest, renderFilteredResultsForTest, renderPageForTest, renderRiderPageForTest, renderRidersForTest, renderTeamPageForTest, renderTeamsForTest } from '../src/app.js';

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

test('simulates a race with stages, classification, jersey identities and detailed rider records', () => {
  const state = createUniverse({ seed: 99 });
  let result;
  while (!result?.stages?.length || result.stages.length === 1) result = simulateNextEvent(state).result;
  assert.ok(result.stages.length > 1);
  assert.ok(result.classification.length >= 10);
  assert.ok(result.jerseys.points);
  assert.ok(result.jerseys.mountains);
  assert.ok(result.jerseys.young);
  const event = state.events.find(item => item.id === result.eventId);
  const edition = event.editions.at(-1);
  assert.equal(edition.jerseyWinners.mountains.id, result.jerseys.mountains);
  const stageWinner = state.riders.find(rider => rider.id === result.stages[0].winnerId);
  assert.ok(stageWinner.currentSeason.stageWinDetails.some(win => win.eventId === result.eventId));
});

test('results filters rebuild the race desk instead of leaving an unrelated race selected', () => {
  const state = createUniverse({ seed: 5150 });
  const results = renderFilteredResultsForTest(state, { tier: 'worldtour', type: 'grand-tour' });
  assert.match(results, /Giro d’Italia/);
  assert.match(results, /Tour de France/);
  assert.match(results, /La Vuelta a España/);
  assert.doesNotMatch(results, /Strade Bianche/);
  assert.match(results, /3 matching races/);
});

test('renders navigation, working race links and a full rider year breakdown', () => {
  const state = createUniverse({ seed: 5151 });
  simulateWeeks(state, 24);
  const results = renderPageForTest(state, 'results');
  const calendar = renderPageForTest(state, 'calendar');
  const races = renderPageForTest(state, 'races');
  const riders = renderPageForTest(state, 'riders');
  const teams = renderPageForTest(state, 'teams');
  const directors = renderPageForTest(state, 'directors');
  const stats = renderPageForTest(state, 'stats');
  const raceDetail = renderPageForTest(state, 'race-detail');
  const magazine = renderPageForTest(state, 'magazine');
  const rider = state.riders.find(item => item.currentSeason.stageWins > 0) || state.riders[0];
  const riderPage = renderRiderPageForTest(state, rider.id, 'history');
  assert.match(results, /results-browser/);
  assert.match(results, /data-open-race="[^"]+"/);
  assert.match(results, /data-action="simulate-1"/);
  assert.match(calendar, /data-tier="u23"/);
  assert.match(races, /race-card-grid/);
  assert.match(riders, /data-open-rider-page/);
  assert.match(teams, /team-grid/);
  assert.match(directors, /director-grid/);
  assert.match(stats, /Grand Tours won/);
  assert.match(raceDetail, /Mountains/);
  assert.match(raceDetail, /Young rider/);
  assert.match(magazine, /data-open-rider=/);
  assert.match(riderPage, /Complete year breakdown/);
  assert.match(riderPage, /Stages/);
  if (rider.currentSeason.stageWinDetails[0]) assert.ok(riderPage.includes(rider.currentSeason.stageWinDetails[0].event));
  assert.doesNotMatch(results + calendar + races + riders + teams + directors + stats + raceDetail + magazine + riderPage, />undefined</);
});

test('end of year closes the current season without opening the next one', () => {
  const state = createUniverse({ seed: 7 });
  const output = simulateSeason(state);
  assert.equal(state.year, 2026);
  assert.equal(state.seasonStatus, 'complete');
  assert.equal(state.archives.length, 0);
  assert.equal(state.pendingArchive.year, 2026);
  assert.ok(state.eventResults.length > 40);
  assert.ok(output.archive.raceWinners.length > 40);
  assert.ok(output.archive.directorRanking.length > 0);
  assert.ok(output.archive.summary.topRider);
  assert.equal(state.eventIndex, state.events.length);
  const review = renderPageForTest(state, 'results');
  assert.match(review, /Open 2027 season|Move to 2027/);
  assert.match(review, /2026 is complete/);
  assert.match(review, /2026 Season Review/);
  assert.match(review, /December 31/);
});

test('opening the next season archives the completed year and resets the calendar', () => {
  const state = createUniverse({ seed: 17 });
  simulateSeason(state);
  const result = openNextSeason(state);
  assert.equal(result.opened, true);
  assert.equal(state.year, 2027);
  assert.equal(state.seasonStatus, 'active');
  assert.equal(state.archives.length, 1);
  assert.equal(state.archives[0].year, 2026);
  assert.equal(state.eventResults.length, 0);
  assert.equal(state.eventIndex, 0);
});

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

test('Hall of Fame weighting places Tour plus Giro above five Monuments', () => {
  const base = createUniverse({ seed: 8080 }).riders[0];
  const grandTourRider = structuredClone(base);
  grandTourRider.career.raceWinDetails = [
    { eventId: 'tour', kind: 'grand-tour' },
    { eventId: 'giro', kind: 'grand-tour' }
  ];
  grandTourRider.career.grandTours = 2;
  const classicsRider = structuredClone(base);
  classicsRider.career.raceWinDetails = Array.from({ length: 5 }, (_, index) => ({ eventId: `monument-${index}`, kind: 'monument' }));
  classicsRider.career.monuments = 5;
  assert.ok(hallScore(grandTourRider) > hallScore(classicsRider));
});


test('repairs detailed opening-year wins in upgraded saves from permanent race editions', () => {
  const state = createUniverse({ seed: 424242 });
  simulateSeason(state);
  const rider = state.riders.find(item => item.career.seasons.some(season => season.year === 2026 && (season.stageWins > 0 || season.raceWins > 0 || season.jerseys > 0)));
  assert.ok(rider);
  const season = rider.career.seasons.find(item => item.year === 2026);
  const expected = { races: season.raceWins, stages: season.stageWins, jerseys: season.jerseys };
  season.raceWinDetails = [];
  season.stageWinDetails = [];
  season.jerseyWinDetails = [];
  state.version = 3;
  delete state.detailRepairV4;
  upgradeUniverse(state);
  assert.equal(season.raceWinDetails.length, expected.races);
  assert.equal(season.stageWinDetails.length, expected.stages);
  assert.equal(season.jerseyWinDetails.length, expected.jerseys);
});

test('renders full team and director pages with exact annual win lists', () => {
  const state = createUniverse({ seed: 98765 });
  simulateSeason(state);
  const team = state.teams.find(item => item.career.seasons.some(season => season.raceWins > 0));
  const director = state.directors.find(item => item.career.seasons.some(season => season.raceWins > 0));
  assert.ok(team);
  assert.ok(director);
  const teamPage = renderTeamPageForTest(state, team.id, 'history');
  const directorPage = renderDirectorPageForTest(state, director.id, 'history');
  const teamWin = team.career.seasons.find(season => season.raceWinDetails?.length)?.raceWinDetails[0]?.event;
  const directorWin = director.career.seasons.find(season => season.raceWinDetails?.length)?.raceWinDetails[0]?.event;
  assert.match(teamPage, /career-season-list/);
  assert.match(directorPage, /career-season-list/);
  if (teamWin) assert.ok(teamPage.includes(teamWin));
  if (directorWin) assert.ok(directorPage.includes(directorWin));
});

test('uses realistic Grand Tour gaps and official-style UCI ranking values',()=>{
  const state=createUniverse({seed:505});
  simulateSeason(state);
  for(const id of ['giro','tour','vuelta']){
    const result=state.eventResults.find(row=>row.eventId===id);
    assert.ok(result.classification[1].gap<=360,'runner-up should not casually finish tens of minutes behind');
    assert.ok(result.classification[9].gap<=2200,'top ten gaps should remain within a modern plausible range');
  }
  const ranking=uciRankings(state,'year');
  assert.ok(ranking.riders[0].points>1300);
  assert.ok(ranking.teams.length>=18);
  const tour=state.eventResults.find(row=>row.eventId==='tour');
  const tourWinner=ranking.riders.find(row=>row.id===tour.winnerId);
  assert.ok(tourWinner.points>=1300);
});

test('career plans are chronological and retirement targets are plausible',()=>{
  const state=createUniverse({seed:909});
  for(const rider of state.riders.filter(r=>!r.retired)){
    assert.ok(rider.retirementAge>=28);
    assert.ok(rider.careerLength>=10);
    const careerYear=state.year-rider.debutYear+1;
    assert.ok(careerYear>=1&&careerYear<=rider.careerLength);
    const dates=rider.targetEvents.map(id=>state.events.find(e=>e.id===id)).filter(Boolean).map(e=>e.month*100+e.day);
    assert.deepEqual(dates,[...dates].sort((a,b)=>a-b));
  }
});




test('facility investment becomes sharply more expensive near level ten', () => {
  assert.ok(facilityUpgradeCost(9.5, 10, 'worldtour') > facilityUpgradeCost(6, 6.5, 'worldtour') * 3);
});

test('rider and team filters and expanded economy cards render correctly', () => {
  const state = createUniverse({ seed: 445566 });
  const proTeams = renderTeamsForTest(state, { tier: 'proseries', sort: 'budget' });
  assert.match(proTeams, /Sort: budget/);
  assert.match(proTeams, /ProSeries/);
  assert.doesNotMatch(proTeams, /data-open-team-page="alpecin"/);
  const generational = renderRidersForTest(state, { rarity: 'generational' });
  assert.match(generational, /3 matching riders/);
  assert.match(generational, /Y\d+\/\d+/);
  assert.doesNotMatch(generational, /rarity legend/);
  const team = state.teams.find(item => item.tier === 'worldtour');
  const teamPage = renderTeamPageForTest(state, team.id, 'overview');
  assert.match(teamPage, /Primary · team name/);
  assert.match(teamPage, /Secondary · maillot/);
  assert.match(teamPage, /Projected balance/);
});


test('rarity fixes permanent base skill and annual skills average to base times multiplier', () => {
  const state = createUniverse({ seed: 131313 });
  for (const rider of state.riders.filter(item => !item.retired)) {
    const range = RARITIES[rider.rarity];
    assert.ok(rider.baseSkill >= range.min && rider.baseSkill <= range.max, `${rider.rarity} base ${rider.baseSkill}`);
    assert.equal(rider.potential, rider.baseSkill);
    const values = Object.values(rider.skills);
    assert.equal(values.length, 9);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    assert.equal(average, currentAbility(rider));
    assert.equal(average, Math.round(rider.baseSkill * rider.annualMultiplier));
  }
});

test('stage specialties redistribute the same average into relevant skills', () => {
  const common = { id:'skill-model-test', baseSkill:90, potential:90, careerLength:12, debutYear:2019, debutAge:18, age:25, developmentProfile:'stable' };
  const climber = buildRiderSkills({ ...common, terrain:'climber' }, 2026);
  const sprinter = buildRiderSkills({ ...common, terrain:'sprinter' }, 2026);
  const timeTrialist = buildRiderSkills({ ...common, terrain:'time-trialist' }, 2026);
  assert.equal(climber.annualRating, sprinter.annualRating);
  assert.equal(sprinter.annualRating, timeTrialist.annualRating);
  assert.ok(climber.skills.climbing > sprinter.skills.climbing);
  assert.ok(sprinter.skills.speed > climber.skills.speed);
  assert.ok(timeTrialist.skills.power > sprinter.skills.power);
  assert.ok(stageSkillRating({ ...common, terrain:'climber', skills:climber.skills, annualRating:climber.annualRating }, 'mountain') > stageSkillRating({ ...common, terrain:'sprinter', skills:sprinter.skills, annualRating:sprinter.annualRating }, 'mountain'));
});

test('deterministic stage winners exhibit the skills demanded by their terrain', () => {
  const state = createUniverse({ seed: 246810 });
  simulateSeason(state);
  const active = state.riders.filter(rider => !rider.retired);
  const populationClimbing = active.reduce((sum, rider) => sum + rider.skills.climbing, 0) / active.length;
  const populationSpeed = active.reduce((sum, rider) => sum + rider.skills.speed, 0) / active.length;
  const mountainWinners = state.eventResults.flatMap(result => result.stages.filter(stage => stage.profile === 'mountain').map(stage => state.riders.find(rider => rider.id === stage.winnerId))).filter(Boolean);
  const flatWinners = state.eventResults.flatMap(result => result.stages.filter(stage => stage.profile === 'flat').map(stage => state.riders.find(rider => rider.id === stage.winnerId))).filter(Boolean);
  assert.ok(mountainWinners.length > 10);
  assert.ok(flatWinners.length > 10);
  assert.ok(mountainWinners.reduce((sum, rider) => sum + rider.skills.climbing, 0) / mountainWinners.length > populationClimbing + 5);
  assert.ok(flatWinners.reduce((sum, rider) => sum + rider.skills.speed, 0) / flatWinners.length > populationSpeed + 5);
});

test('v1.2 saves migrate deterministically into the new rarity bands', () => {
  const state = createUniverse({ seed: 919191 });
  const rider = state.riders.find(item => item.rarity === 'legend');
  state.version = 8;
  rider.baseSkill = 89;
  rider.potential = 89;
  delete rider.skills;
  delete rider.annualRating;
  delete rider.annualMultiplier;
  upgradeUniverse(state);
  assert.equal(rider.baseSkill, 90);
  assert.equal(rider.potential, 90);
  assert.equal(Object.keys(rider.skills).length, 9);
  assert.equal(currentAbility(rider), Math.round(rider.baseSkill * rider.annualMultiplier));
});

test('rider overview exposes the fixed base, multiplier and individual skills', () => {
  const state = createUniverse({ seed: 929292 });
  const rider = state.riders.find(item => item.rarity === 'generational');
  const page = renderRiderPageForTest(state, rider.id, 'overview');
  assert.match(page, /Base skill/);
  assert.match(page, /Annual factor/);
  assert.match(page, /Current rating/);
  assert.match(page, /Rider skills/);
  assert.match(page, /Mental strength/);
});

test('rider totals, season programme, annual record and UCI ledger share the official race results', () => {
  const state = createUniverse({ seed: 20260803 });
  simulateSeason(state);
  const giroResult = state.eventResults.find(result => result.eventId === 'giro');
  assert.ok(giroResult);
  const rider = state.riders.find(item => item.id === giroResult.winnerId);
  assert.ok(rider);

  // Reproduce the reported case: the rider won a race that was not one of the
  // original calendar targets. The official start must still be visible.
  rider.targetEvents = rider.targetEvents.filter(id => id !== 'giro');

  const officialRaceWins = state.eventResults.filter(result => result.winnerId === rider.id).length;
  const officialStageWins = state.eventResults.flatMap(result => result.stages || []).filter(stage => stage.winnerId === rider.id).length;
  const officialPoints = state.uciPointEvents.filter(row => row.year === state.year && row.riderId === rider.id).reduce((sum, row) => sum + row.points, 0);
  assert.equal(rider.currentSeason.raceWins, officialRaceWins);
  assert.equal(rider.currentSeason.stageWins, officialStageWins);
  assert.equal(rider.currentSeason.uciPoints, officialPoints);
  assert.ok(rider.currentSeason.raceWinDetails.some(win => win.eventId === 'giro'));
  assert.ok(rider.currentSeason.grandTours >= 1);

  const programme = renderRiderPageForTest(state, rider.id, 'season');
  const history = renderRiderPageForTest(state, rider.id, 'history');
  assert.match(programme, /Giro d’Italia/);
  assert.match(programme, /Winner/);
  assert.match(programme, /Official start/);
  assert.match(history, /Giro d’Italia/);
  assert.match(history, new RegExp(`${officialPoints.toLocaleString('en-US').replaceAll(',', ',?')}|${officialPoints}`));

  const archived = rider.career.seasons.find(season => season.year === state.year);
  assert.ok(archived?.raceWinDetails?.some(win => win.eventId === 'giro'));
  assert.equal(archived.points, officialPoints);
});
