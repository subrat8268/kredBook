# DESIGN.md — KredBook

> **KredBook** is a Bharat-first credit ledger (udhaar) app for kirana owners, traders, and service providers. The design language is warm, legible, and financially trustworthy — premium enough for a ₹1 crore business, honest enough for a ₹500 transaction.

---

## 1. Design Philosophy

KredBook's canvas is a warm off-white — not clinical white, not dark mode. Forest green anchors every "money settled" moment: the universal colour of growth, cleared dues, and financial health. The product must feel like a trusted accountant's ledger, not a silicon-valley SaaS tool.

**Five pillars:**
- **Clarity over decoration** — every pixel earns its place. Dense financial data needs no chrome.
- **Semantic colour is the UI** — green/amber/red/violet carry meaning. They are not decorative.
- **₹ is first-class** — tabular numerics, perfect column alignment, rupee symbol treated as a typographic citizen.
- **Thumb-native** — all primary actions within 72px of the bottom edge. One-handed use for a shopkeeper mid-transaction.
- **Low-end Android first** — minimum 400 font weight, no pure-white text on coloured backgrounds, WCAG AA everywhere.

---

## 2. Brand Colours

### 2.1 Primary — Forest Green

| Token | Hex | Usage |
|---|---|---|
| `green-600` | `#16a34a` | Primary CTA, active nav, paid/cleared status, brand anchor |
| `green-700` | `#15803d` | Button hover state |
| `green-800` | `#166534` | Button active/pressed state |
| `green-50` | `#f0fdf4` | Success tinted surface, selected row background |
| `green-100` | `#dcfce7` | Success card border fill |
| `green-200` | `#bbf7d0` | Success border, badge border |

### 2.2 Canvas & Surfaces

| Token | Hex | Usage |
|---|---|---|
| `canvas` | `#fafaf7` | App background — warm off-white |
| `surface` | `#ffffff` | Cards, sheets, modals |
| `surface-raised` | `#f4f4f0` | Inset inputs, secondary backgrounds, skeleton base |
| `surface-muted` | `#eeede8` | Disabled states, skeleton shimmer |
| `surface-overlay` | `rgba(17,24,39,0.40)` | Modal backdrop |

### 2.3 Text

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#111827` | Primary headings, amounts, customer names |
| `body` | `#374151` | Body text, labels, descriptions |
| `muted` | `#6b7280` | Secondary info, timestamps, metadata |
| `faint` | `#9ca3af` | Placeholders, inactive labels |
| `on-primary` | `#ffffff` | Text on green-600 backgrounds |

### 2.4 Semantic — Financial States

| State | Primary | Surface | Border | Text on Surface |
|---|---|---|---|---|
| **Paid / Cleared** | `#16a34a` | `#f0fdf4` | `#bbf7d0` | `#166534` |
| **Pending** | `#d97706` | `#fffbeb` | `#fde68a` | `#92400e` |
| **Overdue** | `#dc2626` | `#fef2f2` | `#fecaca` | `#991b1b` |
| **Advance** | `#7c3aed` | `#f5f3ff` | `#ddd6fe` | `#5b21b6` |

> **Rule:** Semantic colours are reserved exclusively for financial state communication. They must never be used for decoration, illustration, or UI chrome unrelated to a transaction status.

### 2.5 Border & Divider

| Token | Hex | Usage |
|---|---|---|
| `border-subtle` | `#f3f4f6` | Inner dividers, hairlines, list separators |
| `border-default` | `#e5e7eb` | Card borders, container outlines |
| `border-strong` | `#d1d5db` | Input borders, focused containers |
| `border-focus` | `#16a34a` | Input focus ring colour |

---

## 3. Typography

### 3.1 Font Families

| Role | Family | Fallback | Notes |
|---|---|---|---|
| Display / Heading | `Plus Jakarta Sans` | `Inter, system-ui, sans-serif` | Geometric warmth; 600–800 only |
| Body / UI / Data | `Inter` | `system-ui, sans-serif` | Reliability at small sizes |
| Currency / Numbers | `Inter` | `system-ui, sans-serif` | Always with `font-feature-settings: "tnum"` |

