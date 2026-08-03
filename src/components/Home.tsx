import { useMemo, useState } from 'react';
import { useGame, type SaveSlot } from '../state/store';

export function Home() {
  const newGame = useGame((s) => s.newGame);
  const loadGame = useGame((s) => s.loadGame);
  const deleteGame = useGame((s) => s.deleteGame);
  const getSaveSlots = useGame((s) => s.getSaveSlots);
  const [revision, setRevision] = useState(0);

  const slots = useMemo(() => getSaveSlots(), [getSaveSlots, revision]);

  const removeSlot = (slot: SaveSlot) => {
    if (!confirm(`Delete Universe ${slot}? This cannot be undone.`)) return;
    deleteGame(slot);
    setRevision((value) => value + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-10">
      <div className="max-w-6xl w-full text-center">
        <div className="masthead-paper px-6 py-8 sm:px-10 sm:py-10 mb-8">
          <div className="font-sans tracking-[0.42em] text-[10px] sm:text-xs opacity-60 mb-2">EST · MMXXVI</div>
          <h1 className="font-display font-black text-6xl sm:text-8xl leading-none mb-2">
            PELOTON<span className="text-rouge">.</span>
          </h1>
          <div className="font-body italic text-lg sm:text-2xl opacity-75 mb-1">The Season Almanac</div>
          <div className="rule mt-6 mb-6 max-w-xs mx-auto" />

          <p className="font-body text-base sm:text-lg leading-relaxed mb-2 max-w-3xl mx-auto">
            A cycling universe presented like an old sporting paper: one season at a time, every race with memory, every rider with a story.
          </p>
          <p className="font-body opacity-70 mb-0 max-w-3xl mx-auto text-sm sm:text-base">
            Choose one of three independent universes. Each slot saves automatically after every race and season update.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {slots.map((slot) => (
            <div key={slot.slot} className="card-paper p-5 min-h-[250px] flex flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-ink/20 pb-3">
                <div>
                  <div className="font-sans tracking-[0.25em] text-[10px] opacity-55">SAVE SLOT</div>
                  <div className="font-display font-black text-3xl">Universe {slot.slot}</div>
                </div>
                <div className={`font-mono text-[10px] px-2 py-1 border ${slot.occupied ? 'border-ink/30' : 'border-ink/15 opacity-45'}`}>
                  {slot.occupied ? 'ACTIVE SAVE' : 'EMPTY'}
                </div>
              </div>

              {slot.occupied ? (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-5 text-sm flex-1">
                    <SlotStat label="Season" value={String(slot.currentYear)} />
                    <SlotStat label="Volume" value={String((slot.currentYear ?? 2026) - (slot.startYear ?? 2026) + 1)} />
                    <SlotStat label="Riders" value={String(slot.activeRiders ?? '—')} />
                    <SlotStat label="Seed" value={(slot.seed ?? 0).toString(16).toUpperCase().slice(0, 6)} />
                  </div>
                  <button className="btn-vintage w-full" onClick={() => loadGame(slot.slot)}>Continue</button>
                  <button className="mt-3 text-xs underline opacity-55 hover:opacity-100 text-center" onClick={() => removeSlot(slot.slot)}>
                    delete universe
                  </button>
                </>
              ) : (
                <>
                  <div className="font-body italic opacity-55 py-7 flex-1">
                    Start a fresh cycling history with a newly generated peloton.
                  </div>
                  <button className="btn-vintage outline w-full" onClick={() => newGame(slot.slot)}>Begin Universe</button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <Stat label="Teams" value="12" />
          <Stat label="Riders" value="120" />
          <Stat label="Races / Yr" value="20" />
        </div>
      </div>
    </div>
  );
}

function SlotStat({ label, value }: { label: string; value: string }) {
  return <div><div className="font-mono font-bold">{value}</div><div className="font-sans tracking-wider text-[10px] opacity-50 uppercase">{label}</div></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-paper px-4 py-3 text-center">
      <div className="font-display font-black text-3xl">{value}</div>
      <div className="font-sans tracking-widest text-xs opacity-60 uppercase mt-1">{label}</div>
    </div>
  );
}
