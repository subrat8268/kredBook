// src/theme/theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// KredBook Design Token File
// Single source of truth for every colour, spacing, radius, shadow,
// typography value and motion constant used in the app.
//
// Usage:
//   import { theme } from '@/theme/theme';
//   import { useTheme } from '@/theme/useTheme';
//
//   const t = useTheme();
//   style={{ color: t.colors.ink, fontSize: t.fontSize.cardTitle }}
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';

// ─── Colour Palettes ─────────────────────────────────────────────────────────

const lightColors = {
  // Primary — Forest Green
  primary:           '#16a34a',
  primaryHover:      '#15803d',
  primaryActive:     '#166534',
  primarySurface:    '#f0fdf4',
  primaryBorder:     '#bbf7d0',
  primaryBorderFill: '#dcfce7',

  // Canvas & Surfaces
  canvas:            '#fafaf7',
  surface:           '#ffffff',
  surfaceRaised:     '#f4f4f0',
  surfaceMuted:      '#eeede8',
  surfaceOverlay:    'rgba(17,24,39,0.40)',

  // Text
  ink:               '#111827',
  body:              '#374151',
  muted:             '#6b7280',
  faint:             '#9ca3af',
  onPrimary:         '#ffffff',

  // Semantic — Financial States
  paid:              '#16a34a',
  paidSurface:       '#f0fdf4',
  paidBorder:        '#bbf7d0',
  paidText:          '#166534',

  pending:           '#d97706',
  pendingSurface:    '#fffbeb',
  pendingBorder:     '#fde68a',
  pendingText:       '#92400e',

  overdue:           '#dc2626',
  overdueSurface:    '#fef2f2',
  overdueBorder:     '#fecaca',
  overdueText:       '#991b1b',

  advance:           '#7c3aed',
  advanceSurface:    '#f5f3ff',
  advanceBorder:     '#ddd6fe',
  advanceText:       '#5b21b6',

  partial:           '#3b82f6',
  partialSurface:    '#eff6ff',
  partialBorder:     '#bfdbfe',
  partialText:       '#1d4ed8',

  // Border & Divider
  borderSubtle:      '#f3f4f6',
  borderDefault:     '#e5e7eb',
  borderStrong:      '#d1d5db',
  borderFocus:       '#16a34a',

  // Error (form validation only)
  error:             '#dc2626',
  errorSurface:      '#fef2f2',
  errorBorder:       '#fecaca',
} as const;

const darkColors = {
  // Primary — Forest Green (lightened for dark backgrounds)
  primary:           '#4ade80',
  primaryHover:      '#22c55e',
  primaryActive:     '#16a34a',
  primarySurface:    '#052e16',
  primaryBorder:     '#14532d',
  primaryBorderFill: '#166534',

  // Canvas & Surfaces
  canvas:            '#0f1012',
  surface:           '#18191c',
  surfaceRaised:     '#222427',
  surfaceMuted:      '#2a2d31',
  surfaceOverlay:    'rgba(0,0,0,0.60)',

  // Text
  ink:               '#f3f4f6',
  body:              '#d1d5db',
  muted:             '#9ca3af',
  faint:             '#6b7280',
  onPrimary:         '#052e16',

  // Semantic — Financial States (softened for dark mode)
  paid:              '#4ade80',
  paidSurface:       '#052e16',
  paidBorder:        '#14532d',
  paidText:          '#86efac',

  pending:           '#fbbf24',
  pendingSurface:    '#1c1400',
  pendingBorder:     '#78350f',
  pendingText:       '#fde68a',

  overdue:           '#f87171',
  overdueSurface:    '#1f0707',
  overdueBorder:     '#7f1d1d',
  overdueText:       '#fca5a5',

  advance:           '#a78bfa',
  advanceSurface:    '#13061f',
  advanceBorder:     '#4c1d95',
  advanceText:       '#c4b5fd',

  partial:           '#60a5fa',
  partialSurface:    '#1e3a8a',
  partialBorder:     '#2563eb',
  partialText:       '#93c5fd',

  // Border & Divider
  borderSubtle:      '#1f2023',
  borderDefault:     '#2a2d31',
  borderStrong:      '#374151',
  borderFocus:       '#4ade80',

  // Error
  error:             '#f87171',
  errorSurface:      '#1f0707',
  errorBorder:       '#7f1d1d',
} as const;

export type ColorTokens = typeof lightColors;

