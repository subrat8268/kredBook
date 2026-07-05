# Dashboard Screen — Fresh-Eyes Audit
> **Date:** 2026-07-04  
> **Phase:** 4 — UI/UX Redesign (post Dashboard code-health block 4.1.1x)  
> **Audited by:** Agent review  
> **Status:** ⚡ Partially fixed — compiler errors resolved; C2/m2 (heroIndicatorDot token) fixed in `theme.ts`; remaining audit items (C1, C3–C5, M1–M8) still open

## Files Audited

| File | Role |
|---|---|
| `src/features/dashboard/components/DashboardScreen.tsx` | Orchestrator |
| `src/features/dashboard/components/DashboardHeader.tsx` | Header bar |
| `src/features/dashboard/components/DashboardHeroCard.tsx` | Hero gradient card |
| `src/features/dashboard/components/DashboardQuickStats.tsx` | Stat tile row |
| `src/features/dashboard/components/DashboardFollowUpSection.tsx` | Follow-up list + states |
| `src/features/dashboard/components/DashboardFollowUpCard.tsx` | Follow-up customer card |
| `src/features/dashboard/components/DashboardRecentActivity.tsx` | Activity feed |
| `src/features/dashboard/components/DashboardRecentActivityRow.tsx` | Activity row |
| `src/features/dashboard/components/DashboardSkeleton.tsx` | Loading skeleton |
| `src/features/dashboard/components/DashboardPaymentFlow.tsx` | Modal orchestrator |
| `app/(main)/dashboard/index.tsx` | Route wrapper |
| `app/(main)/people/index.tsx` | Modified in same commit |

## Audit Dimensions

1. UI & Visual Consistency
2. Dark Mode
3. State Completeness
4. Runtime Risks
5. Accessibility
6. Performance
7. Code Quality
8. Skeleton Quality

---

## 🔴 Critical

### C1 · `DashboardRecentActivity` · Dark Mode
**Dimension:** Dark Mode

`LinearGradient` at bottom of activity card uses `colors.surface` as end color. In dark mode `colors.surface` is `#122036`, but the card background is set via NativeWind class `dark:bg-surface-dark`. If `surface-dark` in `tailwind.config.js` diverges from `darkColors.surface`, the gradient end will visibly mismatch the card — hard visible edge instead of soft fade.

**Fix:** Verify `surface-dark` Tailwind token equals `#122036`. Safer long-term: use `["transparent", colors.surface]` so the gradient always fades to the actual runtime surface colour.

---

### C2 · `DashboardHeroCard` · Hero amount hardcoded `#ffffff` → ✅ Fixed
**Dimension:** Dark Mode / UI  
**File:** `DashboardHeroCard.tsx` (previously L133)

`color: "#ffffff"` was replaced with `colors.dashboard.heroText` — theme-correct and future-proof. See also m2 (heroIndicatorDot token added to `theme.ts`).

---

### C3 · `DashboardScreen` · `onOpenPeopleOverdue` implicit coupling
**Dimension:** Runtime  
**File:** `DashboardScreen.tsx` L174

`onPressNotifications` is passed as both the notification bell handler and the Overdue tile handler. If `onPressNotifications` gains side-effects (badge reset, API call), the Overdue tile will fire those unintentionally. The `Props` type has no explicit `onOpenPeopleOverdue` slot.

**Fix:** Add `onOpenPeopleOverdue: () => void` to `DashboardScreen` Props. Pass separate handlers from the route.

---

### C4 · `DashboardSkeleton` · Header border hardcoded light-mode hex
**Dimension:** Dark Mode / Skeleton  
**File:** `DashboardSkeleton.tsx` L20

```tsx
borderBottomColor: "#f3f4f6", // light-mode borderSubtle
```

In dark mode this border is invisible (light colour on dark surface). Real `DashboardHeader` uses `colors.borderSubtle` which is `#1F2937` in dark mode.

**Fix:** Pass `colors` prop into `DashboardSkeleton` (only `spacing` is currently passed) and replace with `colors.borderSubtle`.

---

### C5 · `DashboardFollowUpCard` · Nested Pressable breaks TalkBack on Android
**Dimension:** Accessibility  
**File:** `DashboardFollowUpCard.tsx` L79–143

Outer `Pressable` (card → customer detail) wraps inner `Pressable` (Collect button). On Android TalkBack can swallow touch events from the outer view making the inner Collect button unreachable. `importantForAccessibility="yes"` on the inner button does not reliably fix this.

**Fix:** Restructure — either:
- Make the card body a non-Pressable `View` + use a transparent absolute-positioned `Pressable` overlay for the card tap, keeping Collect outside the overlay; or
- Move Collect button to be a sibling of the outer Pressable, not a child.

---

## 🟠 Moderate

### M1 · `console.log` debug statements in production (6 components)
**Dimension:** Code Quality

