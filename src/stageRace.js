// Stage-race orchestrator. Rides every stage with the race engine and keeps the race's
// memory between them: general-classification times (with finish bonuses), points and
// mountains classifications from real sprints and summits, the young-rider and team
// classifications, and fatigue that builds through the race and eases on rest days.
import { rideRoad, rideTimeTrial, formatRaceGap, injuryName } from './raceEngine.js';

const POINTS = {
  flat: [50, 30, 20, 18, 16, 14, 12, 10, 8, 7, 6, 5, 4, 3, 2],
  hilly: [25, 20, 16, 14, 12, 10, 8, 6, 4, 2],
  mountain: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1],
  intermediate: [20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
};
const KOM = { 0: [20, 15, 12, 10, 8, 6, 4, 2], 1: [10, 8, 6, 4, 2, 1], 2: [5, 3, 2, 1], 3: [2, 1], 4: [1] };
const FINISH_BONUS = [10, 6, 4];
const YOUTH_AGE = 23;

function pointsScaleFor(stage) { return stage.type === 'flat' ? POINTS.flat : ['hilly', 'cobbles', 'gravel'].includes(stage.type) ? POINTS.hilly : POINTS.mountain; }
function leaderOf(map) { let best = null; for (const [id, value] of map) if (value > 0 && (!best || value > best[1])) best = [id, value]; return best?.[0] || null; }

/**
 * @param plan   { stages[] } from stagePlanForEvent
 * @param power  (rider, profile, team) race-day strength
 * @param detail true to keep full road snapshots for every stage (Grand Tours and showcase races)
 */
