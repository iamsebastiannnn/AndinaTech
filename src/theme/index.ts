import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  primary: '#0F4C5C',
  primaryDark: '#0A3743',
  primarySoft: '#E3EEF1',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#BFD6DC',

  accent: '#C8500A',
  accentSoft: '#FCEBDD',
  onAccent: '#FFFFFF',

  background: '#F4F7F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF2F4',
  border: '#DCE4E7',

  text: '#14262C',
  textMuted: '#566A71',
  textDisabled: '#9AAAB0',

  success: '#1B7A4C',
  successSoft: '#E2F3EA',
  warning: '#8A5A00',
  warningSoft: '#FFF2D6',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',

  overlay: 'rgba(10, 30, 36, 0.55)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const breakpoints = {
  tablet: 600,
  desktop: 960,
} as const;

export const layout = {
  maxContentWidth: 1180,
  maxFormWidth: 460,
  minTouchSize: 44,
  bottomNavHeight: 60,
  headerHeight: 56,
} as const;

export const typography = {
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 17, lineHeight: 23, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, lineHeight: 21, color: colors.text },
  bodyMuted: { fontSize: 15, lineHeight: 21, color: colors.textMuted },
  small: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
  label: { fontSize: 14, lineHeight: 19, fontWeight: '600', color: colors.text },
  caption: { fontSize: 12, lineHeight: 16, color: colors.textMuted },
} satisfies Record<string, TextStyle>;

export const cardShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 1px 3px rgba(15, 76, 92, 0.10), 0 1px 2px rgba(15, 76, 92, 0.06)' },
  android: { elevation: 2 },
  default: {
    shadowColor: '#0F4C5C',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
}) as ViewStyle;

export const theme = { colors, spacing, radius, breakpoints, layout, typography, cardShadow };