**Loading (React Native / expo-font):**
```js
"PlusJakartaSans_600SemiBold"
"PlusJakartaSans_700Bold"
"PlusJakartaSans_800ExtraBold"
"Inter_400Regular"
"Inter_500Medium"
"Inter_600SemiBold"
"Inter_700Bold"
```

### 3.2 Type Scale

| Token | Font | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `type/screen-title` | Plus Jakarta Sans | 24px | 700 | 1.20 | -0.3px | Page headers (People, Entries) |
| `type/section-heading` | Plus Jakarta Sans | 20px | 700 | 1.25 | -0.2px | Card group titles |
| `type/card-title` | Plus Jakarta Sans | 17px | 600 | 1.30 | -0.1px | Customer name in list row |
| `type/amount-xl` | Inter `"tnum"` | 28px | 700 | 1.10 | -0.5px | Total balance on summary screen |
| `type/amount-lg` | Inter `"tnum"` | 20px | 600 | 1.20 | -0.3px | Entry amount in detail view |
| `type/amount-sm` | Inter `"tnum"` | 15px | 500 | 1.30 | 0 | Inline ₹ in list rows |
| `type/body` | Inter | 15px | 400 | 1.50 | 0 | All body text, descriptions |
| `type/body-semibold` | Inter | 15px | 600 | 1.50 | 0 | Labels, metadata emphasis |
| `type/caption` | Inter | 13px | 400 | 1.40 | +0.1px | Timestamps, secondary info |
| `type/caption-bold` | Inter | 13px | 600 | 1.40 | +0.1px | Filter chip labels, badge text |
| `type/micro` | Inter | 11px | 600 | 1.30 | +0.5px | `UPPERCASE` section kickers only |
| `type/button` | Plus Jakarta Sans | 15px | 600 | 1.00 | 0 | Primary and secondary CTAs |
| `type/button-sm` | Plus Jakarta Sans | 13px | 600 | 1.00 | +0.1px | Chip buttons, filter pills |

### 3.3 Typography Rules

- **₹ is first-class.** Every currency value uses Inter with `font-feature-settings: "tnum"`. Never mix display font with currency in the same text node.
- **Minimum weight 400.** No light (300) or thin (200) weights. The audience reads on budget Android screens in varied lighting.
- **Plus Jakarta Sans caps at 16px minimum.** Inter handles all text below 16px.
- **Tabular numerics everywhere.** Amounts, counts, dates in columns — always `"tnum"` so values align vertically.
- **Heading weight floor is 600.** Never use Plus Jakarta Sans below semibold.

---

## 4. Spacing

Base unit: **4px**.

| Token | Value | Usage |
|---|---|---|
| `space/1` | 4px | Icon gaps, inline padding |
| `space/2` | 8px | Tight component spacing |
| `space/3` | 12px | Input vertical padding, badge padding |
| `space/4` | 16px | Screen horizontal padding, card padding |
| `space/5` | 20px | Tablet screen padding |
| `space/6` | 24px | Section gap, card gap |
| `space/8` | 32px | Large section separation |
| `space/10` | 40px | Bottom sheet content padding |
| `space/12` | 48px | Screen top padding (below nav) |
| `space/16` | 64px | FAB clearance from bottom edge |

