import { Platform, TextStyle } from 'react-native';

/**
 * Willo design tokens.
 *
 * Direction: the calm, generous, information-dense feel of Wealthsimple —
 * off-white paper, hairline rules, oversized display type, tiny mono labels —
 * but on Willo's own palette: cool bone paper (willow-leaf underside) with an
 * electric indigo signal and an ochre counter-signal.
 *
 * Colour carries meaning, not decoration:
 *   indigo = something certain — a habit you kept, a reminder pinned to a date
 *   ochre  = something open   — a window of days you still get to choose inside
 */

export const color = {
  paper: '#EDEFEA',
  paperDeep: '#E4E7E0',
  card: '#FFFFFF',
  ink: '#12140F',
  inkSoft: '#3A3F38',
  muted: '#5A6058',
  faint: '#8B9188',
  line: '#DCDFD7',
  lineStrong: '#C6CABF',

  signal: '#2E23C9',
  signalSoft: '#EBE9FA',

  flexInk: '#8A5B12',
  flex: '#D9A441',
  flexSoft: '#F7EEDC',

  danger: '#A62F3C',
  onSignal: '#FFFFFF',
} as const;

/** Empty + 4 filled steps. Shared by the week pulse, the heatmaps and the calendar. */
export const ramp = {
  signal: ['#E2E5DE', '#C8C4EE', '#9188E0', '#5A4ED4', '#2E23C9'],
  flex: ['#E2E5DE', '#F0DFBB', '#E3C077', '#D9A441', '#B87F1E'],
} as const;

export const font = {
  display: Platform.select({
    web: '"Bricolage Grotesque", "Instrument Sans", system-ui, sans-serif',
    default: 'System',
  }) as string,
  body: Platform.select({
    web: '"Instrument Sans", system-ui, -apple-system, sans-serif',
    default: 'System',
  }) as string,
  mono: Platform.select({
    web: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
    default: 'Menlo',
  }) as string,
};

export const type = {
  goal: {
    fontFamily: font.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.4,
    fontWeight: '600',
    color: color.ink,
  },
  displayL: {
    fontFamily: font.display,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.9,
    fontWeight: '600',
    color: color.ink,
  },
  displayM: {
    fontFamily: font.display,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.5,
    fontWeight: '600',
    color: color.ink,
  },
  title: {
    fontFamily: font.body,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
    fontWeight: '600',
    color: color.ink,
  },
  body: {
    fontFamily: font.body,
    fontSize: 15,
    lineHeight: 22,
    color: color.inkSoft,
  },
  small: {
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 18,
    color: color.muted,
  },
  micro: {
    fontFamily: font.mono,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: color.muted,
  },
  numeral: {
    fontFamily: font.display,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -1.2,
    fontWeight: '600',
    color: color.ink,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  cell: 3,
  control: 10,
  card: 16,
  sheet: 24,
  pill: 999,
} as const;

/** Content column. The app is a phone-shaped world even on a wide screen. */
export const COLUMN = 620;

export const shadow = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(18,20,15,0.04), 0 8px 24px rgba(18,20,15,0.05)' } as any,
  default: {
    shadowColor: '#12140F',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
});
