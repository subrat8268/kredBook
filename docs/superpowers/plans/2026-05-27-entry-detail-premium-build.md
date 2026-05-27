# Entry Detail Premium Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build premium Entry Detail page with 6 components, design system alignment, bug fixes, route refactoring to <100 lines.

**Architecture:** Component extraction + composition pattern. All inline JSX moved to extracted components. Route file acts as pure composition layer with no business logic.

**Tech Stack:** React Native, NativeWind, Reanimated, Lucide React icons, existing hooks (`useOrderDetail`, `usePayments`)

---

## Files Changed

### Modify
- `app/(main)/entries/[orderId].tsx` (383 → 80-100 lines)
- `src/components/entries/EntryHeroCard.tsx` (108 → refined)
- `src/components/entries/EntryCustomerCard.tsx` (76 → identity-only pattern)
- `src/components/entries/EntryStickyBar.tsx` (93 → fixed button hierarchy, border opacity)
- `src/components/entries/EntryItemsSection.tsx` (230 → fused card + StatusBadge)

### Reference
- `src/utils/theme.ts` (tokens for gradients, spacing, colors)
- `app/(main)/people/[customerId].tsx` (pattern reference)
- `src/components/people/customer-detail/CustomerBalanceHero.tsx` (hero template)
- `src/components/people/customer-detail/CustomerStickyCollectBar.tsx` (sticky bar template)

---

## Task 1: EntryHeroCard Styling Refinement

**Files:**
- Modify: `src/components/entries/EntryHeroCard.tsx` (lines 1-108)
- Modify: `src/utils/theme.ts` (verify tokens available)

**Purpose:** Update EntryHeroCard to match premium design system, add blob decorations, fix typography hierarchy.

**Distribution of Changes:**
- Line 6-10: Update props type with billNumber, createdAt
- Line 23-25: Remove optional MetadataRow props, keep state prop separate
- Line 27-45: Update Typography variants with proper semantic naming
- Line 55-71: Fix border radius to use `spacing.cardRadius` (16dp)
- Line 73-89: Add blob decorations (blobA, blobB)
- Line 91-108: Align title case with spec ("BALANCE DUE", not "Amount Label")

**Files to Check:**
- `src/utils/theme.ts` — verify `spacing.cardRadius`, `gradients.dashboard.heroOrb` exist

---

## Task 2: EntryStickyBar Button Hierarchy Fix

**Files:**
- Modify: `src/components/entries/EntryStickyBar.tsx` (lines 1-93)

**Purpose:** Fix critical UX problem — unpaid state should prioritize "Record Payment", paid state should use "Send Receipt" (not "Send Entry").

**Distribution of Changes:**
- Line 3-8: Update interface to include `isPaid` boolean flag (already exists, verify typing)
- Line 15-25: Update wrapper View with border opacity 60% (already exists as `colors.border + "60"`)
- Line 27-30: Add color overlay with `colors.primary + "08"` opacity (already exists)
- Line 32-35: Add elevation 12 (already exists as `elevation: 12`)
- Line 37-45: REFACTOR button logic completely:
  - Base button component with dynamic icon prop
  - Unpaid state: Record Payment (primary green) = first child, Send Entry (ghost) = second child
  - Paid state: Send Receipt (centered, primary green) = single centered button
- Line 47-52: Update icon mapping:
  - Use `Wallet` for Record Payment
  - Use `Send` for Send Entry / Send Receipt
- Line 54-60: Update text variants:
  - Primary button: `typography.buttonPrimary` (or `typography.button` with success color variant)
  - Ghost button: `typography.buttonGhost` (or `typography.button` with muted color variant)

**Key Emoji Fix:**
- Unpaid: `(primary)   (ghost)` → Record Payment | Send Entry
- Paid: `    [Send Receipt]` → single centered button, reworded text

---

## Task 3: EntryCustomerCard Identity-Only Refactor

**Files:**
- Modify: `src/components/entries/EntryCustomerCard.tsx` (lines 1-76)

**Purpose:** Remove financial confusion — customer card is now identity-only (avatar, name, phone, tap action). Financial data moves to EntryItemsSection.

**Distribution of Changes:**
- Line 3-7: Update interface - remove `previousBalance: number`
- Line 9-13: ADD new prop `onCustomerTap?: () => void`
- Line 15-27: Update JSX structure to match identity pattern:
  ```
  [Avatar]  [Customer Name]
          [Phone (+91)]
          [View Customer →]
  ```