**Layout constants:**
- Screen horizontal padding: `16px` (mobile), `20px` (tablet+)
- List item padding: `14px 16px`
- Section gap: `24px`
- List gap: `0` (border-bottom dividers, not margin)

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius/xs` | 4px | Tiny inline chips, progress fill |
| `radius/sm` | 8px | Small inner elements, radio indicators |
| `radius/md` | 10px | Inputs, small cards |
| `radius/lg` | 12px | Buttons, action items |
| `radius/xl` | 14px | Summary/KPI cards |
| `radius/2xl` | 16px | Standard cards, list containers |
| `radius/3xl` | 20px | Bottom sheet top corners, large modals |
| `radius/full` | 9999px | Pills: filter chips, status badges, avatars |

> **Nested radius rule:** inner radius = outer radius − gap. A card (`radius/2xl` = 16px) with 12px padding contains an inner element at `radius/sm` (4px). Never use the same radius on both parent and child — it creates a bulging corner.

---

## 6. Elevation & Shadows

All shadows are warm-tinted (not pure black) to match the off-white canvas.

| Level | Shadow | Usage |
|---|---|---|
| `elevation/flat` | none | List rows, inline elements, tab backgrounds |
| `elevation/card` | `0 1px 3px rgba(17,24,39,0.06), 0 1px 2px rgba(17,24,39,0.04)` | Standard cards, input containers |
| `elevation/hover` | `0 4px 12px rgba(17,24,39,0.08), 0 2px 4px rgba(17,24,39,0.04)` | Active/focused cards, hover state |
| `elevation/sheet` | `0 -4px 24px rgba(17,24,39,0.10)` | Bottom sheets, modals (upward shadow) |
| `elevation/fab` | `0 4px 16px rgba(22,163,74,0.30)` | FAB — green-tinted glow |

---

## 7. Component Specifications

### 7.1 Buttons

#### Primary
```
background:  #16a34a
color:       #ffffff
font:        Plus Jakarta Sans 15px/600
padding:     14px 20px
radius:      12px
hover:       background #15803d, transform scale(1.01)
active:      background #166534, transform scale(0.98)
focus:       outline 2px solid #16a34a, offset 2px
disabled:    background #bbf7d0, color #166534, opacity 0.5
```

#### Secondary (Outlined)
```
background:  transparent
border:      1.5px solid #d1d5db
color:       #374151
padding:     13px 20px
radius:      12px
hover:       background #f4f4f0, border-color #9ca3af
active:      background #eeede8
```

#### Destructive
```
background:  #dc2626
color:       #ffffff
hover:       background #b91c1c
active:      background #991b1b
```
Same sizing as Primary.

#### Filter Chip (Pill)
```
inactive:    background #f4f4f0, color #374151
active:      background #f0fdf4, border 1px solid #bbf7d0, color #166534 weight 600
radius:      9999px
padding:     6px 14px
font:        Inter 13px/600
transition:  120ms ease
```

### 7.2 List Items (Customer / Entry Rows)

```
background:       #ffffff
padding:          14px 16px
border-bottom:    1px solid #f3f4f6
tap-state:        background #f9fafb, transition 120ms

Avatar:
  size:           40px × 40px
  radius:         9999px
  background:     #f0fdf4
  text:           Inter 14px/600, #16a34a (initials)

