import type { CalendarEvent, Rider, RiderSeasonStats, Universe } from '../types';
import { annualOverall } from '../engine/riderRatings';

export interface RiderEventLedger {
  event: CalendarEvent;
  completed: boolean;
  participated: boolean;
  position: number | null;
  stageWins: number;
  stageWinsByType: Record<string, number>;
  jerseys: {
    gc: boolean;
    points: boolean;
    mountain: boolean;
    youth: boolean;
  };
}

function buildEmptySeasonStats(rider: Rider, year: number): RiderSeasonStats {
  return {
    year,
    age: rider.age,
    teamId: rider.teamId,
    phase: rider.phase,
    seasonForm: rider.seasonForm,
    careerMomentum: rider.careerMomentum,
    annualOverall: annualOverall(rider, year),
    points: 0,
    stageWins: 0,
    raceWins: 0,
    raceWinsBy: [],
    stageWinsByDetail: [],
    grandTourFinishes: {},
    jerseys: { gc: [], points: [], mountain: [], youth: [] },
  };
}

function upsertStageWin(
  stats: RiderSeasonStats,
  eventId: string,
  stageType: string,
  count = 1,
) {
  const existing = stats.stageWinsByDetail.find(
    (entry) => entry.eventId === eventId && entry.stageType === stageType,
  );
  if (existing) existing.count += count;
  else stats.stageWinsByDetail.push({ eventId, stageType, count });
}

/**
 * Rebuilds every rider's current-season cache from the authoritative completed
 * events list and current season points. This prevents detail screens from
 * drifting away from the calendar / race results when saves are reloaded.
 */
export function syncCurrentSeasonHistory(universe: Universe): void {
  const year = universe.currentYear;
  const statsByRider: Record<string, RiderSeasonStats> = {};

  const ensure = (riderId: string): RiderSeasonStats | null => {
    const rider = universe.riders[riderId];
    if (!rider) return null;
    if (!statsByRider[riderId]) statsByRider[riderId] = buildEmptySeasonStats(rider, year);
    return statsByRider[riderId];
  };

  for (const completed of universe.season.completedEvents) {
    if (completed.year !== year) continue;
    const event = universe.season.calendar.find((entry) => entry.id === completed.eventId);
    if (!event) continue;

    for (const riderId of completed.participants) {
      ensure(riderId);
    }

    for (const row of completed.finalGc) {
      const stats = ensure(row.riderId);
      if (!stats) continue;
      if (event.category === 'grand-tour') {
        stats.grandTourFinishes[event.id] = row.position;
      }
    }

    for (const winner of completed.stageWinners) {
      const stats = ensure(winner.riderId);
      if (!stats) continue;
      stats.stageWins += 1;
      upsertStageWin(stats, completed.eventId, winner.stageType, 1);
    }

    const gcWinner = completed.jerseys.gc;
    if (gcWinner) {
      const stats = ensure(gcWinner);
      if (stats && !stats.raceWinsBy.includes(completed.eventId)) {
        stats.raceWins += 1;
        stats.raceWinsBy.push(completed.eventId);
        stats.jerseys.gc.push(completed.eventId);
      }
    }
    if (completed.jerseys.points) {
      const stats = ensure(completed.jerseys.points);
      if (stats) stats.jerseys.points.push(completed.eventId);
    }
    if (completed.jerseys.mountain) {
      const stats = ensure(completed.jerseys.mountain);
      if (stats) stats.jerseys.mountain.push(completed.eventId);
    }
    if (completed.jerseys.youth) {
      const stats = ensure(completed.jerseys.youth);
      if (stats) stats.jerseys.youth.push(completed.eventId);
    }
  }

  for (const rider of Object.values(universe.riders)) {
    const rebuilt = statsByRider[rider.id];
    rider.history = rider.history.filter((entry) => entry.year !== year);
    if (rebuilt) {
      rebuilt.points = universe.season.individualPoints[rider.id] ?? 0;
      rebuilt.age = rider.age;
      rebuilt.teamId = rider.teamId;
      rebuilt.phase = rider.phase;
      rebuilt.seasonForm = rider.seasonForm;
      rebuilt.careerMomentum = rider.careerMomentum;
      rebuilt.annualOverall = annualOverall(rider, year);
      rider.history.push(rebuilt);
    }
    rider.history.sort((a, b) => a.year - b.year);
  }
}

export function getCurrentYearStats(universe: Universe, rider: Rider): RiderSeasonStats {
  const existing = rider.history.find((entry) => entry.year === universe.currentYear);
  if (existing) return existing;
  return buildEmptySeasonStats(rider, universe.currentYear);
}

export function getRiderEventLedger(universe: Universe, rider: Rider): RiderEventLedger[] {
  const currentYearStats = getCurrentYearStats(universe, rider);
  const completedById = new Map(
    universe.season.completedEvents
      .filter((entry) => entry.year === universe.currentYear)
      .map((entry) => [entry.eventId, entry]),
  );

  return [...universe.season.calendar]
    .sort((a, b) => a.month - b.month || a.weekInMonth - b.weekInMonth)
    .map((event) => {
      const completed = completedById.get(event.id);
      const participated = completed ? completed.participants.includes(rider.id) : false;
      const stageWinsByType: Record<string, number> = {};
      let stageWins = 0;
      if (completed) {
        for (const winner of completed.stageWinners) {
          if (winner.riderId !== rider.id) continue;
          stageWins += 1;
          stageWinsByType[winner.stageType] = (stageWinsByType[winner.stageType] ?? 0) + 1;
        }
      }

      let position: number | null = null;
      if (completed) {
        position = completed.finalGc.find((row) => row.riderId === rider.id)?.position ?? null;
      }
      if (position == null && event.category === 'grand-tour') {
        position = currentYearStats.grandTourFinishes[event.id] ?? null;
      }
      if (position == null && currentYearStats.raceWinsBy.includes(event.id)) {
        position = 1;
      }

      return {
        event,
        completed: !!completed,
        participated,
        position,
        stageWins,
        stageWinsByType,
        jerseys: {
          gc: currentYearStats.jerseys.gc.includes(event.id),
          points: currentYearStats.jerseys.points.includes(event.id),
          mountain: currentYearStats.jerseys.mountain.includes(event.id),
          youth: currentYearStats.jerseys.youth.includes(event.id),
        },
      };
    });
}
