import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLUMN, color, radius, space } from '@/theme';
import { IconButton } from './controls';
import { Txt } from './Type';

/**
 * One overlay pattern for everything that isn't a screen: add, edit, detail,
 * profile. Rises from the bottom on a phone, sits centred on a wide screen.
 */
export function Sheet({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { height, width } = useWindowDimensions();
  const anim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);
  const wide = width >= 760;

  // Stay mounted through the close animation so sheets fall away rather than
  // vanish.
  useEffect(() => {
    if (open) setMounted(true);
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: open ? 220 : 150,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, anim]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: anim }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, s.backdrop]}
        />
      </Animated.View>

      <Animated.View
        style={[
          s.panelWrap,
          wide && { justifyContent: 'center', paddingHorizontal: space.xl },
          {
            opacity: anim,
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [wide ? 16 : 40, 0] }) },
            ],
            pointerEvents: 'box-none',
          },
        ]}
      >
        <View
          style={[
            s.panel,
            { maxHeight: height * (wide ? 0.86 : 0.92) },
            wide && { borderRadius: radius.sheet, borderBottomWidth: 1 },
          ]}
        >
          <View style={s.head}>
            <View style={{ flex: 1, gap: 2 }}>
              {eyebrow ? <Txt variant="micro">{eyebrow}</Txt> : null}
              <Txt variant="displayM">{title}</Txt>
            </View>
            <IconButton glyph="✕" label="Close" onPress={onClose} tone="bare" />
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ padding: space.xl, paddingTop: space.lg, gap: space.lg }}
            keyboardShouldPersistTaps="handled"
            {...({ dataSet: { willoScroll: true } } as any)}
          >
            {children}
          </ScrollView>

          {footer ? <View style={s.footer}>{footer}</View> : null}
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(18,20,15,0.32)',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(2px)' } as any) : null),
  },
  panelWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  panel: {
    width: '100%',
    maxWidth: COLUMN,
    backgroundColor: color.paper,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: color.line,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.md,
  },
  footer: {
    flexDirection: 'row',
    gap: space.sm,
    padding: space.lg,
    paddingBottom: space.xl,
    borderTopWidth: 1,
    borderTopColor: color.line,
    backgroundColor: color.paper,
  },
});
