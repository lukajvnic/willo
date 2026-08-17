import React from 'react';
import { Habit } from '@/store/types';
import { Check, Stepper } from './controls';

/** A sensible tap size for a count habit, derived from its daily target. */
export function stepFor(habit: Habit) {
  const target = habit.target ?? 10;
  if (target >= 150) return 30;
  if (target >= 60) return 10;
  if (target >= 20) return 5;
  return 1;
}

export function HabitControl({
  habit,
  value,
  onChange,
}: {
  habit: Habit;
  value: number;
  onChange: (next: number) => void;
}) {
  if (habit.kind === 'binary') {
    return (
      <Check
        checked={value > 0}
        onPress={() => onChange(value > 0 ? 0 : 1)}
        label={`Mark ${habit.name} done`}
      />
    );
  }
  return (
    <Stepper
      value={value}
      unit={habit.unit}
      step={stepFor(habit)}
      onChange={onChange}
      label={habit.name}
    />
  );
}
