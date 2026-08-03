import { useGame } from '../state/store';
import { MONTH_NAMES } from '../data/calendar';

export function Header() {
  const universe = useGame((s) => s.universe);
  const view = useGame((s) => s.view);
  const setView = useGame((s) => s.setView);
  const returnToHome = useGame((s) => s.returnToHome);
  const activeSlot = useGame((s) => s.activeSlot);
  if (!universe) return null;

  const navItems: { id: typeof view; label: string; number: string }[] = [
    { id: 'calendar', label: 'Calendar', number: 'I' },
    { id: 'race', label: 'Live Race', number: 'II' },
    { id: 'season', label: 'Season Ledger', number: 'III' },
    { id: 'standings', label: 'Rankings', number: 'IV' },
    { id: 'riders', label: 'Riders', number: 'V' },
    { id: 'teams', label: 'Teams', number: 'VI' },
    { id: 'history', label: 'Archives', number: 'VII' },
  ];

  const inRace = !!universe.season.activeRace;
  const completed = universe.season.completedEvents.length;
  const total = universe.season.calendar.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const nextEvent = universe.season.calendar[universe.season.currentEventIndex];
  const activeEvent = universe.season.activeRace
    ? universe.season.calendar.find((event) => event.id === universe.season.activeRace?.eventId)
    : null;

  return (
    <header className="almanac-shell-header">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 py-3 sm:py-5">
        <div className="almanac-masthead">
          <div className="almanac-masthead__edition">
            <span>THE INTERNATIONAL CYCLING RECORD</span>
            <span className="hidden sm:inline">·</span>
            <span>VOLUME {universe.currentYear - universe.startYear + 1}</span>
            <span className="hidden sm:inline">·</span>
            <span>ANNO {universe.currentYear}</span>
          </div>

          <div className="almanac-masthead__main">
            <div className="min-w-0">
              <h1 className="font-display font-black leading-none text-[3.15rem] sm:text-[5.4rem] tracking-[-0.045em]">
                PELOTON<span className="text-rouge">.</span>
              </h1>
              <div className="font-body italic text-sm sm:text-lg opacity-70 mt-1">
                The season almanac of roads, riders and remembered victories
              </div>
            </div>

            <div className="almanac-masthead__stamp">
              <div className="font-sans text-[9px] tracking-[0.22em] opacity-60">UNIVERSE</div>
              <div className="font-display text-2xl font-bold leading-none">No. {activeSlot ?? '—'}</div>
              <div className="font-mono text-[10px] opacity-60 mt-1">
                {universe.seed.toString(16).toUpperCase().slice(0, 6)}
              </div>
              <button className="almanac-text-link mt-2" onClick={returnToHome}>
                Save editions
              </button>
            </div>
          </div>

          <div className="almanac-status-strip">
            <div className="almanac-status-strip__label">SEASON DISPATCH</div>
            <div className="almanac-status-strip__story">
              <strong>{completed}/{total} races filed</strong>
              <span className="opacity-45">·</span>
              {activeEvent ? (
                <span><strong>On the road:</strong> {activeEvent.name}</span>
              ) : nextEvent ? (
                <span><strong>Next:</strong> {nextEvent.name}, {MONTH_NAMES[nextEvent.month]}</span>
              ) : (
                <span><strong>Edition complete</strong></span>
              )}
            </div>
            <div className="almanac-status-strip__progress" aria-label={`${progress}% of season complete`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="font-mono text-[10px] opacity-65">{progress}%</div>
          </div>

          <div className="almanac-contents-label">
            <span>CONTENTS</span>
            <span>SELECT A SECTION OF THE ANNUAL</span>
          </div>

          <nav className="almanac-nav" aria-label="Main almanac sections">
            {navItems.map((item) => {
              const disabled = item.id === 'race' && !inRace;
              const active = view === item.id || (item.id === 'race' && view === 'race');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (disabled) return;
                    setView(item.id);
                  }}
                  className={`almanac-nav__item ${active ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}`}
                  disabled={disabled}
                >
                  <span className="almanac-nav__number">{item.number}</span>
                  <span className="almanac-nav__label">{item.label}</span>
                  {item.id === 'race' && inRace && <span className="almanac-nav__live">LIVE</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
