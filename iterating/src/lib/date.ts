/** All dates in Willo are local-time ISO days: 'YYYY-MM-DD'. */

const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function fromISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const todayISO = () => toISO(new Date());

export function addDays(iso: string, n: number) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function daysBetween(a: string, b: string) {
  const ms = fromISO(b).getTime() - fromISO(a).getTime();
  return Math.round(ms / 86400000);
}

/** Monday-first, matching how people talk about "this week". */
export function startOfWeek(iso: string) {
  const d = fromISO(iso);
  const shift = (d.getDay() + 6) % 7;
  return addDays(iso, -shift);
}

export function rangeOfDays(startISO: string, count: number) {
  return Array.from({ length: count }, (_, i) => addDays(startISO, i));
}

export function isWithin(iso: string, start: string, end: string) {
  return iso >= start && iso <= end;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const monthName = (m: number) => MONTHS[m];
export const dayName = (iso: string) => DAYS[fromISO(iso).getDay()];
export const dayNum = (iso: string) => fromISO(iso).getDate();

/** Six Monday-first weeks covering the month — a stable 6x7 grid. */
export function monthGrid(year: number, month: number) {
  const first = toISO(new Date(year, month, 1));
  const start = startOfWeek(first);
  return Array.from({ length: 6 }, (_, w) => rangeOfDays(addDays(start, w * 7), 7));
}

export function shortDate(iso: string) {
  const d = fromISO(iso);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function formatTime(hhmm?: string) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${pad(m)}${suffix}`;
}

/** 'Today' / 'Tomorrow' / 'Saturday' inside the week / 'Mar 12' beyond it. */
export function whenLabel(iso: string, today = todayISO()) {
  const delta = daysBetween(today, iso);
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta === -1) return 'Yesterday';
  if (delta > 1 && delta < 7) return dayName(iso);
  if (delta < 0) return `${Math.abs(delta)} days ago`;
  return shortDate(iso);
}

export function rangeLabel(start: string, end: string, today = todayISO()) {
  const sameMonth = fromISO(start).getMonth() === fromISO(end).getMonth();
  if (start <= today && today <= end) {
    const left = daysBetween(today, end);
    return left === 0 ? 'Last day of the window' : `${left} day${left === 1 ? '' : 's'} left`;
  }
  return sameMonth
    ? `${shortDate(start)}–${fromISO(end).getDate()}`
    : `${shortDate(start)}–${shortDate(end)}`;
}
