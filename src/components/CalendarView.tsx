import { useState } from 'react';
import { useGame } from '../state/store';
import { MONTH_NAMES } from '../data/calendar';
import type { CalendarEvent, EventCategory } from '../types';
import { isSeasonOver } from '../engine/season';
import { Flag } from '../utils/flags';
import { AlmanacPageHeader } from './AlmanacPageHeader';

const FILTERS: Array<{ id: 'all' | EventCategory; label: string }> = [
  { id: 'all', label: 'Complete calendar' },
  { id: 'grand-tour', label: 'Grand Tours' },
  { id: 'week-stage', label: 'Stage races' },
  { id: 'monument', label: 'Monuments' },
  { id: 'classic', label: 'Classics' },
];

export function CalendarView() {
  const universe = useGame((s) => s.universe);
  const startActiveRace = useGame((s) => s.startActiveRace);
  const setView = useGame((s) => s.setView);
  const endSeasonAndAdvance = useGame((s) => s.endSeasonAndAdvance);
  const selectRider = useGame((s) => s.selectRider);
  const [filter, setFilter] = useState<'all' | EventCategory>('all');
  if (!universe) return null;

  const { calendar, currentEventIndex, completedEvents } = universe.season;
  const seasonOver = isSeasonOver(universe);
  const currentEvent: CalendarEvent | undefined = calendar[currentEventIndex];
  const completedById = new Map(completedEvents.map((entry) => [entry.eventId, entry]));

  const visibleEvents = calendar.filter(
    (event) => filter === 'all' || event.category === filter,
  );

  const groupedMonths = new Map<number, CalendarEvent[]>();
  for (const event of visibleEvents) {
    const entries = groupedMonths.get(event.month) ?? [];
    entries.push(event);
    groupedMonths.set(event.month, entries);
  }
  const months = [...groupedMonths.entries()].sort((a, b) => a[0] - b[0]);

  const seasonLeader = Object.entries(universe.season.individualPoints)
    .sort((a, b) => b[1] - a[1])[0];
  const leaderRider = seasonLeader ? universe.riders[seasonLeader[0]] : null;
  const leaderTeam = leaderRider ? universe.teams[leaderRider.teamId] : null;

  const completedMajor = completedEvents.filter((entry) => {
    const event = calendar.find((candidate) => candidate.id === entry.eventId);
    return event?.category === 'grand-tour' || event?.category === 'monument';
  }).length;

  return (
    <div className="pt-7 sm:pt-8">
      <AlmanacPageHeader
        kicker="Road book · official programme"
        title={`${universe.currentYear} Race Calendar`}
        subtitle="The annual route through stage races, monuments and the three great tours — filed as a sporting record rather than a list of cards."
        folio="01"
        aside={
          <div>
            <div className="font-display text-3xl font-bold leading-none">
              {completedEvents.length}<span className="opacity-35">/{calendar.length}</span>
            </div>
            <div className="font-sans text-[9px] tracking-[0.18em] uppercase opacity-60 mt-1">
              dispatches filed
            </div>
          </div>
        }
      />

      {seasonOver ? (
        <div className="calendar-feature mb-7">
          <div className="calendar-feature__main">
            <div className="font-sans tracking-[0.2em] text-[10px] text-rouge mb-2">FINAL EDITION</div>
            <div className="font-display font-black text-4xl leading-none">The season is complete.</div>
            <div className="font-body italic opacity-70 mt-3 max-w-xl">
              Every result has been entered into the annual. Close the volume and open the next cycling year.
            </div>
          </div>
          <div className="calendar-feature__aside flex items-center justify-center">
            <button className="btn-vintage w-full" onClick={endSeasonAndAdvance}>
              Open {universe.currentYear + 1}
            </button>
          </div>
        </div>
      ) : currentEvent ? (
        <div className="calendar-feature mb-7">
          <div className="calendar-feature__main">
            <div className="font-sans tracking-[0.22em] text-[10px] text-rouge mb-2">NEXT DISPATCH · {MONTH_NAMES[currentEvent.month].toUpperCase()}</div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="font-display font-black text-4xl sm:text-5xl leading-[0.95]">
                <Flag code={currentEvent.country} /> {currentEvent.name}
              </div>
              <CategoryMark category={currentEvent.category} />
            </div>
            <div className="font-body italic opacity-70 mt-3 max-w-2xl">
              {describeEvent(currentEvent)}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] opacity-70">
              <span>{currentEvent.stages.length} stage{currentEvent.stages.length > 1 ? 's' : ''}</span>
              <span>{currentEvent.ridersPerTeam} riders per team</span>
              <span>{currentEvent.country}</span>
            </div>
          </div>
          <div className="calendar-feature__aside">
            <div className="font-sans tracking-[0.18em] text-[9px] opacity-60 uppercase mb-3">Editor’s desk</div>
            {leaderRider && seasonLeader ? (
              <button className="text-left w-full group" onClick={() => selectRider(leaderRider.id)}>
                <div className="font-body text-xs opacity-60">Current points leader</div>
                <div className="font-display text-2xl font-bold group-hover:text-rouge leading-tight mt-1">
                  {leaderRider.name}
                </div>
                <div className="font-mono text-[10px] opacity-60 mt-1">
                  {leaderTeam?.shortName ?? '—'} · {seasonLeader[1].toLocaleString()} pts
                </div>
              </button>
            ) : (
              <div className="font-body italic text-sm opacity-60">The first ranking will appear after the opening race.</div>
            )}
            <div className="rule my-5" />
            <div className="grid grid-cols-2 gap-3 mb-5">
              <DeskStat label="Major races" value={completedMajor} />
              <DeskStat label="Season progress" value={`${Math.round((completedEvents.length / calendar.length) * 100)}%`} />
            </div>
            <button
              className="btn-vintage w-full"
              onClick={() => {
                startActiveRace();
                setView('race');
              }}
            >
              Sign on to race
            </button>
          </div>
        </div>
      ) : null}

      <div className="calendar-index-tools mb-5">
        <div>
          <div className="font-display font-bold text-2xl leading-none">Race index</div>
          <div className="font-body italic text-xs opacity-60 mt-1">Filter the annual without losing the chronological road book.</div>
        </div>
        <div className="calendar-filter-list" aria-label="Filter calendar by race type">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              className={`calendar-filter-button ${filter === item.id ? 'is-active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        {months.map(([month, events]) => (
          <section key={month} className="calendar-month">
            <div className="calendar-month__folio">
              <div className="calendar-month__number">{String(month).padStart(2, '0')}</div>
              <div className="calendar-month__name">{MONTH_NAMES[month]}</div>
            </div>
            <div className="calendar-month__races">
              {events.map((event) => {
                const completed = completedById.get(event.id);
                const isCurrent = currentEvent?.id === event.id;
                const eventNumber = calendar.findIndex((entry) => entry.id === event.id) + 1;
                const winner = completed?.finalGc[0];
                const second = completed?.finalGc[1];
                const third = completed?.finalGc[2];
                const winnerRider = winner ? universe.riders[winner.riderId] : null;
                const winnerTeam = winner ? universe.teams[winner.teamId] : null;

                return (
                  <article
                    key={event.id}
                    className={`calendar-race-row ${isCurrent ? 'is-current' : ''} ${completed ? 'is-complete' : ''}`}
                  >
                    <div className="calendar-race-row__index">{String(eventNumber).padStart(2, '0')}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="calendar-race-row__title">
                          <Flag code={event.country} /> {event.name}
                        </div>
                        <CategoryMark category={event.category} />
                        {isCurrent && <span className="calendar-current-tag">ON DECK</span>}
                      </div>
                      <div className="calendar-race-row__meta">
                        <span>{event.shortName}</span>
                        <span>·</span>
                        <span>{event.stages.length} stage{event.stages.length > 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>{event.country}</span>
                        <span>·</span>
                        <span>{event.ridersPerTeam} per team</span>
                      </div>
                    </div>

                    <div className="calendar-race-row__result">
                      {completed && winnerRider ? (
                        <>
                          <div className="calendar-winner-line">
                            <span className="opacity-55">Winner </span>
                            <button className="hover:underline" onClick={() => selectRider(winnerRider.id)}>
                              <strong>{winnerRider.name}</strong>
                            </button>
                          </div>
                          <div className="font-mono text-[9px] opacity-55 mt-1">
                            {winnerTeam?.shortName ?? '—'} · official result filed
                          </div>
                          <div className="calendar-podium-mini">
                            {second && <span>2 {abbreviateName(universe.riders[second.riderId]?.name)}</span>}
                            {third && <span>3 {abbreviateName(universe.riders[third.riderId]?.name)}</span>}
                          </div>
                        </>
                      ) : isCurrent ? (
                        <>
                          <div className="font-display text-xl font-bold text-rouge">Next race</div>
                          <div className="font-body italic text-xs opacity-60 mt-1">Awaiting the start list</div>
                        </>
                      ) : (
                        <>
                          <div className="font-display text-lg opacity-55">Scheduled</div>
                          <div className="font-body italic text-xs opacity-50 mt-1">Result not yet filed</div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function DeskStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-ink/20 bg-paper/50 px-3 py-3 text-center">
      <div className="font-display text-2xl font-bold leading-none">{value}</div>
      <div className="font-sans text-[8px] tracking-[0.15em] opacity-55 uppercase mt-1">{label}</div>
    </div>
  );
}

function describeEvent(event: CalendarEvent): string {
  if (event.category === 'grand-tour') {
    return `Three weeks of accumulated time, fatigue and terrain. ${event.name} is one of the season’s defining chapters.`;
  }
  if (event.category === 'week-stage') {
    return 'A compact stage race where form, time trialling and recovery are tested over one decisive week.';
  }
  if (event.category === 'monument') {
    return 'One of cycling’s monuments: a single day, a historic route and almost no margin for error.';
  }
  return 'A one-day classic where terrain specialty, timing and race craft decide the result.';
}

function CategoryMark({ category }: { category: EventCategory }) {
  const label = category === 'grand-tour'
    ? 'Grand Tour'
    : category === 'week-stage'
      ? 'Stage Race'
      : category === 'monument'
        ? 'Monument'
        : 'Classic';
  return (
    <span className={`calendar-category-mark calendar-category-mark--${category}`}>
      {label}
    </span>
  );
}

function abbreviateName(name?: string): string {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}
