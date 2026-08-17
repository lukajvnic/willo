import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, ChipRow } from '@/components/controls';
import { HabitControl } from '@/components/HabitControl';
import { Heatmap } from '@/components/Heatmap';
import { Avatar, Card, Row, Rule, SectionHead } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Type';
import { todayISO } from '@/lib/date';
import { currentStreak, keptIn, lastNDays, totalIn, valueOn } from '@/lib/stats';
import { useStore } from '@/store/StoreContext';
import { Habit } from '@/store/types';
import { color, space } from '@/theme';

export function HabitsScreen({
  onNewHabit,
  onOpenHabit,
}: {
  onNewHabit: () => void;
  onOpenHabit: (habit: Habit) => void;
}) {
  const { state } = useStore();
  const today = todayISO();
  const [filter, setFilter] = useState<string>('all');

  const categories = useMemo(
    () => state.categories.filter((c) => state.habits.some((h) => h.category === c)),
    [state.categories, state.habits],
  );

  const visible = filter === 'all' ? state.habits : state.habits.filter((h) => h.category === filter);
  const keptToday = state.habits.filter((h) => valueOn(state.logs, h.id, today) > 0).length;

  return (
    <Screen>
      <View style={{ gap: space.lg, paddingTop: space.xxl }}>
        <Txt variant="displayL">Habits</Txt>
        <Txt variant="body">
          {state.habits.length === 0
            ? 'Nothing tracked yet.'
            : `${keptToday} of ${state.habits.length} kept today. Tap a habit for its full record.`}
        </Txt>
        {categories.length > 1 ? (
          <ChipRow
            value={filter}
            onChange={setFilter}
            options={[{ value: 'all', label: 'All' }, ...categories.map((c) => ({ value: c, label: c }))]}
          />
        ) : null}
      </View>

      <View style={{ gap: space.md }}>
        <SectionHead
          label={filter === 'all' ? `${visible.length} habits` : filter}
          right={<Button label="New habit" onPress={onNewHabit} tone="quiet" size="sm" />}
        />

        {visible.length === 0 ? (
          <Card style={{ gap: space.md, alignItems: 'flex-start' }}>
            <Txt variant="body">
              Add the handful of things that, done often enough, make the goal inevitable.
            </Txt>
            <Button label="Add a habit" onPress={onNewHabit} tone="quiet" size="sm" />
          </Card>
        ) : (
          <View style={{ gap: space.md }}>
            {visible.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onOpen={() => onOpenHabit(habit)} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function HabitCard({ habit, onOpen }: { habit: Habit; onOpen: () => void }) {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const [width, setWidth] = useState(0);

  const grid = useMemo(() => fitGrid(width), [width]);
  const last30 = lastNDays(30, today);
  const value = valueOn(state.logs, habit.id, today);
  const streak = currentStreak(habit, state.logs, today);
  const friends = state.friends.filter((f) => habit.sharedWith.includes(f.id));

  const summary =
    habit.kind === 'binary'
      ? `${keptIn(habit, state.logs, last30)} of the last 30 days`
      : `${totalIn(habit, state.logs, last30).toLocaleString()} ${habit.unit} in 30 days`;

  return (
    <Card padded={false}>
      <View style={s.cardHead}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${habit.name}`}
          onPress={onOpen}
          style={({ hovered }: any) => [{ flex: 1, gap: 3 }, hovered && { opacity: 0.68 }]}
        >
          <Txt variant="title" style={{ fontSize: 17 }}>
            {habit.name}
          </Txt>
          <Row gap={space.sm}>
            <Txt variant="micro">{habit.category}</Txt>
            <Txt variant="micro" color={streak > 0 ? color.signal : color.faint}>
              {streak > 0 ? `${streak} day streak` : 'no streak'}
            </Txt>
          </Row>
        </Pressable>
        <HabitControl
          habit={habit}
          value={value}
          onChange={(next) => dispatch({ type: 'setLog', habitId: habit.id, date: today, value: next })}
        />
      </View>

      <View style={{ paddingHorizontal: space.lg, paddingBottom: space.lg }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Heatmap
            habit={habit}
            logs={state.logs}
            weeks={grid.weeks}
            size={grid.size}
            gap={grid.gap}
            onPressDay={(iso) =>
              habit.kind === 'binary'
                ? dispatch({ type: 'toggleLog', habitId: habit.id, date: iso })
                : onOpen()
            }
          />
        ) : null}
      </View>

      <Rule />
      <View style={s.cardFoot}>
        <Txt variant="small" numberOfLines={1} style={{ flexShrink: 1 }}>
          {summary}
        </Txt>
        {friends.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Leaderboard for ${habit.name}`}
            onPress={onOpen}
            style={({ hovered }: any) => [{ flexDirection: 'row', alignItems: 'center', gap: space.sm }, hovered && { opacity: 0.7 }]}
          >
            <View style={{ flexDirection: 'row' }}>
              {friends.slice(0, 3).map((f, i) => (
                <View key={f.id} style={{ marginLeft: i === 0 ? 0 : -7 }}>
                  <Avatar name={f.name} size={22} />
                </View>
              ))}
            </View>
            <Txt variant="small" color={color.signal}>
              Leaderboard →
            </Txt>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={`Share ${habit.name}`} onPress={onOpen}>
            <Txt variant="small" color={color.faint}>
              Share with friends →
            </Txt>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

/** Fill the card with as many weeks as read comfortably at this width. */
function fitGrid(width: number, ideal = 14, gap = 3, min = 10, max = 30) {
  if (width <= 0) return { weeks: min, size: ideal, gap };
  const weeks = Math.max(min, Math.min(max, Math.floor((width + gap) / (ideal + gap))));
  const size = (width - (weeks - 1) * gap) / weeks;
  return { weeks, size, gap };
}

const s = StyleSheet.create({
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    paddingBottom: space.md,
  },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
});
