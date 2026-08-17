# Willo

A goal-grounded habit and reminder app. Frontend only — every screen runs on local
state so the UI/UX can be iterated on before any backend exists.

Built on Expo (SDK 57) + expo-router so the same code can target iOS and Android
later. **Only the web target is wired up right now.**

## Run it

```bash
npm install
npm run web        # http://localhost:8081
```

`npm run typecheck` runs `tsc --noEmit`.

## The shape of the app

Three panels on one horizontal pager. Swipe, click the rail, or use ← →.

```
   ← Habits            Goal (home)            Reminders →
   heatmaps            the one sentence       calendar + agenda
   streaks             this week's pulse      dates and windows
   leaderboards        today's slate          priority order
```

**Goal** is the ground. Your one sentence is set in oversized display type; below
it, the week's pulse and today's habits, so the goal immediately converts into
something to do. A new account starts here with nothing but the prompt — you type
the goal in the same face it will live in.

**Habits** are grouped by category and tracked two ways:

- _Did it or not_ — a filled square means you did it
- _Count how much_ — squares shade against the bigger of your daily target and
  your personal best, so a heavy day is always the darkest square you own

Each habit card carries a heatmap; opening one gives the full record (tap any day
to change it), streak stats, sharing, and a leaderboard against the friends who
share that habit — ranked by longest streak or by this week.

**Reminders** come in two kinds, and the colour says which:

- **indigo — on a date.** An appointment. Fills the calendar day.
- **ochre — in a window.** "A haircut sometime this week." Draws a bar across the
  days it stays open, and closes the moment you tick it off.

The agenda groups by day and sorts by priority inside each group; the ▲▼ control
on each row is how you decide what comes first when several things land together.

## Design

One visual grammar: **the square**. The week pulse on Goal, every habit heatmap,
and the reminders calendar are the same cell primitive at different sizes, so a
filled square means the same thing everywhere — something happened.

| Token   | Value     | Job                                            |
| ------- | --------- | ---------------------------------------------- |
| paper   | `#EDEFEA` | cool bone background                           |
| ink     | `#12140F` | text                                           |
| signal  | `#2E23C9` | certainty — kept habits, dated reminders       |
| flex    | `#D9A441` | openness — windows you still get to choose in  |

Type: **Bricolage Grotesque** (display), **Instrument Sans** (body/UI),
**IBM Plex Mono** (eyebrows, dates, units). Loaded from Google Fonts in
`app/+html.tsx`, which is web-only — native builds will need `expo-font`.

Tokens live in `src/theme.ts`. Nothing hardcodes a colour or a size.

## Layout

```
app/
  _layout.tsx        store provider + safe area
  index.tsx          the three-panel pager, rail, and sheet host
  +html.tsx          web document shell and fonts
src/
  theme.ts           colour, type, spacing, the heat ramps
  lib/               date maths (local ISO days) and habit stats
  store/             types, reducer, seed data, localStorage
  components/        Cell, Heatmap, Calendar, Rail, Sheet, controls
  screens/           Habits, Home (goal), Reminders
  sheets/            goal, habit, habit detail, reminder, profile
```

## What's faked

There is no server. Specifically:

- **Accounts** — `profile` is a local name and email. No sign-up, no auth.
- **Friends** — seeded people with fixed per-habit numbers. "Send invite" adds
  them locally; nothing is sent.
- **Leaderboards** — your side is computed from your real logs, theirs is static.
- **Persistence** — `localStorage`, via `src/store/storage.ts`. That one file is
  what an API client would replace.

The profile sheet has **Reload demo** (six habits, ~6 months of history, ten
reminders) and **Start empty** (a fresh account) for moving between the two ends.

## Known gaps

- Native (iOS/Android) is unbuilt: fonts and the date/time pickers are web-only
  paths in `+html.tsx` and `src/components/DateField.tsx`.
- Notifications, recurring reminders, and habit archiving aren't in yet.
- Reordering reminders adjusts priority level; there's no free drag-to-rank.
