import { useState } from "react";
import type { Habit } from "../lib/habits";

type Props = {
  habit: Habit;
  value: number;
  onSet: (value: number) => void;
};

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5 L10 17.5 L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DayLog({ habit, value, onSet }: Props) {
  // the field owns its text; committing normalises it and reports upward.
  // nothing logged reads as empty, not a zero
  const [draft, setDraft] = useState(value > 0 ? String(value) : "");

  const commit = () => {
    const n = draft === "" ? 0 : Math.max(0, Math.round(Number(draft)));
    onSet(n);
    setDraft(n === 0 ? "" : String(n));
  };

  if (habit.toggle) {
    return (
      <div className="log">
        <button
          className="log-check"
          type="button"
          data-on={value > 0}
          aria-pressed={value > 0}
          onClick={() => onSet(value > 0 ? 0 : 1)}
        >
          <span className="log-ring">
            <Check />
          </span>
          <span className="log-caption">complete for today</span>
        </button>
      </div>
    );
  }

  return (
    <div className="log">
      <div className="log-head">
        <span className="log-label">today</span>
        <span className="log-goal">
          / {habit.goal} {habit.unit}
        </span>
      </div>

      <form
        className="log-entry"
        onSubmit={(e) => {
          e.preventDefault();
          commit();
        }}
      >
        <input
          className="log-input"
          value={draft}
          placeholder="0"
          inputMode="numeric"
          maxLength={5}
          aria-label={`${habit.name} today in ${habit.unit}`}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
          onBlur={commit}
        />
        <span className="log-unit">{habit.unit}</span>
      </form>

      <div className="log-track">
        <div className="log-fill" style={{ width: `${Math.min(100, (value / habit.goal) * 100)}%` }} />
      </div>

      <span className="log-hint">enter to log</span>
    </div>
  );
}
