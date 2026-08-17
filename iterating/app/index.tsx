import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Rail } from '@/components/Rail';
import { daysBetween, isWithin, todayISO } from '@/lib/date';
import { valueOn } from '@/lib/stats';
import { HabitsScreen } from '@/screens/HabitsScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { RemindersScreen } from '@/screens/RemindersScreen';
import { GoalSheet } from '@/sheets/GoalSheet';
import { HabitDetailSheet } from '@/sheets/HabitDetailSheet';
import { HabitSheet } from '@/sheets/HabitSheet';
import { ProfileSheet } from '@/sheets/ProfileSheet';
import { ReminderSheet } from '@/sheets/ReminderSheet';
import { useStore } from '@/store/StoreContext';
import { Habit, Reminder } from '@/store/types';
import { color } from '@/theme';

const HABITS = 0;
const GOAL = 1;
const REMINDERS = 2;

type SheetState =
  | { kind: 'none' }
  | { kind: 'goal' }
  | { kind: 'habit'; habit?: Habit }
  | { kind: 'habitDetail'; habit: Habit }
  | { kind: 'reminder'; reminder?: Reminder; date?: string }
  | { kind: 'profile' };

export default function App() {
  const { state } = useStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const today = todayISO();

  const pager = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(GOAL);
  const [sheet, setSheet] = useState<SheetState>({ kind: 'none' });

  // Hold the last sheet's payload so it still has something to render while it
  // animates closed.
  const [held, setHeld] = useState<SheetState>({ kind: 'none' });
  useEffect(() => {
    if (sheet.kind !== 'none') setHeld(sheet);
  }, [sheet]);
  const shown = sheet.kind === 'none' ? held : sheet;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(2, next));
      setIndex(clamped);
      pager.current?.scrollTo({ x: clamped * width, animated: true });
    },
    [width],
  );

  // Land on the goal, and keep the current panel under the viewport on resize.
  useEffect(() => {
    if (width <= 0) return;
    scrollX.setValue(index * width);
    const id = setTimeout(() => pager.current?.scrollTo({ x: index * width, animated: false }), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing || sheet.kind !== 'none') return;
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, index, sheet.kind]);

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / Math.max(width, 1));
      if (next !== index) setIndex(next);
    },
  });

  const railItems = useMemo(() => {
    const live = state.habits.filter((h) => h.createdAt <= today);
    const left = live.filter((h) => valueOn(state.logs, h.id, today) === 0).length;
    const dueToday = state.reminders.filter(
      (r) =>
        !r.doneOn &&
        (r.kind === 'fixed' ? r.date === today : isWithin(today, r.date, r.endDate!)),
    ).length;
    const overdue = state.reminders.filter(
      (r) => !r.doneOn && r.kind === 'fixed' && r.date < today,
    ).length;

    return [
      {
        label: 'Habits',
        hint: live.length === 0 ? 'none yet' : left === 0 ? 'all kept' : `${left} left today`,
      },
      {
        label: 'Goal',
        hint: state.goal ? `day ${daysBetween(state.goal.setAt, today) + 1}` : 'not set',
      },
      {
        label: 'Reminders',
        hint: overdue > 0 ? `${overdue} overdue` : dueToday === 0 ? 'clear today' : `${dueToday} today`,
      },
    ];
  }, [state, today]);

  const close = () => setSheet({ kind: 'none' });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Rail
        items={railItems}
        index={index}
        scrollX={scrollX}
        pageWidth={width}
        onGo={goTo}
        profileName={state.profile.name}
        onProfile={() => setSheet({ kind: 'profile' })}
      />

      <Animated.ScrollView
        ref={pager as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        style={{ flex: 1 }}
        {...({ dataSet: { willoPager: true } } as any)}
      >
        <View style={{ width }}>
          <HabitsScreen
            onNewHabit={() => setSheet({ kind: 'habit' })}
            onOpenHabit={(habit) => setSheet({ kind: 'habitDetail', habit })}
          />
        </View>
        <View style={{ width }}>
          <HomeScreen
            onEditGoal={() => setSheet({ kind: 'goal' })}
            onOpenHabits={() => goTo(HABITS)}
            onOpenReminders={() => goTo(REMINDERS)}
            onOpenReminder={(reminder) => setSheet({ kind: 'reminder', reminder })}
          />
        </View>
        <View style={{ width }}>
          <RemindersScreen
            onNewReminder={(date) => setSheet({ kind: 'reminder', date })}
            onOpenReminder={(reminder) => setSheet({ kind: 'reminder', reminder })}
          />
        </View>
      </Animated.ScrollView>

      <View style={styles.sheets}>
        <GoalSheet open={sheet.kind === 'goal'} onClose={close} />
        <HabitSheet
          open={sheet.kind === 'habit'}
          habit={shown.kind === 'habit' ? shown.habit : undefined}
          onClose={close}
        />
        <HabitDetailSheet
          open={sheet.kind === 'habitDetail'}
          habit={shown.kind === 'habitDetail' ? shown.habit : undefined}
          onClose={close}
          onEdit={(habit) => setSheet({ kind: 'habit', habit })}
        />
        <ReminderSheet
          open={sheet.kind === 'reminder'}
          reminder={shown.kind === 'reminder' ? shown.reminder : undefined}
          defaultDate={shown.kind === 'reminder' ? shown.date : undefined}
          onClose={close}
        />
        <ProfileSheet open={sheet.kind === 'profile'} onClose={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.paper },
  sheets: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    pointerEvents: 'box-none',
  },
});
