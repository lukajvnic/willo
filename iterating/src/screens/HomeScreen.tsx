import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Cell } from '@/components/Cell';
import { Button, Field } from '@/components/controls';
import { HabitControl } from '@/components/HabitControl';
import { WeekPulse } from '@/components/Heatmap';
import { Card, Row, Rule, SectionHead, Tag } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Type';
import {
  addDays,
  daysBetween,
  formatTime,
  rangeLabel,
  rangeOfDays,
  startOfWeek,
  todayISO,
  whenLabel,
} from '@/lib/date';
import { currentStreak, keptIn, valueOn } from '@/lib/stats';
import { useStore } from '@/store/StoreContext';
import { Reminder } from '@/store/types';
import { color, space, type as t } from '@/theme';

export function HomeScreen({
  onEditGoal,
  onOpenHabits,
  onOpenReminders,
  onOpenReminder,
}: {
  onEditGoal: () => void;
  onOpenHabits: () => void;
  onOpenReminders: () => void;
  onOpenReminder: (r: Reminder) => void;
}) {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: 520,
      delay: 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [rise]);

  const week = useMemo(() => rangeOfDays(startOfWeek(today), 7), [today]);
  const daysElapsed = week.filter((d) => d <= today).length;

  const liveHabits = state.habits.filter((h) => h.createdAt <= today);
  const keptThisWeek = liveHabits.reduce(
    (sum, h) => sum + keptIn(h, state.logs, week.filter((d) => d <= today)),
    0,
  );
  const possibleThisWeek = liveHabits.length * daysElapsed;
  const keptToday = liveHabits.filter((h) => valueOn(state.logs, h.id, today) > 0).length;

  const bestStreak = liveHabits.reduce(
    (best, h) => {
      const n = currentStreak(h, state.logs, today);
      return n > best.n ? { n, name: h.name } : best;
    },
    { n: 0, name: '' },
  );

  const upcoming = useMemo(() => nextUp(state.reminders, today), [state.reminders, today]);

  if (!state.goal) return <GoalPrompt />;

  const daysSince = daysBetween(state.goal.setAt, today);

  return (
    <Screen>
      <Animated.View
        style={{
          gap: space.lg,
          paddingTop: space.xxl,
          opacity: rise,
          transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        }}
      >
        <Row gap={space.sm}>
          <Txt variant="micro">Greatest goal</Txt>
          <View style={{ flex: 1, height: 1, backgroundColor: color.line }} />
          <Txt variant="micro">{daysSince === 0 ? 'set today' : `day ${daysSince + 1}`}</Txt>
        </Row>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit your greatest goal"
          onPress={onEditGoal}
          style={({ hovered }: any) => [{ opacity: hovered ? 0.7 : 1 }]}
        >
          <Txt variant="goal">{state.goal.text}</Txt>
        </Pressable>
      </Animated.View>

      {liveHabits.length > 0 ? (
        <View style={{ gap: space.md }}>
          <SectionHead
            label="This week"
            right={
              <Txt variant="small">
                {keptThisWeek} of {possibleThisWeek} kept
              </Txt>
            }
          />
          <WeekPulse habits={liveHabits} logs={state.logs} />
        </View>
      ) : null}

      <View style={{ gap: space.md }}>
        <SectionHead
          label="Today"
          right={
            <Pressable accessibilityRole="link" onPress={onOpenHabits}>
              <Txt variant="small" color={color.signal}>
                All habits →
              </Txt>
            </Pressable>
          }
        />

        {liveHabits.length === 0 ? (
          <Empty
            line="No habits yet. The goal needs something to stand on."
            action="Add your first habit"
            onPress={onOpenHabits}
          />
        ) : (
          <Card padded={false}>
            {liveHabits.map((habit, i) => {
              const value = valueOn(state.logs, habit.id, today);
              const streak = currentStreak(habit, state.logs, today);
              return (
                <View key={habit.id}>
                  {i > 0 ? <Rule /> : null}
                  <View style={s.todayRow}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt variant="title">{habit.name}</Txt>
                      <Row gap={space.sm}>
                        <Txt variant="micro">{habit.category}</Txt>
                        {streak > 0 ? (
                          <Txt variant="micro" color={color.signal}>
                            {streak}d streak
                          </Txt>
                        ) : null}
                      </Row>
                    </View>
                    <HabitControl
                      habit={habit}
                      value={value}
                      onChange={(next) =>
                        dispatch({ type: 'setLog', habitId: habit.id, date: today, value: next })
                      }
                    />
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {liveHabits.length > 0 ? (
          <Txt variant="small" color={color.faint}>
            {keptToday === liveHabits.length
              ? 'Everything kept today.'
              : `${keptToday} of ${liveHabits.length} kept today.`}
            {bestStreak.n > 2 ? `  ${bestStreak.name} is on ${bestStreak.n} days.` : ''}
          </Txt>
        ) : null}
      </View>

      <View style={{ gap: space.md }}>
        <SectionHead
          label="Next up"
          right={
            <Pressable accessibilityRole="link" onPress={onOpenReminders}>
              <Txt variant="small" color={color.signal}>
                All reminders →
              </Txt>
            </Pressable>
          }
        />
        {upcoming.length === 0 ? (
          <Empty line="Nothing scheduled. Enjoy it." action="Add a reminder" onPress={onOpenReminders} />
        ) : (
          <Card padded={false}>
            {upcoming.map((r, i) => (
              <View key={r.id}>
                {i > 0 ? <Rule /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${r.title}`}
                  onPress={() => onOpenReminder(r)}
                  style={({ hovered }: any) => [s.upRow, hovered && { backgroundColor: color.paperDeep }]}
                >
                  <Cell
                    level={r.kind === 'window' ? 3 : 4}
                    tone={r.kind === 'window' ? 'flex' : 'signal'}
                    size={9}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="title" numberOfLines={1}>
                      {r.title}
                    </Txt>
                    <Txt variant="small">
                      {r.kind === 'fixed'
                        ? `${whenLabel(r.date, today)}${r.time ? ` · ${formatTime(r.time)}` : ''}`
                        : rangeLabel(r.date, r.endDate!, today)}
                    </Txt>
                  </View>
                  <Tag
                    label={r.kind === 'fixed' ? 'On a date' : 'In a window'}
                    tone={r.kind === 'fixed' ? 'signal' : 'flex'}
                  />
                </Pressable>
              </View>
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}

/** The first screen of a new account: type the goal in the face it will live in. */
function GoalPrompt() {
  const { dispatch } = useStore();
  const [text, setText] = useState('');
  return (
    <Screen>
      <View style={{ gap: space.xl, paddingTop: space.xxxl * 1.4 }}>
        <Txt variant="micro">Start here</Txt>
        <Txt variant="displayL">What are you actually working toward?</Txt>
        <Field
          value={text}
          onChangeText={setText}
          placeholder="One sentence."
          multiline
          autoFocus
          inputStyle={[t.goal as object, { minHeight: 132, paddingTop: space.md, lineHeight: 44 }]}
        />
        <Txt variant="small" color={color.faint}>
          Everything else in Willo hangs off this. You can rewrite it whenever it changes.
        </Txt>
        <Button label="Set my goal" onPress={() => text.trim() && dispatch({ type: 'setGoal', text })} disabled={!text.trim()} />
      </View>
    </Screen>
  );
}

function Empty({ line, action, onPress }: { line: string; action: string; onPress: () => void }) {
  return (
    <Card style={{ gap: space.md, alignItems: 'flex-start' }}>
      <Txt variant="body">{line}</Txt>
      <Button label={action} onPress={onPress} tone="quiet" size="sm" />
    </Card>
  );
}

/** Today and tomorrow first, then whatever window is already open. */
function nextUp(reminders: Reminder[], today: string) {
  const horizon = addDays(today, 2);
  return reminders
    .filter((r) => !r.doneOn)
    .filter((r) => (r.kind === 'fixed' ? r.date <= horizon && r.date >= today : r.date <= horizon && r.endDate! >= today))
    .sort((a, b) => a.priority - b.priority || a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
    .slice(0, 3);
}

const s = StyleSheet.create({
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 62,
  },
  upRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
});
