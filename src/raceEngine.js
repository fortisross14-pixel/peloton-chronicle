// Race engine.
// A road race is ridden kilometre by kilometre over its real route: a breakaway forms, the
// peloton lets it go and then chases, each climb or cobbled sector thins the front group,
// favourites attack in the finale, chasers organise, and the line decides the rest.
// Every result (order, time gaps) comes from that single run, and every decisive moment
// is recorded so the playback and the race story replay exactly what happened.
//
// The same core rides one-day races and the stages of stage races. A stage adds a race
// situation: general-classification times, team leaders with domestiques, fatigue carried
// from earlier stages, and the tactical choices that follow (who may join the break, when
// the leader's team lets it go, when it must chase).
import { routeForEvent, FINISH_LABELS, SECTOR_LABELS } from './routes.js';

const PROFILES = ['flat', 'hill', 'climb', 'cobbles', 'cobbledClimb', 'gravel', 'sprint', 'punch', 'descend', 'tt'];
const SECTOR_MIX = {
  climbShort: { hill: 1 },
  climbSteep: { hill: 0.5, climb: 0.5 },
  climbLong: { climb: 0.85, hill: 0.15 },
  'cobbled-climb': { cobbledClimb: 1 },
  cobbles: { cobbles: 1 },
  gravel: { gravel: 1 }
};
const FINISH_MIX = {
  sprint: { sprint: 0.85, flat: 0.15 },
  'reduced-sprint': { sprint: 0.65, punch: 0.35 },
  'small-group': { punch: 0.5, sprint: 0.3, hill: 0.2 },
  uphill: { punch: 0.6, hill: 0.4 },
  summit: { climb: 1 },
  descent: { climb: 0.5, descend: 0.5 },
  velodrome: { sprint: 0.6, cobbles: 0.4 }
};
const GROUP_SPRINT_MIX = { sprint: 0.75, punch: 0.25 };
const SPRINT_FINISHES = new Set(['sprint', 'reduced-sprint', 'velodrome']);
// Seconds lost per point of score difference within a group arriving together.
const FINISH_SPREAD = { sprint: 0, 'reduced-sprint': 0, velodrome: 0, 'small-group': 0.12, descent: 0.15, uphill: 0.9, summit: 1.6 };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function sectorMix(sector) {
  if (sector.type === 'climb') return (sector.length || 2) >= 4 ? SECTOR_MIX.climbLong : sector.difficulty >= 7 ? SECTOR_MIX.climbSteep : SECTOR_MIX.climbShort;
  return SECTOR_MIX[sector.type] || SECTOR_MIX.climbShort;
}
export function climbCategory(difficulty) { return difficulty >= 9 ? 0 : difficulty >= 7 ? 1 : difficulty >= 5 ? 2 : difficulty >= 3 ? 3 : 4; }
function nameList(list) {
  const names = list.map((entry) => entry.rider.name);
  if (names.length <= 1) return names[0] || '';
  if (names.length > 4) return `${names.slice(0, 3).join(', ')} and ${names.length - 3} others`;
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}
// Crashes: most riders get up and carry on, some ride on hurt, a few cannot continue.
function crashOutcome(random) {
  const roll = random();
  if (roll < 0.5) return { severity: 'minor', weeks: 0 };
  if (roll < 0.72) return { severity: 'hurt', weeks: 1 + Math.floor(random() * 2) };
  const r = random();
  return { severity: 'out', weeks: r < 0.6 ? 2 + Math.floor(random() * 3) : r < 0.9 ? 5 + Math.floor(random() * 5) : r < 0.98 ? 10 + Math.floor(random() * 7) : 20 + Math.floor(random() * 11) };
}
export function injuryName(weeks, kind = 'crash') {
  if (kind === 'illness') return weeks >= 3 ? 'a serious illness' : 'illness';
  return weeks <= 2 ? 'bruising and road rash' : weeks <= 4 ? 'a broken wrist' : weeks <= 9 ? 'a broken collarbone' : weeks <= 16 ? 'a fractured pelvis' : 'a broken femur';
}
const ordinal = (n) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;

// What a one-day race asks for: its hardest sectors plus its finish, as profile weights.
// Used for race targeting so specialists plan their seasons around the right races.
const SIGNATURE_CACHE = new Map();
export function routeTerrainSignature(event, year) {
  const key = `${event.id}|${year}`; if (SIGNATURE_CACHE.has(key)) return SIGNATURE_CACHE.get(key);
  const route = routeForEvent(event, year), hard = [...route.sectors].sort((a, b) => b.difficulty - a.difficulty).slice(0, 4), total = hard.reduce((sum, s) => sum + s.difficulty, 0) || 1, signature = {};
  const add = (mix, weight) => { for (const [profile, w] of Object.entries(mix)) signature[profile] = (signature[profile] || 0) + w * weight; };
  for (const sector of hard) add(sectorMix(sector), (sector.difficulty / total) * 0.6);
  add(FINISH_MIX[route.finish] || FINISH_MIX['small-group'], hard.length ? 0.4 : 1);
  SIGNATURE_CACHE.set(key, signature); return signature;
}
export function formatRaceGap(seconds) {
  const s = Math.max(0, Math.round(seconds)), m = Math.floor(s / 60);
  return m ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
}
export function buildRaceRiders(participants, power, random, { dayRange = 15, carry = null } = {}) {
  return participants.map(({ rider, team }) => {
    const p = {};
    for (const profile of PROFILES) p[profile] = power(rider, profile, team);
    const startWear = carry?.get(rider.id) || 0;
    return { rider, team, id: rider.id, p, day: (random() - 0.5) * dayRange, wear: startWear, startWear, status: 'front', lost: 0, endurance: rider.skills?.endurance ?? 70 };
  });
}

/** One-day road race over the event's route. */
export function simulateOneDayRace({ event, year, participants, random, power }) {
  const route = routeForEvent(event, year);
  const riders = buildRaceRiders(participants, power, random, { dayRange: 19 });
  const out = rideRoad({ route, riders, random, recordSnapshots: true });
  return { order: out.order, race: out.race, incidents: out.incidents };
}

/**
 * The core: ride one road race or stage.
 * @param route    { distance, finish, sectors[], sprintKm? }
 * @param riders   prepared by buildRaceRiders
 * @param stage    optional race situation for stages:
 *   { number, total, week, gc: Map(id→seconds behind leader), gcRank: Map(id→rank),
 *     komPoints: Map, badDay: Map(id→size), recordSnapshots }
 */