export function simulateStageRace({ participants, random, power, plan, detail = false }) {
  const total = plan.stages.length;
  // Race-day strengths are fixed for the race; daily form, fatigue and tactics vary.
  const base = participants.map(({ rider, team }) => {
    const p = {}; for (const profile of ['flat', 'hill', 'climb', 'cobbles', 'cobbledClimb', 'gravel', 'sprint', 'punch', 'descend', 'tt']) p[profile] = power(rider, profile, team);
    return { rider, team, id: rider.id, p, form: (random() + random() + random() - 1.5) * 4, recovery: rider.skills?.recovery ?? 70, endurance: rider.skills?.endurance ?? 70 };
  });
  const byId = new Map(base.map((b) => [b.id, b]));
  const gc = new Map(base.map((b) => [b.id, 0])), placeSum = new Map(base.map((b) => [b.id, 0]));
  const points = new Map(base.map((b) => [b.id, 0])), kom = new Map(base.map((b) => [b.id, 0])), carry = new Map(base.map((b) => [b.id, 0]));
  const teamTime = new Map(), stageWins = new Map();
  const stages = [], gcProgress = [], rankMaps = [];

  // Each team protects one leader: its strongest stage racer. The leader only changes if he
  // falls out of contention while a team-mate is clearly better placed.
  const strength = (b) => b.p.climb * 0.55 + b.p.tt * 0.2 + b.p.hill * 0.15 + b.p.flat * 0.1;
  const leaders = new Map();
  for (const b of base) { const teamId = b.team?.id || b.id, current = leaders.get(teamId); if (!current || strength(b) > strength(byId.get(current))) leaders.set(teamId, b.id); }
  const gcOrder = () => [...gc.entries()].sort((a, b) => a[1] - b[1] || placeSum.get(a[0]) - placeSum.get(b[0]));

  // Riders still in the race, everyone who left it and why, and injuries to carry home.
  const active = new Set(base.map((b) => b.id)), abandons = [], injuries = new Map();
  const noteInjury = (id, weeks, kind, cause, stageNumber) => { const current = injuries.get(id); if (!current || weeks > current.weeks) injuries.set(id, { riderId: id, weeks, kind, cause, stage: stageNumber }); };
  const leave = (id, stageNumber, kind, cause) => { if (!active.has(id)) return; active.delete(id); gc.delete(id); placeSum.delete(id); points.delete(id); kom.delete(id); abandons.push({ riderId: id, stage: stageNumber, kind, cause }); };

  for (const stage of plan.stages) {
    // Overnight illness: some riders do not start, others start sick.
    const sickToday = new Map(), nonStarters = [];
    if (stage.number > 1) for (const id of active) {
      const ill = random() < 0.0018 + (stage.number > 15 ? 0.0015 : 0);
      if (!ill) continue;
      const weeks = 1 + Math.floor(random() * 2);
      noteInjury(id, weeks, 'illness', injuryName(weeks, 'illness'), stage.number);
      if (random() < 0.5) nonStarters.push(id); else sickToday.set(id, 10 + random() * 5);
    }
    const leaderBefore = gcOrder()[0]?.[0];
    for (const id of nonStarters) leave(id, stage.number, 'illness', 'illness (did not start)');
    const order = gcOrder(), leaderTime = order[0][1];
    const gcGap = new Map(order.map(([id, t]) => [id, t - leaderTime])), gcRank = new Map(order.map(([id], i) => [id, i + 1]));
    const week = total >= 15 ? (stage.number <= 9 ? 1 : stage.number <= 15 ? 2 : 3) : 1 + Math.floor((3 * (stage.number - 1)) / total);
    // Bad days: more likely late in a long race and for tired riders.
    const badDay = new Map();
    for (const b of base) { if (!active.has(b.id)) continue; const chance = 0.006 + (week === 3 ? 0.02 : week === 2 ? 0.006 : 0) + ((gcRank.get(b.id) ?? 99) <= 5 && week >= 2 ? (week === 3 ? 0.03 : 0.012) : 0) + (carry.get(b.id) || 0) / 600; if (random() < chance) badDay.set(b.id, 4 + random() * 7); }
    for (const [id, size] of sickToday) badDay.set(id, Math.max(badDay.get(id) || 0, size));
    const riders = base.filter((b) => active.has(b.id)).map((b) => ({ rider: b.rider, team: b.team, id: b.id, p: b.p, day: b.form + (random() - 0.5) * 14, wear: carry.get(b.id), startWear: carry.get(b.id), status: 'front', lost: 0, endurance: b.endurance }));
    for (const [teamId, leaderId] of leaders) {
      // A leader who has left the race is replaced by the strongest team-mate still racing.
      if (!active.has(leaderId)) { const next = base.filter((b) => (b.team?.id || b.id) === teamId && active.has(b.id)).sort((a, b) => (gcGap.get(a.id) ?? 1e9) - (gcGap.get(b.id) ?? 1e9) || strength(b) - strength(a))[0]; if (next) leaders.set(teamId, next.id); else leaders.delete(teamId); continue; }
      const gap = gcGap.get(leaderId) ?? 0;
      if (gap <= 600) continue;
      const better = base.filter((b) => (b.team?.id || b.id) === teamId && b.id !== leaderId && (gcGap.get(b.id) ?? 1e9) < Math.min(300, gap - 300)).sort((a, b) => gcGap.get(a.id) - gcGap.get(b.id))[0];
      if (better) leaders.set(teamId, better.id);
    }
    const context = { number: stage.number, total, week, gc: gcGap, gcRank, komPoints: kom, badDay, leaders, stageWins };
    const out = stage.type === 'itt'
      ? rideTimeTrial({ route: stage, riders, random, stage: context, recordSnapshots: detail })
      : rideRoad({ route: stage, riders, random, stage: context, recordSnapshots: detail });

    // Crashes: injuries go home with the rider; those who could not continue leave the race.
    for (const incident of out.incidents || []) {
      noteInjury(incident.riderId, incident.weeks, 'crash', incident.cause, stage.number);
      if (incident.abandoned) leave(incident.riderId, stage.number, 'crash', incident.cause);
    }
    // General classification: stage time minus finish bonuses on road stages.
    out.order.forEach((row, rank) => {
      gc.set(row.rider.id, gc.get(row.rider.id) + row.time - (stage.type !== 'itt' ? FINISH_BONUS[rank] || 0 : 0));
      placeSum.set(row.rider.id, placeSum.get(row.rider.id) + rank + 1);
    });
    // Points: the finish, and the intermediate sprint.
    const scale = pointsScaleFor(stage);
    out.order.slice(0, scale.length).forEach((row, rank) => points.set(row.rider.id, points.get(row.rider.id) + scale[rank]));
    if (out.sprint) out.sprint.order.forEach((id, rank) => points.set(id, points.get(id) + (POINTS.intermediate[rank] || 0)));
    // Mountains: points over every categorised summit, double at a summit finish.
    for (const summit of out.summits) { const scaleK = KOM[summit.category] || []; summit.order.forEach((id, rank) => kom.set(id, kom.get(id) + Math.round((scaleK[rank] || 0) * (summit.finish ? 1.5 : 1)))); }
    // Team classification: the best three riders' times on each stage.
    const teamRows = new Map();
    for (const row of out.order) { const id = row.rider.teamId || row.team?.id; if (!teamRows.has(id)) teamRows.set(id, []); if (teamRows.get(id).length < 3) teamRows.get(id).push(row.time); }
    for (const [id, times] of teamRows) if (times.length === 3) teamTime.set(id, (teamTime.get(id) ?? 0) + times[0] + times[1] + times[2]); else teamTime.set(id, Infinity);
    // Fatigue carried into tomorrow: good recoverers shed more of it; rest days help everyone.
    for (const b of base) {
      if (!active.has(b.id)) continue;
      const decay = 0.5 + ((100 - b.recovery) / 100) * 0.45;
      // Winning costs: a victory or a podium is ridden in the red, and the legs remember it tomorrow.
      const place = out.order.findIndex((row) => row.rider.id === b.id), podiumCost = stage.type === 'itt' ? 0 : place === 0 ? 3 : place > 0 && place < 3 ? 1.2 : 0;
      let next = ((carry.get(b.id) || 0) + (out.effort.get(b.id) || 0) * 0.9 + podiumCost) * decay;
      if (stage.restAfter) next *= 0.55;
      carry.set(b.id, next);
    }

    // Sprinters suffer in the high mountains: some miss the time cut or climb off to save
    // themselves for the next goal.
    const quitters = [];
    if (stage.type === 'mountain' && total >= 15 && stage.number >= 8) {
      const pointsLeader = leaderOf(points);
      for (const id of [...active]) { const b = byId.get(id); if (b.rider.terrain !== 'sprinter') continue; if (random() < (id === pointsLeader ? 0.02 : 0.06)) quitters.push(id); }
      for (const id of quitters) leave(id, stage.number, 'abandon', random() < 0.5 ? 'outside the time limit' : 'climbed off in the mountains');
    }
    const after = gcOrder(), afterLeader = after[0][1];
    const youngId = after.find(([id]) => byId.get(id).rider.age <= YOUTH_AGE)?.[0] || null;
    const top10 = after.slice(0, 10).map(([id, t], i) => ({ rank: i + 1, riderId: id, name: byId.get(id).rider.name, teamId: byId.get(id).rider.teamId, gap: t - afterLeader }));
    gcProgress.push({ stage: stage.number, top10 });
    rankMaps.push(new Map(after.map(([id], i) => [id, i + 1])));
    const winner = out.order[0].rider;
    stageWins.set(winner.id, (stageWins.get(winner.id) || 0) + 1);
    const previousLeader = leaderBefore || order[0][0], newLeader = after[0][0];
    const raceDetail = { ...out.race, timeline: [...out.race.timeline] };
    if (!detail) delete raceDetail.snapshots;
    if (quitters.length) raceDetail.timeline.push({ km: stage.distance, kind: 'abandon', text: `${quitters.map((id) => byId.get(id).rider.name).join(', ')} ${quitters.length === 1 ? 'is' : 'are'} out of the race: the mountains were too much for the sprinter${quitters.length === 1 ? '' : 's'}.`, riderIds: quitters });
    if (nonStarters.length) raceDetail.timeline.unshift({ km: 0, kind: 'abandon', text: `${nonStarters.map((id) => byId.get(id).rider.name).join(', ')} ${nonStarters.length === 1 ? 'does' : 'do'} not start: illness.`, riderIds: nonStarters });
    if (stage.number > 1 && previousLeader !== newLeader && !active.has(previousLeader)) raceDetail.timeline.push({ km: stage.distance, kind: 'jersey', text: `${byId.get(previousLeader).rider.name}, the race leader, has abandoned — ${byId.get(newLeader).rider.name} inherits the jersey.`, riderIds: [newLeader, previousLeader] });
    else if (stage.number > 1 && previousLeader !== newLeader) raceDetail.timeline.push({ km: stage.distance, kind: 'jersey', text: `${byId.get(newLeader).rider.name} takes the leader's jersey from ${byId.get(previousLeader).rider.name}${after[1] ? ` and leads by ${formatRaceGap(after[1][1] - afterLeader)}` : ''}.`, riderIds: [newLeader, previousLeader] });
    stages.push({
      number: stage.number, profile: stage.profile, type: stage.type, title: stage.title, distance: stage.distance, queen: Boolean(stage.queen), restAfter: Boolean(stage.restAfter),
      winnerId: winner.id, winnerName: winner.name, teamId: winner.teamId,
      top5: out.order.slice(0, 5).map((row, rank) => ({ rank: rank + 1, riderId: row.rider.id, name: row.rider.name, teamId: row.rider.teamId, gap: row.time })),
      jerseys: { gc: newLeader, points: leaderOf(points), mountains: leaderOf(kom), young: youngId },
      leaderChange: stage.number > 1 && previousLeader !== newLeader,
      race: raceDetail
    });
  }

  const final = gcOrder(), leaderTime = final[0][1];
  const podium = final.slice(0, 3).map(([id]) => id);
  const positionHistory = Object.fromEntries(podium.map((id) => [id, rankMaps.map((map) => Math.min(21, map.get(id) || 21))]));
  const teamFinal = [...teamTime.entries()].filter(([, t]) => Number.isFinite(t)).sort((a, b) => a[1] - b[1]);
  return {
    stages, gcProgress, positionHistory,
    final: final.map(([id, t]) => ({ rider: byId.get(id).rider, team: byId.get(id).team, time: t - leaderTime, gap: t - leaderTime })),
    jerseys: { points: leaderOf(points), mountains: leaderOf(kom), young: final.find(([id]) => byId.get(id).rider.age <= YOUTH_AGE)?.[0] || null },
    teamClassification: teamFinal[0]?.[0] || null,
    abandons, injuries: [...injuries.values()],
    standings: { points: [...points.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10), mountains: [...kom.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10) }
  };
}
