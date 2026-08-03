import { useMemo } from 'react';
import { useGame } from '../state/store';
import {
  SKILL_KEYS,
  SKILL_LABELS,
  ARCHETYPE_LABELS,
  ARCHETYPE_TAGLINES,
  RACE_SPECIALTY_LABELS,
  RACE_SPECIALTY_TAGLINES,
} from '../types';
import { MONTH_NAMES } from '../data/calendar';
import { annualOverall, baseOverall, currentPerformanceOverall } from '../engine/riderRatings';
import { Flag } from '../utils/flags';
import { eventName, terrainLabel } from '../utils/eventNames';
import type { Rider } from '../types';
import { getCurrentYearStats, getRiderEventLedger, type RiderEventLedger } from '../utils/riderSeason';

export function RiderDetailView() {
  const universe = useGame((s) => s.universe);
  const selectedRiderId = useGame((s) => s.selectedRiderId);
  const selectTeam = useGame((s) => s.selectTeam);
  const setView = useGame((s) => s.setView);
  if (!universe || !selectedRiderId) return null;

  const rider = universe.riders[selectedRiderId];
  if (!rider) return null;
  const team = universe.teams[rider.teamId];

  const yearsIn = universe.currentYear - rider.careerStartYear;
  const yearsLeft = rider.careerLength - yearsIn;
  const pts = universe.season.individualPoints[rider.id] ?? 0;
  const currentYearStats = getCurrentYearStats(universe, rider);
  const ledger = getRiderEventLedger(universe, rider);

  const ledgerByMonth = useMemo(() => {
    const grouped: Array<{ month: number; entries: RiderEventLedger[] }> = [];
    for (const entry of ledger) {
      const existing = grouped.find((item) => item.month === entry.event.month);
      if (existing) existing.entries.push(entry);
      else grouped.push({ month: entry.event.month, entries: [entry] });
    }
    return grouped;
  }, [ledger]);

  const currentYearJerseys =
    currentYearStats.jerseys.gc.length +
    currentYearStats.jerseys.points.length +
    currentYearStats.jerseys.mountain.length +
    currentYearStats.jerseys.youth.length;
  const raceDays = ledger
    .filter((entry) => entry.completed && entry.participated)
    .reduce((sum, entry) => sum + entry.event.stages.length, 0);
  const currentYearMonuments = ledger.filter(
    (entry) => entry.completed && entry.position === 1 && entry.event.category === 'monument',
  ).length;
  const currentYearGrandTours = ledger.filter(
    (entry) => entry.completed && entry.position === 1 && entry.event.category === 'grand-tour',
  ).length;

  return (
    <div className="pt-8">
      <button
        onClick={() => setView('riders')}
        className="text-sm font-body opacity-60 hover:opacity-100 mb-4"
      >
        ← Back to riders
      </button>

      <div className="masthead-paper p-5 md:p-7 mb-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="font-sans tracking-widest text-xs opacity-60 flex items-center gap-2">
              <span><Flag code={rider.nationality} /></span>
              <span>{rider.nationality}</span>
              {rider.retired && <span className="ml-2 text-rouge">· RETIRED</span>}
            </div>
            <div className="font-display font-black text-4xl md:text-6xl leading-none mt-1 text-balance">
              {rider.name}
            </div>
            <div className="font-body italic mt-2 opacity-80 max-w-3xl">
              {team && (
                <button onClick={() => selectTeam(team.id)} className="hover:underline font-semibold">
                  {team.name}
                </button>
              )}
              {!team && rider.retired && <span>Retired from competition</span>}
              <span className="opacity-60"> · </span>
              {ARCHETYPE_TAGLINES[rider.archetype]} {RACE_SPECIALTY_TAGLINES[rider.raceSpecialty]}
            </div>
          </div>
          <div className="text-right max-w-sm">
            <div className={`text-sm uppercase tracking-widest font-bold rarity-${rider.rarity}`}>
              {rider.rarity}
            </div>
            <div className="font-display text-lg font-bold">
              {ARCHETYPE_LABELS[rider.archetype]}
            </div>
            <div className="font-body italic text-sm opacity-75">
              {RACE_SPECIALTY_LABELS[rider.raceSpecialty]}
            </div>
            <div className="font-mono text-xs opacity-60 mt-2">
              Age {rider.age} · {rider.phase} · Year {Math.max(0, yearsIn) + 1}/{rider.careerLength}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        <Stat label="Race Wins" value={rider.totals.raceWins} />
        <Stat label="Stage Wins" value={rider.totals.stageWins} />
        <Stat label="Grand Tours" value={rider.totals.gtWins} />
        <Stat label="Monuments" value={rider.totals.monumentWins} />
        <Stat label="Tours" value={rider.totals.tourWins} />
        <Stat label="Giros" value={rider.totals.giroWins} />
        <Stat label="Pts" value={rider.totals.points} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 mb-6">
        <div className="card-paper p-5">
          <div className="flex items-baseline gap-3 mb-4">
            <div className="font-display font-bold text-xl">Identity & Attributes</div>
            <div className="flex-1 rule" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
            <div className="space-y-2">
              {SKILL_KEYS.map((k) => (
                <SkillBar key={k} label={SKILL_LABELS[k]} value={rider.skills[k]} />
              ))}
              <div className="rule my-3" />
              <SkillBar label="Leadership" value={rider.leadership} accent />
              <SkillBar label="Consistency" value={rider.consistency} accent />
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Base rating" value={baseOverall(rider).toFixed(1)} />
              <Row label="Annual rating" value={annualOverall(rider, universe.currentYear).toFixed(1)} />
              <Row label="Current performance" value={currentPerformanceOverall(rider, universe.currentYear).toFixed(1)} />
              <Row label="Annual shape" value={formatDelta(rider.seasonForm ?? 1)} />
              <Row label="Career momentum" value={formatDelta(rider.careerMomentum ?? 1)} />
              <Row label="Stamina" value={`${Math.round(rider.stamina ?? 100)}/100`} />
              <Row label="Years remaining" value={rider.retired ? '—' : Math.max(0, yearsLeft).toString()} />
              <Row label="Joined peloton" value={rider.careerStartYear.toString()} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-paper p-5">
            <div className="flex items-baseline gap-3 mb-3">
              <div className="font-display font-bold text-xl">{universe.currentYear} season</div>
              <div className="flex-1 rule" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SeasonTile label="Grand Tours" value={currentYearGrandTours} />
              <SeasonTile label="Monuments" value={currentYearMonuments} />
              <SeasonTile label="Races" value={currentYearStats.raceWins} />
              <SeasonTile label="Stages" value={currentYearStats.stageWins} />
              <SeasonTile label="Jerseys" value={currentYearJerseys} />
              <SeasonTile label="UCI points" value={pts} />
            </div>
            <div className="mt-4 text-sm space-y-1">
              <Row label="Race days" value={String(raceDays)} />
              <Row label="Team" value={team?.name ?? '—'} />
              <Row label="Phase" value={rider.phase} capitalize />
            </div>
          </div>

          <div className="card-paper p-5">
            <div className="font-display font-bold text-lg mb-3">Jerseys Won</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <JerseyTally jersey="polka" label="Mountain" count={rider.totals.mountainJerseys} />
              <JerseyTally jersey="green" label="Points" count={rider.totals.pointsJerseys} />
              <JerseyTally jersey="white" label="Youth" count={rider.totals.youthJerseys} />
            </div>
          </div>
        </div>
      </div>

      {rider.history.some((h) => h.stageWinsByDetail && h.stageWinsByDetail.length > 0) && (
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-3">
            <div className="font-display font-bold text-xl">Stage Wins · Career Breakdown</div>
            <div className="flex-1 rule" />
          </div>
          <StageWinBreakdown rider={rider} />
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <div className="font-display font-bold text-3xl">Complete year breakdown</div>
          <div className="font-sans tracking-[0.18em] text-xs text-rouge uppercase">every official race on the calendar</div>
          <div className="flex-1 rule" />
        </div>

        <div className="space-y-5">
          {ledgerByMonth.map(({ month, entries }) => (
            <div key={month} className="card-paper overflow-hidden">
              <div className="px-5 py-4 border-b border-ink/15 bg-paper-dark/35">
                <div className="font-sans tracking-[0.28em] text-sm opacity-80">{MONTH_NAMES[month].toUpperCase()}</div>
              </div>
              <div>
                {entries.map((entry, index) => (
                  <EventLedgerRow key={entry.event.id} entry={entry} isLast={index === entries.length - 1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {rider.history.length > 0 && (
        <div>
          <div className="flex items-baseline gap-3 mb-3">
            <div className="font-display font-bold text-xl">Career Timeline</div>
            <div className="flex-1 rule" />
          </div>
          <div className="card-paper overflow-x-auto">
            <table className="w-full min-w-[760px] tabular text-sm">
              <thead>
                <tr className="border-b border-ink/30">
                  <th className="text-left p-2.5 font-sans text-xs tracking-widest opacity-60">YEAR</th>
                  <th className="text-left p-2.5 font-sans text-xs tracking-widest opacity-60">AGE</th>
                  <th className="text-left p-2.5 font-sans text-xs tracking-widest opacity-60">PHASE</th>
                  <th className="text-right p-2.5 font-sans text-xs tracking-widest opacity-60">PTS</th>
                  <th className="text-left p-2.5 font-sans text-xs tracking-widest opacity-60">RACE WINS</th>
                  <th className="text-left p-2.5 font-sans text-xs tracking-widest opacity-60">STAGE WINS</th>
                  <th className="text-left p-2.5 font-sans text-xs tracking-widest opacity-60">GRAND TOURS</th>
                  <th className="text-left p-2.5 font-sans text-xs tracking-widest opacity-60">JERSEYS</th>
                </tr>
              </thead>
              <tbody>
                {[...rider.history].reverse().map((h) => (
                  <tr key={h.year} className="border-b border-ink/10 align-top">
                    <td className="p-2.5 font-mono font-bold">{h.year}</td>
                    <td className="p-2.5 font-mono">{h.age}</td>
                    <td className="p-2.5 font-mono text-xs opacity-70 capitalize">{h.phase}</td>
                    <td className="p-2.5 text-right font-mono">{h.points}</td>
                    <td className="p-2.5 font-mono text-xs">
                      {h.raceWins === 0 ? (
                        <span className="opacity-40">—</span>
                      ) : (
                        <div>
                          <div className="font-bold text-rouge">{h.raceWins}</div>
                          {(h.raceWinsBy ?? []).map((eid) => (
                            <div key={eid} className="opacity-80 whitespace-nowrap">
                              {eventName(eid)}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-xs">
                      {h.stageWins === 0 ? (
                        <span className="opacity-40">—</span>
                      ) : (
                        <div>
                          <div className="font-bold">{h.stageWins}</div>
                          {(h.stageWinsByDetail ?? []).map((d, i) => (
                            <div key={i} className="opacity-80 whitespace-nowrap">
                              {eventName(d.eventId)}: {d.count} ({terrainLabel(d.stageType)})
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-xs">
                      {Object.entries(h.grandTourFinishes).length === 0 ? (
                        <span className="opacity-40">—</span>
                      ) : (
                        Object.entries(h.grandTourFinishes).map(([eid, pos]) => (
                          <div key={eid} className="whitespace-nowrap">
                            {labelGT(eid)}:{' '}
                            <span className={pos === 1 ? 'text-rouge font-bold' : ''}>#{pos}</span>
                          </div>
                        ))
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-xs">
                      <JerseyDots jerseys={h.jerseys} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EventLedgerRow({ entry, isLast }: { entry: RiderEventLedger; isLast: boolean }) {
  const result = describeEventResult(entry);
  const chips = [
    entry.jerseys.gc ? 'GC' : null,
    entry.jerseys.points ? 'Points' : null,
    entry.jerseys.mountain ? 'KOM' : null,
    entry.jerseys.youth ? 'Youth' : null,
  ].filter(Boolean) as string[];

  return (
    <div className={`px-5 py-4 ${isLast ? '' : 'border-b border-ink/10'}`}>
      <div className="flex items-start gap-4 justify-between flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="font-display text-2xl font-bold leading-none">
              <Flag code={entry.event.country} /> {entry.event.name}
            </div>
            <CategoryBadge category={entry.event.category} />
          </div>
          <div className="font-body italic opacity-65 mt-1">
            {entry.event.stages.length} stage{entry.event.stages.length > 1 ? 's' : ''} · {eventLabel(entry)}
          </div>
        </div>
        <div className="text-left sm:text-right min-w-[170px]">
          <div className={`font-display text-2xl ${result.accent}`}>{result.title}</div>
          <div className="font-body text-sm opacity-70">{result.subtitle}</div>
        </div>
      </div>

      {(entry.stageWins > 0 || chips.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {entry.stageWins > 0 && (
            <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-paper-dark/60 border border-ink/15 text-xs font-mono">
              <strong>{entry.stageWins}</strong> stage win{entry.stageWins > 1 ? 's' : ''}
              {Object.entries(entry.stageWinsByType).length > 0 && (
                <span className="opacity-70">
                  ({Object.entries(entry.stageWinsByType).map(([type, count]) => `${terrainLabel(type)} ×${count}`).join(', ')})
                </span>
              )}
            </span>
          )}
          {chips.map((chip) => (
            <span key={chip} className="inline-block px-2 py-1 border border-ink/15 bg-paper-dark/45 text-[11px] font-sans tracking-widest uppercase">
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function describeEventResult(entry: RiderEventLedger): { title: string; subtitle: string; accent: string } {
  if (!entry.completed) {
    return { title: 'Pending', subtitle: 'Race not yet run', accent: 'opacity-70' };
  }
  if (!entry.participated) {
    return { title: 'Not selected', subtitle: 'Did not start this race', accent: 'opacity-55' };
  }
  if (entry.position === 1) {
    return { title: 'Winner', subtitle: 'Official race victory', accent: 'text-rouge font-bold' };
  }
  if (entry.position != null) {
    if (entry.position <= 3) return { title: `#${entry.position}`, subtitle: 'Podium finish', accent: 'text-ink font-bold' };
    if (entry.position <= 10) return { title: `#${entry.position}`, subtitle: 'Top ten finish', accent: 'text-ink font-bold' };
    return { title: `#${entry.position}`, subtitle: 'Finished classification', accent: 'text-ink' };
  }
  return { title: 'Outside top 30', subtitle: 'Finished off the main classification', accent: 'opacity-70' };
}

function eventLabel(entry: RiderEventLedger): string {
  switch (entry.event.category) {
    case 'grand-tour':
      return 'Grand Tour';
    case 'week-stage':
      return 'One-week stage race';
    case 'monument':
      return 'Monument';
    case 'classic':
      return 'Classic';
  }
}

function formatDelta(multiplier: number): string {
  const pct = (multiplier - 1) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

function labelGT(id: string): string {
  if (id === 'tour') return 'Tour';
  if (id === 'giro') return 'Giro';
  if (id === 'vuelta') return 'Vuelta';
  return id.toUpperCase();
}

function SkillBar({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div className="font-body w-32 text-sm opacity-80">{label}</div>
      <div className="flex-1 h-2 bg-paper-dark border border-ink/20 relative">
        <div
          className={`h-full ${accent ? 'bg-rouge' : 'bg-ink'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="font-mono text-sm w-10 text-right">{value}</div>
    </div>
  );
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink/10 pb-1">
      <dt className="opacity-60">{label}</dt>
      <dd className={`font-mono text-right ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-paper p-3 text-center">
      <div className="font-display font-black text-xl">{value.toLocaleString()}</div>
      <div className="font-sans tracking-widest text-[9px] opacity-60 uppercase mt-1">
        {label}
      </div>
    </div>
  );
}

function SeasonTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink/15 bg-paper-dark/35 px-3 py-3">
      <div className="font-display font-black text-3xl leading-none">{value.toLocaleString()}</div>
      <div className="font-sans tracking-[0.18em] text-[10px] opacity-65 uppercase mt-1">{label}</div>
    </div>
  );
}

function CategoryBadge({ category }: { category: RiderEventLedger['event']['category'] }) {
  const styles: Record<RiderEventLedger['event']['category'], string> = {
    'grand-tour': 'bg-rouge text-paper',
    monument: 'bg-ink text-paper',
    'week-stage': 'bg-maillot text-ink',
    classic: 'bg-paper-dark text-ink border border-ink/30',
  };
  const label = category === 'grand-tour'
    ? 'Grand Tour'
    : category === 'week-stage'
      ? 'Stage Race'
      : category === 'monument'
        ? 'Monument'
        : 'Classic';
  return <span className={`text-[10px] font-sans tracking-widest px-2 py-0.5 ${styles[category]}`}>{label}</span>;
}

function JerseyTally({
  jersey,
  label,
  count,
}: {
  jersey: 'green' | 'polka' | 'white';
  label: string;
  count: number;
}) {
  const cls =
    jersey === 'green' ? 'jersey-green' : jersey === 'polka' ? 'jersey-polka' : 'jersey-white';
  return (
    <div>
      <div className={`${cls} font-display font-black text-2xl py-2`}>{count}</div>
      <div className="font-sans tracking-widest text-[9px] opacity-60 uppercase mt-1">{label}</div>
    </div>
  );
}

function JerseyDots({
  jerseys,
}: {
  jerseys: { gc: string[]; points: string[]; mountain: string[]; youth: string[] };
}) {
  const total =
    jerseys.gc.length + jerseys.points.length + jerseys.mountain.length + jerseys.youth.length;
  if (total === 0) return <span className="opacity-40">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {jerseys.gc.map((id, i) => (
        <Dot key={`gc-${id}-${i}`} cls="jersey-yellow" title={`GC: ${id}`} />
      ))}
      {jerseys.points.map((id, i) => (
        <Dot key={`p-${id}-${i}`} cls="jersey-green" title={`Points: ${id}`} />
      ))}
      {jerseys.mountain.map((id, i) => (
        <Dot key={`m-${id}-${i}`} cls="jersey-polka" title={`Mountain: ${id}`} />
      ))}
      {jerseys.youth.map((id, i) => (
        <Dot key={`y-${id}-${i}`} cls="jersey-white" title={`Youth: ${id}`} />
      ))}
    </div>
  );
}

function Dot({ cls, title }: { cls: string; title: string }) {
  return <span className={`${cls} inline-block w-3 h-3`} title={title} />;
}

function StageWinBreakdown({ rider }: { rider: Rider }) {
  const byTerrain = new Map<string, { count: number; races: Map<string, number> }>();
  for (const h of rider.history) {
    for (const d of h.stageWinsByDetail ?? []) {
      let entry = byTerrain.get(d.stageType);
      if (!entry) {
        entry = { count: 0, races: new Map() };
        byTerrain.set(d.stageType, entry);
      }
      entry.count += d.count;
      entry.races.set(d.eventId, (entry.races.get(d.eventId) ?? 0) + d.count);
    }
  }
  if (byTerrain.size === 0) return null;
  const sorted = [...byTerrain.entries()].sort((a, b) => b[1].count - a[1].count);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {sorted.map(([terrain, info]) => (
        <div key={terrain} className="card-paper p-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="font-display font-bold">{terrainLabel(terrain)}</div>
            <div className="font-mono text-rouge font-bold text-2xl">{info.count}</div>
          </div>
          <div className="space-y-0.5 text-xs font-mono">
            {[...info.races.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([eid, n]) => (
                <div key={eid} className="flex justify-between opacity-80">
                  <span>{eventName(eid)}</span>
                  <span>×{n}</span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