| Component | Lines |
|---|---|
| `DashboardScreen` | L211, L229 |
| `DashboardHeroCard` | L171, L199, L205, L207 |
| `DashboardQuickStats` | L46 |
| `DashboardFollowUpCard` | L81, L122, L128, L129 |
| `DashboardRecentActivityRow` | L21 |

**Fix:** Remove all `console.log`. Keep `console.warn` only for haptic failures (behind `__DEV__` guard ideally). Route structured logging through a logger utility.

---

### M2 · `DashboardHeroCard` · `dashboardState` IIFE not memoized
**Dimension:** Performance  
**File:** `DashboardHeroCard.tsx` L48–53

State derivation IIFE runs on every render. All downstream constants (`gradient`, `isSendReminderDisabled`, labels, `badgeIcon`) also recompute every render.

**Fix:** `useMemo(() => { ... }, [totalOutstanding, overdueTotalCount])`.

---

### M3 · `DashboardFollowUpSection` · `ScrollView` missing `keyboardShouldPersistTaps`
**Dimension:** Performance / UX  
**File:** `DashboardFollowUpSection.tsx` L91

Horizontal `ScrollView` has no `keyboardShouldPersistTaps="handled"`. If keyboard is open (e.g., search active elsewhere), first tap on follow-up cards may not register.

**Fix:** Add `keyboardShouldPersistTaps="handled"`.

---

### M4 · `DashboardFollowUpCard` · `colors.warningBg` accessed via `any` prop
**Dimension:** Code Quality / Runtime  
**File:** `DashboardFollowUpCard.tsx` L36

`colors` is typed `any` throughout the dashboard component tree. A future token rename will silently produce `undefined` chip backgrounds with no compile-time error.

**Fix:** Type all `colors` props as `ColorTokens` (exported from `theme.ts`). Same applies to all 8 dashboard components.

---

### M5 · `DashboardQuickStats` · `quickStats` array not memoized
**Dimension:** Performance  
**File:** `DashboardQuickStats.tsx` L27–36

`safeCollectedThisMonth` IIFE and `quickStats` array (including `formatINR` call) recompute every render.

**Fix:** Wrap in `useMemo(() => [...], [totalCustomersCount, overdueTotalCount, collectedThisMonth, onOpenPeople, onOpenPeopleOverdue, onOpenEntries])`.

---

### M6 · `DashboardRecentActivity` · Raw `shadowColor: "#000"`
**Dimension:** UI / Dark Mode  
**File:** `DashboardRecentActivity.tsx` L45

Raw hex bypasses token system.

**Fix:** Replace with `colors.ink` or add a `shadow: "#000000"` token to `theme.ts`.

---

### M7 · `DashboardFollowUpSection` · Count badge shows stale value during error
**Dimension:** State Completeness  
**File:** `DashboardFollowUpSection.tsx` L37–42

Section header always renders the `overdueTotalCount` badge, even during the error state. User sees a count number + "Couldn't load" message simultaneously.

**Fix:** Hide badge (`overdueTotalCount > 0 && !errorMessage`) or replace with `--` during error.

---

### M8 · `people/index.tsx` · Filter param lifecycle edge case on unmount/remount
**Dimension:** Runtime  
**File:** `app/(main)/people/index.tsx` L76, L104–106

`paramsFilterConsumedRef` resets when `params.filter` is absent. On Android back-navigation Expo Router may restore the URL with the old `filter` param. Since the component may have unmounted, the ref resets and the stale param re-applies.

**Fix:** After consuming the filter param, pair `router.setParams({ filter: undefined })` (already done) with a `useEffect` cleanup that resets the `filter` state if "Overdue" should not persist across navigation sessions.

---

## 🟡 Minor

### m1 · Badge cap documented as "9+" — code is correct
**File:** `DashboardHeader.tsx` L19  
Code matches "9+" spec. No change needed. Add a comment to prevent future "fix" regression.

---

### m2 · `DashboardHeroCard` · Pending dot mixes className + inline style → ✅ Fixed
**File:** `DashboardHeroCard.tsx` L101–103  
`heroIndicatorDot` token added to `theme.ts` (light and dark). Component now references `colors.dashboard.heroIndicatorDot`.

---

### m3 · `DashboardFollowUpSection` · `isFetching` prop accepted but unused
**File:** `DashboardFollowUpSection.tsx` L12  
Dead prop. Remove from Props and destructure.

---

### m4 · `DashboardRecentActivity` · `isLoading` path unreachable
**File:** `DashboardRecentActivity.tsx` L47  
`DashboardScreen` shows `DashboardSkeleton` and returns early when `isLoading=true`, so `DashboardRecentActivity` never sees `isLoading=true`. Either remove the prop or wire a separate query-level loading state.

---

