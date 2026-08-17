import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar } from '@/components/Calendar';
import { Button, Check, IconButton } from '@/components/controls';
import { Card, Row, Rule, SectionHead, Tag } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Type';
import {
  addDays,
  dayName,
  formatTime,
  fromISO,
  isWithin,
  rangeLabel,
  shortDate,
  startOfWeek,
  todayISO,
  whenLabel,
} from '@/lib/date';
import { useStore } from '@/store/StoreContext';
import { Priority, Reminder } from '@/store/types';
import { color, radius, space } from '@/theme';

const PRIORITY_WORD: Record<Priority, string> = { 1: 'First', 2: 'Then', 3: 'Whenever' };

export function RemindersScreen({
  onNewReminder,
  onOpenReminder,
}: {
  onNewReminder: (date?: string) => void;
  onOpenReminder: (r: Reminder) => void;
}) {
  const { state } = useStore();
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const d = fromISO(today);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState<string | undefined>();
  const [showDone, setShowDone] = useState(false);

  const open = state.reminders.filter((r) => !r.doneOn);
  const done = state.reminders.filter((r) => r.doneOn).sort((a, b) => b.doneOn!.localeCompare(a.doneOn!));

  const groups = useMemo(() => groupReminders(open, today), [open, today]);
  const onSelectedDay = useMemo(
    () => (selected ? open.filter((r) => coversDay(r, selected)).sort(byPriority) : []),
    [open, selected],
  );

  const shiftMonth = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const openWindows = open.filter((r) => r.kind === 'window' && isWithin(today, r.date, r.endDate!)).length;

  return (
    <Screen>
      <View style={{ gap: space.lg, paddingTop: space.xxl }}>
        <Txt variant="displayL">Reminders</Txt>
        <Txt variant="body">
          {open.length === 0
            ? 'Nothing on the books.'
            : `${open.length} open${openWindows ? ` · ${openWindows} window${openWindows === 1 ? '' : 's'} you can close today` : ''}.`}
        </Txt>
      </View>

      <Card>
        <Calendar
          year={cursor.year}
          month={cursor.month}
          reminders={state.reminders}
          selected={selected}
          onSelect={(iso) => setSelected((prev) => (prev === iso ? undefined : iso))}
          onShiftMonth={shiftMonth}
        />
      </Card>

      {selected ? (
        <View style={{ gap: space.md }}>
          <SectionHead
            label={`${dayName(selected)} ${shortDate(selected)}`}
            right={
              <Row gap={space.sm}>
                <Button label="Add here" onPress={() => onNewReminder(selected)} tone="quiet" size="sm" />
                <Button label="Clear" onPress={() => setSelected(undefined)} tone="ghost" size="sm" />
              </Row>
            }
          />
          {onSelectedDay.length === 0 ? (
            <Card>
              <Txt variant="body" color={color.faint}>
                Nothing on this day.
              </Txt>
            </Card>
          ) : (
            <ReminderList items={onSelectedDay} onOpen={onOpenReminder} />
          )}
        </View>
      ) : (
        <View style={{ gap: space.xxl }}>
          <SectionHead
            label="Agenda"
            right={<Button label="New reminder" onPress={() => onNewReminder()} tone="quiet" size="sm" />}
            style={{ marginBottom: -space.md }}
          />
          {groups.map((group) =>
            group.items.length === 0 ? null : (
              <View key={group.label} style={{ gap: space.md }}>
                <SectionHead
                  label={group.label}
                  right={<Txt variant="micro">{group.items.length}</Txt>}
                />
                <ReminderList items={group.items} onOpen={onOpenReminder} />
              </View>
            ),
          )}

          {open.length === 0 ? (
            <Card style={{ gap: space.md, alignItems: 'flex-start' }}>
              <Txt variant="body">
                Two kinds go here: things pinned to a time, and things that just need to happen sometime
                this week.
              </Txt>
              <Button label="Add a reminder" onPress={() => onNewReminder()} tone="quiet" size="sm" />
            </Card>
          ) : null}

          {done.length > 0 ? (
            <View style={{ gap: space.md }}>
              <Pressable accessibilityRole="button" onPress={() => setShowDone((v) => !v)}>
                <SectionHead label={`Done · ${done.length}`} right={<Txt variant="micro">{showDone ? 'Hide' : 'Show'}</Txt>} />
              </Pressable>
              {showDone ? <ReminderList items={done} onOpen={onOpenReminder} /> : null}
            </View>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

function ReminderList({ items, onOpen }: { items: Reminder[]; onOpen: (r: Reminder) => void }) {
  const { dispatch } = useStore();
  const today = todayISO();

  return (
    <Card padded={false}>
      {items.map((r, i) => (
        <View key={r.id}>
          {i > 0 ? <Rule /> : null}
          <View style={s.row}>
            <Check
              checked={!!r.doneOn}
              onPress={() => dispatch({ type: 'toggleReminderDone', id: r.id })}
              label={`Mark ${r.title} done`}
              size={24}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${r.title}`}
              onPress={() => onOpen(r)}
              style={({ hovered }: any) => [{ flex: 1, gap: 3 }, hovered && { opacity: 0.68 }]}
            >
              <Txt
                variant="title"
                numberOfLines={1}
                style={r.doneOn ? { textDecorationLine: 'line-through', color: color.faint } : undefined}
              >
                {r.title}
              </Txt>
              <Row gap={space.sm}>
                <Txt variant="small">
                  {r.kind === 'fixed'
                    ? `${whenLabel(r.date, today)}${r.time ? ` · ${formatTime(r.time)}` : ''}`
                    : rangeLabel(r.date, r.endDate!, today)}
                </Txt>
                {r.kind === 'window' ? <Tag label="Window" tone="flex" /> : null}
              </Row>
            </Pressable>

            {r.doneOn ? null : (
              <PriorityStepper
                value={r.priority}
                onChange={(direction) => dispatch({ type: 'nudgePriority', id: r.id, direction })}
              />
            )}
          </View>
        </View>
      ))}
    </Card>
  );
}

/**
 * Priority as squares, so it speaks the same language as the heatmaps:
 * three filled = protect this one, one filled = whenever.
 */
export function PriorityMark({ value, size = 5 }: { value: Priority; size?: number }) {
  const filled = 4 - value;
  return (
    <View
      accessibilityLabel={`Priority: ${PRIORITY_WORD[value].toLowerCase()}`}
      style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: 1,
            backgroundColor: i < filled ? color.ink : color.lineStrong,
          }}
        />
      ))}
    </View>
  );
}

function PriorityStepper({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (direction: -1 | 1) => void;
}) {
  return (
    <View style={s.priority}>
      <IconButton
        glyph="▲"
        label="Raise priority"
        size={22}
        tone="bare"
        disabled={value === 1}
        onPress={() => onChange(-1)}
      />
      <View style={{ alignItems: 'center', gap: 3, minWidth: 54 }}>
        <PriorityMark value={value} />
        <Txt variant="micro" style={{ fontSize: 8.5, letterSpacing: 0.6 }}>
          {PRIORITY_WORD[value]}
        </Txt>
      </View>
      <IconButton
        glyph="▼"
        label="Lower priority"
        size={22}
        tone="bare"
        disabled={value === 3}
        onPress={() => onChange(1)}
      />
    </View>
  );
}

const byPriority = (a: Reminder, b: Reminder) =>
  a.priority - b.priority ||
  (a.time ?? '23:59').localeCompare(b.time ?? '23:59') ||
  a.date.localeCompare(b.date);

/** A window counts for any day it's open on; a fixed reminder only for its day. */
function coversDay(r: Reminder, iso: string) {
  return r.kind === 'fixed' ? r.date === iso : isWithin(iso, r.date, r.endDate!);
}

/** The day a reminder first wants your attention. */
function claimDate(r: Reminder, today: string) {
  if (r.kind === 'fixed') return r.date;
  return r.date <= today ? today : r.date;
}

function groupReminders(reminders: Reminder[], today: string) {
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(startOfWeek(today), 6);

  const buckets: Record<string, Reminder[]> = {
    Overdue: [],
    Today: [],
    Tomorrow: [],
    'Rest of the week': [],
    Later: [],
  };

  reminders.forEach((r) => {
    const when = claimDate(r, today);
    if (when < today) buckets.Overdue.push(r);
    else if (when === today) buckets.Today.push(r);
    else if (when === tomorrow) buckets.Tomorrow.push(r);
    else if (when <= weekEnd) buckets['Rest of the week'].push(r);
    else buckets.Later.push(r);
  });

  return Object.entries(buckets).map(([label, items]) => ({
    label,
    items: items.sort(byPriority),
  }));
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 66,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.control,
    backgroundColor: color.card,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
});
