import { useGame } from './state/store';
import { Home } from './components/Home';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { RaceView } from './components/RaceView';
import { SeasonView } from './components/SeasonView';
import { SeasonSummaryView } from './components/SeasonSummaryView';
import { MarketReportView } from './components/MarketReportView';
import { StandingsView } from './components/StandingsView';
import { RidersView } from './components/RidersView';
import { TeamsView } from './components/TeamsView';
import { TeamDetailView } from './components/TeamDetailView';
import { RiderDetailView } from './components/RiderDetailView';
import { HistoryView } from './components/HistoryView';

export default function App() {
  const universe = useGame((s) => s.universe);
  const view = useGame((s) => s.view);
  if (!universe) {
    return <Home />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 pb-16">
        {view === 'home' && <Home />}
        {view === 'calendar' && <CalendarView />}
        {view === 'race' && <RaceView />}
        {view === 'season' && <SeasonView />}
        {view === 'season-summary' && <SeasonSummaryView />}
        {view === 'market-report' && <MarketReportView />}
        {view === 'standings' && <StandingsView />}
        {view === 'riders' && <RidersView />}
        {view === 'teams' && <TeamsView />}
        {view === 'team-detail' && <TeamDetailView />}
        {view === 'rider-detail' && <RiderDetailView />}
        {view === 'history' && <HistoryView />}
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-8 border-t border-ink/30">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        <div className="border-y border-ink/40 py-3 flex justify-between items-center gap-4 flex-wrap">
          <div>
            <div className="font-sans tracking-[0.2em] text-[9px] opacity-55">PRINTED FOR THE ANNUAL RECORD</div>
            <div className="font-display font-bold text-lg">Peloton · Season Almanac</div>
          </div>
          <div className="font-mono text-[10px] opacity-55 text-right">
            ROADS · RIDERS · RESULTS<br />SIMULATED EDITION · MMXXVI
          </div>
        </div>
      </div>
    </footer>
  );
}
