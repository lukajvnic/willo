import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Legend } from '@/components/Cell';
import { Button, Segmented } from '@/components/controls';
import { HabitControl } from '@/components/HabitControl';
import { Heatmap } from '@/components/Heatmap';
import { Avatar, Card, Row, Rule, SectionHead } from '@/components/primitives';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Type';
import { dayName, shortDate, todayISO } from '@/lib/date';
import { currentStreak, keptIn, lastNDays, longestStreak, totalIn, valueOn } from '@/lib/stats';
import { useStore } from '@/store/StoreContext';
import { Habit, norm } from '@/store/types';
import { color, space } from '@/theme';

type Metric = 'streak' | 'week';

export function HabitDetailSheet({
  open,
  habit,
  onClose,
  onEdit,
}: {
  open: boolean;
  habit?: Habit;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
}) {
  const { state, dispatch } = useStore();
  const today = todayISO();
  const [selectedDay, setSelectedDay] = useState<string | undefined>();
  const [metric, setMetric] = useState<Metric>('streak');

  const board = useMemo(
    () => (habit ? leaderboard(habit, state, metric, today) : []),
    [habit, state, metric, today],
  );

  // A day picked on one habit shouldn't follow you into the next one.
  useEffect(() => {
    if (!open) setSelectedDay(undefined);
  }, [open, habit?.id]);

  if (!habit) return null;

  const last30 = lastNDays(30, today);
  const streak = currentStreak(habit, state.logs, today);
  const best = longestStreak(habit, state.logs);
  const thirty =
    habit.kind === 'binary'
      ? `${keptIn(habit, state.logs, last30)}`
      : totalIn(habit, state.logs, last30).toLocaleString();

  const maxValue = Math.max(1, ...board.map((e) => e.value));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={habit.category}
      title={habit.name}
      footer={
        <>
          <Button label="Edit habit" onPress={() => onEdit(habit)} tone="quiet" style={{ flex: 1 }} />
          <Button label="Done" onPress={onClose} />
        </>
      }
    >
      <View style={s.stats}>
        <Stat label="Current streak" value={String(streak)} unit={streak === 1 ? 'day' : 'days'} />
        <Stat label="Longest run" value={String(best)} unit="days" />
        <Stat
          label="Last 30 days"
          value={thirty}
          unit={habit.kind === 'binary' ? 'days kept' : habit.unit}
        />
      </View>

      <View style={{ gap: space.md }}>
        <SectionHead
          label="Record"
          right={
            <Txt variant="small" color={color.faint}>
              Tap a day to change it
            </Txt>
          }
          style={{ marginBottom: 0 }}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          {...({ dataSet: { willoScroll: true } } as any)}
        >
          <Heatmap
            habit={habit}
            logs={state.logs}
            weeks={30}
            size={13}
            gap={3}
            showMonths
            showDays
            onPressDay={(iso) =>
              habit.kind === 'binary'
                ? dispatch({ type: 'toggleLog', habitId: habit.id, date: iso })
                : setSelectedDay(iso)
            }
          />
        </ScrollView>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt variant="small" color={color.faint}>
            {habit.kind === 'binary' ? 'Filled means you did it' : `Darker means more ${habit.unit}`}
          </Txt>
          <Legend />
        </Row>
      </View>

      {selectedDay ? (
        <Card style={{ gap: space.md }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ gap: 2 }}>
              <Txt variant="micro">{dayName(selectedDay)}</Txt>
              <Txt variant="title">{shortDate(selectedDay)}</Txt>
            </View>
            <HabitControl
              habit={habit}
              value={valueOn(state.logs, habit.id, selectedDay)}
              onChange={(next) =>
                dispatch({ type: 'setLog', habitId: habit.id, date: selectedDay, value: next })
              }
            />
          </Row>
          <Row gap={space.sm}>
            <Button
              label="Clear day"
              tone="ghost"
              size="sm"
              onPress={() =>
                dispatch({ type: 'setLog', habitId: habit.id, date: selectedDay, value: 0 })
              }
            />
            <Button label="Close" tone="ghost" size="sm" onPress={() => setSelectedDay(undefined)} />
          </Row>
        </Card>
      ) : null}

      <View style={{ gap: space.md }}>
        <SectionHead
          label="Leaderboard"
          right={<Txt variant="micro">{board.length} tracking this</Txt>}
          style={{ marginBottom: 0 }}
        />
        <Segmented
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'streak', label: 'Longest streak' },
            { value: 'week', label: 'This week' },
          ]}
        />
        {board.length <= 1 ? (
          <Card>
            <Txt variant="body" color={color.faint}>
              Share this habit with a friend and you'll both show up here.
            </Txt>
          </Card>
        ) : (
          <Card padded={false}>
            {board.map((entry, i) => (
              <View key={entry.id}>
                {i > 0 ? <Rule /> : null}
                <View style={[s.boardRow, entry.you && { backgroundColor: color.signalSoft }]}>
                  <Txt variant="micro" style={{ width: 16 }}>
                    {i + 1}
                  </Txt>
                  <Avatar name={entry.name} size={26} tint={entry.you ? color.signal : undefined} />
                  <View style={{ flex: 1, gap: 5 }}>
                    <Txt variant="title" style={{ fontSize: 15 }} numberOfLines={1}>
                      {entry.you ? 'You' : entry.name}
                    </Txt>
                    <View style={s.track}>
                      <View
                        style={[
                          s.fill,
                          {
                            width: `${Math.max(3, (entry.value / maxValue) * 100)}%`,
                            backgroundColor: entry.you ? color.signal : color.lineStrong,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Txt variant="title" style={{ fontSize: 15, fontVariant: ['tabular-nums'] }}>
                    {formatMetric(entry.value, metric, habit)}
                  </Txt>
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>

      <View style={{ gap: space.md }}>
        <SectionHead label="Shared with" style={{ marginBottom: 0 }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {state.friends.map((f) => {
            const on = habit.sharedWith.includes(f.id);
            return (
              <Button
                key={f.id}
                label={`${on ? '✓ ' : '+ '}${f.name.split(' ')[0]}`}
                size="sm"
                tone={on ? 'solid' : 'quiet'}
                onPress={() => dispatch({ type: 'shareHabit', habitId: habit.id, friendId: f.id })}
              />
            );
          })}
        </View>
        <Txt variant="small" color={color.faint}>
          Friends you share with can add this habit to their own list. Only the habit travels — your
          entries stay yours.
        </Txt>
      </View>
    </Sheet>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
        <Txt variant="numeral" style={{ fontSize: 28, lineHeight: 32 }}>
          {value}
        </Txt>
        {unit ? (
          <Txt variant="small" color={color.muted} numberOfLines={1}>
            {unit}
          </Txt>
        ) : null}
      </View>
      <Txt variant="micro">{label}</Txt>
    </View>
  );
}

interface Entry {
  id: string;
  name: string;
  value: number;
  you?: boolean;
}

function leaderboard(
  habit: Habit,
  state: ReturnType<typeof useStore>['state'],
  metric: Metric,
  today: string,
): Entry[] {
  const week = lastNDays(7, today);
  const mine =
    metric === 'streak'
      ? currentStreak(habit, state.logs, today)
      : habit.kind === 'binary'
        ? keptIn(habit, state.logs, week)
        : totalIn(habit, state.logs, week);

  const key = norm(habit.name);
  const friends = state.friends
    .filter((f) => habit.sharedWith.includes(f.id))
    .map((f) => ({
      id: f.id,
      name: f.name,
      value: f.stats[key]?.[metric === 'streak' ? 'streak' : 'week'] ?? 0,
    }));

  return [{ id: 'me', name: state.profile.name, value: mine, you: true }, ...friends].sort(
    (a, b) => b.value - a.value,
  );
}

function formatMetric(value: number, metric: Metric, habit: Habit) {
  if (metric === 'streak') return `${value}d`;
  return habit.kind === 'binary' ? `${value}/7` : value.toLocaleString();
}

const s = StyleSheet.create({
  stats: { flexDirection: 'row', gap: space.md },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  track: { height: 3, borderRadius: 2, backgroundColor: color.paperDeep, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2 },
});
