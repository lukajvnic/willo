import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Field } from '@/components/controls';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Type';
import { useStore } from '@/store/StoreContext';
import { color, space, type as t } from '@/theme';

export function GoalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [text, setText] = useState(state.goal?.text ?? '');

  useEffect(() => {
    if (open) setText(state.goal?.text ?? '');
  }, [open, state.goal?.text]);

  const save = () => {
    if (!text.trim()) return;
    dispatch({ type: 'setGoal', text });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow="Greatest goal"
      title="Say it in one sentence"
      footer={
        <>
          <Button label="Save" onPress={save} disabled={!text.trim()} style={{ flex: 1 }} />
          <Button label="Cancel" onPress={onClose} tone="quiet" />
        </>
      }
    >
      <View style={{ gap: space.md }}>
        <Field
          value={text}
          onChangeText={setText}
          placeholder="What are you working toward?"
          multiline
          autoFocus
          inputStyle={[t.displayM as object, { minHeight: 110, paddingTop: space.md, lineHeight: 28 }]}
        />
        <Txt variant="small" color={color.faint}>
          Rewriting the goal keeps your history — habits and reminders stay exactly where they are.
        </Txt>
      </View>
    </Sheet>
  );
}
