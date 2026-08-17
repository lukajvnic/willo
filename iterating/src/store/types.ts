export type HabitKind = 'binary' | 'count';

export interface Habit {
  id: string;
  name: string;
  category: string;
  kind: HabitKind;
  /** count habits only — 'push-ups', 'pages', 'minutes' */
  unit?: string;
  /** count habits only — a full day's worth, used to scale the heatmap */
  target?: number;
  createdAt: string;
  /** friend ids this habit has been shared with */
  sharedWith: string[];
}

/** habitId -> ISO date -> value. Binary habits store 0 or 1. */
export type Logs = Record<string, Record<string, number>>;

export type ReminderKind = 'fixed' | 'window';

/** 1 is the thing you'd protect first. */
export type Priority = 1 | 2 | 3;

export interface Reminder {
  id: string;
  title: string;
  note?: string;
  kind: ReminderKind;
  /** fixed: the day it happens. window: the first day it may happen. */
  date: string;
  /** fixed only, 'HH:MM' */
  time?: string;
  /** window only, inclusive last day */
  endDate?: string;
  priority: Priority;
  doneOn?: string;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  /** normalised habit name -> what they've done with it */
  stats: Record<string, { streak: number; week: number }>;
}

export interface Goal {
  text: string;
  setAt: string;
}

export interface State {
  profile: { name: string; email: string };
  goal: Goal | null;
  categories: string[];
  habits: Habit[];
  logs: Logs;
  reminders: Reminder[];
  friends: Friend[];
}

export const norm = (name: string) => name.trim().toLowerCase();