export function rideRoad({ route, riders, random, stage = null, recordSnapshots = true }) {
  const distance = route.distance, timeline = [], snapshots = [], summits = [];
  let sprintResult = null;
  const score = (r, mix, noise = 0) => Object.entries(mix).reduce((sum, [key, weight]) => sum + r.p[key] * weight, 0) + r.day - r.wear + (noise ? (random() - 0.5) * noise : 0);
  const inGroup = (status) => riders.filter((r) => r.status === status);
  const log = (km, kind, text, list = [], extra = {}) => timeline.push({ km: Math.round(km), kind, text, riderIds: list.map((r) => r.id), ...extra });
  const incidents = [];
  const gcGap = (r) => stage?.gc?.get(r.id) ?? null;
  const gcRank = (r) => stage?.gcRank?.get(r.id) ?? null;

  // Team roles: each team rides for its best GC rider and its best sprinter.
  const teams = new Map();
  for (const r of riders) { const id = r.team?.id || r.id; if (!teams.has(id)) teams.set(id, []); teams.get(id).push(r); }
  const gcStrength = (r) => r.p.climb * 0.55 + r.p.tt * 0.2 + r.p.hill * 0.15 + r.p.flat * 0.1;
  const leaderOf = new Map(), sprinterOf = new Map();
  for (const [teamId, list] of teams) {
    // A stage race passes in each team's protected leader; otherwise the strongest all-round rider leads.
    const designated = stage?.leaders?.get(teamId);
    leaderOf.set(teamId, designated && list.some((r) => r.id === designated) ? designated : [...list].sort((a, b) => gcStrength(b) - gcStrength(a))[0]?.id);
    sprinterOf.set(teamId, [...list].sort((a, b) => b.p.sprint - a.p.sprint)[0]?.id);
  }
  const teamIdOf = (r) => r.team?.id || r.id;
  const isLeader = (r) => leaderOf.get(teamIdOf(r)) === r.id;
  const isSprinter = (r) => sprinterOf.get(teamIdOf(r)) === r.id;

  // Who the race is built around.
  const hard = [...route.sectors].sort((a, b) => b.difficulty - a.difficulty).slice(0, 4);
  const finishMixForKey = FINISH_MIX[route.finish] || FINISH_MIX['small-group'];
  // Pre-race reputation: no day form included, so favourites can have a bad day.
  // Fatigue is excluded too: reputation is what rivals expect, not how the rider feels today.
  const keyScore = (r) => -r.day + r.wear + (hard.length ? hard.reduce((sum, sector) => sum + score(r, sectorMix(sector)) * sector.difficulty, 0) / Math.max(1, hard.reduce((sum, s) => sum + s.difficulty, 0)) * 0.6 + score(r, finishMixForKey) * 0.4 : score(r, finishMixForKey));
  const ranked = [...riders].sort((a, b) => keyScore(b) - keyScore(a));
  const favorites = new Set(ranked.slice(0, 10).map((r) => r.id));
  // The top three are marked men: rivals jump on their wheel and chase them hard,
  // while an outsider's attack can go because the favourites watch each other.
  let marked = new Set(ranked.slice(0, 3).map((r) => r.id));
  if (stage?.gc && stage.number > 1) {
    // In a stage race the general classification decides who is watched.
    const contenders = riders.filter((r) => (gcGap(r) ?? 1e9) <= 300).sort((a, b) => gcGap(a) - gcGap(b)).slice(0, 8);
    for (const r of contenders) favorites.add(r.id);
    marked = new Set(contenders.slice(0, 3).map((r) => r.id));
  }
  // Riders who have already won stages are watched closely by the rest of the peloton.
  if (stage?.stageWins) for (const r of riders) if ((stage.stageWins.get(r.id) || 0) >= 2) { marked.add(r.id); favorites.add(r.id); }
  const isNotable = (r) => favorites.has(r.id) || r.status === 'lead' || r.status === 'break';

  // Bad days: someone always cracks in the third week.
  if (stage?.badDay) for (const r of riders) { const size = stage.badDay.get(r.id); if (size) { r.day -= size; r.crisis = true; } }

  // ---- The morning breakaway --------------------------------------------------------
  const sprintRace = route.finish === 'sprint';
  const mountainStage = Boolean(stage) && route.sectors.some((s) => s.difficulty >= 7);
  const week = stage?.week || 1;
  const threatFloor = stage?.gc && stage.number > 1 ? (week >= 2 ? 240 : 150) : 0;
  const breakSize = Math.max(0, Math.min(riders.length - 5, !stage ? (sprintRace ? 2 + Math.floor(random() * 3) : 3 + Math.floor(random() * 6)) : sprintRace ? 2 + Math.floor(random() * 3) : mountainStage ? 6 + Math.floor(random() * 11) : 4 + Math.floor(random() * 8)));
  const breakTeams = new Set(), breakaway = [];
  const pool = riders.filter((r) => !favorites.has(r.id)).map((r) => {
    let weight = 1 + (['proseries', 'continental'].includes(r.team?.tier) ? 1.2 : 0) + (r.rider.program === 'stage-hunter' ? 0.6 : 0) + (['rouleur', 'all-rounder'].includes(r.rider.terrain) ? 0.3 : 0) + random() * 0.8;
    if (stage) {
      const gap = gcGap(r);
      if (gap != null && gap < threatFloor) weight *= gap < 90 ? 0 : 0.12; // GC riders are rarely allowed to go
      if (sprintRace && isSprinter(r)) weight = 0;
      if (mountainStage) weight += Math.max(0, (r.p.climb - r.p.flat) / 6) + (stage.komPoints?.get(r.id) || 0) / 25;
      if (isLeader(r) && (gap ?? 1e9) < 900) {
        // A leader minutes down on a big mountain day late in the race may gamble on a long-range move.
        const gamble = week >= 2 && mountainStage && gap >= 180 && (gcRank(r) ?? 99) <= 15;
        weight = gamble ? weight + 1.5 + (week - 2) * 1.5 : weight * 0.3;
      }
    }
    return { r, weight };
  }).filter((item) => item.weight > 0);
  while (breakaway.length < breakSize && pool.length) {
    const total = pool.reduce((sum, item) => sum + item.weight, 0); let roll = random() * total, index = 0;
    while (index < pool.length - 1 && roll > pool[index].weight) { roll -= pool[index].weight; index += 1; }
    const [{ r }] = pool.splice(index, 1);
    if (breakTeams.has(r.team?.id) && breakaway.length < 6 && pool.some((item) => !breakTeams.has(item.r.team?.id))) continue;
    breakTeams.add(r.team?.id); breakaway.push(r);
  }
  const formKm = Math.round(3 + random() * 22), peakKm = Math.round(distance * (0.3 + random() * 0.2));
  const breakQuality = breakaway.reduce((sum, r) => sum + score(r, { flat: 0.5, hill: 0.5 }), 0) / Math.max(1, breakaway.length);
  const fieldQuality = ranked.slice(0, 20).reduce((sum, r) => sum + score(r, { flat: 0.5, hill: 0.5 }), 0) / 20;
  let maxGap = clamp(150 + random() * 330 + (breakQuality < fieldQuality - 12 ? 60 : 0) - (sprintRace ? 40 : 0), 110, 540);
  let plannedCatchKm = sprintRace ? distance - (3 + random() * 22) : distance - (random() * 50);
  // Stage tactics: on a hard day the peloton may simply let the break fight for the stage.
  let letGo = false, threat = null, controlled = false, threatActive = false;
  if (stage && !sprintRace && breakaway.length) {
    // A leader with minutes in hand has no reason to chase the break for the stage.
    const leaderMargin = stage.gc && stage.number > 1 ? [...stage.gc.values()].sort((a, b) => a - b)[1] ?? 0 : 0;
    const pLetGo = 0.24 + 0.12 * (week - 1) + (route.finish === 'summit' ? -0.12 : 0.06) + (stage.number <= 3 ? -0.2 : 0) + (leaderMargin > 180 ? 0.15 : 0);
    letGo = random() < pLetGo;
    if (letGo) { maxGap = 240 + random() * 480; plannedCatchKm = distance * 4; }
    threat = stage.gc && stage.number > 1 ? [...breakaway].filter((r) => gcGap(r) != null && gcRank(r) <= 25).sort((a, b) => gcGap(a) - gcGap(b))[0] || null : null;
    if (threat && gcGap(threat) < maxGap + 60) {
      threatActive = true;
      // The leader's team (helped by the other GC teams) decides how much rope to give a
      // dangerous rider in the break. Early in the race it almost always keeps control; in the
      // last week a tired team with few domestiques can lose the race to a long-range move.
      const leaderTeam = riders.find((r) => gcRank(r) === 1)?.team?.id, domestiques = riders.filter((r) => r.team?.id === leaderTeam).length - 1;
      const control = clamp(0.82 + domestiques * 0.025 - (week - 1) * 0.12 - (gcGap(threat) > 480 ? 0.15 : 0), 0.4, 0.97);
      controlled = random() < control;
      if (controlled) maxGap = Math.max(60, gcGap(threat) - 30 - random() * 60);
      else maxGap = Math.min(maxGap, gcGap(threat) + 30 + random() * 270);
    }
  }
  let chaseRate = letGo ? maxGap * 0.25 / Math.max(20, distance - peakKm) : maxGap / Math.max(20, plannedCatchKm - peakKm) * (0.85 + random() * 0.3);
  const hesitationKm = !letGo && random() < (sprintRace ? 0.07 : 0.26) ? Math.round(peakKm + (distance - peakKm) * (0.35 + random() * 0.4)) : null;
  let breakGap = 0, breakAlive = breakaway.length > 0, breakPeakLogged = false, leadGap = 0, leadAlive = false, virtualLogged = false;

  // ---- Snapshot of the road ---------------------------------------------------------
  const snap = (km, label) => {
    if (!recordSnapshots) return;
    const head = Math.max(breakAlive ? breakGap : -Infinity, leadAlive ? leadGap : -Infinity, 0), groups = [];
    const describe = (list, kind, gap, groupLabel) => ({ kind, label: groupLabel, size: list.length, gap: Math.max(0, Math.round(gap)), riders: [...list].sort((a, b) => (favorites.has(b.id) - favorites.has(a.id)) || (gcRank(a) ?? 999) - (gcRank(b) ?? 999) || keyScore(b) - keyScore(a)).slice(0, 6).map((r) => r.id) });
    const breakList = inGroup('break'), leadList = inGroup('lead'), frontList = inGroup('front'), dropped = inGroup('dropped');
    if (breakAlive && breakList.length) groups.push(describe(breakList, 'break', head - breakGap, breakList.length === 1 ? 'Solo leader' : 'Breakaway'));
    if (leadAlive && leadList.length) groups.push(describe(leadList, 'lead', head - leadGap, leadList.length === 1 ? 'Solo attack' : 'Leading group'));
    if (frontList.length) groups.push(describe(frontList, 'front', head, leadAlive || breakAlive ? (frontList.length > 40 ? 'Peloton' : 'Favourites group') : (frontList.length > 40 ? 'Peloton' : 'Front group')));
    if (dropped.length) { const sorted = dropped.map((r) => r.lost).sort((a, b) => a - b); groups.push({ kind: 'dropped', label: 'Dropped riders', size: dropped.length, gap: Math.round(head + sorted[0]), riders: [] }); }
    groups.sort((a, b) => a.gap - b.gap);
    const entry = { km: Math.round(km), label, groups };
    if (stage?.gc && stage.number > 1) {
      // Where the overall top three are right now, and the virtual podium if the race ended here.
      const behindHead = (r) => r.status === 'break' ? head - breakGap : r.status === 'lead' ? head - leadGap : r.status === 'front' ? head : r.status === 'dropped' ? head + r.lost : null;
      const groupOf = (r) => groups.find((g) => g.kind === r.status)?.label || (r.status === 'out' ? 'Abandoned' : 'Dropped');
      entry.gcWatch = riders.filter((r) => (gcRank(r) ?? 99) <= 3).sort((a, b) => gcRank(a) - gcRank(b)).map((r) => ({ id: r.id, rank: gcRank(r), overall: Math.round(gcGap(r)), status: r.status, group: groupOf(r), gap: behindHead(r) == null ? null : Math.max(0, Math.round(behindHead(r))) }));
      const onRoad = riders.filter((r) => r.status !== 'out' && gcGap(r) != null).map((r) => ({ r, t: gcGap(r) + behindHead(r) })).sort((a, b) => a.t - b.t);
      entry.virtualTop3 = onRoad.slice(0, 3).map((x) => ({ id: x.r.id, gap: Math.round(x.t - onRoad[0].t) }));
      if (onRoad[0]) entry.virtualLeader = { id: onRoad[0].r.id, status: onRoad[0].r.status, margin: Math.round((onRoad[1]?.t ?? onRoad[0].t) - onRoad[0].t) };
    }
    snapshots.push(entry);
  };

  log(0, 'start', `${riders.length} riders roll out for ${distance} km. ${FINISH_LABELS[route.finish] || ''}.`);
  snap(0, 'Start');

  // ---- Ride the route -----------------------------------------------------------------
  // A crash in the bunch: likelier on nervous flat days, rarer in the mountains.
  const crashChance = !stage ? 0.22 : sprintRace ? 0.32 : mountainStage ? 0.15 : 0.25;
  const massCrashKm = random() < crashChance && distance > 40 ? Math.round(15 + random() * (distance - 35)) : null;
  const waypoints = [...new Set([formKm, peakKm, ...(massCrashKm ? [massCrashKm] : []), ...(route.sprintKm ? [route.sprintKm] : []), ...route.sectors.map((s) => s.km), ...Array.from({ length: Math.floor(distance / 25) }, (_, i) => (i + 1) * 25), distance])].filter((km) => km <= distance).sort((a, b) => a - b);
  const sectorsAt = new Map(); for (const sector of route.sectors) { if (!sectorsAt.has(sector.km)) sectorsAt.set(sector.km, []); sectorsAt.get(sector.km).push(sector); }
  const lastHardKm = Math.max(0, ...route.sectors.filter((s) => s.difficulty >= 5 && !s.finish).map((s) => s.km));
  let prevKm = 0;

  const catchBreak = (km, by = 'peloton') => {
    if (!breakAlive) return; breakAlive = false;
    const caught = inGroup('break'); for (const r of caught) r.status = 'front';
    if (caught.length) log(km, 'catch', `${by === 'peloton' ? 'The peloton sweeps' : 'The attackers sweep'} up ${caught.length === 1 ? 'the last escapee' : 'the breakaway'} (${nameList(caught)}) ${distance - km < 1 ? 'in the final kilometre' : `with ${Math.round(distance - km)} km to go`}.`, caught);
  };
  const catchLead = (km) => {
    leadAlive = false; const caught = inGroup('lead'); for (const r of caught) r.status = 'front';
    if (caught.length) log(km, 'catch', `${caught.length === 1 ? `${caught[0].rider.name} is` : `${nameList(caught)} are`} caught ${distance - km < 1 ? 'in the final kilometre' : `with ${Math.round(distance - km)} km to go`}.`, caught);
  };
  // A crash: riders hit the deck, most chase back, the injured may abandon.
  const crash = (km, victims, where, { sameTime = false, announce = true } = {}) => {
    const out = [], hurt = [];
    for (const r of victims) {
      const outcome = crashOutcome(random);
      if (outcome.weeks) incidents.push({ riderId: r.id, kind: 'crash', km: Math.round(km), weeks: outcome.weeks, abandoned: outcome.severity === 'out', cause: injuryName(outcome.weeks) });
      if (outcome.severity === 'out') { r.status = 'out'; out.push(r); continue; }
      if (outcome.severity === 'hurt') { r.day -= 3; r.wear += 3; hurt.push(r); }
      if (sameTime) continue;
      if (r.status === 'front' && distance - km > 25) { r.wear += 2; continue; }
      if (['front', 'lead', 'break'].includes(r.status)) { const was = r.status; r.status = 'dropped'; r.lost = Math.round(15 + random() * 75) + (was === 'lead' ? Math.max(0, -leadGap) : was === 'break' ? Math.max(0, -breakGap) : 0); r.dropKm = km; }
    }
    if (!announce && !out.length) return;
    log(km, 'crash', `Crash ${where}! ${nameList(victims)} ${victims.length === 1 ? 'goes' : 'go'} down.${out.length ? ` ${nameList(out)} cannot continue${out.length === 1 ? '' : ' — they abandon'}.` : hurt.length ? ` ${nameList(hurt)} ${hurt.length === 1 ? 'is' : 'are'} hurt but back on the bike.` : ' Everyone remounts.'}`, victims);
  };
  // Domestiques still with their leader in the front group.
  const helpers = (leaderId, group) => group.filter((r) => r.id !== leaderId && leaderOf.get(teamIdOf(r)) === leaderId);

  for (const km of waypoints) {
    const segment = km - prevKm;
    // Flat riding between moments.
    if (segment > 0) {
      for (const r of riders) r.wear += (segment / 100) * (1.2 - r.endurance / 100) * 1.4;
      if (breakAlive && km > formKm) {
        if (hesitationKm && km >= hesitationKm && prevKm < hesitationKm) { chaseRate *= 0.3; log(hesitationKm, 'chase', `Nobody wants to commit to the chase — the gap to the break stops falling.`); }
        if (km <= peakKm) breakGap = maxGap * clamp((km - formKm) / Math.max(1, peakKm - formKm), 0, 1);
        else breakGap -= chaseRate * segment;
        if (!breakPeakLogged && km >= peakKm && breakAlive) {
          breakPeakLogged = true;
          log(peakKm, 'gap', `The break's advantage peaks at ${formatRaceGap(maxGap)}.${letGo ? ' The peloton has let them go — the stage will be fought out in the break.' : ''}`, inGroup('break'), { gap: Math.round(maxGap) });
          if (threatActive && threat.status === 'break') log(peakKm, controlled ? 'chase' : 'gap', controlled ? `${threat.rider.name}, ${ordinal(gcRank(threat))} overall at ${formatRaceGap(gcGap(threat))}, is in the move — the leader's team keeps the gap on a short leash.` : `${threat.rider.name}, ${ordinal(gcRank(threat))} overall at ${formatRaceGap(gcGap(threat))}, is in the break and the leader's team cannot control it!`, [threat]);
        }
        if (threat && !virtualLogged && threat.status === 'break' && breakAlive && breakGap > gcGap(threat) && gcRank(threat) > 1) { virtualLogged = true; log(km, 'gap', `${threat.rider.name} is the virtual leader on the road!`, [threat]); }
        if (breakGap <= 0) catchBreak(km);
      }
      if (leadAlive) {
        const lead = inGroup('lead'), front = inGroup('front');
        const chasePower = front.length ? [...front].map((r) => score(r, { flat: 0.7, hill: 0.3 })).sort((a, b) => b - a).slice(0, 4).reduce((s, v) => s + v, 0) / Math.min(4, front.length) : 0;
        const leadPower = lead.map((r) => score(r, { flat: 0.7, hill: 0.3 })).reduce((s, v) => s + v, 0) / lead.length;
        const organised = front.length >= 8 ? 1.6 : 0.5 + front.length * 0.14;
        const markedAhead = lead.some((r) => marked.has(r.id)), favouriteAhead = lead.some((r) => favorites.has(r.id));
        // Teams whose leader is chasing put their domestiques on the front.
        const chasingHelpers = stage ? Math.min(3, front.filter((r) => !isLeader(r) && front.some((l) => isLeader(l) && teamIdOf(l) === teamIdOf(r) && marked.has(l.id))).length) : 0;
        const rate = clamp((organised + (chasePower - leadPower) * 0.08 - (lead.length >= 3 ? 0.4 : 0) + (markedAhead ? 0.6 : 0) + chasingHelpers * 0.25) * (favouriteAhead ? 1 : 0.7), 0.2, 5);
        leadGap -= rate * segment;
        if (leadGap <= 0) catchLead(km);
      }
      if (breakAlive && leadAlive && leadGap >= breakGap) {
        const lead = inGroup('lead'), leadBest = Math.max(...lead.map((r) => score(r, { flat: 0.5, hill: 0.5 })));
        const survivors = inGroup('break').filter((r) => score(r, { flat: 0.5, hill: 0.5 }, 4) >= leadBest - 3);
        for (const r of survivors) r.status = 'lead';
        if (survivors.length) log(km, 'bridge', `${nameList(survivors)} ${survivors.length === 1 ? 'clings' : 'cling'} on as the attackers sweep past the remains of the break.`, survivors);
        catchBreak(km, 'attackers');
      }
    }

    if (km === massCrashKm) {
      const bunch = inGroup('front');
      // Leaders ride near the front, shielded by their team-mates, and are caught up less often.
      if (bunch.length > 10) { const victims = bunch.map((r) => ({ r, k: random() * (isLeader(r) && stage ? 0.35 : 1) })).sort((a, b) => b.k - a.k).slice(0, 2 + Math.floor(random() * 7)).map((x) => x.r); crash(km, victims, 'in the peloton'); }
    }
    // Intermediate sprint: the break takes the top places, the sprinters fight for the rest.
    if (route.sprintKm && km === route.sprintKm && !sprintResult) {
      const ahead = breakAlive ? inGroup('break').sort((a, b) => b.p.sprint - a.p.sprint) : [];
      const bunch = [...inGroup('lead'), ...inGroup('front')].map((r) => ({ r, s: score(r, { sprint: 1 }, 8) + (isSprinter(r) ? 3 : 0) })).sort((a, b) => b.s - a.s).map((x) => x.r);
      sprintResult = { km, order: [...ahead, ...bunch].slice(0, 15).map((r) => r.id) };
      const firstBunch = bunch[0];
      if (stage && firstBunch && isSprinter(firstBunch)) log(km, 'sprint', `Intermediate sprint: ${ahead.length ? `${ahead[0].rider.name} takes the top points from the break; ` : ''}${firstBunch.rider.name} wins the bunch kick behind.`, [...(ahead[0] ? [ahead[0]] : []), firstBunch]);
    }

    // Decisive sectors.
    for (const sector of sectorsAt.get(km) || []) {
      const d = sector.difficulty, kmToGo = distance - km, finale = kmToGo <= Math.max(70, distance * 0.3), intensity = finale ? 1 : 0.35;
      const mix = sectorMix(sector), noise = 9;
      const scores = new Map(riders.filter((r) => r.status !== 'dropped').map((r) => [r.id, score(r, mix, noise)]));
      const sc = (r) => scores.get(r.id);

      // Punctures and mechanicals on rough roads.
      if (['cobbles', 'gravel', 'cobbled-climb'].includes(sector.type)) {
        for (const r of riders.filter((x) => ['front', 'lead', 'break'].includes(x.status))) {
          if (random() > 0.0012 * d) continue;
          if (random() < 0.3) { crash(km, [r], `on ${sector.name}`, { announce: isNotable(r) }); continue; }
          const loss = Math.round(20 + random() * 70), notable = isNotable(r), teamWaits = stage && isLeader(r) && helpers(r.id, inGroup('front')).length > 0;
          if (((kmToGo > 35 && loss < 70) || (teamWaits && kmToGo > 15)) && r.status === 'front') { r.wear += 1.5; if (notable) log(km, 'mechanical', `${r.rider.name} punctures on ${sector.name}${teamWaits ? ' — his team-mates drop back to pace him' : ''} and has to chase back on.`, [r], { sector: sector.name }); continue; }
          const was = r.status; r.status = 'dropped'; r.lost = loss + (was === 'lead' ? Math.max(0, -leadGap) : 0);
          if (notable) log(km, 'mechanical', `Disaster on ${sector.name}: ${r.rider.name} punctures and loses contact${was === 'lead' ? ' with the leaders' : ''}.`, [r], { sector: sector.name });
        }
      }

      // Dropped riders keep losing time; a team leader rides his own tempo to limit the damage,
      // the rest sit up in the gruppetto.
      for (const r of riders) if (r.status !== 'dropped') r.wear += d * 0.16 * (1.2 - r.endurance / 100); else r.lost += (stage && isLeader(r) ? d * 1.8 : d * 4) + random() * 10;
      // In a lead group the marked rider does the work while the others sit on his wheel.
      const leadNowForWork = inGroup('lead');
      if (leadNowForWork.length > 1) for (const r of leadNowForWork) if (marked.has(r.id)) r.wear += d * 0.35;
      // Domestiques bury themselves setting the pace; a protected leader saves energy.
      if (stage && d >= 4) for (const r of inGroup('front')) { if (isLeader(r)) { if (helpers(r.id, inGroup('front')).length >= 2) r.wear -= d * 0.05; } else if (leaderOf.get(teamIdOf(r)) && riders.find((l) => l.id === leaderOf.get(teamIdOf(r)))?.status === 'front') r.wear += d * 0.22; }

      // The breakaway on the climb.
      if (breakAlive) {
        const list = inGroup('break');
        if (list.length) {
          const ordered = [...list].sort((a, b) => sc(b) - sc(a)), best = sc(ordered[0]), tol = 30 - 2.6 * d;
          const shed = ordered.filter((r, i) => i > 0 && sc(r) < best - tol);
          for (const r of shed) r.status = 'front';
          if (shed.length && d >= 4) log(km, 'drop', `${nameList(shed)} ${shed.length === 1 ? 'is' : 'are'} dropped from the break on ${sector.name}.`, shed, { sector: sector.name });
          const front = inGroup('front').map(sc).sort((a, b) => b - a), frontPace = front[Math.min(3, front.length - 1)] ?? 0;
          const breakPace = ordered.slice(0, 2).reduce((s, r) => s + sc(r), 0) / Math.min(2, ordered.length);
          // With minutes in hand the favourites race each other rather than the break.
          breakGap -= clamp(frontPace - breakPace, -12, 25) * d * 0.5 * intensity * (breakGap > 120 ? 0.4 : 1);
          if (breakGap <= 0) catchBreak(km);
        }
      }

      // Selection in the main group.
      const front = inGroup('front');
      if (front.length > 1) {
        const ordered = [...front].sort((a, b) => sc(b) - sc(a)), reference = sc(ordered[1]);
        // Long mountain climbs in a stage race are ridden at threshold: no hiding in the wheels.
        const longClimb = stage && sector.type === 'climb' && (sector.length || 0) >= 4 && d >= 6;
        const tol = (32 - 2.7 * d) * (finale ? 1 : 1.6) * (longClimb ? 0.72 : 1);
        const shed = ordered.filter((r) => sc(r) < reference - tol);
        for (const r of shed) { r.status = 'dropped'; r.lost = Math.round((reference - tol - sc(r)) * 0.6 * d + (stage && isLeader(r) ? 3.5 : 6) * d + 10); r.dropKm = km; }
        const remaining = front.length - shed.length, favShed = shed.filter((r) => favorites.has(r.id));
        if (d >= 5 && shed.length >= 3) log(km, 'sector', `${sector.name}: the ${(SECTOR_LABELS[sector.type] || 'climb').toLowerCase()} splits the race — ${remaining} rider${remaining === 1 ? '' : 's'} left in the ${leadAlive || breakAlive ? 'chase' : 'front group'}.`, [], { sector: sector.name, remaining });
        if (favShed.length) {
          const crisis = favShed.filter((r) => r.crisis), plain = favShed.filter((r) => !r.crisis);
          if (plain.length) log(km, 'drop', `${nameList(plain)} ${plain.length === 1 ? 'is' : 'are'} distanced on ${sector.name}.`, plain, { sector: sector.name });
          for (const r of crisis) log(km, 'drop', `Crisis for ${r.rider.name}${gcRank(r) ? `, ${ordinal(gcRank(r))} overall,` : ''} on ${sector.name} — he is having a bad day.`, [r], { sector: sector.name });
        }
      }

      // Attackers out front: does the gap grow or fall on this sector?
      if (leadAlive) {
        const lead = inGroup('lead');
        if (lead.length > 1) {
          const ordered = [...lead].sort((a, b) => sc(b) - sc(a)), best = sc(ordered[0]), tol = (32 - 2.7 * d) * 0.45;
          const shed = ordered.filter((r, i) => i > 0 && sc(r) < best - tol);
          for (const r of shed) r.status = 'front';
          if (shed.length) log(km, 'drop', `${nameList(shed)} cannot hold the wheel on ${sector.name} and drift${shed.length === 1 ? 's' : ''} back.`, shed, { sector: sector.name });
        }
        const leadNow = inGroup('lead'), chasers = inGroup('front').map(sc).sort((a, b) => b - a);
        if (leadNow.length && chasers.length) {
          const leadPace = Math.max(...leadNow.map(sc)), chasePace = chasers.slice(0, 2).reduce((s, v) => s + v, 0) / Math.min(2, chasers.length);
          leadGap += clamp(leadPace - chasePace, -12, 12) * d * (stage && sector.type === 'climb' && (sector.length || 0) >= 4 ? 0.7 : 0.55) * intensity;
          if (leadGap <= 0) catchLead(km);
        } else if (!leadNow.length) leadAlive = false;
      }

      // Attacks in the finale.
      const attackField = inGroup('front');
      if (finale && d >= 4 && !sector.finish && attackField.length >= 2) {
        const lastBig = km === lastHardKm, sprinterFinish = SPRINT_FINISHES.has(route.finish);
        const candidates = [...attackField].sort((a, b) => sc(b) - sc(a)).slice(0, 10).filter((r) => {
          const sprinterType = r.rider.terrain === 'sprinter';
          const gcBonus = stage?.gc && marked.has(r.id) && mountainStage ? 0.12 : 0;
          // A leader with minutes in hand rides defensively and lets others fight for the stage.
          const comfortable = stage?.gc && gcRank(r) === 1 && ([...stage.gc.values()].sort((a, b) => a - b)[1] ?? 0) > 180 ? 0.18 : 0;
          const domestique = stage && !isLeader(r) && riders.find((l) => l.id === leaderOf.get(teamIdOf(r)))?.status === 'front' && marked.has(leaderOf.get(teamIdOf(r)));
          const chance = 0.13 + (d >= 7 ? 0.12 : 0) + (lastBig ? 0.25 : 0) + (sprinterFinish && !sprinterType ? 0.1 : 0) - (sprinterFinish && sprinterType ? 0.25 : 0) + (favorites.has(r.id) ? 0.06 : 0.04) + gcBonus - comfortable - (domestique ? 0.2 : 0);
          return random() < chance;
        });
        const attacker = candidates[0];
        if (attacker) {
          const outsider = !favorites.has(attacker.id), aScore = sc(attacker), followTol = 2 + (10 - d) * 0.45 + (marked.has(attacker.id) ? 2.5 : 0) - (outsider ? 1.5 : 0);
          const followers = [attacker, ...attackField.filter((r) => r !== attacker && sc(r) >= aScore - followTol)];
          const rest = attackField.filter((r) => !followers.includes(r));
          const bestRest = rest.length ? Math.max(...rest.map(sc)) : aScore;
          const gain = (aScore - bestRest) * d * 0.7 + 4;
          if (followers.length <= 5 && rest.length && gain >= 6) {
            if (leadAlive) {
              if (gain >= leadGap * 0.7) { for (const r of followers) r.status = 'lead'; log(km, 'bridge', `${attacker.rider.name} attacks on ${sector.name}${followers.length > 1 ? `, followed by ${nameList(followers.filter((r) => r !== attacker))},` : ''} and bridges across to the leaders.`, followers, { sector: sector.name }); }
              else if (favorites.has(attacker.id)) log(km, 'counter', `${attacker.rider.name} counter-attacks on ${sector.name} but cannot close the gap to the leaders.`, [attacker], { sector: sector.name });
            } else {
              for (const r of followers) r.status = 'lead';
              leadAlive = true; leadGap = gain;
              const companions = followers.filter((r) => r !== attacker), gcNote = stage?.gc && gcRank(attacker) && gcRank(attacker) <= 10 ? ` (${ordinal(gcRank(attacker))} overall)` : '';
              log(km, 'attack', `${attacker.rider.name}${gcNote} attacks on ${sector.name}!${companions.length ? ` Only ${nameList(companions)} can follow.` : ' Nobody can follow.'} ${formatRaceGap(gain)} with ${Math.round(kmToGo)} km to go.${outsider ? ' The favourites look at each other.' : ''}`, followers, { sector: sector.name, gap: Math.round(gain) });
            }
          } else if (favorites.has(attacker.id) && d >= 5) {
            log(km, 'counter', `${attacker.rider.name} tests the legs on ${sector.name}, but ${rest.length ? 'the favourites close it down' : 'the group holds together'}.`, [attacker], { sector: sector.name });
          }
        }
      }

      // Descending is where risks are taken.
      if (sector.type === 'climb' && !sector.finish && d >= 6 && random() < 0.035) {
        const lead = inGroup('lead'), pool = lead.length && random() < 0.5 ? lead : inGroup('front').slice(0, 15);
        if (pool.length) crash(km, [pool[Math.floor(random() * pool.length)]], `on the descent of ${sector.name}`);
      }
      // Mountains classification: the order over the top.
      if (['climb', 'cobbled-climb'].includes(sector.type)) {
        const over = [...(breakAlive ? inGroup('break').sort((a, b) => sc(b) - sc(a)) : []), ...inGroup('lead').sort((a, b) => sc(b) - sc(a)), ...inGroup('front').sort((a, b) => sc(b) - sc(a))];
        summits.push({ km, name: sector.name, category: sector.category ?? climbCategory(d), finish: Boolean(sector.finish), order: over.slice(0, 10).map((r) => r.id) });
      }
    }
    if (km === formKm && breakaway.length) {
      for (const r of breakaway) r.status = 'break';
      log(formKm, 'break', `${breakaway.length} riders go clear: ${nameList(breakaway)}.`, breakaway);
    }
    if (km !== distance) snap(km, (sectorsAt.get(km) || []).map((s) => s.name).join(' · ') || (km === formKm ? 'The break goes' : km === route.sprintKm ? 'Intermediate sprint' : `${Math.round(distance - km)} km to go`));
    prevKm = km;
  }

  // ---- The finish ---------------------------------------------------------------------
  const finishMix = FINISH_MIX[route.finish] || FINISH_MIX['small-group'];
  const finishGroup = (list, base, kind) => {
    if (!list.length) return [];
    const bigGroup = list.length >= 10 && ['small-group', 'descent', 'reduced-sprint'].includes(route.finish);
    const mix = kind === 'front' && bigGroup ? GROUP_SPRINT_MIX : finishMix, spread = kind === 'front' && bigGroup ? 0 : (FINISH_SPREAD[route.finish] ?? 0.12) * (stage && route.finish === 'summit' ? 1.35 : 1);
    const sprinting = 'sprint' in mix && mix.sprint >= 0.5;
    // Lead-outs: a sprinter delivered by team-mates in the final kilometre.
    const leadOut = (r) => (sprinting && isSprinter(r) ? Math.min(3, list.filter((t) => t !== r && teamIdOf(t) === teamIdOf(r) && t.p.flat >= r.p.flat - 15).length) * 1.1 : 0);
    // Bunch sprints are chaotic: a rider can be boxed in or lose the wheel at the decisive moment.
    const boxed = new Set(sprinting && list.length >= 10 ? list.filter(() => random() < 0.28).map((r) => r.id) : []);
    let ordered = list.map((r) => ({ r, s: score(r, mix, sprinting && list.length >= 10 ? 12 : 8) + leadOut(r) - (boxed.has(r.id) ? 5 + random() * 6 : 0), lo: leadOut(r) })).sort((a, b) => b.s - a.s);
    // Crash in the final kilometre of a bunch sprint: the fallers lose the sprint (in a stage race
    // they keep the group's time under the 3 km rule).
    if (kind === 'front' && sprinting && list.length >= 20 && random() < 0.1) {
      const victims = ordered.slice(1, 13).filter(() => random() < 0.2).slice(0, 3).map((x) => x.r);
      if (victims.length) {
        crash(distance, victims, 'in the final kilometre', { sameTime: true });
        const fallen = new Set(victims.map((r) => r.id));
        ordered = [...ordered.filter((x) => !fallen.has(x.r.id)), ...ordered.filter((x) => fallen.has(x.r.id) && x.r.status !== 'out').map((x) => ({ ...x, s: x.s - 40, late: !stage }))];
      }
    }
    const top = ordered[0].s;
    if (boxed.size) { const fastest = [...list].sort((a, b) => b.p.sprint - a.p.sprint)[0]; if (boxed.has(fastest.id) && ordered[0].r !== fastest) log(distance, 'sprint', `${fastest.rider.name} is boxed in and cannot launch his sprint.`, [fastest]); }
    if (sprinting && list.length >= 10 && ordered[0].lo >= 2.2) log(distance, 'sprint', `${ordered[0].r.rider.name}'s team-mates deliver a perfect lead-out.`, [ordered[0].r]);
    return ordered.filter(({ r }) => r.status !== 'out').map(({ r, s, late }) => ({ r, time: Math.round(base + (late ? 20 + random() * 60 : Math.max(0, top - s) * spread)) }));
  };
  const finishers = [
    ...finishGroup(breakAlive ? inGroup('break') : [], -breakGap, 'break'),
    ...finishGroup(leadAlive ? inGroup('lead') : [], -leadGap, 'lead'),
    ...finishGroup(inGroup('front'), 0, 'front')
  ];
  const dropped = inGroup('dropped').map((r) => ({ r, time: Math.round((r.lost + (distance - (r.dropKm ?? distance)) * 0.35) / 5) * 5 })).sort((a, b) => a.time - b.time);
  const all = [...finishers, ...dropped].map((entry, index) => ({ ...entry, index })).sort((a, b) => a.time - b.time || a.index - b.index);
  const base = all[0].time;
  const order = all.map(({ r, time }) => ({ rider: r.rider, team: r.team, time: time - base }));

  // ---- How it was won ---------------------------------------------------------------
  const winner = all[0].r, runner = all[1]?.r, margin = (all[1]?.time ?? base) - base;
  let how;
  if (winner.status === 'break') how = `${winner.rider.name} ${letGo ? 'wins from the breakaway' : 'survives from the breakaway'} that went clear at km ${formKm}${letGo ? '' : ' — the favourites never saw him again'}.`;
  else if (winner.status === 'lead' && inGroup('lead').length === 1) { const move = [...timeline].reverse().find((e) => ['attack', 'bridge'].includes(e.kind) && e.riderIds.includes(winner.id)), own = move && move.riderIds[0] === winner.id; how = `${winner.rider.name} holds on alone${move?.sector ? ` after ${own ? 'attacking' : 'going clear'} on ${move.sector}` : ''}, ${formatRaceGap(margin)} ahead of ${runner ? runner.rider.name : 'the chase'}.`; }
  else if (winner.status === 'lead') how = `${winner.rider.name} wins from the ${inGroup('lead').length}-man group that escaped in the finale${margin ? `, ${formatRaceGap(margin)} clear` : ''}.`;
  else if (['uphill', 'summit'].includes(route.finish)) how = `${winner.rider.name} is strongest on ${route.sectors.at(-1)?.name || 'the final climb'} and wins ${margin ? `by ${formatRaceGap(margin)}` : 'by a few lengths'}.`;
  else how = `${winner.rider.name} wins the ${inGroup('front').length >= 25 ? 'bunch sprint' : `sprint from a group of ${inGroup('front').length}`} ahead of ${runner ? runner.rider.name : 'the field'}.`;
  log(distance, 'finish', how, [winner, ...(runner ? [runner] : [])], { margin });
  snap(distance, 'Finish');

  const effort = new Map(riders.map((r) => [r.id, Math.max(0, r.wear - r.startWear)]));
  return {
    order, effort, summits, sprint: sprintResult, incidents,
    race: {
      version: 2,
      distance,
      finish: route.finish,
      sectors: route.sectors.map(({ km, name, type, difficulty, finish, category }) => ({ km, name, type, difficulty, ...(category != null ? { category } : {}), ...(finish ? { finish: true } : {}) })),
      favorites: ranked.slice(0, 6).map((r) => r.id),
      breakaway: { km: formKm, riderIds: breakaway.map((r) => r.id), maxGap: Math.round(maxGap), survived: winner.status === 'break', letGo },
      winningMove: winner.status,
      timeline,
      snapshots
    }
  };
}