- Line 34-41: Remove previousBalance display rows, styling
- Line 43-54: Add "View Customer →" tap row with cursor style
- Line 56-67: Update spacing tokens:
  - Avatar margin: `spacing.md` (keep)
  - Name → Phone: `spacing.xs` (keep)
  - Phone → View Customer: `spacing.md` (NEW)
- Line 69-76: Remove balance-specific colors (danger, textMuted for zero balance)

**Hook Distribution:**
- Update route file to include `onCustomerTap={() => router.push(\`/(main)/people/\${order.customer_id}\` as never)}`

---

## Task 4: EntryItemsSection Fused Card + StatusBadge

**Files:**
- Modify: `src/components/entries/EntryItemsSection.tsx` (lines 1-230)

**Purpose:** Fuse items + summary into single card with StatusBadge inline on Grand Total row.

**Distribution of Changes:**
- Line 6-11: Update interface props:
  - Remove any separate `statusKey` prop (use `order.status`)
  - Verify `fmt: (value: number) => string` exists
- Line 13-28: REFACTOR structure to single card:
  - Outer View: `colors.surface`, radius `spacing.cardRadius`, padding `spacing.lg`
  - Header: `typography.label` (11px uppercase, secondary), border-top radius only
  - Items list: existing row component
  - Divider before summary only
- Line 30-45: REFACTOR summary section:
  - Subtotal: always show (keep)
  - GST: conditional show (`order.tax_percent > 0`) (keep)
  - Loading Charge: conditional show (`order.loading_charge > 0`) (keep)
  - Previous Balance: conditional show (`order.previous_balance > 0`) (needs move from Customer to Items)
  - NOTE: Previous Balance calculation moved from Customer Card to here — this is entry-level derived data
  - Grand Total: center aligned `typography.screenTitle` (24px, bold) (keep)
- Line 47-52: ADD StatusBadge card:
  - Position: right aligned on Grand Total row (compact diameter 40px)
  - Stack status inline: `gradients[statusKey]`, `colors.textSecondary` text, custom degree badge
- Line 54-68: Clean up styling tokens:
  - Single card radius vs header radius distinction
  - Divider before Grand Total only
  - Remove separate top stats section (fold into Payments header)

---

## Task 5: EntryPaymentsSection Skeleton Reuse + Empty State

**Files:**
- Modify: `src/components/entries/EntryPaymentsSection.tsx` (lines 1-176)

**Purpose:** Skip custom HeroLineSkeleton — reuse existing `ActivityIndicator + EmptyState` pattern from Customer Detail.

**Distribution of Changes:**
- Line 6-12: Update interface props (keep existing)
- Line 14-25: REFACTOR loading state:
  - OLD: Create `HeroLineSkeleton` component
  - NEW: REUSE existing `ActivityIndicator` from theme (if exists) or create inline skeleton matching payment card
  - Option A (preferred): Use `ActivityIndicator` with custom styling matching payment card shape (3 bars: date, badge, amount)
  - Option B: Inline `<Skeleton` components using existing theme tokens
- Line 27-45: Add EmptyState with illustration:
  ```typescript
  <EmptyState
    title="No payments recorded yet"
    description="Payments will appear here once recorded."
    illustration="empty-payments"
  />
  ```
- Line 47-56: Keep payment card styling:
  - Background: `colors.surfaceAlt`
  - Border: `1px solid colors.border`
  - Radius: `radius.lg` (14dp)
  - Padding: `spacing.md`
  - Date row: typography.cardTitle, left-aligned
  - Payment mode badge: radius.full, typography.caption, 11px, 600 weight
  - Amount: MoneyAmount variant="title", success color
  - Due amount: typography.caption + MoneyAmount (danger/green based on remaining)
- Line 58-76: Verify existing usage with proper types

---

## Task 6: Route File Refactoring

**Files:**
- Modify: `app/(main)/entries/[orderId].tsx` (lines 1-383)

**Purpose:** Reduce route file to 80-100 lines by extracting all inline JSX to components.

**Refactoring Strategy:**
1. Preserve all existing handlers (no logic changes)
2. Preserve all derived values (no re-derivation)
3. Preserve all loading/error gates (no behavior changes)
4. Replace inline JSX sections with component calls
5. Use existing components (verified at Task 1-5)

