import { useMemo, useState } from "react";
import DayLog from "./DayLog";
import { buildGrid, gridDates, levelFor, monthLabels, todayIndex, WEEKS, type Habit } from "../lib/habits";

const DAY_LABELS = ["", "mon", "", "wed", "", "fri", ""];

type Props = { habit: Habit; seed: number; weeks?: number; cell?: number };

export default function Heatmap({ habit, seed, weeks = WEEKS, cell = 18 }: Props) {
  const [logged, setLogged] = useState(0);

  const levels = useMemo(() => buildGrid(seed, habit.density, weeks), [seed, habit.density, weeks]);
  const months = useMemo(() => monthLabels(gridDates(weeks), weeks), [weeks]);
  const today = useMemo(() => todayIndex(weeks), [weeks]);

  // what you log lands on today's square
  const shown = useMemo(() => {
    if (today < 0) return levels;
    const next = levels.slice();
    next[today] = levelFor(logged, habit.goal);
    return next;
  }, [levels, today, logged, habit.goal]);

  const rampVars = {
    "--c0": habit.ramp[0],
    "--c1": habit.ramp[1],
    "--c2": habit.ramp[2],
    "--c3": habit.ramp[3],
    "--c4": habit.ramp[4],
    "--cell": `${cell}px`,
    "--gap": cell > 14 ? "5px" : "3px",
  } as React.CSSProperties;

  const done = shown.filter((l) => l > 0).length;

  return (
    <section className="panel" style={rampVars}>
      <div className="panel-head">
        <h2 className="panel-title">{habit.name}</h2>
        <span className="panel-meta">
          {habit.meta} · {done} days
        </span>
      </div>

      <div className="panel-body">
        <div className="heatmap">
          <div className="day-labels">
            {DAY_LABELS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="grid-wrap">
            <div className="months">
              {months.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
            <div className="grid">
              {Array.from({ length: weeks * 7 }, (_, i) => (
                <div key={i} className="cell" data-level={shown[i]} data-today={i === today} />
              ))}
            </div>
          </div>
        </div>

        <DayLog habit={habit} value={logged} onSet={setLogged} />
      </div>
    </section>
  );
}
