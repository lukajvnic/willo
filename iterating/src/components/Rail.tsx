import React, { useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { COLUMN, color, space } from '@/theme';
import { Avatar } from './primitives';
import { Txt } from './Type';

export interface RailItem {
  label: string;
  /** live count — what's waiting for you over there */
  hint?: string;
}

/**
 * The three-panel world, made legible at rest. The underline tracks the swipe
 * itself rather than snapping after it, so the gesture and the label agree.
 */
export function Rail({
  items,
  index,
  scrollX,
  pageWidth,
  onGo,
  profileName,
  onProfile,
}: {
  items: RailItem[];
  index: number;
  scrollX: Animated.Value;
  pageWidth: number;
  onGo: (i: number) => void;
  profileName: string;
  onProfile: () => void;
}) {
  const [railWidth, setRailWidth] = useState(0);
  const seg = railWidth / items.length;

  const translateX = scrollX.interpolate({
    inputRange: [0, Math.max(pageWidth, 1) * (items.length - 1)],
    outputRange: [0, seg * (items.length - 1)],
    extrapolate: 'clamp',
  });

  return (
    <View style={s.wrap}>
      <View style={s.inner}>
        <View style={s.top}>
          <Txt variant="displayM" style={{ fontSize: 19, letterSpacing: -0.6 }}>
            willo
          </Txt>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Your account and friends"
            onPress={onProfile}
            style={({ hovered }: any) => [{ opacity: hovered ? 0.75 : 1 }]}
          >
            <Avatar name={profileName} size={28} />
          </Pressable>
        </View>

        <View style={s.rail} onLayout={(e) => setRailWidth(e.nativeEvent.layout.width)}>
          {items.map((item, i) => {
            const active = i === index;
            return (
              <Pressable
                key={item.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item.hint ? `${item.label}, ${item.hint}` : item.label}
                onPress={() => onGo(i)}
                style={({ hovered }: any) => [s.tab, hovered && !active && { opacity: 0.7 }]}
              >
                <Txt
                  variant="title"
                  color={active ? color.ink : color.faint}
                  style={{ fontSize: 14.5 }}
                  numberOfLines={1}
                >
                  {item.label}
                </Txt>
                <Txt
                  variant="micro"
                  color={active ? color.muted : color.faint}
                  style={{ opacity: item.hint ? 1 : 0 }}
                  numberOfLines={1}
                >
                  {item.hint || '—'}
                </Txt>
              </Pressable>
            );
          })}

          {railWidth > 0 ? (
            <Animated.View style={[s.indicator, { width: seg, transform: [{ translateX }] }]} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: color.paper,
    borderBottomWidth: 1,
    borderBottomColor: color.line,
    ...(Platform.OS === 'web' ? ({ position: 'sticky' as any, top: 0, zIndex: 20 } as any) : null),
  },
  inner: { width: '100%', maxWidth: COLUMN, alignSelf: 'center', paddingHorizontal: space.xl },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  rail: { flexDirection: 'row', position: 'relative' },
  tab: { flex: 1, paddingVertical: space.sm, gap: 1 },
  indicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    height: 2,
    backgroundColor: color.ink,
  },
});