**Distribution of Changes:**
- Line 23: Verify Linking import exists (already verified as MISSING in discovery, fix now)
- Line 58-68: Remove `useMemo` derived values now in components (summarize, taxAmount, etc.)
- Line 70-92: REMOVE inline JSX:
  - `<DetailHeader` component
  - `<ScrollView` wrapper
  - EntryHeroCard JSX (line 94-111)
  - EntryQuickActions JSX (line 113-124)
  - EntryCustomerCard JSX (line 126-134)
  - EntryItemsSection JSX (line 136-189)
  - EntryPaymentsSection JSX (line 191-231)
  - RecordCustomerPaymentModal JSX (line 233-239)
  - EntryStickyBar JSX (line 241-267)
- Line 94-267: ADD component calls inline:
  ```typescript
  <EntryHeroCard
    balanceDue={order.balance_due}
    status={order.status}
    billNumber={order.bill_number}
    createdAt={order.created_at}
    isOverdue={isOverdue}
  />
  {/* Repeat for all 5 components */}
  ```
- Line 94-267: FIX one critical bug: Add Linking import if missing
- Final count target: 80-100 lines

**Verification:**
- Run: `npm run dev` and verify page loads
- Run: `npm run lint` and ensure no type errors
- Test: Linking import fix verified
- Test: All components render with correct props

---

## Task 7: Linking Import Bug Fix

**Files:**
- Modify: `app/(main)/entries/[orderId].tsx` (Line 23)

**Purpose:** Fix critical bug discovered in discovery — Linking import was verified as MISSING.

**Distribution of Changes:**
- Line 23: ADD import: `import * as Linking from 'expo-linking'` (if not already present)
- Verify: `handleCall` handler uses `Linking.openURL(\`tel:\${customerPhone}\`)` (already exists, verify import coverage)

---

## Task 8: Verification & Type Checking

**Files:**
- All files from Tasks 1-6

**Purpose:** Run verification checklist to ensure all success criteria met.

**Commands to Run:**
```bash
npm run lint
npm run typecheck
npm run dev
```

**Verification Checklist (from design doc):**
- [ ] npm run lint passes
- [ ] Dark mode visual verification on all components
- [ ] Linking import verification (Line 23 check)
- [ ] Hero gradient, card radius, sticky bar elevation checks
- [ ] Quick actions appear below hero
- [ ] Previous balance zero state is muted, not alarming (valid in EntryItemsSection)
- [ ] Grand Total row shows StatusBadge inline
- [ ] Payments empty state uses EmptyState component
- [ ] Record Payment opens modal correctly
- [ ] Send Entry generates PDF / WhatsApp fallback
- [ ] isPaid hides Record Payment button (unpaid state)
- [ ] Record Payment primary for unpaid, Send Receipt single for paid
- [ ] Safe area respected in sticky bar
- [ ] Route file < 100 lines after extraction

**Expected Results:**
- 6 components all render without errors
- No TypeScript type errors
- Linter passes without warnings
- Page navigates correctly
- Payment modal opens/closes properly
- Entry detail loads with both dark/light themes
- Route file reduced from 383 → 80-100 lines

---

## Commits

**Commit Message Pattern:**
```
feat(entrys): [component] - [what changed]

[1-2 line summary]
[objectives]
[methodology]
[places modified]
```

---

## Success Criteria

### Functional Completeness
- Entry detail page loads data correctly
- All 6 components render with correct props
- Links and modals trigger correctly
- Share/WhatsApp actions work
- Payment recording works end-to-end
- Record Payment → Send Receipt workflow works
- Linking.openURL for phone calls works

### Design System Alignment
- Gradient cards match CustomerDetail hero style
- Sticky bar matches CustomerDetail collect bar style
- Border opacity consistency (60%)
- Shadow system (elevation 2 for hero, 12 for sticky bar)
- Spacing rhythm matches customer detail
- Typography hierarchy matches design spec
- Border radius consistency (16dp = spacing.cardRadius)

### Code Quality
- Route file < 100 lines
- No inline JSX trees
- All props typed
- Dashboard tokens used (no hardcoded hex/pixel values)
- npm run lint passes
- npm run typecheck passes

### Dark Mode
- All components render correctly in dark mode
- Gradients invert correctly (light ⇄ dark)
- Border opacity works in both modes
- Text colors pass contrast checks

### UX Fix Validation
- Unpaid state: Record Payment primary button, Send Entry ghost outline (verified visual hierarchy)
- Paid state: Send Receipt centered, no Record Payment shown (verified no collect action on settled entry)
- Customer card: No financial data displayed (identity-only, no balance values) (verified content)
- Hero skeleton: Reused existing pattern (no custom skeleton created) (verified pattern)