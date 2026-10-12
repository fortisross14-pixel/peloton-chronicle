// Grand Tour balance checklist: several worlds x several seasons; prints each metric with PASS/FAIL.
// usage: node scripts/gt-checklist.mjs [engine path] [seeds] [seasons]   e.g. node scripts/gt-checklist.mjs "" 101,202,303 6
const E = await import(process.argv[2] ? new URL(process.argv[2], `file://${process.cwd()}/`).href : new URL("../src/engine.js", import.meta.url).href);
const seeds = (process.argv[3] || '101,202,303').split(',').map(Number);
const seasons = Number(process.argv[4] || 6);
const q = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(p * (b.length - 1))]; };
const share = (a, f) => a.filter(f).length / Math.max(1, a.length);
const FLAT_SPRINTERS = ['sprinter'];
const gts = []; const worlds = [];
const t0 = Date.now();
for (const seed of seeds) {
  const s = E.createUniverse({ seed });
  const world = { seed, editions: [] };
  for (let y = 0; y < seasons; y += 1) {
    // step event by event so we can capture pre-race favourites of Grand Tours
    while (s.seasonStatus !== 'complete') {
      const ev = s.events[s.eventIndex];
      let favs = null;
      if (ev && ['giro', 'tour', 'vuelta'].includes(ev.id)) favs = E.projectedFavorites(s, ev, 5).map((r) => r.id);
      if (!ev) { E.simulateWeeks(s, 1); continue; }
      const out = E.simulateWeeks(s, 1);
      if (favs) {
        const r = s.eventResults.find((x) => x.eventId === ev.id && x.year === s.year) || out.results.find((x) => x.eventId === ev.id);
        if (r) { const R = new Map(s.riders.map((z) => [z.id, z])); const rec = { year: s.year, seed, r, favs, rider: (id) => R.get(id) }; gts.push(rec); world.editions.push(rec); }
      }
    }
    if (y < seasons - 1) E.openNextSeason(s);
  }
  worlds.push(world);
}
const checks = [];
const check = (label, value, ok, fmt = (v) => (typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v)) => checks.push({ label, value: fmt(value), ok });

