import React from 'react';
import { Platform, View } from 'react-native';
import { color, font, radius } from '@/theme';
import { Field } from './controls';
import { Txt } from './Type';

const webInput = {
  fontFamily: font.body,
  fontSize: 15,
  color: color.ink,
  backgroundColor: color.card,
  border: `1px solid ${color.line}`,
  borderRadius: radius.control,
  padding: '0 12px',
  height: 44,
  width: '100%',
  boxSizing: 'border-box' as const,
};

/**
 * The browser's own date and time pickers. Native gets a plain text fallback —
 * we're iterating on web first, and a half-built wheel picker helps nobody.
 */
export function DateField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  min?: string;
}) {
  if (Platform.OS !== 'web') {
    return <Field label={label} value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" />;
  }
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Txt variant="micro">{label}</Txt>
      {React.createElement('input', {
        type: 'date',
        value,
        min,
        'aria-label': label,
        onChange: (e: any) => onChange(e.target.value),
        style: webInput,
      })}
    </View>
  );
}

export function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hhmm: string) => void;
}) {
  if (Platform.OS !== 'web') {
    return <Field label={label} value={value} onChangeText={onChange} placeholder="HH:MM" />;
  }
  return (
    <View style={{ gap: 6, flex: 1 }}>
      <Txt variant="micro">{label}</Txt>
      {React.createElement('input', {
        type: 'time',
        value,
        'aria-label': label,
        onChange: (e: any) => onChange(e.target.value),
        style: webInput,
      })}
    </View>
  );
}
