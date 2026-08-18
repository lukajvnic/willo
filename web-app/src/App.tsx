import { useState } from "react";
import Heatmap from "./components/Heatmap";
import NewHabit from "./components/NewHabit";
import Leaderboard from "./components/Leaderboard";
import Social from "./components/Social";
import Avatar from "./components/Avatar";
import ProfileModal from "./components/ProfileModal";
import { ME, toneFor } from "./lib/people";
import Todo from "./components/Todo";
import AvatarCreator from "./components/AvatarCreator";
import { HABITS, type Habit } from "./lib/habits";

const NAV = ["habits", "to-do", "leaderboard", "social", "avatar"];

export default function App() {
  const [tab, setTab] = useState("habits");
  const [habits, setHabits] = useState<Habit[]>(HABITS);
  const [adding, setAdding] = useState(false);
  const [showMe, setShowMe] = useState(false);

  return (
    <main className="page" data-tab={tab}>
      <h1 className="wordmark">willo</h1>

      <div className="topbar">
        <nav className="nav">
          {NAV.map((item) => (
            <button
              key={item}
              type="button"
              data-active={item === tab}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          className="me"
          type="button"
          onClick={() => setShowMe(true)}
          aria-label="your account"
        >
          <Avatar name={ME.name} tone={toneFor(ME.name)} size={34} />
        </button>
      </div>

      {tab === "habits" && (
        <>
          <button className="add-habit" type="button" onClick={() => setAdding(true)}>
            new habit
          </button>

          <div className="stack">
            {habits.map((habit, i) => (
              <Heatmap key={habit.name} habit={habit} seed={i + 1} />
            ))}
          </div>
          <p className="foot">last 26 weeks</p>
        </>
      )}

      {tab === "leaderboard" && <Leaderboard />}

      {tab === "social" && <Social />}

      {tab === "to-do" && <Todo />}

      {tab === "avatar" && <AvatarCreator />}

      {adding && (
        <NewHabit
          taken={habits.map((h) => h.name)}
          onCreate={(habit) => setHabits((list) => [...list, habit])}
          onClose={() => setAdding(false)}
        />
      )}

      {showMe && <ProfileModal person={ME} onClose={() => setShowMe(false)} />}
    </main>
  );
}
