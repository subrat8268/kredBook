---
version: alpha
name: KredBook Design System
description: Unified design system. Stripe (Fintech) is primary default, with Expo (React Native) available as alternative.

# ============================================
# STRIPE DESIGN SYSTEM (Fintech) - PRIMARY
# ============================================

name: Stripe
description: Stripe's website is the gold standard of fintech design -- a system that manages to feel simultaneously technical and luxurious, precise and warm. The page opens on a clean white canvas (`#ffffff`) with deep navy headings (`#061b31`) and a signature purple (`#533afd`) that functions as both brand anchor and interactive accent. This isn't the cold, clinical purple of enterprise software; it's a rich, saturated violet that reads as confident and premium. The overall impression is of a financial institution redesigned by a world-class type foundry.

colors:
  primary: "#533afd"
  primary-hover: "#4434d4"
  primary-active: "#2e2b8c"
  text-link: "#533afd"
  text-link-secondary: "#665efd"
  heading: "#061b31"
  label: "#273951"
  body: "#64748d"
  muted: "#94a3b8"
  hairline: "#e5edf5"
  hairline-soft: "#d6d9fc"
  canvas: "#ffffff"
  canvas-soft: "#fafafa"
  surface-card: "#ffffff"
  surface-strong: "#f1f5f9"
  surface-dark: "#1c1e54"
  surface-dark-elevated: "#0d253d"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  on-dark-soft: "#aeb4be"
  accent-ruby: "#ea2261"
  accent-magenta: "#f96bee"
  accent-magenta-light: "#ffd7ef"
  semantic-success: "#15be53"
  semantic-success-text: "#108c3d"
  semantic-success-bg: "rgba(21,190,83,0.2)"
  semantic-warning: "#9b6829"
  semantic-warning-bg: "rgba(155,104,41,0.2)"
  semantic-error: "#dc2626"
  semantic-error-bg: "rgba(220,38,38,0.2)"

typography:
  display-hero:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 56px
    fontWeight: 300
    lineHeight: 1.03
    letterSpacing: -1.4px
    fontFeatureSettings: "'ss01'"
  display-xl:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 48px
    fontWeight: 300
    lineHeight: 1.15
    letterSpacing: -0.96px
    fontFeatureSettings: "'ss01'"
  display-lg:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 300
    lineHeight: 1.10
    letterSpacing: -0.64px
    fontFeatureSettings: "'ss01'"
  display-md:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 26px
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: -0.26px
    fontFeatureSettings: "'ss01'"
  display-sm:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 300
    lineHeight: 1.10
    letterSpacing: -0.22px
    fontFeatureSettings: "'ss01'"
  title-lg:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 300
    lineHeight: 1.40
  title-md:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 300
    lineHeight: 1.40
  body-lg:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 300
    lineHeight: 1.40
  body-md:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 300
    lineHeight: 1.40
  body-sm:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.40
  button:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.00
  button-sm:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.00
  link:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.00
  caption:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
  caption-sm:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 300
    lineHeight: 1.33
  caption-tabular:
    fontFamily: "sohne-var, SF Pro Display, -apple-system, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 300
    lineHeight: 1.33
    letterSpacing: -0.36px
    fontFeatureSettings: "'tnum'"
  code:
    fontFamily: "SourceCodePro, SFMono-Regular, monospace"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 2.00
  code-bold:
    fontFamily: "SourceCodePro, SFMono-Regular, monospace"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 2.00

rounded:
  micro: 1px
  xs: 4px
  sm: 5px
  md: 6px
  lg: 8px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  base: 16px
  md: 20px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

shadows:
  sm: "rgba(23,23,23,0.06) 0px 3px 6px"
  md: "rgba(23,23,23,0.08) 0px 15px 35px"
  lg: "rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px"
  xl: "rgba(3,3,39,0.25) 0px 14px 21px -14px, rgba(0,0,0,0.1) 0px 8px 17px -8px"

breakpoints:
  mobile: 640px
  tablet: 1024px
  desktop: 1280px

# ============================================
# EXPO DESIGN SYSTEM (Alternative)
# ============================================

