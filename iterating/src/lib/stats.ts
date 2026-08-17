import { Habit, Logs } from '@/store/types';
import { addDays, rangeOfDays, todayISO } from './date';

export const valueOn = (logs: Logs, habitId: string, iso: string) => logs[habitId]?.[iso] ?? 0;

/** A day "kept" means you did the thing at all — any reps count, targets are separate. */
export const kept = (value: number) => value > 0;

/**
 * Heat level 0–4. Binary habits are on or off; count habits are shaded against
 * the bigger of your daily target and your personal best, so a heavy day is
 * always the darkest square you own.
 */
export function heatLevel(habit: Habit, value: number, scale: number) {
  if (value <= 0) return 0;
  if (habit.kind === 'binary') return 4;
  const ratio = value / Math.max(scale, 1);
  return Math.min(4, Math.max(1, Math.ceil(ratio * 4)));
}

export function heatScale(habit: Habit, logs: Logs) {
  const values = Object.values(logs[habit.id] ?? {});
  const best = values.length ? Math.max(...values) : 0;
  return Math.max(habit.target ?? 0, best, 1);
}

export function currentStreak(habit: Habit, logs: Logs, today = todayISO()) {
  // Today not being logged yet shouldn't read as a broken streak.
  let cursor = kept(valueOn(logs, habit.id, today)) ? today : addDays(today, -1);
  let n = 0;
  while (kept(valueOn(logs, habit.id, cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function longestStreak(habit: Habit, logs: Logs) {
  const days = Object.keys(logs[habit.id] ?? {})
    .filter((d) => kept(logs[habit.id][d]))
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function totalIn(habit: Habit, logs: Logs, days: string[]) {
  return days.reduce((sum, d) => sum + valueOn(logs, habit.id, d), 0);
}

export function keptIn(habit: Habit, logs: Logs, days: string[]) {
  return days.filter((d) => kept(valueOn(logs, habit.id, d))).length;
}

export function lastNDays(n: number, today = todayISO()) {
  return rangeOfDays(addDays(today, -(n - 1)), n);
}

/** How much of the whole day's slate you kept — the Home pulse. */
export function dayCompletion(habits: Habit[], logs: Logs, iso: string) {
  const live = habits.filter((h) => h.createdAt <= iso);
  if (!live.length) return 0;
  const done = live.filter((h) => kept(valueOn(logs, h.id, iso))).length;
  return done / live.length;
}

export function completionLevel(fraction: number) {
  if (fraction <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil(fraction * 4)));
}
