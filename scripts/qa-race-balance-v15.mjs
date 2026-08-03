import fs from 'node:fs';
import {
  createUniverse,
  currentAbility,
  riderById,
  simulateSeason,
} from '../src/engine.js';

const SEEDS = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1010];
const GT_IDS = new Set(['giro', 'tour', 'vuelta']);
const ELITE = new Set(['generational', 'legend', 'epic']);
const MOUNTAIN_COMPATIBLE = new Set(['climber', 'all-rounder', 'puncheur']);
const FLAT_COMPATIBLE = new Set(['sprinter', 'rouleur', 'cobbles', 'all-rounder']);

function maxRollingDays(log, window = 28) {
  if (!log?.length) return 0;
  let max = 0;
  for (let day = 1; day <= 366; day += 1) {
    const total = log
      .filter(row => row.end >= day - window + 1 && row.start <= day)
      .reduce((sum, row) => sum + Math.max(0, Math.min(row.end, day) - Math.max(row.start, day - window + 1) + 1), 0);
    max = Math.max(max, total);
  }
  return max;
}

function overlapCount(log) {
  const sorted = [...(log || [])].sort((a, b) => a.start - b.start || a.end - b.end);
  let count = 0;
  for (let i = 1; i < sorted.length; i += 1) if (sorted[i].start <= sorted[i - 1].end) count += 1;
  return count;
}

const raw = [];
const totals = {
  seeds: SEEDS.length,
  grandTours: 0,
  samePointsMountains: 0,
  overAgeYoungWinners: 0,
  lowRarityGrandTourWinners: 0,
  mountainStages: 0,
  incompatibleMountainWinners: 0,
  flatStages: 0,
  incompatibleFlatWinners: 0,
  actualCalendarOverlaps: 0,
  ridersOver21DaysIn28: 0,
  maxStageWinsInGrandTour: 0,
  maxRolling28Days: 0,
  maxEliteStarts: 0,
  maxEliteRaceDays: 0,
  maxAnyStarts: 0,
  maxAnyRaceDays: 0,
};

for (const seed of SEEDS) {
  const state = createUniverse({ seed });
  simulateSeason(state);
  const gtRows = [];

  for (const result of state.eventResults.filter(row => GT_IDS.has(row.eventId))) {
    totals.grandTours += 1;
    const stageCounts = new Map();
    for (const stage of result.stages || []) {
      stageCounts.set(stage.winnerId, (stageCounts.get(stage.winnerId) || 0) + 1);
      const winner = riderById(state, stage.winnerId);
      if (stage.profile === 'mountain') {
        totals.mountainStages += 1;
        if (!MOUNTAIN_COMPATIBLE.has(winner?.terrain)) totals.incompatibleMountainWinners += 1;
      }
      if (stage.profile === 'flat') {
        totals.flatStages += 1;
        if (!FLAT_COMPATIBLE.has(winner?.terrain)) totals.incompatibleFlatWinners += 1;
      }
    }
    const maxStages = Math.max(0, ...stageCounts.values());
    totals.maxStageWinsInGrandTour = Math.max(totals.maxStageWinsInGrandTour, maxStages);
    if (result.jerseys?.points && result.jerseys.points === result.jerseys.mountains) totals.samePointsMountains += 1;
    const young = riderById(state, result.jerseys?.young);
    if (young && young.age > 23) totals.overAgeYoungWinners += 1;
    const winner = riderById(state, result.winnerId);
    if (winner && !ELITE.has(winner.rarity)) totals.lowRarityGrandTourWinners += 1;
    const pointsWinner = riderById(state, result.jerseys?.points);
    const mountainsWinner = riderById(state, result.jerseys?.mountains);
    gtRows.push({
      race: result.eventName,
      winner: winner?.name,
      winnerRarity: winner?.rarity,
      winnerProfile: winner?.terrain,
      winnerRating: winner ? Math.round(currentAbility(winner)) : null,
      maxStagesByOneRider: maxStages,
      pointsWinner: pointsWinner?.name,
      pointsProfile: pointsWinner?.terrain,
      mountainsWinner: mountainsWinner?.name,
      mountainsProfile: mountainsWinner?.terrain,
      youngWinnerAge: young?.age ?? null,
      pointsAndMountainsSame: result.jerseys?.points === result.jerseys?.mountains,
    });
  }

  let seedMaxRolling = 0;
  let seedMaxEliteStarts = 0;
  let seedMaxEliteDays = 0;
  let seedMaxAnyStarts = 0;
  let seedMaxAnyDays = 0;
  let seedOverlaps = 0;
  let seedOverloaded = 0;

  for (const rider of state.riders.filter(row => !row.retired)) {
    const rolling = maxRollingDays(rider.raceLoadLog);
    const overlaps = overlapCount(rider.raceLoadLog);
    seedMaxRolling = Math.max(seedMaxRolling, rolling);
    seedOverlaps += overlaps;
    if (rolling > 21) seedOverloaded += 1;
    seedMaxAnyStarts = Math.max(seedMaxAnyStarts, rider.currentSeason.starts || 0);
    seedMaxAnyDays = Math.max(seedMaxAnyDays, rider.currentSeason.raceDays || 0);
    if (ELITE.has(rider.rarity)) {
      seedMaxEliteStarts = Math.max(seedMaxEliteStarts, rider.currentSeason.starts || 0);
      seedMaxEliteDays = Math.max(seedMaxEliteDays, rider.currentSeason.raceDays || 0);
    }
  }

  totals.actualCalendarOverlaps += seedOverlaps;
  totals.ridersOver21DaysIn28 += seedOverloaded;
  totals.maxRolling28Days = Math.max(totals.maxRolling28Days, seedMaxRolling);
  totals.maxEliteStarts = Math.max(totals.maxEliteStarts, seedMaxEliteStarts);
  totals.maxEliteRaceDays = Math.max(totals.maxEliteRaceDays, seedMaxEliteDays);
  totals.maxAnyStarts = Math.max(totals.maxAnyStarts, seedMaxAnyStarts);
  totals.maxAnyRaceDays = Math.max(totals.maxAnyRaceDays, seedMaxAnyDays);

  raw.push({
    seed,
    grandTours: gtRows,
    calendar: {
      overlaps: seedOverlaps,
      ridersOver21DaysInRolling28: seedOverloaded,
      maxRolling28Days: seedMaxRolling,
      maxEliteStarts: seedMaxEliteStarts,
      maxEliteRaceDays: seedMaxEliteDays,
      maxAnyStarts: seedMaxAnyStarts,
      maxAnyRaceDays: seedMaxAnyDays,
    },
  });
}