expo:
  name: Expo
  description: A React Native developer-platform whose marketing site reads like a quietly-confident infrastructure brand. The base canvas is pure white with a soft sky-blue gradient atmospheric wash behind the hero; near-black ink (`#171717`) carries body and display alike. The single brand voltage is **pure black** (`#000000`) for primary CTAs — minimal and editorial-feeling, paired with a small blue text-link accent (`#0d74ce`) reserved for inline body links. Type pairs Inter at modest weights (display 600, body 400) with JetBrains Mono on every code surface. The brand's strongest visual signature is the **device-mockup hero** — a centered MacBook + iPhone composite showing real Expo dev surfaces — over the gradient sky wash.

  colors:
    primary: "#000000"
    primary-active: "#1a1a1a"
    text-link: "#0d74ce"
    text-link-secondary: "#476cff"
    ink: "#171717"
    body: "#60646c"
    body-strong: "#171717"
    muted: "#999999"
    muted-soft: "#cccccc"
    hairline: "#f0f0f3"
    hairline-soft: "#f5f5f7"
    hairline-strong: "#dcdee0"
    canvas: "#ffffff"
    canvas-soft: "#fafafa"
    surface-card: "#ffffff"
    surface-strong: "#f0f0f3"
    surface-dark: "#171717"
    surface-dark-elevated: "#1a1a1a"
    on-primary: "#ffffff"
    on-dark: "#ffffff"
    on-dark-soft: "#b0b4ba"
    gradient-sky-light: "#cfe7ff"
    gradient-sky-mid: "#a8c8e8"
    accent-warning: "#ab6400"
    accent-preview: "#8145b5"
    accent-link-bright: "#47c2ff"
    semantic-error: "#eb8e90"
    semantic-success: "#16a34a"

  typography:
    display-mega:
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif"
      fontSize: 64px
      fontWeight: 600
      lineHeight: 1.05
      letterSpacing: -1.92px
    display-xl:
      fontFamily: "'Inter', sans-serif"
      fontSize: 48px
      fontWeight: 600
      lineHeight: 1.1
      letterSpacing: -1.44px
    display-lg:
      fontFamily: "'Inter', sans-serif"
      fontSize: 36px
      fontWeight: 600
      lineHeight: 1.15
      letterSpacing: -1.08px
    display-md:
      fontFamily: "'Inter', sans-serif"
      fontSize: 28px
      fontWeight: 600
      lineHeight: 1.2
      letterSpacing: -0.84px
    display-sm:
      fontFamily: "'Inter', sans-serif"
      fontSize: 22px
      fontWeight: 600
      lineHeight: 1.25
      letterSpacing: -0.5px
    title-md:
      fontFamily: "'Inter', sans-serif"
      fontSize: 18px
      fontWeight: 600
      lineHeight: 1.4
    title-sm:
      fontFamily: "'Inter', sans-serif"
      fontSize: 16px
      fontWeight: 600
      lineHeight: 1.4
    body-md:
      fontFamily: "'Inter', sans-serif"
      fontSize: 16px
      fontWeight: 400
      lineHeight: 1.5
    body-sm:
      fontFamily: "'Inter', sans-serif"
      fontSize: 14px
      fontWeight: 400
      lineHeight: 1.5
    caption:
      fontFamily: "'Inter', sans-serif"
      fontSize: 13px
      fontWeight: 400
      lineHeight: 1.4
    caption-uppercase:
      fontFamily: "'Inter', sans-serif"
      fontSize: 11px
      fontWeight: 600
      lineHeight: 1.4
      letterSpacing: 0.88px
      textTransform: uppercase
    code:
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
      fontSize: 13px
      fontWeight: 400
      lineHeight: 1.5
    button:
      fontFamily: "'Inter', sans-serif"
      fontSize: 14px
      fontWeight: 500
      lineHeight: 1.0
    nav-link:
      fontFamily: "'Inter', sans-serif"
      fontSize: 14px
      fontWeight: 500
      lineHeight: 1.4

  rounded:
    none: 0px
    xs: 4px
    sm: 6px
    md: 8px
    lg: 12px
    xl: 16px
    xxl: 24px
    pill: 9999px
    full: 9999px

  spacing:
    xxs: 4px
    xs: 8px
    sm: 12px
    base: 16px
    md: 20px
    lg: 24px
    xl: 32px
    xxl: 48px
    section: 96px

  shadows:
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    glow: "0 0 0 4px rgba(0, 116, 206, 0.1)"

  breakpoints:
    small: 480px
    medium: 768px
    large: 1024px
    xlarge: 1280px

# ============================================
# USAGE GUIDE
# ============================================

# PRIMARY DESIGN: Stripe (default)
# Reference directly: {colors.primary}, {typography.body-md}, etc.
# Or prefix: {stripe.colors.primary}, {stripe.typography.button}

# ALTERNATIVE DESIGN: Expo
# Reference: {expo.colors.primary}, {expo.typography.body-md}

# Example prompts:
# "Build a card using primary design tokens" -> uses Stripe
# "Build a button with primary.color" -> uses Stripe
# "Use expo design for this component" -> switches to Expo