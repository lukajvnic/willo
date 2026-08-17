import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { color, font, radius, space, type as t } from '@/theme';
import { Txt } from './Type';

type ButtonTone = 'solid' | 'quiet' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  tone = 'solid',
  size = 'md',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette: Record<ButtonTone, { bg: string; fg: string; border: string }> = {
    solid: { bg: color.ink, fg: color.card, border: color.ink },
    quiet: { bg: color.card, fg: color.ink, border: color.lineStrong },
    ghost: { bg: 'transparent', fg: color.muted, border: 'transparent' },
    danger: { bg: 'transparent', fg: color.danger, border: color.line },
  };
  const p = palette[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        s.button,
        size === 'sm' && s.buttonSm,
        { backgroundColor: p.bg, borderColor: p.border },
        (hovered || pressed) && !disabled && { opacity: 0.82 },
        pressed && !disabled && { transform: [{ scale: 0.985 }] },
        disabled && { opacity: 0.38 },
        style,
      ]}
    >
      <Txt variant="title" color={p.fg} style={size === 'sm' ? { fontSize: 14 } : undefined}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function IconButton({
  glyph,
  onPress,
  label,
  size = 32,
  disabled,
  tone = 'quiet',
}: {
  glyph: string;
  onPress: () => void;
  label: string;
  size?: number;
  disabled?: boolean;
  tone?: 'quiet' | 'bare';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        {
          width: size,
          height: size,
          borderRadius: radius.control,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: tone === 'quiet' ? 1 : 0,
          borderColor: color.line,
          backgroundColor: tone === 'quiet' ? color.card : 'transparent',
        },
        hovered && !disabled && { borderColor: color.lineStrong, backgroundColor: color.paperDeep },
        pressed && !disabled && { opacity: 0.7 },
        disabled && { opacity: 0.3 },
      ]}
    >
      <Txt variant="title" color={color.inkSoft} style={{ fontSize: size * 0.46, lineHeight: size * 0.6 }}>
        {glyph}
      </Txt>
    </Pressable>
  );
}

/** The check is a grid cell, grown. Same language as every square in the app. */
export function Check({
  checked,
  onPress,
  size = 26,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  size?: number;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        {
          width: size,
          height: size,
          borderRadius: radius.cell + 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: checked ? color.signal : color.paperDeep,
          borderWidth: 1,
          borderColor: checked ? color.signal : color.lineStrong,
        },
        hovered && !checked && { backgroundColor: color.signalSoft, borderColor: color.signal },
        pressed && { transform: [{ scale: 0.92 }] },
        Platform.OS === 'web' ? ({ transition: 'background-color 140ms ease, transform 120ms ease' } as any) : null,
      ]}
    >
      {checked ? (
        <Txt color={color.onSignal} style={{ fontSize: size * 0.5, lineHeight: size * 0.66, fontWeight: '600' }}>
          ✓
        </Txt>
      ) : null}
    </Pressable>
  );
}

export function Stepper({
  value,
  unit,
  step = 5,
  onChange,
  label,
}: {
  value: number;
  unit?: string;
  step?: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <View style={s.stepper}>
      <IconButton
        glyph="–"
        label={`Subtract ${step} ${unit ?? ''} from ${label}`}
        size={30}
        tone="bare"
        disabled={value <= 0}
        onPress={() => onChange(Math.max(0, value - step))}
      />
      <View style={{ minWidth: 62, alignItems: 'center' }}>
        <Txt
          variant="title"
          color={value > 0 ? color.ink : color.faint}
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {value}
        </Txt>
        {unit ? <Txt variant="micro" style={{ marginTop: 1 }}>{unit}</Txt> : null}
      </View>
      <IconButton
        glyph="+"
        label={`Add ${step} ${unit ?? ''} to ${label}`}
        size={30}
        tone="bare"
        onPress={() => onChange(value + step)}
      />
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  autoFocus,
  inputStyle,
  hint,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
  autoFocus?: boolean;
  inputStyle?: StyleProp<TextStyle>;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Txt variant="micro">{label}</Txt> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color.faint}
        keyboardType={keyboardType}
        multiline={multiline}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label ?? placeholder}
        style={[
          s.input,
          multiline && { minHeight: 74, paddingTop: 11 },
          focused && { borderColor: color.signal, backgroundColor: color.card },
          inputStyle,
        ]}
      />
      {hint ? <Txt variant="small" color={color.faint}>{hint}</Txt> : null}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Txt variant="micro">{label}</Txt> : null}
      <View style={s.segmented} accessibilityRole="tablist">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="tab"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected: active }}
              onPress={() => onChange(opt.value)}
              style={({ hovered }: any) => [
                s.segment,
                active && { backgroundColor: color.card, borderColor: color.lineStrong },
                !active && hovered && { backgroundColor: 'rgba(255,255,255,0.5)' },
              ]}
            >
              <Txt
                variant="small"
                color={active ? color.ink : color.muted}
                style={{ fontWeight: active ? '600' : '400' }}
              >
                {opt.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Horizontal chip list — categories, friends, priorities. */
export function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.value)}
            style={({ hovered }: any) => [
              s.chip,
              active && { backgroundColor: color.ink, borderColor: color.ink },
              !active && hovered && { borderColor: color.lineStrong },
            ]}
          >
            <Txt variant="small" color={active ? color.card : color.inkSoft}>
              {opt.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  button: {
    paddingHorizontal: space.lg,
    height: 44,
    borderRadius: radius.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: { height: 34, paddingHorizontal: space.md },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.control,
    backgroundColor: color.card,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  input: {
    ...(t.body as object),
    color: color.ink,
    fontFamily: font.body,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.card,
    borderRadius: radius.control,
    paddingHorizontal: space.md,
    height: 44,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: color.paperDeep,
    borderRadius: radius.control,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    height: 32,
    borderRadius: radius.control - 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chip: {
    paddingHorizontal: space.md,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
