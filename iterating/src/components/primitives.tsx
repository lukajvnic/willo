import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { color, radius, shadow, space } from '@/theme';
import { Txt } from './Type';

export function Card({
  children,
  style,
  padded = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return <View style={[s.card, padded && { padding: space.lg }, style]}>{children}</View>;
}

export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[s.rule, style]} />;
}

export function Row({
  children,
  gap = space.sm,
  style,
  align = 'center',
}: {
  children: React.ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  align?: ViewStyle['alignItems'];
}) {
  return <View style={[{ flexDirection: 'row', alignItems: align, gap }, style]}>{children}</View>;
}

export function Avatar({ name, size = 30, tint }: { name: string; size?: number; tint?: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return (
    <View
      style={[
        s.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tint ?? color.paperDeep },
      ]}
    >
      <Txt
        variant="micro"
        color={tint ? color.onSignal : color.inkSoft}
        style={{ letterSpacing: 0.4, fontSize: size * 0.36, lineHeight: size * 0.36 + 2 }}
      >
        {initials}
      </Txt>
    </View>
  );
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'signal' | 'flex' }) {
  const tones = {
    neutral: { bg: color.paperDeep, fg: color.muted },
    signal: { bg: color.signalSoft, fg: color.signal },
    flex: { bg: color.flexSoft, fg: color.flexInk },
  }[tone];
  return (
    <View style={[s.tag, { backgroundColor: tones.bg }]}>
      <Txt variant="micro" color={tones.fg}>
        {label}
      </Txt>
    </View>
  );
}

/** Section header: mono eyebrow on the left, optional action on the right. */
export function SectionHead({
  label,
  right,
  style,
}: {
  label: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.sectionHead, style]}>
      <Txt variant="micro">{label}</Txt>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: color.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: color.line,
    ...(shadow as object),
  },
  rule: { height: 1, backgroundColor: color.line },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 20,
    marginBottom: space.md,
  },
});
