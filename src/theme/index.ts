import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  primary: '#0F4C5C',
  primaryDark: '#0B1F25',
  primarySoft: '#E4EEF0',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#A9B8BC',

  ink: '#0B1F25',
  onInk: '#FFFFFF',
  onInkMuted: '#A9B8BC',

  accent: '#A8650F',
  accentSoft: '#F7EBD3',
  gold: '#E4B24A',
  cream: '#F5EDE0',
  onAccent: '#FFFFFF',

  background: '#F3F2EE',
  surface: '#FFFFFF',
  surfaceMuted: '#ECEAE4',
  stage: '#F7F6F3',
  border: '#E2DFD8',

  text: '#10181B',
  textMuted: '#5C6569',
  textDisabled: '#A3A9AB',

  success: '#1B7A4C',
  successSoft: '#E2F3EA',
  warning: '#8A5A00',
  warningSoft: '#FFF2D6',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',

  overlay: 'rgba(11, 31, 37, 0.55)',
} as const;

export const stageTints = ['#EEF2F3', '#F4EEE8', '#ECEFF6', '#EFF3EC', '#F3EEF2', '#F2F1EA'] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 44,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const breakpoints = {
  tablet: 600,
  desktop: 960,
} as const;

export const layout = {
  maxContentWidth: 1220,
  maxFormWidth: 460,
  minTouchSize: 44,
  bottomNavHeight: 60,
  headerHeight: 60,
} as const;

export const fonts = {
  display: 'Manrope_800ExtraBold',
  heading: 'Manrope_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.8, color: colors.text },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.4, color: colors.text },
  subtitle: { fontFamily: fonts.heading, fontSize: 17, lineHeight: 23, color: colors.text },
  eyebrow: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', color: colors.textMuted },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  bodyMuted: { fontSize: 15, lineHeight: 22, color: colors.textMuted },
  small: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
  label: { fontSize: 14, lineHeight: 19, fontWeight: '600', color: colors.text },
  caption: { fontSize: 12, lineHeight: 16, color: colors.textMuted },
  price: { fontFamily: fonts.display, fontSize: 18, lineHeight: 23, letterSpacing: -0.3, color: colors.text },
} satisfies Record<string, TextStyle>;

export const cardShadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 1px 2px rgba(11, 31, 37, 0.05), 0 8px 24px rgba(11, 31, 37, 0.05)' },
  android: { elevation: 1 },
  default: {
    shadowColor: '#0B1F25',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
}) as ViewStyle;

export const theme = { colors, spacing, radius, breakpoints, layout, typography, fonts, cardShadow };
