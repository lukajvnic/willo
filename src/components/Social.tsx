import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import ProfileModal from "./ProfileModal";
import { ACTIVITIES, PEOPLE, toneFor, type Person } from "../lib/people";

type Event = { id: number; name: string; text: string; at: number };

function ago(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 10) return "now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function randomEvent(id: number, at: number): Event {
  return {
    id,
    name: PEOPLE[Math.floor(Math.random() * PEOPLE.length)].name,
    text: ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)],
    at,
  };
}

const SEED_COUNT = 7;

export default function Social() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Person | null>(null);
  const nextId = useRef(SEED_COUNT);
  const [events, setEvents] = useState<Event[]>(() => {
    const now = Date.now();
    return Array.from({ length: SEED_COUNT }, (_, i) =>
      randomEvent(i, now - (i + 1) * 1000 * (40 + i * 55)),
    );
  });
  const [, tick] = useState(0);

  // new activity drops in, and timestamps stay honest between drops
  useEffect(() => {
    const add = setInterval(() => {
      setEvents((prev) => [randomEvent(nextId.current++, Date.now()), ...prev].slice(0, 14));
    }, 5000);
    const clock = setInterval(() => tick((t) => t + 1), 1000);
    return () => {
      clearInterval(add);
      clearInterval(clock);
    };
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? PEOPLE.filter((p) => p.name.includes(q) || p.handle.toLowerCase().includes(q))
    : [];

  return (
    <div className="social">
      <div className="search-wrap">
        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16 16 L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search accounts"
            aria-label="search accounts"
          />
          {query && (
            <button className="search-clear" type="button" onClick={() => setQuery("")} aria-label="clear">
              ×
            </button>
          )}
        </div>

      </div>

      {q ? (
        <div className="feed">
          <div className="feed-head">
            <span className="feed-title">accounts</span>
            <span className="feed-count">
              {results.length} {results.length === 1 ? "match" : "matches"}
            </span>
          </div>

          <ul className="results">
            {results.length === 0 && <li className="result-empty">no accounts found</li>}
            {results.map((p) => (
              <li key={p.handle}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(p);
                    setQuery("");
                  }}
                >
                  <Avatar name={p.name} tone={toneFor(p.name)} size={30} />
                  <span className="result-name">{p.name}</span>
                  <span className="result-handle">{p.handle}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="feed">
          <div className="feed-head">
            <span className="feed-title">recent activity</span>
            <span className="live">
              <i /> live
            </span>
          </div>

          <ul className="feed-list">
            {events.map((e) => (
              <li className="feed-item" key={e.id}>
                <Avatar name={e.name} tone={toneFor(e.name)} size={30} />
                <span className="feed-text">
                  <strong>{e.name}</strong> {e.text}!
                </span>
                <span className="feed-time">{ago(Date.now() - e.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && <ProfileModal person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