// ─── Spacing (4px base) ───────────────────────────────────────────────────────

export const spacing = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const layout = {
  screenPaddingH:       16,
  screenPaddingHTablet: 20,
  listItemPaddingV:     14,
  listItemPaddingH:     16,
  sectionGap:           24,
  cardPadding:          16,
  fabBottom:            24,
  fabClearance:         64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  xs:    4,
  sm:    8,
  md:    10,
  lg:    12,
  xl:    14,
  '2xl': 16,
  '3xl': 20,
  full:  9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

const fontFamily = {
  display: Platform.select({
    ios:     'PlusJakartaSans-Bold',
    android: 'PlusJakartaSans_700Bold',
    default: 'System',
  }),
  displaySemiBold: Platform.select({
    ios:     'PlusJakartaSans-SemiBold',
    android: 'PlusJakartaSans_600SemiBold',
    default: 'System',
  }),
  displayExtraBold: Platform.select({
    ios:     'PlusJakartaSans-ExtraBold',
    android: 'PlusJakartaSans_800ExtraBold',
    default: 'System',
  }),
  body: Platform.select({
    ios:     'Inter-Regular',
    android: 'Inter_400Regular',
    default: 'System',
  }),
  bodyMedium: Platform.select({
    ios:     'Inter-Medium',
    android: 'Inter_500Medium',
    default: 'System',
  }),
  bodySemiBold: Platform.select({
    ios:     'Inter-SemiBold',
    android: 'Inter_600SemiBold',
    default: 'System',
  }),
  bodyBold: Platform.select({
    ios:     'Inter-Bold',
    android: 'Inter_700Bold',
    default: 'System',
  }),
} as const;

export const tnum = { fontVariant: ['tabular-nums'] } as const;

export const fontSize = {
  screenTitle:    24,
  sectionHeading: 20,
  cardTitle:      17,
  amountXl:       28,
  amountLg:       20,
  amountSm:       15,
  body:           15,
  caption:        13,
  micro:          11,
  button:         15,
  buttonSm:       13,
} as const;

export const fontWeight = {
  regular:   '400',
  medium:    '500',
  semiBold:  '600',
  bold:      '700',
  extraBold: '800',
} as const;

export const lineHeight = {
  screenTitle:    28.8,
  sectionHeading: 25,
  cardTitle:      22.1,
  amountXl:       30.8,
  amountLg:       24,
  amountSm:       19.5,
  body:           22.5,
  caption:        18.2,
  micro:          14.3,
  button:         15,
} as const;

export const letterSpacing = {
  screenTitle:    -0.3,
  sectionHeading: -0.2,
  cardTitle:      -0.1,
  amountXl:       -0.5,
  amountLg:       -0.3,
  captionLoose:    0.1,
  micro:           0.5,
  buttonSm:        0.1,
  label:           1.4,
} as const;

export const typeStyles = {
  screenTitle: {
    fontFamily:    fontFamily.display,
    fontSize:      fontSize.screenTitle,
    fontWeight:    fontWeight.bold,
    lineHeight:    lineHeight.screenTitle,
    letterSpacing: letterSpacing.screenTitle,
  },
  sectionHeading: {
    fontFamily:    fontFamily.display,
    fontSize:      fontSize.sectionHeading,
    fontWeight:    fontWeight.bold,
    lineHeight:    lineHeight.sectionHeading,
    letterSpacing: letterSpacing.sectionHeading,
  },
  cardTitle: {
    fontFamily:    fontFamily.displaySemiBold,
    fontSize:      fontSize.cardTitle,
    fontWeight:    fontWeight.semiBold,
    lineHeight:    lineHeight.cardTitle,
    letterSpacing: letterSpacing.cardTitle,
  },
  amountXl: {
    fontFamily:    fontFamily.bodyBold,
    fontSize:      fontSize.amountXl,
    fontWeight:    fontWeight.bold,
    lineHeight:    lineHeight.amountXl,
    letterSpacing: letterSpacing.amountXl,
    fontVariant:   ['tabular-nums'],
  },
  amountLg: {
    fontFamily:    fontFamily.bodySemiBold,
    fontSize:      fontSize.amountLg,
    fontWeight:    fontWeight.semiBold,
    lineHeight:    lineHeight.amountLg,
    letterSpacing: letterSpacing.amountLg,
    fontVariant:   ['tabular-nums'],
  },
  amountSm: {
    fontFamily:    fontFamily.bodyMedium,
    fontSize:      fontSize.amountSm,
    fontWeight:    fontWeight.medium,
    lineHeight:    lineHeight.amountSm,
    fontVariant:   ['tabular-nums'],
  },
  body: {
    fontFamily:    fontFamily.body,
    fontSize:      fontSize.body,
    fontWeight:    fontWeight.regular,
    lineHeight:    lineHeight.body,
  },
  bodySemiBold: {
    fontFamily:    fontFamily.bodySemiBold,
    fontSize:      fontSize.body,
    fontWeight:    fontWeight.semiBold,
    lineHeight:    lineHeight.body,
  },
  caption: {
    fontFamily:    fontFamily.body,
    fontSize:      fontSize.caption,
    fontWeight:    fontWeight.regular,
    lineHeight:    lineHeight.caption,
    letterSpacing: letterSpacing.captionLoose,
  },
  captionBold: {
    fontFamily:    fontFamily.bodySemiBold,
    fontSize:      fontSize.caption,
    fontWeight:    fontWeight.semiBold,
    lineHeight:    lineHeight.caption,
    letterSpacing: letterSpacing.captionLoose,
  },
  micro: {
    fontFamily:    fontFamily.bodySemiBold,
    fontSize:      fontSize.micro,
    fontWeight:    fontWeight.semiBold,
    lineHeight:    lineHeight.micro,
    letterSpacing: letterSpacing.micro,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily:    fontFamily.displaySemiBold,
    fontSize:      fontSize.button,
    fontWeight:    fontWeight.semiBold,
    lineHeight:    lineHeight.button,
  },
  buttonSm: {
    fontFamily:    fontFamily.displaySemiBold,
    fontSize:      fontSize.buttonSm,
    fontWeight:    fontWeight.semiBold,
    lineHeight:    lineHeight.button,
    letterSpacing: letterSpacing.buttonSm,
  },
} as const;

// ─── Elevation / Shadows ─────────────────────────────────────────────────────

export const elevation = {
  flat: {
    shadowColor:   'transparent',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
  card: {
    shadowColor:   '#111827',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  3,
    elevation:     2,
  },
  hover: {
    shadowColor:   '#111827',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius:  12,
    elevation:     4,
  },
  sheet: {
    shadowColor:   '#111827',
    shadowOffset:  { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius:  24,
    elevation:     8,
  },
  fab: {
    shadowColor:   '#16a34a',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius:  16,
    elevation:     6,
  },
} as const;

// ─── Motion Constants ─────────────────────────────────────────────────────────

export const motion = {
  duration: {
    micro:    120,
    standard: 180,
    emphasis: 250,
    complex:  400,
  },
  spring: {
    stiffness: 300,
    damping:   30,
    mass:      1,
  },
  listStagger: 30,
} as const;

// ─── Component-level Tokens ───────────────────────────────────────────────────

export const components = {
  avatar: {
    size:   40,
    radius: 9999,
  },
  listItem: {
    paddingV:  14,
    paddingH:  16,
    minHeight: 64,
  },
  button: {
    height:   48,
    paddingV: 14,
    paddingH: 20,
    radius:   radius.lg,
  },
  buttonSm: {
    height:   36,
    paddingV: 6,
    paddingH: 14,
    radius:   radius.full,
  },
  input: {
    height:      48,
    paddingV:    12,
    paddingH:    14,
    radius:      radius.md,
    borderWidth: 1.5,
  },
  card: {
    padding:     16,
    radius:      radius['2xl'],
    borderWidth: 1,
  },
  kpiCard: {
    padding:     14,
    paddingH:    16,
    radius:      radius.xl,
    borderWidth: 1,
  },
  badge: {
    paddingV: 3,
    paddingH: 8,
    radius:   radius.full,
  },
  bottomSheet: {
    radius:        radius['3xl'],
    handleWidth:   40,
    handleHeight:  4,
    handleTopGap:  12,
    paddingH:      20,
    paddingBottom: 32,
  },
  minTouchTarget: 44,
} as const;

// ─── Theme Object ─────────────────────────────────────────────────────────────

function buildTheme(colors: ColorTokens) {
  return {
    colors,
    spacing,
    layout,
    radius,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    typeStyles,
    tnum,
    elevation,
    motion,
    components,
  } as const;
}

export const lightTheme = buildTheme(lightColors);
export const darkTheme  = buildTheme(darkColors);

export const theme = lightTheme;
export type Theme = typeof lightTheme;
