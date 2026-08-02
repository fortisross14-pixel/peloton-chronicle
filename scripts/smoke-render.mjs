import { createUniverse, simulateWeeks } from '../src/engine.js';
import {
  renderDirectorPageForTest,
  renderPageForTest,
  renderRiderPageForTest,
  renderTeamPageForTest,
} from '../src/app.js';

const state = createUniverse({ seed: 7711, name: 'Render smoke' });
simulateWeeks(state, 12);
const pages = [
  'results', 'calendar', 'races', 'riders', 'teams', 'directors', 'transfers',
  'rankings', 'stats', 'magazine', 'almanac', 'hall', 'settings', 'race-detail',
];
const output = pages.map((page) => [page, renderPageForTest(state, page)]);
output.push(['rider-detail', renderRiderPageForTest(state, state.riders.find((rider) => !rider.retired).id, 'overview')]);
output.push(['team-detail', renderTeamPageForTest(state, state.teams.find((team) => team.status === 'active').id, 'overview')]);
output.push(['director-detail', renderDirectorPageForTest(state, state.directors.find((director) => !director.retired).id, 'overview')]);

for (const [name, html] of output) {
  if (!html || html.length < 300) throw new Error(`${name} rendered too little HTML`);
  if (/>undefined</.test(html) || />null</.test(html)) throw new Error(`${name} rendered an undefined/null value`);
  if (!html.includes('app-shell')) throw new Error(`${name} did not render the app shell`);
}
console.log(`Rendered ${output.length} screens without missing values.`);
