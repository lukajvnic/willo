export type Habit = {
  name: string;
  meta: string;
  /** css color ramp, lightest -> darkest */
  ramp: [string, string, string, string, string];
  /** deterministic-ish 0..1 "commitment" — higher means more filled days */
  density: number;
  /** what a full day looks like — 1 for yes/no habits */
  goal: number;
  unit: string;
  /** yes/no habit — logged with a single button instead of a typed amount */
  toggle: boolean;
};

export const WEEKS = 26;

export type RampName = "gold" | "clay" | "blue" | "moss" | "violet";

export const RAMPS: Record<RampName, Habit["ramp"]> = {
  gold: ["#3E3C3A", "#5C4A28", "#8B6C2A", "#C09231", "#F2BF48"],
  clay: ["#3E3C3A", "#573330", "#853F35", "#B75340", "#E37152"],
  blue: ["#3E3C3A", "#31404F", "#3F5C79", "#5079A6", "#6C9BD0"],
  moss: ["#3E3C3A", "#2F4238", "#3B6349", "#4D8A60", "#70B784"],
  violet: ["#3E3C3A", "#3F3349", "#584770", "#75609B", "#9C88C6"],
};

export const HABITS: Habit[] = [
  {
    name: "gym",
    meta: "yes / no",
    ramp: RAMPS.gold,
    density: 0.58,
    goal: 1,
    unit: "",
    toggle: true,
  },
  {
    name: "push-ups",
    meta: "count per day",
    ramp: RAMPS.clay,
    density: 0.62,
    goal: 100,
    unit: "reps",
    toggle: false,
  },
  {
    name: "reading",
    meta: "minutes per day",
    ramp: RAMPS.blue,
    density: 0.55,
    goal: 30,
    unit: "min",
    toggle: false,
  },
];

/** cheap seeded noise so the grids look plausible and stay stable across renders */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function buildGrid(seed: number, density: number, weeks: number = WEEKS): number[] {
  const days = weeks * 7;
  return Array.from({ length: days }, (_, i) => {
    const n = noise(seed * 100 + i);
    // gentle upward trend — recent weeks a bit stronger
    const trend = 0.75 + (i / days) * 0.5;
    const v = n * density * trend;
    if (v < 0.3) return 0;
    if (v < 0.42) return 1;
    if (v < 0.55) return 2;
    if (v < 0.68) return 3;
    return 4;
  });
}

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

/** dates for every cell, column-first (col = week, row = Sun..Sat) */
export function gridDates(weeks: number): Date[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  const start = new Date(endOfWeek);
  start.setDate(endOfWeek.getDate() - (weeks * 7 - 1));

  return Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** one entry per column — month name if the 1st falls in that week, else null */
export function monthLabels(dates: Date[], weeks: number): (string | null)[] {
  return Array.from({ length: weeks }, (_, c) => {
    const first = dates.slice(c * 7, c * 7 + 7).find((d) => d.getDate() === 1);
    return first ? MONTHS[first.getMonth()] : null;
  });
}

/** where a logged amount lands on the habit's 0..4 colour ramp */
export function levelFor(value: number, goal: number): number {
  if (value <= 0) return 0;
  const r = value / goal;
  if (r < 0.34) return 1;
  if (r < 0.67) return 2;
  if (r < 1) return 3;
  return 4;
}

/** index of today's cell in the grid, or -1 if it falls outside */
export function todayIndex(weeks: number = WEEKS): number {
  const now = new Date();
  return gridDates(weeks).findIndex(
    (d) =>
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate(),
  );
}
