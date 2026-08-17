import React from 'react';
import { Platform, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { color, radius as r, ramp } from '@/theme';
import { Txt } from './Type';

export type Tone = 'signal' | 'flex';

export interface CellProps {
  /** 0 = nothing there, 4 = your best day */
  level: number;
  tone?: Tone;
  size?: number;
  /** override for calendar cells, which are wide rather than square */
  height?: number;
  /** calendar day numeral */
  label?: string;
  today?: boolean;
  /** outside the month, or in the future */
  dim?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  /** Heatmaps hold hundreds of cells — keep them out of the tab order. */
  focusable?: boolean;
}

/**
 * One square. This is the whole visual grammar of Willo: the week pulse on
 * Home, every habit heatmap, and the reminders calendar are all made of it,
 * so a filled square means the same thing everywhere — something happened.
 */
export function Cell({
  level,
  tone = 'signal',
  size = 11,
  height,
  label,
  today,
  dim,
  onPress,
  accessibilityLabel,
  style,
  selected,
  focusable = true,
}: CellProps) {
  const bg = ramp[tone][Math.max(0, Math.min(4, level))];
  const fg = level >= 3 ? color.onSignal : level >= 1 ? color.ink : color.muted;

  const body = (
    <View
      style={[
        {
          width: size,
          height: height ?? size,
          borderRadius: label ? r.cell + 2 : r.cell,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: dim ? 0.4 : 1,
          borderWidth: today || selected ? 1.5 : 0,
          borderColor: selected ? color.ink : today ? color.inkSoft : 'transparent',
        },
        Platform.OS === 'web'
          ? ({ transition: 'background-color 160ms ease, transform 120ms ease' } as any)
          : null,
        style,
      ]}
    >
      {label ? (
        <Txt
          variant="small"
          color={fg}
          style={{
            fontSize: Math.max(11, Math.min(14, Math.min(size, height ?? size) * 0.34)),
            fontVariant: ['tabular-nums'],
          }}
        >
          {label}
        </Txt>
      ) : null}
    </View>
  );

  if (!onPress) {
    return (
      <View accessible={!!accessibilityLabel} accessibilityLabel={accessibilityLabel}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      focusable={focusable}
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        hovered && { opacity: 0.75 },
        pressed && { transform: [{ scale: 0.9 }] },
      ]}
    >
      {body}
    </Pressable>
  );
}

export function Legend({ tone = 'signal' as Tone }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Txt variant="micro">Less</Txt>
      {[0, 1, 2, 3, 4].map((l) => (
        <Cell key={l} level={l} tone={tone} size={9} />
      ))}
      <Txt variant="micro">More</Txt>
    </View>
  );
}
