const theme = require("./src/utils/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Brand ────────────────────────────────
        brand: theme.colors.brand,
        "brand-dark": theme.colors.brandDark,
        "brand-light": theme.colors.brandLight,
        primary: theme.colors.primary,
        "primary-dark": theme.colors.primaryDark,
        "primary-light": theme.colors.primaryLight,
        "primary-soft-dark": theme.darkColors.primaryLight,

        // ── Success ──────────────────────────────
        success: theme.colors.success,
        "success-bg": theme.colors.successBg,
        "success-bg-dark": theme.darkColors.successBg,
        "success-light": theme.colors.successLight,
        "success-dark": theme.colors.successDark,
        "success-text": theme.colors.paid.text,

        // ── Danger / Red ─────────────────────────
        danger: theme.colors.danger, // #EF4444
        "danger-bg": theme.colors.dangerBg, // #FEF2F2 — panel bg
        "danger-bg-dark": theme.darkColors.dangerBg,
        "danger-light": theme.colors.overdue.bg, // #FEE2E2
        "danger-dark": theme.colors.dangerStrong,
        "danger-text": theme.colors.overdue.text, // #DC2626
        "danger-strong": theme.colors.dangerStrong, // #DC2626

        // ── Warning / Amber ───────────────────────
        warning: theme.colors.warning, // #F59E0B
        "warning-bg": theme.colors.warningBg, // #FFFBEB — panel bg
        "warning-bg-dark": theme.darkColors.warningBg,
        "warning-light": theme.colors.pending.bg, // #FEF3C7
        "warning-dark": theme.colors.pending.text, // #D97706
        "warning-text": theme.colors.pending.text,

        // ── Info / Blue ───────────────────────────
        info: theme.colors.primary,
        "info-bg": theme.colors.primaryLight,
        "info-light": theme.colors.partial.bg,
        "info-dark": theme.colors.primaryDark,
        "info-text": theme.colors.partial.text,

        // ── Layout surfaces ───────────────────────
        background: theme.colors.background, // #F6F7F9 — app bg
        "background-dark": theme.darkColors.background,
        surface: theme.colors.surface, // #FFFFFF — cards / modals
        "surface-dark": theme.darkColors.surface,
        fab: theme.colors.fabBg,

        // ── Typography ────────────────────────────
        textDark: theme.colors.textPrimary, // #1C1C1E — headings
        textPrimary: theme.colors.textPrimary, // #1C1C1E — body
        "textPrimary-dark": theme.darkColors.textPrimary,
        textSecondary: theme.colors.textSecondary, // #6B7280 — labels / captions
        "textSecondary-dark": theme.darkColors.textSecondary,
        textMuted: theme.colors.textMuted, // placeholder / muted
        "textMuted-dark": theme.darkColors.textMuted,

        // ── Borders & dividers ────────────────────
        border: theme.colors.border, // #E5E7EB
        "border-dark": theme.darkColors.border,
        "border-soft": theme.colors.borderLight, // softer inner dividers
        "border-soft-dark": theme.darkColors.borderLight,
        divider: theme.colors.border, // #E5E7EB

        // ── Status chips ──────────────────────────
        paid: theme.colors.paid.bg,
        "paid-text": theme.colors.paid.text,
        pending: theme.colors.pending.bg,
        "pending-text": theme.colors.pending.text,
        overdue: theme.colors.overdue.bg,
        "overdue-text": theme.colors.overdue.text,

        // ── Misc ─────────────────────────────────
        icon: theme.colors.iconBg,
        "icon-dark": theme.darkColors.iconBg,
        search: theme.colors.surfaceAlt,
        "search-dark": theme.darkColors.surfaceAlt,

        // ── Dashboard hero accents ───────────────
        hero: theme.colors.heroBg,
        "hero-start": theme.colors.heroBgStart,
        "hero-end": theme.colors.heroBgEnd,
        "dashboard-hero-text": theme.colors.dashboard.heroText,
        "dashboard-hero-text-muted": theme.colors.dashboard.heroTextMuted,
        "dashboard-hero-chip-bg": theme.colors.dashboard.heroChipBg,
        "dashboard-hero-chip-border": theme.colors.dashboard.heroChipBorder,
        "dashboard-hero-orb": theme.colors.dashboard.heroOrb,
        "dashboard-hero-orb-dark": theme.darkColors.dashboard.heroOrb,

        // ── Customer detail hero accents ───────
        "customer-hero-text": theme.colors.customerDetail.heroText,
        "customer-hero-text-muted": theme.colors.customerDetail.heroTextMuted,
        "customer-hero-chip-bg": theme.colors.customerDetail.heroChipBg,
        "customer-hero-chip-border": theme.colors.customerDetail.heroChipBorder,
        "customer-hero-orb": theme.colors.customerDetail.heroOrb,
        "customer-hero-orb-dark": theme.darkColors.customerDetail.heroOrb,

        // ── Specialized single-use surfaces ────
        "net-position": theme.gradients.netPosition,
        "net-position-dark": theme.darkGradients.netPosition,

        // ─────────────────────────────────────────────────────────────────
        // CSS VARIABLE TOKENS — automatic dark mode via .dark class switch
        // ⚠️ DO NOT add raw hex colors to components. Use these tokens only.
        // For new tokens, add to: theme.ts → global.css → tailwind.config.js (in that order)
        // ─────────────────────────────────────────────────────────────────
        //
        // Usage (no dark: prefix needed — .dark class switches all vars):
        //   Background:   bg-surface        bg-canvas         bg-primary-surface
        //   Text:         text-ink          text-muted         text-faint
        //   Border:       border-border-default  border-border-subtle
        //   Status bg:    bg-paid-surface   bg-pending-surface bg-overdue-surface
        //   Status text:  text-paid-text    text-pending-text  text-overdue-text
        //   Primary:      bg-primary        text-primary       border-primary-border
        //
        // Only use style prop for:
        //   - shadowColor / elevation (Android)
        //   - Animated/dynamic values (progress bar width etc.)
        //   - surfaceOverlay rgba (OverflowMenu ONLY — rgba not supported in CSS vars)
        //   - fontFamily (not supported as CSS var in RN)
        // ─────────────────────────────────────────────────────────────────

        // Primary
        "primary-hover":    "var(--color-primary-hover)",
        "primary-active":   "var(--color-primary-active)",
        "primary-surface":  "var(--color-primary-surface)",
        "primary-border":   "var(--color-primary-border)",
        "primary-fill":     "var(--color-primary-border-fill)",

        // Surfaces
        canvas:             "var(--color-canvas)",
        "surface-raised":   "var(--color-surface-raised)",
        "surface-muted":    "var(--color-surface-muted)",

        // Text
        ink:                "var(--color-ink)",
        "body-text":        "var(--color-body-text)",
        muted:              "var(--color-muted)",
        faint:              "var(--color-faint)",
        "on-primary":       "var(--color-on-primary)",

        // Financial semantic
        "paid-surface":     "var(--color-paid-surface)",
        "paid-border":      "var(--color-paid-border)",
        "paid-token-text":  "var(--color-paid-text)",

        "pending-surface":  "var(--color-pending-surface)",
        "pending-border":   "var(--color-pending-border)",
        "pending-token-text": "var(--color-pending-text)",

        "overdue-surface":  "var(--color-overdue-surface)",
        "overdue-border":   "var(--color-overdue-border)",
        "overdue-token-text": "var(--color-overdue-text)",

        advance:            "var(--color-advance)",
        "advance-surface":  "var(--color-advance-surface)",
        "advance-border":   "var(--color-advance-border)",
        "advance-text":     "var(--color-advance-text)",

        partial:            "var(--color-partial)",
        "partial-surface":  "var(--color-partial-surface)",
        "partial-border":   "var(--color-partial-border)",
        "partial-text":     "var(--color-partial-text)",

        // Borders (CSS var tokens — separate from legacy 'border'/'border-soft')
        "border-subtle":    "var(--color-border-subtle)",
        "border-default":   "var(--color-border-default)",
        "border-strong":    "var(--color-border-strong)",
        "border-focus":     "var(--color-border-focus)",

        // Error
        error:              "var(--color-error)",
        "error-surface":    "var(--color-error-surface)",
        "error-border":     "var(--color-error-border)",
      },
      borderColor: {
        light: theme.colors.border,
        default: theme.colors.border,
        dark: theme.colors.textSecondary,
        soft: theme.colors.borderLight,
      },
      fontFamily: {
        inter: [theme.fonts.regular],
        "inter-medium": [theme.fonts.medium],
        "inter-semibold": [theme.fonts.semiBold],
        "inter-bold": [theme.fonts.bold],
      },
      fontSize: {
        h1: ["30px", { lineHeight: "40px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "screen-title": ["24px", { lineHeight: "30px", fontWeight: "700" }],
        "section-title": ["18px", { lineHeight: "24px", fontWeight: "700" }],
        "card-title": ["16px", { lineHeight: "22px", fontWeight: "600" }],
        body: ["15px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      borderRadius: {
        sm: theme.radius.sm,
        md: theme.radius.md,
        lg: theme.radius.lg,
        xl: theme.radius.xl,
        "2xl": theme.radius["2xl"],
        full: theme.radius.full,
      },
      spacing: {
        "section-sm": `${theme.spacing.sectionGapSm}px`,
        section: `${theme.spacing.sectionGapMd}px`,
        "section-md": `${theme.spacing.sectionGapMd}px`,
        "section-lg": `${theme.spacing.sectionGapLg}px`,
      },
    },
  },
  plugins: [],
};
