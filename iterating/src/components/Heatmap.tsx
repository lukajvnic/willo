import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { addDays, fromISO, monthName, rangeOfDays, shortDate, startOfWeek, todayISO } from '@/lib/date';
import { completionLevel, dayCompletion, heatLevel, heatScale, valueOn } from '@/lib/stats';
import { Habit, Logs } from '@/store/types';
import { color, space } from '@/theme';
import { Cell } from './Cell';
import { Txt } from './Type';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function Heatmap({
  habit,
  logs,
  weeks = 18,
  size = 11,
  gap = 3,
  showMonths = false,
  showDays = false,
  onPressDay,
}: {
  habit: Habit;
  logs: Logs;
  weeks?: number;
  size?: number;
  gap?: number;
  showMonths?: boolean;
  showDays?: boolean;
  onPressDay?: (iso: string) => void;
}) {
  const today = todayISO();
  const scale = useMemo(() => heatScale(habit, logs), [habit, logs]);

  const columns = useMemo(() => {
    const lastMonday = startOfWeek(today);
    const firstMonday = addDays(lastMonday, -(weeks - 1) * 7);
    return Array.from({ length: weeks }, (_, w) => rangeOfDays(addDays(firstMonday, w * 7), 7));
  }, [today, weeks]);

  // Label a column when the month changes inside it — the same convention as a
  // contribution graph, so the axis costs no explanation.
  const monthLabels = useMemo(
    () =>
      columns.map((col, i) => {
        const m = fromISO(col[0]).getMonth();
        const prev = i === 0 ? null : fromISO(columns[i - 1][0]).getMonth();
        return prev === null || prev !== m ? monthName(m).slice(0, 3) : '';
      }),
    [columns],
  );

  return (
    <View style={{ flexDirection: 'row', gap }}>
      {showDays ? (
        <View style={{ gap, marginRight: 2, paddingTop: showMonths ? 16 : 0 }}>
          {DAY_LETTERS.map((d, i) => (
            <View key={i} style={{ height: size, justifyContent: 'center' }}>
              <Txt variant="micro" style={{ fontSize: 8.5, lineHeight: size, letterSpacing: 0 }}>
                {i % 2 === 0 ? d : ''}
              </Txt>
            </View>
          ))}
        </View>
      ) : null}

      {columns.map((week, ci) => (
        <View key={week[0]} style={{ gap }}>
          {showMonths ? (
            <Txt variant="micro" style={{ height: 14, fontSize: 8.5, letterSpacing: 0.4 }}>
              {monthLabels[ci]}
            </Txt>
          ) : null}
          {week.map((iso) => {
            const future = iso > today;
            const before = iso < habit.createdAt;
            const value = valueOn(logs, habit.id, iso);
            // Days before the habit existed are ghosted, never empty: the grid
            // keeps its shape without claiming you missed something.
            if (before) {
              return <Cell key={iso} size={size} level={0} style={{ opacity: 0.3 }} />;
            }
            return (
              <Cell
                key={iso}
                size={size}
                level={future ? 0 : heatLevel(habit, value, scale)}
                today={iso === today}
                dim={future}
                focusable={false}
                onPress={onPressDay && !future ? () => onPressDay(iso) : undefined}
                accessibilityLabel={
                  future
                    ? `${shortDate(iso)}, not yet`
                    : `${shortDate(iso)}, ${
                        value > 0
                          ? habit.kind === 'binary'
                            ? 'kept'
                            : `${value} ${habit.unit ?? ''}`
                          : 'nothing logged'
                      }`
                }
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

/**
 * Seven wide squares filling the column: how much of each day's slate you kept.
 * It's the goal's heartbeat, and it's the same material as every other grid.
 */
export function WeekPulse({
  habits,
  logs,
  height = 52,
  gap = 4,
  onPressDay,
  selected,
}: {
  habits: Habit[];
  logs: Logs;
  height?: number;
  gap?: number;
  onPressDay?: (iso: string) => void;
  selected?: string;
}) {
  const today = todayISO();
  const [width, setWidth] = useState(0);
  const week = useMemo(() => rangeOfDays(startOfWeek(today), 7), [today]);
  const cellW = width > 0 ? (width - gap * 6) / 7 : 0;

  return (
    <View style={{ gap: 6 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={{ flexDirection: 'row', gap }}>
        {week.map((iso, i) => (
          <View key={iso} style={{ width: cellW, alignItems: 'center' }}>
            <Txt
              variant="micro"
              color={iso === today ? color.ink : color.faint}
              style={{ letterSpacing: 0 }}
            >
              {DAY_LETTERS[i]}
            </Txt>
          </View>
        ))}
      </View>

      {cellW > 0 ? (
        <View style={{ flexDirection: 'row', gap }}>
          {week.map((iso) => {
            const future = iso > today;
            const fraction = future ? 0 : dayCompletion(habits, logs, iso);
            return (
              <Cell
                key={iso}
                size={cellW}
                height={height}
                level={completionLevel(fraction)}
                today={iso === today}
                dim={future}
                selected={selected === iso}
                onPress={onPressDay && !future ? () => onPressDay(iso) : undefined}
                accessibilityLabel={`${shortDate(iso)}, ${Math.round(fraction * 100)}% of habits kept`}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
