import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, ChipRow, Field, Segmented } from '@/components/controls';
import { DateField, TimeField } from '@/components/DateField';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Type';
import { addDays, todayISO } from '@/lib/date';
import { useStore } from '@/store/StoreContext';
import { Priority, Reminder, ReminderKind } from '@/store/types';
import { color, space } from '@/theme';

export function ReminderSheet({
  open,
  reminder,
  defaultDate,
  onClose,
}: {
  open: boolean;
  reminder?: Reminder;
  defaultDate?: string;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const today = todayISO();

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<ReminderKind>('fixed');
  const [date, setDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 6));
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<Priority>(2);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    const start = reminder?.date ?? defaultDate ?? today;
    setTitle(reminder?.title ?? '');
    setKind(reminder?.kind ?? 'fixed');
    setDate(start);
    setEndDate(reminder?.endDate ?? addDays(start, 6));
    setTime(reminder?.time ?? '09:00');
    setPriority(reminder?.priority ?? 2);
    setNote(reminder?.note ?? '');
  }, [open, reminder, defaultDate, today]);

  const end = endDate < date ? date : endDate;
  const valid = title.trim().length > 0;

  const save = () => {
    if (!valid) return;
    const payload = {
      title: title.trim(),
      kind,
      date,
      time: kind === 'fixed' ? time : undefined,
      endDate: kind === 'window' ? end : undefined,
      priority,
      note: note.trim() || undefined,
      doneOn: reminder?.doneOn,
    };
    if (reminder) dispatch({ type: 'updateReminder', id: reminder.id, patch: payload });
    else dispatch({ type: 'addReminder', reminder: payload });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={reminder ? 'Edit reminder' : 'New reminder'}
      title={reminder ? reminder.title : 'What needs to happen?'}
      footer={
        <>
          <Button
            label={reminder ? 'Save changes' : 'Add reminder'}
            onPress={save}
            disabled={!valid}
            style={{ flex: 1 }}
          />
          {reminder ? (
            <Button
              label="Delete"
              tone="danger"
              onPress={() => {
                dispatch({ type: 'deleteReminder', id: reminder.id });
                onClose();
              }}
            />
          ) : (
            <Button label="Cancel" onPress={onClose} tone="quiet" />
          )}
        </>
      }
    >
      <Field
        label="Reminder"
        value={title}
        onChangeText={setTitle}
        placeholder="Dentist, book flights, call Mum"
        autoFocus={!reminder}
      />

      <Segmented
        label="When"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'fixed', label: 'On a date' },
          { value: 'window', label: 'In a window' },
        ]}
      />

      {kind === 'fixed' ? (
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <DateField label="Date" value={date} onChange={setDate} />
          <TimeField label="Time" value={time} onChange={setTime} />
        </View>
      ) : (
        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <DateField label="Any time from" value={date} onChange={setDate} />
            <DateField label="Until" value={end} onChange={setEndDate} min={date} />
          </View>
          <Txt variant="small" color={color.faint}>
            It sits open across those days and closes the moment you tick it off.
          </Txt>
        </View>
      )}

      <View style={{ gap: space.sm }}>
        <Txt variant="micro">Priority</Txt>
        <ChipRow
          value={String(priority) as '1' | '2' | '3'}
          onChange={(v) => setPriority(Number(v) as Priority)}
          options={[
            { value: '1', label: 'First' },
            { value: '2', label: 'Then' },
            { value: '3', label: 'Whenever' },
          ]}
        />
        <Txt variant="small" color={color.faint}>
          Decides the order when several things land on the same day.
        </Txt>
      </View>

      <Field label="Note" value={note} onChangeText={setNote} placeholder="Optional" multiline />
    </Sheet>
  );
}
