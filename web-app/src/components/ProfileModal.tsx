import { useEffect } from "react";
import Avatar from "./Avatar";
import Heatmap from "./Heatmap";
import { HABITS } from "../lib/habits";
import { toneFor, type Person } from "../lib/people";

type Props = { person: Person; onClose: () => void };

export default function ProfileModal({ person, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const seed = person.handle.length + person.streak;

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <button className="modal-close" type="button" onClick={onClose} aria-label="close">
          ×
        </button>

        <div className="profile-head">
          <Avatar name={person.name} tone={toneFor(person.name)} size={64} />
          <div>
            <h3 className="profile-name">{person.name}</h3>
            <p className="profile-handle">{person.handle}</p>
            <p className="profile-bio">{person.bio}</p>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-value">{person.streak}</span>
            <span className="stat-label">day streak</span>
          </div>
          <div className="stat">
            <span className="stat-value">{person.best}</span>
            <span className="stat-label">best streak</span>
          </div>
          <div className="stat">
            <span className="stat-value">{person.tracked}</span>
            <span className="stat-label">habits</span>
          </div>
          <div className="stat">
            <span className="stat-value">{person.joined}</span>
            <span className="stat-label">joined</span>
          </div>
        </div>

        <div className="profile-grids">
          {person.habits.map((name, i) => {
            const habit = HABITS.find((h) => h.name === name);
            if (!habit) return null;
            return (
              <Heatmap key={name} habit={habit} seed={seed + i * 7} weeks={24} cell={14} readOnly />
            );
          })}
        </div>
      </div>
    </div>
  );
}
