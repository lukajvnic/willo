import { useEffect, useState } from "react";
import { RAMPS, type Habit, type RampName } from "../lib/habits";

const RAMP_NAMES = Object.keys(RAMPS) as RampName[];

type Props = {
  taken: string[];
  onCreate: (habit: Habit) => void;
  onClose: () => void;
};

export default function NewHabit({ taken, onCreate, onClose }: Props) {
  const [name, setName] = useState("");
  const [toggle, setToggle] = useState(false);
  const [unit, setUnit] = useState("");
  const [goal, setGoal] = useState("");
  const [ramp, setRamp] = useState<RampName>("moss");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clean = name.trim().toLowerCase();
  const duplicate = clean !== "" && taken.includes(clean);
  const valid = clean !== "" && !duplicate && (toggle || (unit.trim() !== "" && Number(goal) > 0));

  return (
    <div className="scrim" onClick={onClose}>
      <form
        className="modal new-modal"
        role="dialog"
        aria-modal
        style={{ "--c4": RAMPS[ramp][4] } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onCreate({
            name: clean,
            meta: toggle ? "yes / no" : `${unit.trim()} per day`,
            ramp: RAMPS[ramp],
            // a brand new habit starts with an empty grid
            density: 0,
            goal: toggle ? 1 : Number(goal),
            unit: toggle ? "" : unit.trim(),
            toggle,
          });
          onClose();
        }}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="close">
          ×
        </button>

        <h3 className="add-title">new habit</h3>

        <div className="new-grid">
          <label className="new-row">
            <span className="new-label">name</span>
            <input
              className="new-input"
              value={name}
              placeholder="stretching"
              maxLength={24}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="new-row">
            <span className="new-label">tracks</span>
            <div className="new-seg">
              <button type="button" data-active={toggle} onClick={() => setToggle(true)}>
                yes / no
              </button>
              <button type="button" data-active={!toggle} onClick={() => setToggle(false)}>
                a number
              </button>
            </div>
          </div>

          {!toggle && (
            <div className="new-row">
              <span className="new-label">goal</span>
              <div className="new-pair">
                <input
                  className="new-input"
                  value={goal}
                  placeholder="30"
                  inputMode="numeric"
                  maxLength={5}
                  aria-label="daily goal"
                  onChange={(e) => setGoal(e.target.value.replace(/\D/g, ""))}
                />
                <input
                  className="new-input"
                  value={unit}
                  placeholder="min"
                  maxLength={8}
                  aria-label="unit"
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="new-row">
            <span className="new-label">colour</span>
            <div className="new-swatches">
              {RAMP_NAMES.map((n) => (
                <button
                  key={n}
                  className="swatch"
                  type="button"
                  data-active={n === ramp}
                  style={{ background: RAMPS[n][4] }}
                  aria-label={n}
                  onClick={() => setRamp(n)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="new-actions">
          <button className="new-create" type="submit" disabled={!valid}>
            create habit
          </button>
          {duplicate && <span className="new-warn">you already track that</span>}
        </div>
      </form>
    </div>
  );
}
