/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KREDBOOK DESIGN SYSTEM — Theme Tokens
 * ═══════════════════════════════════════════════════════════════════════════════
 * Single source of truth for all design tokens.
 * Components MUST NEVER use raw hex values, pixel values, or hardcoded styles.
 * Every visual detail must reference a token defined here.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const colors = {
  // ─ Brand Green (Primary UI actions)
  brand: "#16A34A", // nav/tab/icon brand green
  brandDark: "#15803D",
  brandLight: "#DCFCE7",

  primary: "#16A34A", // green-600
  primaryDark: "#15803D", // green-700
  primaryLight: "#DCFCE7", // green-100

  // ─ Hero green (dashboard gradient surface)
  heroBgStart: "#15803D",
  heroBgEnd: "#166534",
  heroBg: "#166534",

  // ─ Accent (Overdue/urgency)
  accent: "#F59E0B", // amber-500

  // ─ Brand aliases
  fab: "#16A34A",
  fabBg: "#16A34A",

  // ─ Semantic Reds / Pinks
  danger: "#DC2626", // errors, destructive
  dangerStrong: "#B91C1C", // deeper red for emphasis
  supplierPrimary: "#DB2777", // Supplier card / I Owe Suppliers

  // ─ Semantic Amber
  warning: "#F59E0B", // = accent

  // ─ Semantic Green (positive money only)
  success: "#16A34A", // = primary
  successDark: "#15803D",
  successLight: "#DCFCE7",

  // ─ Neutrals
  background: "#F9FAFB", // gray-50
  surface: "#FFFFFF", // cards, modals, panels
  textPrimary: "#111827", // gray-900
  textBody: "#374151", // gray-700 — body labels, menu items, overflow rows
  textSecondary: "#6B7280", // gray-500
  border: "#E5E7EB", // gray-200
  borderLight: "#F1F5F9", // Slate-100 — innercard borders, sub-box dividers
  borderSubtle: "#F3F4F6", // gray-100 — hairline dividers inside menus, sheets, lists

  // ─ Semantic Blues (legacy info alias)
  primaryBlue: "#2563EB", // legacy brand/info alias
  primaryBlueBg: "#EFF6FF", // legacy light info surface

  // ─ Semantic backgrounds (tinted panels)
  successBg: "#F0FDF4", // Green-50: YOU RECEIVE panel
  dangerBg: "#FEF2F2", // Red-50: YOU OWE panel
  warningBg: "#FFFBEB", // Amber-50: Pending/Caution panel
  warningBadgeBg: "#FEF3C7", // Amber-100 — Remind action bar button bg (= pending.bg)

  // ─ Surface variants
  surfaceAlt: "#F8FAFC", // Slate-50 — inner sub-boxes on cards

  // ─ Text variants
  textMuted: "#64748B", // Slate-500 — secondary labels inside cards

  // ─ Status chip colors
  paid: {
    bg: "#DCFCE7", // Green-100
    text: "#15803D", // Green-700
  },
  partial: {
    bg: "#DBEAFE", // Blue-100
    text: "#2563EB", // Blue-600
  },
  pending: {
    bg: "#FEF3C7", // Amber-100
    text: "#D97706", // Amber-600
  },
  overdue: {
    bg: "#FEE2E2", // Red-100
    text: "#DC2626", // Red-600
  },

  // ─ Specialized tool palettes
  reports: {
    bg: "#EDE9FE", // Purple-100
    text: "#7C3AED", // Purple-600
  },
  export: {
    bg: "#F3F4F6", // Gray-100
    text: "#374151", // Gray-700
  },
  orange: {
    bg: "#FFF7ED", // Orange-50
    border: "#FFEDD5", // Orange-100
    text: "#EA580C", // Orange-600
  },

  // ─ Avatar palette (deterministic, cycled by name hash)
  avatarPalette: [
    "#5B7CFA", // calmer blue
    "#7C5BD6", // calmer purple
    "#C2417A", // muted magenta
    "#0F9FA8", // muted teal
    "#D97706", // muted amber
    "#64748B", // slate (neutral)
  ] as string[],

  // ─ Supplier avatar palette (pastel bg + dark fg, 8 slots)
  supplierAvatarBg: [
    "#EEF2FF", // indigo-50
    "#FDF4FF", // fuchsia-50
    "#EAF0FB", // blue-100
    "#FDF2F8", // pink-50
    "#EDE9FE", // purple-100
    "#FFF1F2", // rose-50
    "#CCFBF1", // teal-100
    "#F1F5F9", // slate-100
  ] as string[],
  supplierAvatarText: [
    "#4338CA", // indigo-700
    "#9333EA", // fuchsia-700
    "#2563EB", // blue-700 (= fab)
    "#DB2777", // pink-600 (= supplierPrimary)
    "#6D28D9", // purple-700
    "#BE123C", // rose-700
    "#0F766E", // teal-700
    "#475569", // slate-600
  ] as string[],

  // ─ Supplier tint surfaces (pink-50 / pink-100)
  supplierBg: "#FDF2F8", // pink-50  — summary panel inner, status badge bg
  supplierBadgeBg: "#FCE7F3", // pink-100 — header "I Owe" badge bg

  // ─ Icon backgrounds
  iconBg: "#F0FDF4", // green-50

  // ─ Sync status tokens (for SyncStatusBanner component)
  sync: {
    offlineBg: "#FEF3C7", // Amber-100 — Light amber tint
    offlineText: "#D97706", // Amber-600
    syncingBg: "#DBEAFE", // Blue-100 — Light blue tint
    syncingText: "#2563EB", // Blue-600
    syncedBg: "#ECFDF5", // Green-50 — Light green tint
    syncedText: "#16A34A", // Green-600 (= success)
  },

  // ─ Dashboard hero accents
  dashboard: {
    heroText: "rgba(255,255,255,0.96)",
    heroTextMuted: "rgba(255,255,255,0.70)",
    heroChipBg: "rgba(255,255,255,0.10)",
    heroChipBorder: "rgba(255,255,255,0.16)",
    heroOrb: "rgba(255,255,255,0.06)",
    arrowUp: "#16A34A", // green-600 — positive delta
    arrowDown: "#F59E0B", // amber-500 — negative delta
  },

  // ─ Customer detail hero accents
  customerDetail: {
    heroText: "rgba(255,255,255,0.96)",
    heroTextMuted: "rgba(255,255,255,0.74)",
    heroChipBg: "rgba(255,255,255,0.15)",
    heroChipBorder: "rgba(255,255,255,0.30)",
    heroOrb: "rgba(255,255,255,0.12)",
  },
} as const;

