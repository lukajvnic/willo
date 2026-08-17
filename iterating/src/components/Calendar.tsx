import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { fromISO, isWithin, monthGrid, monthName, shortDate, todayISO } from '@/lib/date';
import { Reminder } from '@/store/types';
import { color, radius, space } from '@/theme';
import { Cell } from './Cell';
import { IconButton } from './controls';
import { Txt } from './Type';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const GAP = 4;
const BAR = 4;
const BAR_GAP = 3;

interface Bar {
  reminder: Reminder;
  from: number;
  to: number;
  slot: number;
  opensHere: boolean;
  closesHere: boolean;
}

/**
 * A month of the same squares used everywhere else. Indigo fills a day you've
 * pinned something to; an ochre bar underneath spans a window you still get to
 * choose inside.
 */
export function Calendar({
  year,
  month,
  reminders,
  selected,
  onSelect,
  onShiftMonth,
}: {
  year: number;
  month: number;
  reminders: Reminder[];
  selected?: string;
  onSelect: (iso: string) => void;
  onShiftMonth: (delta: number) => void;
}) {
  const today = todayISO();
  const [gridWidth, setGridWidth] = useState(0);
  const cellW = gridWidth > 0 ? (gridWidth - GAP * 6) / 7 : 0;
  const cellH = Math.min(cellW, 46);

  const weeks = useMemo(() => monthGrid(year, month), [year, month]);

  const fixedByDay = useMemo(() => {
    const map = new Map<string, number>();
    reminders
      .filter((r) => r.kind === 'fixed' && !r.doneOn)
      .forEach((r) => map.set(r.date, (map.get(r.date) ?? 0) + 1));
    return map;
  }, [reminders]);

  const windows = useMemo(() => reminders.filter((r) => r.kind === 'window' && !r.doneOn), [reminders]);

  const rows = useMemo(
    () => weeks.map((week) => layoutBars(windows, week)),
    [weeks, windows],
  );
  const slots = Math.max(0, ...rows.map((bars) => Math.max(0, ...bars.map((b) => b.slot + 1))));
  const strip = slots > 0 ? slots * (BAR + BAR_GAP) : 0;

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt variant="title">
          {monthName(month)} {year}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <IconButton glyph="‹" label="Previous month" size={30} onPress={() => onShiftMonth(-1)} />
          <IconButton glyph="›" label="Next month" size={30} onPress={() => onShiftMonth(1)} />
        </View>
      </View>

      <View style={{ gap: 6 }} onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
        <View style={{ flexDirection: 'row', gap: GAP }}>
          {DAY_LETTERS.map((d, i) => (
            <View key={i} style={{ width: cellW, alignItems: 'center' }}>
              <Txt variant="micro" style={{ letterSpacing: 0 }}>
                {d}
              </Txt>
            </View>
          ))}
        </View>

        {cellW > 0
          ? weeks.map((week, wi) => (
              <View key={week[0]} style={{ gap: 5 }}>
                <View style={{ flexDirection: 'row', gap: GAP }}>
                  {week.map((iso) => {
                    const count = fixedByDay.get(iso) ?? 0;
                    const outside = fromISO(iso).getMonth() !== month;
                    return (
                      <Cell
                        key={iso}
                        size={cellW}
                        height={cellH}
                        level={count === 0 ? 0 : Math.min(4, count + 1)}
                        label={String(fromISO(iso).getDate())}
                        today={iso === today}
                        selected={selected === iso}
                        dim={outside}
                        onPress={() => onSelect(iso)}
                        accessibilityLabel={`${shortDate(iso)}, ${count} on the day`}
                      />
                    );
                  })}
                </View>

                {strip > 0 ? (
                  <View style={{ height: strip }}>
                    {rows[wi].map((bar) => {
                      const span = bar.to - bar.from + 1;
                      return (
                        <View
                          key={bar.reminder.id}
                          accessibilityLabel={`${bar.reminder.title}, open window`}
                          style={{
                            position: 'absolute',
                            top: bar.slot * (BAR + BAR_GAP),
                            left: bar.from * (cellW + GAP),
                            width: span * cellW + (span - 1) * GAP,
                            height: BAR,
                            backgroundColor: color.flex,
                            borderTopLeftRadius: bar.opensHere ? radius.cell : 0,
                            borderBottomLeftRadius: bar.opensHere ? radius.cell : 0,
                            borderTopRightRadius: bar.closesHere ? radius.cell : 0,
                            borderBottomRightRadius: bar.closesHere ? radius.cell : 0,
                          }}
                        />
                      );
                    })}
                  </View>
                ) : null}
              </View>
            ))
          : null}
      </View>

      <View style={{ flexDirection: 'row', gap: space.lg, paddingTop: 2 }}>
        <LegendItem tone={color.signal} label="On a date" />
        <LegendItem tone={color.flex} label="In a window" />
      </View>
    </View>
  );
}

function LegendItem({ tone, label }: { tone: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 9, height: 9, borderRadius: radius.cell, backgroundColor: tone }} />
      <Txt variant="micro">{label}</Txt>
    </View>
  );
}

/** Pack each week's open windows into non-overlapping rows of bars. */
function layoutBars(windows: Reminder[], week: string[]): Bar[] {
  const rowStart = week[0];
  const rowEnd = week[6];
  const taken: Array<Array<[number, number]>> = [];

  return windows
    .filter((r) => r.date <= rowEnd && r.endDate! >= rowStart)
    .sort((a, b) => a.date.localeCompare(b.date) || a.priority - b.priority)
    .map((r) => {
      const from = week.findIndex((d) => isWithin(d, r.date, r.endDate!));
      let to = from;
      for (let i = week.length - 1; i >= 0; i--) {
        if (isWithin(week[i], r.date, r.endDate!)) {
          to = i;
          break;
        }
      }
      let slot = 0;
      while (taken[slot]?.some(([a, b]) => from <= b && to >= a)) slot++;
      (taken[slot] ??= []).push([from, to]);
      return {
        reminder: r,
        from,
        to,
        slot,
        opensHere: r.date >= rowStart,
        closesHere: r.endDate! <= rowEnd,
      };
    });
}
