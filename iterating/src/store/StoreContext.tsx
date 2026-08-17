import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { todayISO } from '@/lib/date';
import { emptyState, seedState } from './seed';
import { clear, load, save } from './storage';
import { Friend, Habit, Priority, Reminder, State } from './types';

let counter = 0;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

type Action =
  | { type: 'setGoal'; text: string }
  | { type: 'setProfile'; name: string; email: string }
  | { type: 'addCategory'; name: string }
  | { type: 'addHabit'; habit: Omit<Habit, 'id' | 'createdAt' | 'sharedWith'> }
  | { type: 'updateHabit'; id: string; patch: Partial<Habit> }
  | { type: 'deleteHabit'; id: string }
  | { type: 'setLog'; habitId: string; date: string; value: number }
  | { type: 'toggleLog'; habitId: string; date: string }
  | { type: 'shareHabit'; habitId: string; friendId: string }
  | { type: 'addReminder'; reminder: Omit<Reminder, 'id'> }
  | { type: 'updateReminder'; id: string; patch: Partial<Reminder> }
  | { type: 'deleteReminder'; id: string }
  | { type: 'toggleReminderDone'; id: string }
  | { type: 'nudgePriority'; id: string; direction: -1 | 1 }
  | { type: 'addFriend'; name: string; email: string }
  | { type: 'removeFriend'; id: string }
  | { type: 'hydrate'; state: State }
  | { type: 'reset'; mode: 'demo' | 'empty' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return action.state;

    case 'reset':
      return action.mode === 'demo' ? seedState() : emptyState();

    case 'setGoal':
      return {
        ...state,
        goal: { text: action.text.trim(), setAt: state.goal?.setAt ?? todayISO() },
      };

    case 'setProfile':
      return { ...state, profile: { name: action.name, email: action.email } };

    case 'addCategory':
      return state.categories.includes(action.name)
        ? state
        : { ...state, categories: [...state.categories, action.name] };

    case 'addHabit': {
      const habit: Habit = {
        ...action.habit,
        id: uid('h'),
        createdAt: todayISO(),
        sharedWith: [],
      };
      return {
        ...state,
        habits: [...state.habits, habit],
        categories: state.categories.includes(habit.category)
          ? state.categories
          : [...state.categories, habit.category],
      };
    }

    case 'updateHabit':
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.id ? { ...h, ...action.patch } : h)),
      };

    case 'deleteHabit': {
      const { [action.id]: _dropped, ...logs } = state.logs;
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id), logs };
    }

    case 'setLog': {
      const forHabit = { ...(state.logs[action.habitId] ?? {}) };
      if (action.value > 0) forHabit[action.date] = action.value;
      else delete forHabit[action.date];
      return { ...state, logs: { ...state.logs, [action.habitId]: forHabit } };
    }

    case 'toggleLog': {
      const forHabit = { ...(state.logs[action.habitId] ?? {}) };
      if (forHabit[action.date] > 0) delete forHabit[action.date];
      else forHabit[action.date] = 1;
      return { ...state, logs: { ...state.logs, [action.habitId]: forHabit } };
    }

    case 'shareHabit':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.habitId
            ? {
                ...h,
                sharedWith: h.sharedWith.includes(action.friendId)
                  ? h.sharedWith.filter((f) => f !== action.friendId)
                  : [...h.sharedWith, action.friendId],
              }
            : h,
        ),
      };

    case 'addReminder':
      return { ...state, reminders: [...state.reminders, { ...action.reminder, id: uid('r') }] };

    case 'updateReminder':
      return {
        ...state,
        reminders: state.reminders.map((r) => (r.id === action.id ? { ...r, ...action.patch } : r)),
      };

    case 'deleteReminder':
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.id) };

    case 'toggleReminderDone':
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.id ? { ...r, doneOn: r.doneOn ? undefined : todayISO() } : r,
        ),
      };

    case 'nudgePriority':
      return {
        ...state,
        reminders: state.reminders.map((r) => {
          if (r.id !== action.id) return r;
          const next = Math.min(3, Math.max(1, r.priority + action.direction)) as Priority;
          return { ...r, priority: next };
        }),
      };

    case 'addFriend': {
      const exists = state.friends.some(
        (f) => f.email.toLowerCase() === action.email.trim().toLowerCase(),
      );
      if (exists || !action.email.trim()) return state;
      const friend: Friend = {
        id: uid('f'),
        name: action.name.trim() || action.email.split('@')[0],
        email: action.email.trim(),
        stats: {},
      };
      return { ...state, friends: [...state.friends, friend] };
    }

    case 'removeFriend':
      return {
        ...state,
        friends: state.friends.filter((f) => f.id !== action.id),
        habits: state.habits.map((h) => ({
          ...h,
          sharedWith: h.sharedWith.filter((id) => id !== action.id),
        })),
      };

    default:
      return state;
  }
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => load<State>() ?? seedState());

  useEffect(() => {
    save(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function resetStorage() {
  clear();
}
