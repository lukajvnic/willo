import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, ChipRow, Field, Segmented } from '@/components/controls';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Type';
import { useStore } from '@/store/StoreContext';
import { Habit, HabitKind } from '@/store/types';
import { color, space } from '@/theme';

const NEW_CATEGORY = '__new';

/** Add a habit, or edit one you already keep. */
export function HabitSheet({
  open,
  habit,
  onClose,
}: {
  open: boolean;
  habit?: Habit;
  onClose: () => void;
}) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(state.categories[0] ?? 'Body');
  const [newCategory, setNewCategory] = useState('');
  const [kind, setKind] = useState<HabitKind>('binary');
  const [unit, setUnit] = useState('');
  const [target, setTarget] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? '');
    setCategory(habit?.category ?? state.categories[0] ?? 'Body');
    setNewCategory('');
    setKind(habit?.kind ?? 'binary');
    setUnit(habit?.unit ?? '');
    setTarget(habit?.target ? String(habit.target) : '');
  }, [open, habit, state.categories]);

  const resolvedCategory = category === NEW_CATEGORY ? newCategory.trim() : category;
  const valid = name.trim().length > 0 && resolvedCategory.length > 0 && (kind === 'binary' || unit.trim().length > 0);

  const save = () => {
    if (!valid) return;
    const payload = {
      name: name.trim(),
      category: resolvedCategory,
      kind,
      unit: kind === 'count' ? unit.trim() : undefined,
      target: kind === 'count' ? Math.max(1, Number(target) || 10) : undefined,
    };
    if (habit) dispatch({ type: 'updateHabit', id: habit.id, patch: payload });
    else dispatch({ type: 'addHabit', habit: payload });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={habit ? 'Edit habit' : 'New habit'}
      title={habit ? habit.name : 'What do you want to keep doing?'}
      footer={
        <>
          <Button label={habit ? 'Save changes' : 'Add habit'} onPress={save} disabled={!valid} style={{ flex: 1 }} />
          {habit ? (
            <Button
              label="Delete"
              tone="danger"
              onPress={() => {
                dispatch({ type: 'deleteHabit', id: habit.id });
                onClose();
              }}
            />
          ) : (
            <Button label="Cancel" onPress={onClose} tone="quiet" />
          )}
        </>
      }
    >
      <Field label="Name" value={name} onChangeText={setName} placeholder="Train, Read, Call someone" autoFocus={!habit} />

      <View style={{ gap: space.sm }}>
        <Txt variant="micro">Category</Txt>
        <ChipRow
          value={category}
          onChange={setCategory}
          options={[
            ...state.categories.map((c) => ({ value: c, label: c })),
            { value: NEW_CATEGORY, label: '+ New' },
          ]}
        />
        {category === NEW_CATEGORY ? (
          <Field value={newCategory} onChangeText={setNewCategory} placeholder="Name the category" autoFocus />
        ) : null}
      </View>

      <Segmented
        label="How do you track it?"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'binary', label: 'Did it or not' },
          { value: 'count', label: 'Count how much' },
        ]}
      />

      {kind === 'count' ? (
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Field label="Unit" value={unit} onChangeText={setUnit} placeholder="reps, pages, minutes" />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="A full day"
              value={target}
              onChangeText={setTarget}
              placeholder="60"
              keyboardType="numeric"
              hint="Sets the darkest shade"
            />
          </View>
        </View>
      ) : (
        <Txt variant="small" color={color.faint}>
          A day you did it fills in solid. A day you didn't stays empty.
        </Txt>
      )}
    </Sheet>
  );
}
