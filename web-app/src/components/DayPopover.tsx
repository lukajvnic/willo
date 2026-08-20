import { useState } from "react";
import { formatAmount, formatDay, type Habit } from "../lib/habits";

type Props = {
  habit: Habit;
  date: Date;
  value: number;
  /** offsets within the panel, already clamped by the caller */
  left: number;
  top: number;
  onSet: (value: number) => void;
};

export default function DayPopover({ habit, date, value, left, top, onSet }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    onSet(draft === "" ? 0 : Math.max(0, Math.round(Number(draft))));
    setEditing(false);
  };

  return (
    <div className="day-pop" style={{ left, top }}>
      <span className="day-pop-date">{formatDay(date)}</span>

      {habit.toggle ? (
        <button
          className="day-pop-line"
          type="button"
          aria-pressed={value > 0}
          onClick={() => onSet(value > 0 ? 0 : 1)}
        >
          <b className="day-pop-value">{value > 0 ? "done" : "not done"}</b>
        </button>
      ) : editing ? (
        <form
          className="day-pop-line"
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
        >
          <input
            className="day-pop-input"
            autoFocus
            value={draft}
            placeholder="0"
            inputMode="numeric"
            maxLength={5}
            aria-label={`${habit.name} on ${formatDay(date)} in ${habit.unit}`}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
            onBlur={commit}
          />
          <span className="day-pop-unit">{habit.unit}</span>
        </form>
      ) : (
        <button
          className="day-pop-line"
          type="button"
          aria-label={`edit ${habit.name} on ${formatDay(date)}`}
          onClick={() => {
            setDraft(value > 0 ? String(value) : "");
            setEditing(true);
          }}
        >
          <b className="day-pop-value">{formatAmount(value)}</b>
          <span className="day-pop-unit">{habit.unit}</span>
        </button>
      )}
    </div>
  );
}