const maxWins = gts.map(({ r }) => Math.max(...Object.values(r.stages.reduce((m, s) => ({ ...m, [s.winnerId]: (m[s.winnerId] || 0) + 1 }), {}))));
check('Most stage wins by one rider — median (≤3)', q(maxWins, 0.5), q(maxWins, 0.5) <= 3);
check('Most stage wins by one rider — 90th pct (≤5)', q(maxWins, 0.9), q(maxWins, 0.9) <= 5);
check('Most stage wins by one rider — max (≤6)', Math.max(...maxWins), Math.max(...maxWins) <= 6);
const distinct = gts.map(({ r }) => new Set(r.stages.map((s) => s.winnerId)).size);
check('Different stage winners per GT — median (≥13)', q(distinct, 0.5), q(distinct, 0.5) >= 13);
const gcWinnerStages = gts.map(({ r }) => r.stages.filter((s) => s.winnerId === r.winnerId).length);
check('Stage wins by the GC winner — median (≤2)', q(gcWinnerStages, 0.5), q(gcWinnerStages, 0.5) <= 2);
check('Stage wins by the GC winner — 90th pct (≤4)', q(gcWinnerStages, 0.9), q(gcWinnerStages, 0.9) <= 4);
const tookLead = gts.map(({ r }) => { let first = r.stages.length; for (let i = r.stages.length - 1; i >= 0 && r.stages[i].jerseys.gc === r.winnerId; i -= 1) first = i + 1; return first; });
check('Stage where the winner takes the jersey for good — median (≥9)', q(tookLead, 0.5), q(tookLead, 0.5) >= 9);
check('Wire-to-wire (winner leads from stage ≤4) — share (≤18%)', share(tookLead, (x) => x <= 4), share(tookLead, (x) => x <= 4) <= 0.18);
check('Leader from stage 1–2 to the end — share (info)', share(tookLead, (x) => x <= 2), true);
const changes = gts.map(({ r }) => r.stages.filter((s) => s.leaderChange).length);
check('Leader changes per GT — median (3–7)', q(changes, 0.5), q(changes, 0.5) >= 3 && q(changes, 0.5) <= 7);
const leaders = gts.map(({ r }) => new Set(r.stages.map((s) => s.jerseys.gc)).size);
check('Different jersey wearers per GT — median (≥3)', q(leaders, 0.5), q(leaders, 0.5) >= 3);
const margin = gts.map(({ r }) => r.classification[1].gap);
check('Winning margin (s) — median (45–240)', q(margin, 0.5), q(margin, 0.5) >= 45 && q(margin, 0.5) <= 240);
check('Winning margin (s) — 90th pct (≤540)', q(margin, 0.9), q(margin, 0.9) <= 540);
const top3after15 = gts.map(({ r }) => (r.gcProgress[14]?.top10 || []).findIndex((x) => x.riderId === r.winnerId));
check('Winner was not leading after stage 15 — share (≥20%)', share(top3after15, (x) => x !== 0), share(top3after15, (x) => x !== 0) >= 0.2);
check('Top favourite wins — share (30–55%)', share(gts, ({ r, favs }) => favs[0] === r.winnerId), share(gts, ({ r, favs }) => favs[0] === r.winnerId) >= 0.3 && share(gts, ({ r, favs }) => favs[0] === r.winnerId) <= 0.55);
check('Winner from outside the top-3 favourites — share (≥10%)', share(gts, ({ r, favs }) => !favs.slice(0, 3).includes(r.winnerId)), share(gts, ({ r, favs }) => !favs.slice(0, 3).includes(r.winnerId)) >= 0.1);
// repeat winners across years
let repeat = 0, pairs = 0, maxSameRace = 0; const winnersPerWorld = [];
for (const w of worlds) {
  const by = {}; for (const e of w.editions) (by[e.r.eventId] ||= []).push(e.r.winnerId);
  for (const list of Object.values(by)) { for (let i = 1; i < list.length; i += 1) { pairs += 1; if (list[i] === list[i - 1]) repeat += 1; } const c = {}; for (const id of list) c[id] = (c[id] || 0) + 1; maxSameRace = Math.max(maxSameRace, ...Object.values(c)); }
  winnersPerWorld.push(new Set(w.editions.map((e) => e.r.winnerId)).size / w.editions.length);
}
check('Defending champion wins the same GT again — share (5–35%)', repeat / pairs, repeat / pairs >= 0.05 && repeat / pairs <= 0.35);
check(`Most wins of one GT by one rider in ${seasons} seasons (≤3)`, maxSameRace, maxSameRace <= 3);
check('Different GT winners / editions per world — mean (≥45%)', winnersPerWorld.reduce((a, b) => a + b, 0) / winnersPerWorld.length, winnersPerWorld.reduce((a, b) => a + b, 0) / winnersPerWorld.length >= 0.45);
const doubles = []; for (const w of worlds) { const by = {}; for (const e of w.editions) { const k = `${e.r.year}-${e.r.winnerId}`; by[k] = (by[k] || 0) + 1; } doubles.push(...Object.values(by)); }
check('Riders winning 2+ GTs in one season — share of seasons-winners (≤15%)', share(doubles, (x) => x >= 2), share(doubles, (x) => x >= 2) <= 0.15);
// specialists
const stagesOf = (type) => gts.flatMap(({ r, rider }) => r.stages.filter((s) => s.type === type).map((s) => ({ s, r, w: rider(s.winnerId) })));
const flat = stagesOf('flat'), mtn = stagesOf('mountain'), itt = stagesOf('itt'), hilly = stagesOf('hilly');
check('Flat stages won by sprinters (≥70%)', share(flat, (x) => FLAT_SPRINTERS.includes(x.w.terrain)), share(flat, (x) => FLAT_SPRINTERS.includes(x.w.terrain)) >= 0.7);
const flatBunch = flat.filter((x) => x.s.race.winningMove === 'front');
check('Bunch sprints won by a GC top-10 rider (≤5%)', share(flatBunch, (x) => x.r.classification.slice(0, 10).some((c) => c.riderId === x.s.winnerId)), share(flatBunch, (x) => x.r.classification.slice(0, 10).some((c) => c.riderId === x.s.winnerId)) <= 0.05);
check('Mountain stages won by climbers (≥55%)', share(mtn, (x) => x.w.terrain === 'climber'), share(mtn, (x) => x.w.terrain === 'climber') >= 0.55);
check('Time trials won by TT riders/rouleurs (≥50%)', share(itt, (x) => ['time-trialist', 'rouleur'].includes(x.w.terrain)), share(itt, (x) => ['time-trialist', 'rouleur'].includes(x.w.terrain)) >= 0.5);
check('Hilly stages won by puncheurs/breakaway types (info)', share(hilly, (x) => ['puncheur'].includes(x.w.terrain)), true);
const versatile = gts.map(({ r, rider }) => { const kinds = {}; for (const s of r.stages) { const k = s.type === 'flat' ? 'flat' : s.type === 'mountain' ? 'mountain' : s.type === 'itt' ? 'itt' : null; if (k) (kinds[s.winnerId] ||= new Set()).add(k); } return Math.max(0, ...Object.values(kinds).map((x) => x.size)); });
check('A rider wins flat + mountain + TT in one GT (≤2%)', share(versatile, (x) => x >= 3), share(versatile, (x) => x >= 3) <= 0.02);
const flatAndMtn = gts.map(({ r }) => { const f = new Set(r.stages.filter((s) => s.type === 'flat' && s.race.winningMove === 'front').map((s) => s.winnerId)); return r.stages.some((s) => s.type === 'mountain' && f.has(s.winnerId)); });
check('A bunch-sprint winner also wins a mountain stage (≤8%)', share(flatAndMtn, Boolean), share(flatAndMtn, Boolean) <= 0.08);
check('GT won by climber / all-rounder (≥75%)', share(gts, ({ r, rider }) => ['climber', 'all-rounder'].includes(rider(r.winnerId).terrain)), share(gts, ({ r, rider }) => ['climber', 'all-rounder'].includes(rider(r.winnerId).terrain)) >= 0.75);
const pk = gts.map(({ r, rider }) => rider(r.jerseys.points)?.terrain);
check('Points jersey to a sprinter (≥60%)', share(pk, (t) => t === 'sprinter'), share(pk, (t) => t === 'sprinter') >= 0.6);
const winnerTerrain = {}; for (const { r, rider } of gts) { const t = rider(r.winnerId); const k = `${t.terrain}/${t.rarity}`; winnerTerrain[k] = (winnerTerrain[k] || 0) + 1; }

console.log(`${gts.length} Grand Tours · ${seeds.length} worlds × ${seasons} seasons · ${Math.round((Date.now() - t0) / 1000)} s`);
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.label}: ${c.value}`);
console.log('winner types', JSON.stringify(winnerTerrain));
console.log(`${checks.filter((c) => !c.ok).length} failing`);