export type ThemeMode = "light" | "dark";

// ═══════════════════════════════════════════════════════════════════════════════
// MOTION TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const motion = {
  duration: {
    fast: 150, // ms — icon swaps, badge updates
    base: 250, // ms — screen transitions, modal open/close
    slow: 400, // ms — hero number counter, skeleton fade-in
  },
  easing: {
    spring: "cubic-bezier(0.16, 1, 0.3, 1)", // Expo spring feel
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)", // Material-style smooth
    entrance: "cubic-bezier(0.0, 0.0, 0.2, 1)", // Decelerate in
    exit: "cubic-bezier(0.4, 0.0, 1, 1)", // Accelerate out
  },
  springConfig: {
    default: { damping: 20, stiffness: 200, mass: 1 },
    bouncy: { damping: 14, stiffness: 180, mass: 1 },
    snappy: { damping: 26, stiffness: 300, mass: 1 },
  },
} as const;

export type Motion = typeof motion;

type WidenLiterals<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenLiterals<U>[]
    : T extends object
      ? { [K in keyof T]: WidenLiterals<T[K]> }
      : T;

export type ColorTokens = WidenLiterals<typeof colors>;

export const lightColors: ColorTokens = colors;

export const darkColors: ColorTokens = {
  ...colors,
  brand: "#22C55E", // green-500
  brandDark: "#16A34A",
  brandLight: "#14532D",
  primary: "#22C55E", // green-500
  primaryDark: "#16A34A", // green-600
  primaryLight: "#14532D", // green-900 surface
  heroBgStart: "#14532D",
  heroBgEnd: "#052E16",
  heroBg: "#052E16",
  fab: "#22C55E",
  fabBg: "#22C55E",
  danger: "#FCA5A5",
  dangerStrong: "#EF4444",
  supplierPrimary: "#EC4899",
  accent: "#F59E0B",
  warning: "#F59E0B",
  success: "#22C55E",
  successDark: "#16A34A",
  successLight: "#14532D",
  background: "#08111F",
  surface: "#122036",
  textPrimary: "#F3F4F6",
  textBody: "#D1D5DB", // gray-300 — body labels, menu items in dark mode
  textSecondary: "#B4C0D4",
  border: "#31415D",
  borderLight: "#24334D",
  borderSubtle: "#1F2937", // gray-800 — hairline dividers in dark mode
  primaryBlue: "#3B82F6",
  primaryBlueBg: "#172554",
  successBg: "#0F2A1A",
  dangerBg: "#3A1118",
  warningBg: "#3A2A0E",
  warningBadgeBg: "#4A3411",
  surfaceAlt: "#1A2A43",
  textMuted: "#A3AEC0",
  paid: {
    bg: "#14532D",
    text: "#86EFAC",
  },
  partial: {
    bg: "#1E3A8A",
    text: "#93C5FD",
  },
  pending: {
    bg: "#4A3411",
    text: "#FCD34D",
  },
  overdue: {
    bg: "#4C1D1D",
    text: "#FCA5A5",
  },
  reports: {
    bg: "#312E81",
    text: "#C4B5FD",
  },
  export: {
    bg: "#1F2937",
    text: "#D1D5DB",
  },
  orange: {
    bg: "#3A220C",
    border: "#5A3412",
    text: "#FDBA74",
  },
  supplierBg: "#3B0D2A",
  supplierBadgeBg: "#5B1237",
  iconBg: "#1E293B",
  sync: {
    offlineBg: "#4A3411",
    offlineText: "#FCD34D",
    syncingBg: "#1E3A8A",
    syncingText: "#93C5FD",
    syncedBg: "#14532D",
    syncedText: "#86EFAC",
  },
  dashboard: {
    heroText: "rgba(255,255,255,0.96)",
    heroTextMuted: "rgba(255,255,255,0.80)",
    heroChipBg: "rgba(255,255,255,0.16)",
    heroChipBorder: "rgba(255,255,255,0.28)",
    heroOrb: "rgba(255,255,255,0.10)",
    arrowUp: "#22C55E", // green-500 — bright positive delta for dark mode
    arrowDown: "#F59E0B", // amber-500 — stays same for visibility
  },
  customerDetail: {
    heroText: "rgba(255,255,255,0.96)",
    heroTextMuted: "rgba(255,255,255,0.74)",
    heroChipBg: "rgba(255,255,255,0.15)",
    heroChipBorder: "rgba(255,255,255,0.30)",
    heroOrb: "rgba(255,255,255,0.12)",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADIENT TOKENS (Hero Cards Only)
// ═══════════════════════════════════════════════════════════════════════════════

export const gradients = {
  // Dashboard hero card — green gradient
  dashboardHero: {
    start: colors.heroBgStart,
    end: colors.heroBgEnd,
  },

  // Person balance card — green gradient
  customerHero: {
    start: "#15803D", // green-700
    end: "#166534", // green-800
  },
  // Customer detail hero states
  customerDetailHero: {
    overdue: {
      start: "#DC2626", // red-600
      end: "#7F1D1D", // red-900
      blobA: "rgba(248, 113, 113, 0.28)",
      blobB: "rgba(239, 68, 68, 0.18)",
    },
    pending: {
      start: "#EF4444", // red-500
      end: "#991B1B", // red-900
      blobA: "rgba(248, 113, 113, 0.26)",
      blobB: "rgba(239, 68, 68, 0.16)",
    },
    settled: {
      start: "#22C55E", // green-500
      end: "#047857", // green-600
      blobA: "rgba(74, 222, 128, 0.24)",
      blobB: "rgba(34, 197, 94, 0.14)",
    },
    advance: {
      start: "#2563EB", // blue-600
      end: "#1D4ED8", // blue-700
      blobA: "rgba(96, 165, 250, 0.24)",
      blobB: "rgba(59, 130, 246, 0.14)",
    },
  },
  // Preferred alias (person naming)
  peopleHero: {
    start: "#15803D", // green-700
    end: "#166534", // green-800
  },

  // Supplier payable card — pink gradient
  supplierHero: {
    start: "#DB2777", // Pink-600
    end: "#BE185D", // Pink-800
  },

  // Supplier detail hero — deeper rose gradient (hero card on supplier detail screen)
  supplierDetailHero: {
    start: "#BE2D5C", // Rose-700
    end: "#E8427D", // Rose-500
  } as { start: string; end: string },

  // Net position card — solid dark navy
  netPosition: "#1C2333", // Dark slate

  // When person balance is zero (paid up) — green gradient
  zeroBalance: {
    start: "#16A34A", // Success green
    end: "#15803D", // Success dark
  },

  // Order status hero gradients
  orderPaid: {
    start: "#10B981", // Green-500
    end: "#059669", // Green-600
  },
  orderPartial: {
    start: "#3B82F6", // Blue-500 (light mode)
    end: "#2563EB", // Blue-600 (light mode)
  },
  orderPending: {
    start: "#FDBA74", // Orange-300, a softer golden orange
    end: "#EA580C", // Orange-600, a deeper orange
  },
  orderOverdue: {
    start: "#EF4444", // Red-500
    end: "#DC2626", // Red-600
  },
} as const;

export type GradientTokens = WidenLiterals<typeof gradients>;

export const lightGradients: GradientTokens = gradients;

export const darkGradients: GradientTokens = {
  ...gradients,
  dashboardHero: {
    start: darkColors.heroBgStart,
    end: darkColors.heroBgEnd,
  },
  customerHero: {
    start: "#14532D",
    end: "#052E16",
  },
  customerDetailHero: {
    overdue: {
      start: "#991B1B",
      end: "#B91C1C",
      blobA: "rgba(239, 68, 68, 0.24)",
      blobB: "rgba(127, 29, 29, 0.16)",
    },
    pending: {
      start: "#B91C1C",
      end: "#7F1D1D",
      blobA: "rgba(248, 113, 113, 0.22)",
      blobB: "rgba(185, 28, 28, 0.14)",
    },
    settled: {
      start: "#14532D",
      end: "#052E16",
      blobA: "rgba(34, 197, 94, 0.20)",
      blobB: "rgba(20, 83, 45, 0.14)",
    },
    advance: {
      start: "#1E40AF",
      end: "#172554",
      blobA: "rgba(96, 165, 250, 0.22)",
      blobB: "rgba(37, 99, 235, 0.14)",
    },
  },
  peopleHero: {
    start: "#14532D",
    end: "#052E16",
  },
  supplierHero: {
    start: "#9D174D",
    end: "#500724",
  },
  supplierDetailHero: {
    start: "#881337",
    end: "#BE185D",
  },
  netPosition: "#020617",
  zeroBalance: {
    start: "#166534",
    end: "#14532D",
  },
  orderPaid: {
    start: "#15803D",
    end: "#14532D",
  },
  orderPartial: {
    start: "#1E40AF", // Blue-800 (dark mode)
    end: "#1D4ED8", // Blue-700 (dark mode)
  },
  orderPending: {
    start: "#4A3411", // from darkColors.pending.bg, deep amber
    end: "#9A5B02", // A slightly brighter, warmer dark amber
  },
  orderOverdue: {
    start: "#B91C1C",
    end: "#7F1D1D",
  },
};

export function getThemeTokens(mode: ThemeMode) {
  return {
    colors: mode === "dark" ? darkColors : lightColors,
    gradients: mode === "dark" ? darkGradients : lightGradients,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPACING TOKENS (Component Sizes & Padding)
// ═══════════════════════════════════════════════════════════════════════════════

export const spacing = {
  // ─ Standard scale (dp)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,

  // ─ Screen-level
  screenPadding: 16, // Horizontal padding on all screens (16dp)
  screenContentBottom: 120, // Scroll content bottom padding above FAB/tab
  sectionGapSm: 12, // Tight gap between linked section blocks
  sectionGapMd: 16, // Standard gap between dashboard sections
  sectionGapLg: 24, // Spacious gap between major groups

  // ─ Component dimensions
  inputHeight: 48, // Text input, select input fields
  buttonHeight: 50, // Primary & secondary button height
  tabBarHeight: 64, // Tab navigation bar (+ device bottom inset)

  // ─ Cards
  cardRadius: 16, // Default card border radius (12–20dp range, use 16)
  cardPadding: 16, // Internal padding in cards

  // ─ Avatar sizes
  avatarXs: 32, // Quieter dense rows
  avatarSm: 36, // Compact rows, list indicators
  avatarMd: 44, // List cards (person, supplier)
  avatarLg: 64, // Full-screen profile section

  // ─ FAB
  fabSize: 56, // Diameter of floating action button
  fabSizeCompact: 48, // Quieter FAB size for premium screens
  fabMargin: 20, // Distance from screen edge
  fabBottom: 24, // Distance above tab bar

  // ─ Header heights
  headerHeight: 48, // Custom header bar
  searchBarHeight: 44, // Search input height

  // ─ Dividers & separators
  dividerHeight: 1,

  // ─ Status chips
  chipHeight: 28,
  chipPadding: 8, // Horizontal padding in chips

  // ─ Sheet & modals
  bottomSheetHandleHeight: 4,
  handleWidth: 40,
  sheets: {
    snapFull: "95%",
    snapCustomer: "90%",
    snapPayment: "65%",
    snapCategory: "50%",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const typography = {
  // ─ Font families
  fontFamily: "Inter",
  fontFamilies: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
  },

  // ─ Heading font (Phase 4)
  headingFontFamily: "Manrope",
  headingFontFamilies: {
    regular: "Manrope_400Regular",
    medium: "Manrope_500Medium",
    semiBold: "Manrope_600SemiBold",
    bold: "Manrope_700Bold",
    extraBold: "Manrope_800ExtraBold",
  },

  // ─ Text styles (size, weight, line-height)
  heroAmount: {
    fontSize: 36,
    fontWeight: "800" as const,
    lineHeight: 42,
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 30,
    fontFamily: "Manrope_700Bold",
    color: colors.textPrimary,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    lineHeight: 24,
    fontFamily: "Manrope_700Bold",
    color: colors.textPrimary,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },

  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  label: {
    fontSize: 11,
    fontWeight: "700" as const,
    lineHeight: 14,
    textTransform: "uppercase" as const,
    color: colors.textSecondary,
  },

  // ─ Additional text styles
  h1: {
    fontSize: 30,
    fontWeight: "700" as const,
    lineHeight: 40,
  },

  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  small: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
  },

  overline: {
    fontSize: 10,
    fontWeight: "700" as const,
    lineHeight: 12,
    textTransform: "uppercase" as const,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// DERIVED THEME OBJECT (For convenience in components)
// ═══════════════════════════════════════════════════════════════════════════════

export const theme = {
  colors,
  gradients,
  spacing,
  typography,
  motion,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY / COMPATIBILITY EXPORTS (Can be removed after migration)
// These maintain backward compatibility with existing components.
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardPalette = {
  bg: colors.background,
  white: colors.surface,
  heroDecor: "#F5ECD8",
  receivePanelBg: colors.successBg,
  owePanelBg: colors.dangerBg,
  dashboardRed: colors.dangerStrong,
  heroLabel: colors.textSecondary,
  heroAmount: colors.warning,
  heroSub: colors.textSecondary,
  blue: colors.primary,
  blueLight: "#EFF6FF",
  red: colors.danger,
  redLight: colors.dangerBg,
  heading: colors.textPrimary,
  body: colors.textSecondary,
  muted: "#AEAEB2",
  divider: colors.border,
  paidBg: colors.paid.bg,
  paidText: colors.paid.text,
  pendingBg: colors.pending.bg,
  pendingText: colors.pending.text,
  overdueBg: colors.overdue.bg,
  overdueText: colors.overdue.text,
  partialBg: colors.partial.bg,
  partialText: colors.partial.text,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: spacing.cardRadius,
  xl: 20,
  "2xl": 24,
  full: 9999,
} as const;

export const fonts = {
  regular: typography.fontFamilies.regular,
  medium: typography.fontFamilies.medium,
  semiBold: typography.fontFamilies.semiBold,
  bold: typography.fontFamilies.bold,
};
