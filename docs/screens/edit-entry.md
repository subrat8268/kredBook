# Edit Entry Screen — Design Spec & Style Reference

> **Status:** ✅ Locked — Reference implementation for all form screens.
> **Last updated:** 2026-06-09
> **Doc version:** 1.0
> **Role:** Style reference — all form/edit screens must match this.

---

## 1. SCREEN PURPOSE

The **Edit Entry** screen allows merchants to modify existing credit ledger entries (sales bills). It supports updating line items, loading charges, tax percentages, due dates, and optional notes. Because modifying transactions can alter financial audit records, the screen is engineered with guardrails, strict confirmation sheets, and dirty-state action limits.

**Entry point:** Tap the ⋮ overflow menu on the Entry Detail screen and select **Edit Entry**.

**Route:** `app/(main)/entries/[orderId]/edit.tsx`
**Screen file:** [`edit.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId]/edit.tsx)

---

## 2. WHY THIS IS THE STYLE REFERENCE

The Edit Entry screen is designated as the **canonical reference implementation** for all form and entry inputs across KredBook because it enforces the following best practices:

1. **Modular Sub-component Extraction:** The route acts exclusively as a coordinator/orchestrator. All sections (banners, customer rows, item tables, totals, sheets) are extracted into standalone, memoized components under `src/components/entries/edit/`.
2. **Keyboard Handling Excellence:** Correct usage of `KeyboardAvoidingView` with platform-specific behavior (`padding` on iOS, `height` on Android) paired with scroll-view wrapper properties (`keyboardShouldPersistTaps="handled"`) prevents input fields from being clipped or obscured by the screen keyboard.
3. **Strict State Control (`isFormDirty`):** Form submit buttons remain disabled unless a change is detected. Dirtiness is evaluated by deep-comparing the active state against the loaded database properties (items arrays, note lengths, due-date strings).
4. **Adaptive Token Routing:** All text, inputs, cards, and dividers use dynamic theme-aware styling via `useTheme()` to guarantee light and dark mode parity. No raw colors are hardcoded.
5. **Robust Date Presets:** Integrates native-feeling date offset chips (`Today`, `+7 days`, `+15 days`, `+30 days`) with a custom grid calendar bottom sheet for fine control.

---

## 3. PLATFORM & CANVAS SPEC

- **Platform:** Android & iOS (React Native / Expo SDK 52)
- **Style:** Flat, clean, structural. High contrast layouts, generous tap targets, clear field titles.
- **Font Stack:** Plus Jakarta Sans (titles) + Inter (labels, fields, bodies)
- **Canvas bg:** `t.colors.canvas` (`#fafaf7` light / `#0f1012` dark)
- **Cards:** `bg: t.colors.surface`, `borderColor: t.colors.borderDefault`, `borderWidth: 1`, `borderRadius: 16px` (`rounded-xl`), margin horizontal `16px` (`mx-4`)

### Design Token Reference

Colors are resolved at runtime using the `useTheme()` hook.

| `t.colors.*` key | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `canvas` | `#F9FAFB` | `#08111F` | Screen backdrop background |
| `surface` | `#FFFFFF` | `#122036` | In-screen card surfaces, modals, and sheets |
| `surfaceRaised` | `#F9FAFB` | `#21242c` | Preset buttons, inactive selector chips, and numpad keys |
| `borderDefault` | `#E5E7EB` | `#31415D` | Card border lines and general field outlines |
| `borderSubtle` | `#F3F4F6` | `#1F2937` | Hairline dividers and list line separators |
| `ink` | `#111827` | `#F3F4F6` | Heading titles, primary values, and main text nodes |
| `muted` | `#6B7280` | `#B4C0D4` | Captions, secondary timestamps, and input labels |
| `primary` | `#16A34A` | `#22C55E` | Selected chips, inline triggers, and call-to-actions |
| `primaryActive` | `#15803D` | `#16A34A` | Primary footer submit button background |
| `pending` | `#F59E0B` | `#F59E0B` | Warning banner indicator highlights |
| `pendingSurface` | `#FFFBEB` | `#3A2A0E` | Warning banner backdrops |
| `overdue` | `#DC2626` | `#FCA5A5` | Balance-due values and alert highlights |

---

## 4. INFORMATION HIERARCHY

```
SafeAreaView (canvas bg)
  ├── DetailHeader              ← back action + bill title + edit count subtitle
  ├── EditWarningBanner         ← alert explaining update behavior
  └── KeyboardAvoidingView
        └── ScrollView (keyboardShouldPersistTaps="handled")
              ├── EditCustomerCard      ← read-only customer record (lock icon)
              ├── Quick Amount Input    ← active only if items list is empty
              ├── Note Section          ← collapsible/expanded text input block
              ├── EditItemizedSection   ← collapsible item rows + Add Item trigger
              ├── OrderSummary          ← loading charges + GST inputs (if items exist)
              ├── EntrySummaryCard      ← previous vs. outstanding calculations (guarded)
              ├── Date Picker Preset    ← date chip selector scroll view
              └── BillFooter            ← grand total preview + Save button
```

---

## 5. COMPONENT SPECS

### 5.1 EditCustomerCard
**File:** [`EditCustomerCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditCustomerCard.tsx)

A read-only row displaying identity metadata. Modifying the customer associated with an invoice is forbidden.
- **Top Label:** `"Person (cannot be changed)"` (`t.colors.muted`).
- **Left Slot:** Circular user avatar displaying initials with background color `t.colors.primaryBorderFill`.
- **Primary Text:** Customer Name (`t.colors.ink`, bold, single-line ellipsis).
- **Secondary Text:** Phone number formatted as `+91 XXXXX XXXXX` (`t.colors.muted`).
- **Right Slot:** `Lock` icon (16px, `t.colors.faint`) indicating immutable state.

---

### 5.2 EditWarningBanner
**File:** [`EditWarningBanner.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditWarningBanner.tsx)

Placed directly below the header to alert users that changes affect ledger histories.
- **Background:** `t.colors.pendingSurface`.
- **Left Accent:** `borderLeftWidth: 4` in `t.colors.pending`.
- **Icon:** `AlertCircle` (20px, `t.colors.pending`).
- **Text:** `"Editing will update the person's ledger and payment history"` (13px, `t.colors.ink`).

---

### 5.3 EntrySummaryCard
**File:** [`EntrySummaryCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EntrySummaryCard.tsx)

Displays calculations combining pre-existing customer balance dues with the newly modified bill sum.
- **Null Guard Rule:** If `previousBalance <= 0`, this component returns `null` and is not rendered. This prevents cluttering the screen with empty balance lines.
- **Lines:**
  - Previous Balance (`t.colors.muted` vs `t.colors.ink`).
  - New Total (`t.colors.muted` vs `t.colors.ink`).
  - Divider (`t.colors.borderSubtle`).
  - Total Outstanding (`t.colors.muted` bold vs `t.colors.overdue` bold).

---

### 5.4 EditItemizedSection
**File:** [`EditItemizedSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditItemizedSection.tsx)

An accordion-style container rendering bill items.
- **Header:** Pressable header (`t.colors.surfaceRaised`) showing `Pencil` icon, title `"Itemized Details"`, item count label `(N)`, and a collapse/expand chevron.
- **Empty Hint Rule:** When there are zero items, and the section is collapsed, appends `" — Tap to add items"` to the header title to prompt action.
- **Body:** Renders a list of [`OrderItemCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/orders/OrderItemCard.tsx) rows with stepper quantity inputs, numeric rate inputs, and a red remove button.
- **Add Item Trigger:** A pressable label at the bottom of the list featuring a `Plus` icon in `t.colors.primary` to launch the item console.

---

### 5.5 SaveEntryBottomSheet
**File:** [`SaveEntryBottomSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/SaveEntryBottomSheet.tsx)

A dynamic bottom sheet triggered by the "Save" action to confirm ledger writes.
- **Mechanism:** Extends `BaseBottomSheet` with `withScroll={false}` and `enableDynamicSizing={true}`.
- **Backdrop Dismiss:** Tapping outside the sheet bounds triggers close handler.
- **Title:** `"Save Entry [billNumber]?"` (`t.colors.ink`, bold, centered).
- **Buttons:**
  - **Save & Share PDF (Primary):** Solid `t.colors.primaryActive` background, white text, `Share2` icon (18px).
  - **Save Only (Secondary):** Surface background, `t.colors.primaryActive` text and border.
  - **Cancel (Tertiary):** Raw text button styled with `t.colors.muted`.

---

## 6. INPUT FIELD SPEC

To ensure a seamless typing experience and avoid rendering anomalies in dark mode, input fields adhere to these rules:

### 6.1 `variant="neutral"` Rule
All inputs inside sheets and scrolls must be explicitly declared as `variant="neutral"`. 
- **Light Mode:** Renders with `bg-background` (`#F9FAFB`).
- **Dark Mode:** Renders with `bg-background-dark` (`#08111F`) and `colors.textPrimary` (`#F3F4F6`).
- **Avoid:** Never use `variant="white"` in edit flows as it creates invisible text on white backgrounds during dark-mode overrides.

### 6.2 Amount Numpad Spec
Tapping "Add Item" prompts a modal with a custom tactile-responsive numpad for typing the rate.
- **Keys:** A 4x3 grid (`1` through `9`, `.`, `0`, and `⌫`).
- **Tactile feedback:** Calls `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on every press.
- **Clear Action:** Long-pressing the backspace (`⌫`) key for 500ms triggers a medium vibration impact and completely clears the input field.

### 6.3 Date Picker Spec
Custom due dates are set using the [`DatePickerSheet`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/ui/DateRangePicker.tsx).
- **Positioning:** Renders as a sibling sheet to the main scroll view to avoid nesting modal components.
- **Snap Points:** Fixed snap size of `71%` with `enableDynamicSizing={false}`.
- **Calendar Layout:** Renders a Monday-first grid calendar.
- **Boundary checks:** Disables days falling outside preset min/max ranges (`opacity: 0.25`).
- **Confirm Actions:** confirmed selections update the `customDueDate` parameter and toggle the `Custom` chip state to active.

---

## 7. NAVIGATION CONTRACT

### Navigates FROM (Entry point)

| Screen | Action | Params Received |
|---|---|---|
| **Entry Detail** (`entries/[orderId].tsx`) | Select "Edit Entry" from ⋮ menu | `orderId` |

### Navigates TO (Exit points)

| Screen | Action | Params Passed |
|---|---|---|
| **Entry Detail** (`entries/[orderId].tsx`) | Successfully save changes (returns back) | None |
| **System Share Dialog** | Choose "Save & Share PDF" | Generated PDF path |

---

## 8. COMPONENT MAP

| Component Name | File Path |
|---|---|
| **Edit Order Screen** | [`app/(main)/entries/[orderId]/edit.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/(main)/entries/[orderId]/edit.tsx) |
| **EditCustomerCard** | [`src/components/entries/edit/EditCustomerCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditCustomerCard.tsx) |
| **EditWarningBanner** | [`src/components/entries/edit/EditWarningBanner.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditWarningBanner.tsx) |
| **EditItemizedSection** | [`src/components/entries/edit/EditItemizedSection.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EditItemizedSection.tsx) |
| **EntrySummaryCard** | [`src/components/entries/edit/EntrySummaryCard.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/EntrySummaryCard.tsx) |
| **SaveEntryBottomSheet** | [`src/components/entries/edit/SaveEntryBottomSheet.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/entries/edit/SaveEntryBottomSheet.tsx) |
| **DetailHeader** | [`src/components/layer2/DetailHeader.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/layer2/DetailHeader.tsx) |
| **DatePickerSheet** | [`src/components/ui/DateRangePicker.tsx`](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/components/ui/DateRangePicker.tsx) |

---

## 9. DARK MODE CHECKLIST

Before implementing or editing form components, verify these checklist points:
- [x] All card backgrounds resolve to `t.colors.surface` (never hardcoded `#fff`).
- [x] All form text scales to `t.colors.ink` and labels to `t.colors.muted`.
- [x] Hairlines and separators render using `t.colors.borderSubtle` to avoid blinding borders.
- [x] All inputs are declared as `variant="neutral"` to ensure visible text in dark containers.
- [x] Modal covers default to `t.colors.surfaceOverlay` (e.g. background of item modals).
- [x] Warning and error rows use semantic tint backdrops (`t.colors.pendingSurface` / `t.colors.dangerBg`).