const report = { generatedAt: new Date().toISOString(), modelVersion: '1.5.0', totals, seeds: raw };
fs.writeFileSync('QA_CONDITION_BALANCE_RAW_v1.5.json', JSON.stringify(report, null, 2));

const pct = (part, whole) => whole ? `${(part / whole * 100).toFixed(1)}%` : '0.0%';
const markdown = `# Peloton Chronicle v1.5 — Condition and Jersey Balance QA\n\nFixed-seed benchmark across **${totals.seeds} universes**, **${totals.grandTours} Grand Tours**, and the full professional calendar.\n\n## Calendar and condition\n\n- Actual overlapping rider starts: **${totals.actualCalendarOverlaps}**\n- Riders above 21 race days in any rolling 28-day window: **${totals.ridersOver21DaysIn28}**\n- Maximum race days in a rolling 28-day window: **${totals.maxRolling28Days}**\n- Maximum elite-rider starts in one season: **${totals.maxEliteStarts}**\n- Maximum elite-rider race days in one season: **${totals.maxEliteRaceDays}**\n- Maximum starts for any rider: **${totals.maxAnyStarts}**\n- Maximum race days for any rider: **${totals.maxAnyRaceDays}**\n\n## Grand Tour outcomes\n\n- Points and mountains won by the same rider: **${totals.samePointsMountains}/${totals.grandTours}**\n- Youth winners older than 23: **${totals.overAgeYoungWinners}/${totals.grandTours}**\n- Grand Tours won below Epic rarity: **${totals.lowRarityGrandTourWinners}/${totals.grandTours}**\n- Maximum stages won by one rider in one Grand Tour: **${totals.maxStageWinsInGrandTour}**\n- Mountain stages won by incompatible profiles: **${totals.incompatibleMountainWinners}/${totals.mountainStages} (${pct(totals.incompatibleMountainWinners, totals.mountainStages)})**\n- Flat stages won by incompatible profiles: **${totals.incompatibleFlatWinners}/${totals.flatStages} (${pct(totals.incompatibleFlatWinners, totals.flatStages)})**\n\n## Interpretation\n\nThe test is designed to catch the reported failure mode: overlapping calendars, riders entering a Grand Tour after impossible workloads, ordinary riders sweeping every terrain, combined points/mountains dominance, and over-age youth winners. Rare outliers remain possible in one-day racing, but the deterministic Grand Tour sample keeps stage and jersey outcomes profile-specific.\n\nFull seed-by-seed output is available in \`QA_CONDITION_BALANCE_RAW_v1.5.json\`.\n`;
fs.writeFileSync('QA_CONDITION_BALANCE_v1.5.md', markdown);
console.log(JSON.stringify(totals, null, 2));
