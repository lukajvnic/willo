export type Person = {
  name: string;
  handle: string;
  bio: string;
  joined: string;
  streak: number;
  tracked: number;
  best: number;
  /** habit names this person tracks — keys into HABITS */
  habits: string[];
};

const TONES = ["#8C7B5E", "#7B6A64", "#6F6E68", "#8A6A55", "#6E7276", "#7F7466"];

/** stable per-name so an avatar is the same colour everywhere */
export function toneFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export const PEOPLE: Person[] = [
  {
    name: "maya oduya",
    handle: "@mayao",
    bio: "6am club. mostly.",
    joined: "jan 2026",
    streak: 41,
    tracked: 4,
    best: 63,
    habits: ["gym", "reading"],
  },
  {
    name: "luka j",
    handle: "@luka",
    bio: "building willo",
    joined: "nov 2025",
    streak: 33,
    tracked: 3,
    best: 47,
    habits: ["gym", "push-ups"],
  },
  {
    name: "sam reyes",
    handle: "@sreyes",
    bio: "running a marathon eventually",
    joined: "mar 2026",
    streak: 28,
    tracked: 5,
    best: 28,
    habits: ["gym", "reading"],
  },
  {
    name: "tomo ito",
    handle: "@tomo",
    bio: "one page a day",
    joined: "feb 2026",
    streak: 22,
    tracked: 2,
    best: 39,
    habits: ["reading", "push-ups"],
  },
  {
    name: "amara chen",
    handle: "@amarac",
    bio: "consistency > intensity",
    joined: "dec 2025",
    streak: 19,
    tracked: 6,
    best: 55,
    habits: ["push-ups", "gym"],
  },
  {
    name: "dev patel",
    handle: "@devp",
    bio: "1000 push-ups a week",
    joined: "apr 2026",
    streak: 14,
    tracked: 3,
    best: 31,
    habits: ["push-ups", "reading"],
  },
  {
    name: "nina k",
    handle: "@ninak",
    bio: "reads on the train",
    joined: "may 2026",
    streak: 11,
    tracked: 2,
    best: 24,
    habits: ["reading", "gym"],
  },
  {
    name: "ollie brandt",
    handle: "@ollieb",
    bio: "back at it",
    joined: "jun 2026",
    streak: 6,
    tracked: 3,
    best: 18,
    habits: ["gym", "push-ups"],
  },
];

/** the signed-in user */
export const ME = PEOPLE.find((p) => p.handle === "@luka")!;

export const ACTIVITIES = [
  "just went to the gym",
  "logged 140 push-ups",
  "read for 45 minutes",
  "hit a new streak record",
  "finished a morning session",
  "logged 90 push-ups",
  "read for 20 minutes",
  "checked off every habit today",
];
