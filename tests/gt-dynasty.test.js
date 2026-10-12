// Grand Tour variety over several seasons: favourites win often, but not every year, and the
// same rider does not own the same race. Three universes, five seasons each.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createUniverse, simulateSeason, openNextSeason } from '../src/engine.js';

const editions = [];
for (const seed of [11, 22, 33]) {
  const state = createUniverse({ seed });
  for (let year = 0; year < 5; year += 1) {
    simulateSeason(state);
    for (const r of state.eventResults.filter((x) => x.kind === 'grand-tour')) editions.push({ seed, year: r.year, eventId: r.eventId, winnerId: r.winnerId, stages: r.stages });
    if (year < 4) openNextSeason(state);
  }
}
const inRange = (label, value, min, max) => assert.ok(value >= min && value <= max, `${label} = ${value.toFixed(3)}, expected ${min}–${max}`);

test('nobody owns a Grand Tour', () => {
  let repeats = 0, pairs = 0, most = 0;
  for (const seed of [11, 22, 33]) for (const id of ['giro', 'tour', 'vuelta']) {
    const list = editions.filter((e) => e.seed === seed && e.eventId === id).sort((a, b) => a.year - b.year).map((e) => e.winnerId);
    for (let i = 1; i < list.length; i += 1) { pairs += 1; if (list[i] === list[i - 1]) repeats += 1; }
    const counts = {}; for (const w of list) counts[w] = (counts[w] || 0) + 1; most = Math.max(most, ...Object.values(counts));
  }
  inRange('defending champion wins again', repeats / pairs, 0, 0.4);
  inRange('most wins of one Grand Tour in five seasons', most, 1, 3);
  const doubles = {}; for (const e of editions) { const k = `${e.seed}-${e.year}-${e.winnerId}`; doubles[k] = (doubles[k] || 0) + 1; }
  inRange('riders winning two Grand Tours in a season', Object.values(doubles).filter((n) => n >= 2).length / Object.keys(doubles).length, 0, 0.15);
});
