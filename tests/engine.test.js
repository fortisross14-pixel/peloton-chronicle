import test from 'node:test';
import assert from 'node:assert/strict';
import { createUniverse, hallScore, openNextSeason, simulateNextEvent, simulateSeason, simulateWeeks, uciRankings, upgradeUniverse } from '../src/engine.js';
import { renderDirectorPageForTest, renderFilteredResultsForTest, renderPageForTest, renderRiderPageForTest, renderTeamPageForTest } from '../src/app.js';

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
  const riderPage = renderRiderPageForTest(state, rider.id);
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
  assert.ok(JSON.stringify(state).length < 16_000_000);
});

test('Hall of Fame weighting makes Tour plus Giro comparable to an elite Monument career', () => {
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
  const difference = Math.abs(hallScore(grandTourRider) - hallScore(classicsRider));
  assert.ok(difference < 500);
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
  const teamPage = renderTeamPageForTest(state, team.id);
  const directorPage = renderDirectorPageForTest(state, director.id);
  const teamWin = team.career.seasons.find(season => season.raceWinDetails?.length)?.raceWinDetails[0]?.event;
  const directorWin = director.career.seasons.find(season => season.raceWinDetails?.length)?.raceWinDetails[0]?.event;
  assert.match(teamPage, /Complete team year breakdown/);
  assert.match(directorPage, /Complete director year breakdown/);
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