### m5 · `DashboardHeroCard` · Zero-delta has no icon
**File:** `DashboardHeroCard.tsx` L141  
Non-zero cases show an arrow icon; zero case shows text only. Minor visual inconsistency.  
**Suggestion:** Add `Minus` icon for the zero case.

---

### m6 · `DashboardFollowUpCard` · `chipStyles` IIFE not memoized
**File:** `DashboardFollowUpCard.tsx` L33  
**Fix:** `useMemo(() => {...}, [daysSince, colors])`.

---

### m7 · `DashboardFollowUpCard` · Nested Pressable a11y label redundancy
**File:** `DashboardFollowUpCard.tsx` L88, L135  
See C5 — both labels are correct individually but the nested structure causes TalkBack to either group them (missing Collect) or read both in sequence (confusing). Fix via C5 restructure.

---

### m8 · `DashboardSkeleton` · Follow-up card skeleton width 260 ≠ real card width 200
**File:** `DashboardSkeleton.tsx` L61 vs `DashboardFollowUpCard.tsx` L93  
Causes a 30% layout shift on load.  
**Fix:** Change skeleton card width to `200`.

---

### m9 · `DashboardSkeleton` · Hardcoded `paddingHorizontal: 16` and `paddingVertical: 12`
**File:** `DashboardSkeleton.tsx` L14–15  
**Fix:** Use `spacing.screenPadding` and `spacing.md` (already passed as a prop).

---

### m10 · `DashboardScreen` · Inline `onCustomerAdded` / `onPaymentSuccess` recreated every render
**File:** `DashboardScreen.tsx` L210, L228  
**Fix:** Wrap in `useCallback`.

---

### m11 · Pervasive `any` prop typing across all 8 dashboard components
**Dimension:** Code Quality  
`colors: any`, `gradients: any`, `spacing: any`, `profile: any` eliminate compile-time safety.  
**Fix:** `ColorTokens`, `GradientTokens`, `typeof spacing` from `theme.ts`.

---

## 🔵 Suggestions

### s1 · Extract pulse animation to a shared hook
Both `DashboardHeroCard` and `DashboardFollowUpCard` duplicate the `useFocusEffect` + `withRepeat(withTiming(...))` + `cancelAnimation` pattern.  
**Suggestion:** `usePulseAnimation(active: boolean): { pillStyle }` custom hook.

---

### s2 · `DashboardRecentActivityRow` · Name/title redundancy when `item.name` is absent
When `item.name` is absent, both lines show `item.title`.  
**Suggestion:** Fall back to `"Bill"` or `"Payment"` (from `item.type`) as the primary label.

---

### s3 · `people/index.tsx` · Document intentional dual-filter (server + client fuzzy)
Server filters by `debouncedSearch`, client applies fuzzy match on results. Valid pattern but risks showing 0 results when matches exist on the next page.  
**Suggestion:** Add a comment explaining the dual-filter intention.

---

### s4 · `DashboardHeader` · Bell uses `colors.textMuted` not canonical `colors.muted`
`#64748B` (Slate-500) vs canonical `#6B7280` (Gray-500) — slight value drift.  
**Suggestion:** Standardize to `colors.muted`.

---

## Per-Dimension Scorecard

| Dimension | Score | Key Issues |
|---|---|---|
| **UI & Visual Consistency** | 🟠 Needs Work | Raw `#fff` hex, `#000` shadow, rgba outside token system, mixed className/inline |
| **Dark Mode** | 🟠 Needs Work | Skeleton border hardcoded light hex, gradient/card surface mismatch risk, `#fff` hero amount |
| **State Completeness** | ✅ Good | All 4 hero states, both empty states, zero-delta, per-section error UI — all handled |
| **Runtime Risks** | 🟠 Needs Work | `onOpenPeopleOverdue` coupling, people filter param lifecycle, unreachable `isLoading` path |
| **Accessibility** | 🔴 Critical | Nested Pressable breaks TalkBack on Android |
| **Performance** | 🟠 Needs Work | Unmemoized state derivation in HeroCard, QuickStats, FollowUpCard; inline callbacks in Screen |
| **Code Quality** | 🟠 Needs Work | `any` props in all 8 components; `console.log` in 6 components; dead `isFetching` prop; duplicate pulse hook |
| **Skeleton Quality** | 🟠 Needs Work | Card width mismatch (260 vs 200), border hardcoded, spacing not from tokens |

---

## Fix Priority Order

1. **C5** — Nested Pressable / TalkBack (before next release)
2. **C4** — Skeleton dark mode border
3. **C2** — Hero amount `#ffffff` → token
4. **C1** — Gradient surface token drift check
5. **C3** — `onOpenPeopleOverdue` prop slot separation
6. **M1** — Remove all `console.log`
7. **m8** — Skeleton card width 260 → 200
8. **M11/m11** — Prop typing (`any` → `ColorTokens` etc.)