Customer name:    Plus Jakarta Sans 15px/600, #111827
Last entry date:  Inter 13px/400, #9ca3af
Balance:          Inter 17px/700 "tnum", semantic colour
Arrow indicator:  16px chevron, #d1d5db
```

**Matched search highlight:**
```
matched chars:    color #16a34a, font-weight 700
unmatched chars:  color #111827, font-weight 600
```

### 7.3 Cards

```
background:   #ffffff
border:       1px solid #e5e7eb
radius:       16px
padding:      16px
shadow:       elevation/card
hover:        shadow elevation/hover, transition 180ms
```

### 7.4 Summary / KPI Cards

```
background:   semantic surface (e.g. #f0fdf4 for total collected)
border:       1px solid semantic border (e.g. #bbf7d0)
radius:       14px
padding:      14px 16px

Label:        Inter 11px/600, UPPERCASE, +0.5px tracking, semantic muted text
Amount:       Inter 24px/700 "tnum", semantic primary colour
Sub-label:    Inter 12px/400, semantic muted text
```

### 7.5 Status Badges

| Status | Background | Text Colour | Border |
|---|---|---|---|
| Paid | `#f0fdf4` | `#166534` | `#bbf7d0` |
| Pending | `#fffbeb` | `#92400e` | `#fde68a` |
| Overdue | `#fef2f2` | `#991b1b` | `#fecaca` |
| Advance | `#f5f3ff` | `#5b21b6` | `#ddd6fe` |

```
font:     Inter 12px/600, +0.1px tracking
padding:  3px 8px
radius:   9999px
```

### 7.6 Form Inputs

```
background:     #ffffff
border:         1.5px solid #d1d5db
radius:         10px
padding:        12px 14px
font:           Inter 15px/400, #111827
placeholder:    #9ca3af

focus:
  border-color: #16a34a
  shadow:       0 0 0 3px rgba(22,163,74,0.15)

error:
  border-color: #dc2626
  shadow:       0 0 0 3px rgba(220,38,38,0.15)

label:
  font:         Inter 13px/600, #374151
  gap-below:    6px
```

### 7.7 Search Input

```
background:     #f4f4f0
border:         1.5px solid transparent
radius:         12px
padding:        10px 14px 10px 40px
font:           Inter 15px/400
icon:           20px magnifier, #9ca3af, 12px from left

focus:
  background:   #ffffff
  border-color: #16a34a
  shadow:       0 0 0 3px rgba(22,163,74,0.15)

debounce:       250ms
```

### 7.8 Bottom Sheet / Modal

```
background:          #ffffff
radius:              20px 20px 0 0
handle:              40px × 4px, #e5e7eb, centered, 12px from top
handle-tap-target:   full width, 44px tall
padding:             0 20px 32px
transition:          spring(stiffness 300, damping 30)
backdrop:            rgba(17,24,39,0.40), 200ms fade
```

### 7.9 Empty States

```
icon:       48px, #d1d5db
heading:    Plus Jakarta Sans 17px/600, #374151
body:       Inter 14px/400, #6b7280, max-width 28ch, centered
cta:        Primary button
margin-top: 64px from list top
```

Never show plain "No data found." Always explain what goes here and offer a primary action.

### 7.10 Skeleton Loaders

```
base:       #eeede8
shimmer:    #fafaf7 moving highlight
animation:  1.5s ease-in-out infinite, direction LTR
radius:     matches component shape
```

Skeleton must mirror the exact layout of the real component — avatar circle, name bar (70% width), sub-label bar (45% width), amount block (right-aligned).

---

## 8. Icons & Iconography

- **Library:** Lucide React Native — 1.5px stroke, consistent geometry
- **Default size:** 20px (body), 24px (nav), 16px (inline/badge)
- **Colour:** inherits from context — `#6b7280` default, `#16a34a` active, semantic colour when status-linked
- **Never use filled icons** — KredBook is a stroke-icon system. No mix of fill and stroke.
- **Touch target:** always pad to minimum 44×44px, even if visual icon is 20px

### Icon — Financial Actions

| Icon | Lucide Name | Context |
|---|---|---|
| Add entry | `plus-circle` | FAB, quick-add |
| Collect payment | `indian-rupee` | Entry CTA |
| Customer | `user` | People screen |
| Entries | `receipt` | Entries screen |
| Overdue alert | `alert-circle` | Status indicator |
| Search | `search` | People/Entries search bar |
| Filter | `sliders-horizontal` | Filter tray toggle |
| Calendar | `calendar` | Date picker trigger |
| Export | `download` | Export CSV |
| Settings | `settings` | Nav |
| Back | `chevron-left` | Navigation |

---

## 9. Motion & Animation

- **Duration scale:** 120ms (micro), 180ms (standard), 250ms (emphasis), 400ms (complex)
- **Easing:** `spring(stiffness 300, damping 30)` for sheets/modals; `ease-out` for standard transitions
- **List entrance:** staggered fade-up — 20px translateY + opacity 0→1, 180ms, 30ms stagger between items
- **Balance counter:** number morphs/counts on update, 250ms
- **Status badge:** scale 0.8→1.0 + fade on mount, 120ms spring
- **Bottom sheet:** spring slide-up from bottom, backdrop fades in sync
- **Search results:** cross-fade between result sets, 120ms

**`prefers-reduced-motion`:** All animations collapse to instant opacity swap. No movement.

---

## 10. Screen Layout Patterns

### 10.1 List Screen (People / Entries)

```
┌─────────────────────────────────┐
│ SafeAreaView (top)              │
│ ┌─ Screen Header ─────────────┐ │
│ │  Screen Title     [icon]    │ │
│ └─────────────────────────────┘ │
│ ┌─ Search Bar ────────────────┐ │
│ └─────────────────────────────┘ │
│ ┌─ Filter Chips ─────────────┐  │
│ │ All · Overdue · Pending …  │  │
│ └────────────────────────────┘  │
│ ┌─ Result Count ─────────────┐  │
│ │ "12 of 48 customers"       │  │
│ └────────────────────────────┘  │
│                                 │
│  ┌─ FlatList ─────────────────┐ │
│  │ ListItem                   │ │
│  │ ListItem                   │ │
│  └────────────────────────────┘ │
│                                 │
│ ┌─ FAB ──────────────────────┐  │
│ │  ＋  Add Entry             │  │
│ └────────────────────────────┘  │
│ SafeAreaView (bottom)           │
└─────────────────────────────────┘
```

### 10.2 Detail Screen (Customer / Entry)

```
┌─────────────────────────────────┐
│ SafeAreaView (top)              │
│ ← Back    Customer Name   [⋯]   │
├─────────────────────────────────┤
│ ┌─ KPI Summary Card ──────────┐ │
│ │ Total Due / Advance / Paid  │ │
│ └─────────────────────────────┘ │
│                                 │
│  ┌─ Entry FlatList ───────────┐ │
│  │ Entry row (date, ₹, note) │ │
│  └───────────────────────────┘  │
│                                 │
│ ┌─ FAB ──────────────────────┐  │
│ │  ＋  New Entry             │  │
│ └────────────────────────────┘  │
│ SafeAreaView (bottom)           │
└─────────────────────────────────┘
```

---

## 11. Accessibility

- **WCAG AA minimum** on all text/background pairs. Key pairs verified:

| Pair | Ratio | Pass |
|---|---|---|
| `#111827` on `#fafaf7` | 17.8:1 | ✓ AAA |
| `#166534` on `#f0fdf4` | 5.8:1 | ✓ AA |
| `#92400e` on `#fffbeb` | 5.2:1 | ✓ AA |
| `#991b1b` on `#fef2f2` | 6.1:1 | ✓ AA |
| `#5b21b6` on `#f5f3ff` | 7.4:1 | ✓ AAA |
| `#ffffff` on `#16a34a` | 4.6:1 | ✓ AA |

- **Touch targets:** minimum 44×44px for every interactive element
- **Font floor:** 11px (`type/micro`), body never below 15px
- **No colour-only communication:** every status badge carries a text label, not just colour
- **`accessibilityLabel`** on all icon-only buttons
- **`accessibilityRole`** set on list items, buttons, and headers

---

## 12. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use `#16a34a` forest green as the sole brand anchor | Use Stripe purple, blue gradients, or multi-hue brand colours |
| Semantic colour for financial state only | Decorate cards with coloured left-border strips |
| `"tnum"` on every currency figure | Mix display font with currency in the same text node |
| Plus Jakarta Sans 600+ for headings | Drop below weight 400 anywhere in the product |
| Warm off-white `#fafaf7` canvas | Pure white (`#ffffff`) as the app background |
| Pill radius (`9999px`) for chips and badges | Same border radius on nested parent and child |
| Thumb-zone primary actions | Place CTAs at screen top beyond comfortable reach |
| Designed empty states with action | Show plain "No data" without explanation |
| Tabular number columns | Left-align amounts in a list |
| Lucide stroke icons throughout | Mix filled and stroke icon styles |
