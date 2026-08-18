export type Entry = {
  name: string;
  value: number;
  tone: string;
};

export type Board = {
  title: string;
  metric: string;
  unit: string;
  entries: Entry[];
};

import { toneFor } from "./people";

function build(names: string[], values: number[]): Entry[] {
  return names.map((name, i) => ({ name, value: values[i], tone: toneFor(name) }));
}

export const BOARDS: Board[] = [
  {
    title: "gym",
    metric: "longest current streak",
    unit: "days",
    entries: build(
      ["maya oduya", "luka j", "sam reyes", "tomo ito", "amara chen", "dev patel", "nina k", "ollie brandt"],
      [41, 33, 28, 22, 19, 14, 11, 6],
    ),
  },
  {
    title: "push-ups",
    metric: "total this week",
    unit: "reps",
    entries: build(
      ["dev patel", "amara chen", "luka j", "ollie brandt", "maya oduya", "nina k", "tomo ito", "sam reyes"],
      [1240, 1105, 980, 870, 745, 610, 520, 415],
    ),
  },
  {
    title: "reading",
    metric: "total this week",
    unit: "min",
    entries: build(
      ["nina k", "tomo ito", "maya oduya", "sam reyes", "luka j", "amara chen", "ollie brandt", "dev patel"],
      [520, 465, 410, 355, 300, 265, 190, 120],
    ),
  },
];