/**
 * Individual time trial: riders go off one by one (the GC leader last in a stage race);
 * the hot seat changes hands as faster riders come home.
 */
export function rideTimeTrial({ route, riders, random, stage = null, recordSnapshots = true }) {
  const distance = route.distance, timeline = [], snapshots = [];
  const mountain = route.sectors.some((s) => s.type === 'climb');
  const mix = mountain ? { tt: 0.45, climb: 0.55 } : { tt: 1 };
  for (const r of riders) r.day = r.day * 0.35; // time trials are the most predictable days
  const scoreOf = (r) => Object.entries(mix).reduce((sum, [key, w]) => sum + r.p[key] * w, 0) + r.day - r.wear * 0.6 + (random() - 0.5) * 3 - (stage?.badDay?.get(r.id) || 0) * 0.5;
  const scored = riders.map((r) => ({ r, s: scoreOf(r) }));
  const best = Math.max(...scored.map((x) => x.s));
  const secondsPerKm = mountain ? 105 : 68;
  for (const x of scored) x.time = Math.round(distance * (secondsPerKm + (best - x.s) * 0.22));
  // Start order: reverse GC in a stage race, otherwise weakest first.
  const startOrder = stage?.gc && stage.number > 1 ? [...scored].sort((a, b) => (stage.gc.get(b.r.id) ?? 0) - (stage.gc.get(a.r.id) ?? 0)) : [...scored].sort((a, b) => a.s - b.s + (random() - 0.5) * 6);
  const finishedTimes = [];
  let hotSeat = null;
  const every = Math.max(1, Math.ceil(startOrder.length / 14));
  log0();
  function log0() { timeline.push({ km: 0, kind: 'start', text: `${riders.length} riders start the ${distance} km ${mountain ? 'mountain time trial' : 'time trial'}${stage?.gc && stage.number > 1 ? ', in reverse order of the general classification' : ''}.`, riderIds: [] }); }
  startOrder.forEach((x, index) => {
    finishedTimes.push(x);
    if (!hotSeat || x.time < hotSeat.time) {
      const previous = hotSeat; hotSeat = x;
      const late = index >= startOrder.length - 25;
      if (late || index % 20 === 0) timeline.push({ km: distance, kind: late ? 'attack' : 'gap', text: previous ? `${x.r.rider.name} goes fastest${previous ? `, ${formatRaceGap(previous.time - x.time)} quicker than ${previous.r.rider.name}` : ''} — ${formatRaceGap(x.time)}.` : `${x.r.rider.name} sets the first benchmark: ${formatRaceGap(x.time)}.`, riderIds: [x.r.id], starter: index + 1 });
    }
    // The last riders off (the GC leaders) get a snapshot each.
    if (recordSnapshots && ((index + 1) % every === 0 || index >= startOrder.length - 10)) {
      const top = [...finishedTimes].sort((a, b) => a.time - b.time).slice(0, 6);
      const entry = { km: Math.round(distance * (index + 1) / startOrder.length), label: `${index + 1} of ${startOrder.length} riders home`, tt: true, hotSeat: top.map((t) => ({ id: t.r.id, time: t.time })), groups: [] };
      if (stage?.gc && stage.number > 1) {
        const virtual = finishedTimes.map((t) => ({ id: t.r.id, total: (stage.gc.get(t.r.id) ?? 0) + t.time - top[0].time })).sort((a, b) => a.total - b.total);
        entry.virtualLeader = { id: virtual[0].id, margin: Math.round((virtual[1]?.total ?? virtual[0].total) - virtual[0].total) };
        const home = new Map(finishedTimes.map((t) => [t.r.id, t.time])), best = top[0].time;
        entry.gcWatch = [...stage.gc.entries()].sort((a, b) => a[1] - b[1]).slice(0, 3).map(([id, overall], i) => ({ id, rank: i + 1, overall: Math.round(overall), status: home.has(id) ? 'home' : 'waiting', group: home.has(id) ? 'Finished' : 'Still to start', gap: home.has(id) ? Math.round(home.get(id) - best) : null }));
        if (index === startOrder.length - 1) entry.virtualTop3 = virtual.slice(0, 3).map((v) => ({ id: v.id, gap: Math.round(v.total - virtual[0].total) }));
      }
      snapshots.push(entry);
    }
  });
  const order = [...scored].sort((a, b) => a.time - b.time);
  const winner = order[0], runner = order[1];
  timeline.push({ km: distance, kind: 'finish', text: `${winner.r.rider.name} wins the time trial in ${formatRaceGap(winner.time)}, ${formatRaceGap(runner.time - winner.time)} ahead of ${runner.r.rider.name}.`, riderIds: [winner.r.id, runner.r.id], margin: runner.time - winner.time });
  for (const x of scored) x.r.wear += distance / 100 * (1.2 - x.r.endurance / 100) * 2;
  const effort = new Map(riders.map((r) => [r.id, Math.max(0, r.wear - r.startWear)]));
  return {
    order: order.map((x) => ({ rider: x.r.rider, team: x.r.team, time: x.time - winner.time })), effort, summits: [], sprint: null, incidents: [],
    race: { version: 2, distance, finish: 'itt', sectors: route.sectors.map(({ km, name, type, difficulty, category }) => ({ km, name, type, difficulty, ...(category != null ? { category } : {}) })), favorites: [...scored].sort((a, b) => b.s - a.s).slice(0, 6).map((x) => x.r.id), breakaway: null, winningMove: 'itt', timeline, snapshots }
  };
}
