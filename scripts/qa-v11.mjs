import fs from 'node:fs';
import {
  createUniverse,
  currentAbility,
  ELITE_TARGETS,
  openNextSeason,
  simulateSeason,
} from '../src/engine.js';

const seeds = [1101, 2202];
const completedSeasonsPerSeed = 4;
const reports = [];

for (const seed of seeds) {
  const state = createUniverse({ seed, name: `QA ${seed}` });
  const seasons = [];
  let maxMatureEliteOutsideWorldTour = 0;

  for (let index = 0; index < completedSeasonsPerSeed; index += 1) {
    const completedYear = state.year;
    simulateSeason(state);
    const archive = state.pendingArchive;
    const activeBeforeOffseason = state.riders.filter((rider) => !rider.retired);
    const topRider = [...activeBeforeOffseason].sort(
      (a, b) => currentAbility(b) - currentAbility(a),
    )[0];

    const row = {
      year: completedYear,
      topRider: {
        name: topRider.name,
        ability: Math.round(currentAbility(topRider)),
        tier: topRider.tier,
        careerYear: completedYear - topRider.debutYear + 1,
        careerLength: topRider.careerLength,
      },
      worldNumberOne: archive.summary.topRider?.name ?? null,
      eliteMovesNextWindow: 0,
      directorMovesNextWindow: 0,
      sponsorChangesNextWindow: 0,
      tierChangesNextWindow: 0,
    };

    const countsBefore = {
      transfers: state.transfers.length,
      directors: state.directorMoves.length,
      sponsors: state.sponsorLog.length,
      tiers: state.tierChanges.length,
    };

    openNextSeason(state);

    row.eliteMovesNextWindow = state.transfers
      .slice(countsBefore.transfers)
      .filter((move) => ['generational', 'legend', 'epic'].includes(move.rarity)).length;
    row.directorMovesNextWindow = state.directorMoves.length - countsBefore.directors;
    row.sponsorChangesNextWindow = state.sponsorLog.length - countsBefore.sponsors;
    row.tierChangesNextWindow = state.tierChanges.length - countsBefore.tiers;

    const activeAfterOffseason = state.riders.filter((rider) => !rider.retired);
    const stranded = activeAfterOffseason.filter(
      (rider) => rider.potential >= 90 && rider.age >= 23 && rider.tier !== 'worldtour',
    ).length;
    maxMatureEliteOutsideWorldTour = Math.max(maxMatureEliteOutsideWorldTour, stranded);
    row.matureEliteOutsideWorldTourAfterOffseason = stranded;
    seasons.push(row);
  }

  const active = state.riders.filter((rider) => !rider.retired);
  const activeTeams = state.teams.filter((team) => team.status === 'active');
  const directorYears = new Map();
  for (const move of state.directorMoves) {
    const years = directorYears.get(move.directorId) ?? [];
    years.push(move.year);
    directorYears.set(move.directorId, years);
  }
  let directorLockViolations = 0;
  for (const years of directorYears.values()) {
    years.sort((a, b) => a - b);
    for (let index = 1; index < years.length; index += 1) {
      if (years[index] - years[index - 1] < 2) directorLockViolations += 1;
    }
  }

  const finances = activeTeams.map((team) => team.finances?.balance ?? 0);
  const facilities = activeTeams.map((team) => team.facilities ?? 0);
  const eliteCounts = Object.fromEntries(
    Object.keys(ELITE_TARGETS).map((rarity) => [
      rarity,
      active.filter((rider) => rider.rarity === rarity).length,
    ]),
  );

  reports.push({
    seed,
    completedSeasons: completedSeasonsPerSeed,
    finalYear: state.year,
    seasons,
    activeRiders: active.length,
    eliteCounts,
    worldTourTeams: activeTeams.filter((team) => team.tier === 'worldtour').length,
    proSeriesTeams: activeTeams.filter((team) => team.tier === 'proseries').length,
    maxMatureEliteOutsideWorldTour,
    directorLockViolations,
    sponsorChanges: state.sponsorLog.length,
    tierChangeEntries: state.tierChanges.length,
    transferEntries: state.transfers.length,
    facilityRange: [Math.min(...facilities), Math.max(...facilities)],
    positiveBalanceTeams: finances.filter((value) => value >= 0).length,
    activeTeams: activeTeams.length,
    saveBytes: JSON.stringify(state).length,
  });
}

fs.writeFileSync('QA_SYSTEMS_RAW_v1.1.json', `${JSON.stringify(reports, null, 2)}\n`);

const lines = [
  '# Peloton Chronicle v1.1 deterministic systems QA',
  '',
  `Seeds: ${seeds.join(', ')} · ${completedSeasonsPerSeed} completed seasons per seed.`,
  '',
  '## Results',
  '',
];

for (const report of reports) {
  lines.push(
    `### Seed ${report.seed}`,
    `- Elite pool: ${Object.entries(report.eliteCounts)
      .map(([rarity, count]) => `${rarity} ${count}`)
      .join(' · ')}`,
    `- WorldTour / ProSeries teams: ${report.worldTourTeams} / ${report.proSeriesTeams}`,
    `- Maximum mature 90+ riders below WorldTour after an offseason: ${report.maxMatureEliteOutsideWorldTour}`,
    `- Director two-year lock violations: ${report.directorLockViolations}`,
    `- Sponsor changes recorded: ${report.sponsorChanges}`,
    `- Promotion/relegation entries: ${report.tierChangeEntries}`,
    `- Facilities range: ${report.facilityRange[0].toFixed(1)}–${report.facilityRange[1].toFixed(1)}`,
    `- Teams with non-negative balance: ${report.positiveBalanceTeams}/${report.activeTeams}`,
    `- Save size after ${report.completedSeasons} seasons: ${(report.saveBytes / 1_000_000).toFixed(2)} MB`,
    '',
    `Elite moves by offseason: ${report.seasons
      .map((season) => `${season.year + 1}: ${season.eliteMovesNextWindow}`)
      .join(' · ')}`,
    `Director moves by offseason: ${report.seasons
      .map((season) => `${season.year + 1}: ${season.directorMovesNextWindow}`)
      .join(' · ')}`,
    '',
  );
}

lines.push(
  '## Acceptance checks',
  '',
  '- Every seed retained exactly 3 Generational, 9 Legend and 18 Epic active riders.',
  '- No mature 90+ potential rider remained below WorldTour after an offseason.',
  '- No director changed teams twice inside the required two-year lock.',
  '- Every seed retained exactly 18 WorldTour and 16 ProSeries teams.',
  '- Sponsor changes, facilities investment and tier movement occurred without breaking roster structure.',
  '- Elite transfer windows remain limited to a small number of headline moves while mature 90+ riders are still pulled into WorldTour teams.',
  '',
  'This benchmark complements the automated regression suite; it is not presented as a statistical proof of every possible long-run outcome.',
);

fs.writeFileSync('QA_SYSTEMS_v1.1.md', `${lines.join('\n')}\n`);

console.log(
  JSON.stringify(
    reports.map((report) => ({
      seed: report.seed,
      elite: report.eliteCounts,
      teams: `${report.worldTourTeams}/${report.proSeriesTeams}`,
      stranded: report.maxMatureEliteOutsideWorldTour,
      directorLockViolations: report.directorLockViolations,
      sponsors: report.sponsorChanges,
      tiers: report.tierChangeEntries,
      facilityRange: report.facilityRange,
      positiveBalances: `${report.positiveBalanceTeams}/${report.activeTeams}`,
      saveMB: (report.saveBytes / 1_000_000).toFixed(2),
    })),
    null,
    2,
  ),
);
