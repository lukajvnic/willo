import { addDays, todayISO } from '@/lib/date';
import { Friend, Habit, Logs, Reminder, State } from './types';

/** Deterministic noise, so the demo looks the same every reload. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HISTORY = 175;

const habits: Habit[] = [
  {
    id: 'h_gym',
    name: 'Train',
    category: 'Body',
    kind: 'binary',
    createdAt: addDays(todayISO(), -HISTORY),
    sharedWith: ['f_mara', 'f_dev', 'f_iris'],
  },
  {
    id: 'h_pushups',
    name: 'Push-ups',
    category: 'Body',
    kind: 'count',
    unit: 'reps',
    target: 60,
    createdAt: addDays(todayISO(), -HISTORY),
    sharedWith: ['f_mara', 'f_tomas'],
  },
  {
    id: 'h_read',
    name: 'Read',
    category: 'Mind',
    kind: 'count',
    unit: 'pages',
    target: 25,
    createdAt: addDays(todayISO(), -HISTORY),
    sharedWith: ['f_iris', 'f_mara'],
  },
  {
    id: 'h_meditate',
    name: 'Sit quietly',
    category: 'Mind',
    kind: 'binary',
    createdAt: addDays(todayISO(), -120),
    sharedWith: ['f_iris'],
  },
  {
    id: 'h_deep',
    name: 'Deep work',
    category: 'Craft',
    kind: 'count',
    unit: 'minutes',
    target: 120,
    createdAt: addDays(todayISO(), -HISTORY),
    sharedWith: ['f_dev', 'f_tomas'],
  },
  {
    id: 'h_ship',
    name: 'Ship something',
    category: 'Craft',
    kind: 'binary',
    createdAt: addDays(todayISO(), -90),
    sharedWith: [],
  },
];

/** rate: chance of a day being kept. peak: a typical strong day for count habits. */
const shape: Record<string, { rate: number; peak?: number; trend?: number }> = {
  h_gym: { rate: 0.58, trend: 0.18 },
  h_pushups: { rate: 0.63, peak: 85, trend: 0.14 },
  h_read: { rate: 0.72, peak: 42, trend: 0.1 },
  h_meditate: { rate: 0.44, trend: 0.3 },
  h_deep: { rate: 0.66, peak: 210, trend: 0.12 },
  h_ship: { rate: 0.33, trend: 0.22 },
};

function buildLogs(): Logs {
  const today = todayISO();
  const logs: Logs = {};
  habits.forEach((habit, hi) => {
    const random = rng(1337 + hi * 977);
    const { rate, peak, trend = 0 } = shape[habit.id];
    const entries: Record<string, number> = {};
    for (let back = HISTORY; back >= 0; back--) {
      const iso = addDays(today, -back);
      if (iso < habit.createdAt) continue;
      // Life happened: a flat week in the middle where nothing got logged.
      if (back <= 96 && back >= 90) continue;
      const progress = 1 - back / HISTORY;
      const chance = Math.min(0.94, rate + trend * progress);
      if (random() > chance) continue;
      if (habit.kind === 'binary') {
        entries[iso] = 1;
      } else {
        const spread = 0.45 + random() * 0.75;
        entries[iso] = Math.max(1, Math.round((peak ?? 30) * spread * (0.8 + 0.35 * progress)));
      }
    }
    // Today starts empty on purpose — the app should feel like it's waiting for you.
    delete entries[today];
    entries[addDays(today, -1)] ??= habit.kind === 'binary' ? 1 : Math.round((peak ?? 30) * 0.8);
    logs[habit.id] = entries;
  });
  return logs;
}

const friends: Friend[] = [
  {
    id: 'f_mara',
    name: 'Mara Okonkwo',
    email: 'mara@okonkwo.co',
    stats: { train: { streak: 21, week: 5 }, 'push-ups': { streak: 14, week: 640 }, read: { streak: 9, week: 120 } },
  },
  {
    id: 'f_dev',
    name: 'Dev Raman',
    email: 'dev.raman@hey.com',
    stats: { train: { streak: 6, week: 3 }, 'deep work': { streak: 31, week: 940 } },
  },
  {
    id: 'f_iris',
    name: 'Iris Lindqvist',
    email: 'iris@lindqvist.se',
    stats: { train: { streak: 12, week: 4 }, read: { streak: 44, week: 210 }, 'sit quietly': { streak: 52, week: 7 } },
  },
  {
    id: 'f_tomas',
    name: 'Tomás Vieira',
    email: 'tomas.vieira@gmail.com',
    stats: { 'push-ups': { streak: 4, week: 410 }, 'deep work': { streak: 8, week: 520 } },
  },
];

function buildReminders(): Reminder[] {
  const t = todayISO();
  return [
    { id: 'r1', title: 'Physio — left shoulder', kind: 'fixed', date: t, time: '17:30', priority: 1 },
    { id: 'r2', title: 'Pick up prescription', kind: 'fixed', date: t, time: '12:00', priority: 3, note: 'Pharmacy on Bank St closes at 6.' },
    { id: 'r3', title: 'Q3 review with Sam', kind: 'fixed', date: addDays(t, 1), time: '14:00', priority: 1, note: 'Bring the retention numbers.' },
    { id: 'r4', title: 'Dentist', kind: 'fixed', date: addDays(t, 3), time: '09:30', priority: 2 },
    { id: 'r5', title: "Call Mum — birthday", kind: 'fixed', date: addDays(t, 6), time: '19:00', priority: 1 },
    { id: 'r6', title: 'Renew passport', kind: 'fixed', date: addDays(t, 12), time: '10:00', priority: 2 },
    { id: 'r7', title: 'Get a haircut', kind: 'window', date: t, endDate: addDays(t, 6), priority: 3 },
    { id: 'r8', title: 'Book December flights', kind: 'window', date: addDays(t, 2), endDate: addDays(t, 13), priority: 1, note: 'Prices climb after the 20th.' },
    { id: 'r9', title: 'Replace running shoes', kind: 'window', date: addDays(t, 7), endDate: addDays(t, 20), priority: 3 },
    { id: 'r10', title: 'File last month’s expenses', kind: 'fixed', date: addDays(t, -2), time: '09:00', priority: 2, doneOn: addDays(t, -2) },
  ];
}

export function seedState(): State {
  return {
    profile: { name: 'Luka', email: 'lukaj2501@gmail.com' },
    goal: {
      text: 'Build a body and a business I never need a vacation from.',
      setAt: addDays(todayISO(), -HISTORY),
    },
    categories: ['Body', 'Mind', 'Craft'],
    habits,
    logs: buildLogs(),
    reminders: buildReminders(),
    friends,
  };
}

/** A brand-new account: no goal, nothing tracked. Toggle from the profile sheet. */
export function emptyState(): State {
  return {
    profile: { name: 'Luka', email: 'lukaj2501@gmail.com' },
    goal: null,
    categories: ['Body', 'Mind', 'Craft'],
    habits: [],
    logs: {},
    reminders: [],
    friends,
  };
}
