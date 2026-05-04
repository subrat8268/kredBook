# KredBook — Roadmap & Status

> **Source of truth for all phase tracking, task sequencing, and OpenCode execution.**
> Stop referring to Notion. This file is the single tracker. Update it after every completed task.

---

## How to use this file

1. **Before starting any task** — read the task row, check `Depends On`, confirm that dependency is `✅ Done`.
2. **Copy the OpenCode Prompt** exactly as written. Load listed skills before running.
3. **After completing a task** — update `Status` to `✅ Done`, fill in the `Commit` link, and run doc-sync checklist (`.agents/doc-sync-checklist.md`).
4. **Never skip a task or reorder**. Tasks within a phase are sequenced for safety.
5. This file is the only tracker. Do not use Notion or Google Sheets.

---

## Phase Overview

| Phase | Name | Status | Theme |
|---|---|---|---|
| 1 | Truth Reset | ✅ Done | Canonical nouns, core flows, offline-first baseline |
| 2 | DB Hardening | ✅ Done | Schema cleanup, due_date, payment_date, parties fields |
| 3 | Experience Upgrades | ✅ Done | Dark mode, WhatsApp-first sharing, overdue polish |
| 4 | UI/UX Redesign | 🔄 In Progress | Full design system overhaul — Vercel × Khatabook × Linear |
| 5 | Documents + Collection | ⏳ Not Started | PDF outputs, UPI collection |
| 6 | AI Assistance | ⏳ Not Started | Opt-in AI layer via Edge Functions |

---

## Active Product Surface

| Area | Status | Notes |
|---|---|---|
| Authentication | ✅ Working | `app/_layout.tsx` owns auth/onboarding redirects |
| Dashboard | ✅ Working | Outstanding-first overview, overdue collection hero |
| People (Customers) | ✅ Working | Add / list / search / detail |
| Entries | ✅ Working | Create / list / detail |
| Payments | ✅ Working | Record + context |
| Profile | ✅ Working | Settings + CSV export |
| Offline-first sync | ✅ Working | Queue in `src/lib/syncQueue.ts`, replay on reconnect |
| Localization | ✅ Working | EN / HI |
| CSV export | ✅ Working | Profile-area export |
| Dark mode | ✅ Working | Token pairs in `theme.ts`, toggle in Profile |

---

## Drift Watchlist

- Legacy internals still use `order` / `party` — label as `legacy/transitional` if referenced.
- `customers` and `suppliers` tables dropped; all data now in `parties`.
- Legacy supplier/product tables have been dropped from `public` (e.g., `products`, `supplier_*`).
- `order_items.product_id` / `order_items.variant_id` remain as nullable legacy columns; treat them as transitional.
- `parties` is customers-only now (`parties_is_customer_only`). Supplier fields have been removed.
- `profiles.dashboard_mode` has been removed.
- Supplier / product surfaces are out of scope and must not be described as active features.

---

## Phase 1 — Truth Reset ✅ Done

**Goal:** Lock canonical product nouns, get core flows working, establish offline-first baseline.

| # | Task | Status | Commit |
|---|---|---|---|
| 1.1 | Rename canonical nouns to Customer / Entry / Payment | ✅ Done | [6334742](https://github.com/subrat8268/kredBook/commit/6334742aa7059fc77d5942a9bc77b393a8b3640f) |
| 1.2 | Implement Dashboard screen (outstanding + overdue) | ✅ Done | [211cc76](https://github.com/subrat8268/kredBook/commit/211cc76f00dac84d0bb3577585f37ddb85dd6b74) |
| 1.3 | Design system + theme tokens in `src/utils/theme.ts` | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.4 | Migrate customer hooks to `parties` table | ✅ Done | [6d5415b](https://github.com/subrat8268/kredBook/commit/6d5415bb10392ae6709015fe5a472fbeb899be51) |
| 1.5 | Offline-first mutation queue wired (`syncQueue.ts`) | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.6 | EN/HI localization | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.7 | CSV export (Profile area) | ✅ Done | [0bb6587](https://github.com/subrat8268/kredBook/commit/0bb6587eb9d3735ab0aebcbcdfe6349df3637ce1) |
| 1.8 | Align docs to product truth (PRD, ARCHITECTURE, flows) | ✅ Done | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |

---

## Phase 2 — DB Hardening ✅ Done

**Goal:** Clean up schema, drop dead columns, add business-critical fields, lock schema truth.

| # | Task | Status | Command | Skills | Commit |
|---|---|---|---|---|---|
| 2.1 | Audit full schema correctness | ✅ Done | `/audit` | `code-reviewer`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.2 | Remove dead `product_id` + `variant_id` from `order_items` | ✅ Done | `/fix` | `systematic-debugging`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.3 | Add `due_date` to orders + overdue partial index | ✅ Done | `/build` | `project-planner`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.4 | Expand `payment_mode` enum + add `payment_date` | ✅ Done | `/build` | `project-planner`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.5 | Add `notes`, `avatar_url`, `email` to `parties` | ✅ Done | `/build` | `project-planner`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.6 | Add CHECK constraint `parties.is_customer = TRUE` | ✅ Done | `/fix` | `systematic-debugging`, `supabase` | [bee19a9](https://github.com/subrat8268/kredBook/commit/bee19a931aa49080026cbab9efb51c5d2a06a62a) |
| 2.7 | Regenerate `database.types.ts` from live Supabase | ✅ Done | `/fix` | `supabase`, `project-planner` | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |
| 2.8 | Refresh `schema.sql` from live Supabase (no-data ref) | ✅ Done | `/audit` | `supabase` | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |
| 2.9 | Rename storage bucket `product-images` → `avatars` | ✅ Done | `/refactor` | `refactor-engineer`, `supabase` | [dea2297](https://github.com/subrat8268/kredBook/commit/dea22974108ac94a7f677919d9c37234cb2d9b18) |
| 2.10 | Add RPC `get_dashboard_summary` (single-query dashboard) | ✅ Done | `/build` | `project-planner`, `supabase` | [dea2297](https://github.com/subrat8268/kredBook/commit/dea22974108ac94a7f677919d9c37234cb2d9b18) |

---

## Phase 3 — Experience Upgrades ✅ Done

**Goal:** Dark mode, WhatsApp-first sharing polish, overdue badge consistency, quality-of-life wins.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 3.1 | Dark mode — semantic tokens in `theme.ts` + settings toggle | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `building-native-ui`, `react-native-skills` |
| 3.2 | Overdue badge consistency — token + component across Dashboard / People / Entries | ✅ Done | P0 | `/refactor` | `ui-ux-pro-max`, `refactor-engineer` |
| 3.3 | WhatsApp share polish — consistent message template (amounts, dates, customer name) | ✅ Done | P1 | `/build` | `project-planner`, `react-native-skills`, `code-reviewer` |
| 3.4 | Overdue push notifications — grouped local reminders + Profile toggle + People deep-link | ✅ Done | P1 | `/build` | `building-native-ui`, `native-data-fetching` |
| 3.5 | Indian number format — ₹1,20,000 everywhere | ✅ Done | P1 | `/fix` | `systematic-debugging`, `react-native-skills` |
| 3.6 | Public ledger share link | ✅ Done | P1 | `/build` | `building-native-ui`, `native-data-fetching`, `supabase` |
| 3.7 | Entry note field — optional short text per Entry | ✅ Done | P1 | `/build` | `project-planner`, `supabase`, `react-native-skills` |
| 3.8 | Collect shortcut on Dashboard hero — deep-link to top overdue Customer | ✅ Done | P2 | `/build` | `react-native-skills`, `project-planner`, `code-reviewer` |
| 3.9 | Empty state illustrations — warm empty states with CTA | ✅ Done | P2 | `/build` | `react-native-skills`, `project-planner` |
| 3.10 | Offline banner — top overlay with offline/online sync confirmation states | ✅ Done | P2 | `/build` | `react-native-skills`, `project-planner` |
| 3.11 | Customer search improvements — speed + relevance | ✅ Done | P2 | `/build` | `react-native-skills`, `project-planner`, `code-reviewer` |
| 3.12 | Entries + People filters | ✅ Done | P2 | `/plan` | `project-planner`, `writing-plans` |
| 3.13 | Export hardening — validate CSV totals, locale-safe formatting | ✅ Done | P2 | `/audit` | `supabase`, `code-reviewer` |

### Phase 3 — Task Notes

#### 3.11 — Customer Search Improvements ✅ Done

**Implemented the People search upgrade end-to-end with smoother input handling and better matching.**

- Added 250ms debounced search input in `app/(main)/people/index.tsx` so typing doesn't trigger immediate heavy updates on every keypress.
- Added fuzzy/prefix matching (includes, token-prefix, and ordered-char fallback) so queries like `raj` match `Rajesh Kumar` in `app/(main)/people/index.tsx`.
- Added search result count label: `X of Y customers` in `app/(main)/people/index.tsx`.
- Added matched substring highlight in customer name by passing a rich title node into `ListItem`:
  - `src/components/layer2/ListItem.tsx` now supports `titleNode?: React.ReactNode`
  - `app/(main)/people/index.tsx` renders highlighted text using theme primary color.
- Consolidated duplicate data-fetch logic by switching `usePeople` to reuse API fetch logic:
  - `src/hooks/usePeople.ts` now uses `fetchPeople` from `src/api/people.ts` instead of maintaining a second parallel fetch implementation.

**Files changed:** `app/(main)/people/index.tsx`, `src/components/layer2/ListItem.tsx`, `src/hooks/usePeople.ts`

**Verification:** `npm run lint` passes with 0 errors (existing warnings remain in unrelated files).

---

#### 3.12 — Entries + People Filters ✅ Done

**Plan: List Filter Chips**

**Overview:** Add client-side filter chips to both People and Entries screens, with URL-safe state so links can restore the active filter. Keep all filtering local to cached React Query data and avoid new DB calls.

**Tasks:**

| # | Task | Type | Estimate | Depends |
|---|---|---|---|---|
| 1 | Inspect current list state, routing, and existing filter helpers in People and Entries screens | Research | 15m | - |
| 2 | Define a shared URL-safe filter schema for each screen (peopleFilter, entriesFilter, plus custom range params) | Design | 30m | 1 |
| 3 | Add People filter chips: All, Overdue, Pending, Paid, Advance | UI | 30m | 2 |
| 4 | Add Entries filter chips: All, Overdue, Pending, Paid, This Month, Custom Range | UI | 45m | 2 |
| 5 | Wire both screens to read/write filter state from params so deep links restore correctly | Navigation/State | 1 hr | 2 |
| 6 | Keep filtering client-side from existing React Query cache, with no extra fetches | Data flow | 30m | 1 |
| 7 | Make Custom Range param-safe and restoreable from link state | State/Navigation | 45m | 2, 5 |
| 8 | Verify empty states, result counts, and active filter labels still behave correctly | QA | 30m | 3, 4, 5 |
| 9 | Run lint and sanity-check deep-link behavior | Verification | 15m | 3-8 |

**Execution Order:**
1. Confirm the current filter and route patterns.
2. Define the shared param contract.
3. Implement People chips.
4. Implement Entries chips.
5. Connect deep-linkable param state.
6. Validate client-side filtering only.
7. Test restore behavior from URLs.

**Risks:**
- Custom Range can become ambiguous unless the param shape is fixed up front.
- People and Entries may use different route param conventions, so the shared contract needs to stay simple.
- Deep-link support may require normalizing empty/default states carefully.

**Success Criteria:**
- Both screens expose the requested chip sets.
- Filter state survives refresh/deep link navigation.
- No new DB queries are added.
- Lint passes.

---

### Phase 3 — OpenCode Prompts

#### 3.13 — Export Hardening

```
/audit load_skills=["supabase","code-reviewer"]

Audit CSV export for correctness and locale safety.
- Validate that exported totals match on-screen totals (spot-check 3 customers)
- Confirm all amounts use formatINR — no raw toLocaleString calls remaining
- Confirm date formatting is consistent (DD MMM YYYY) across export rows
- Flag any rows that may produce broken CSV if customer name has a comma
Deliver an audit report only. Fixes go in a follow-up /fix task.
```

- Audit report: `docs/audits/csv-export-audit-2026-05-03.md`
- Outcome: totals spot-check passed for 3/3 customers; locale/date inconsistencies found in CSV rows; CSV escaping is safe for commas/quotes/newlines.
- Follow-up `/fix` complete: CSV row amounts now use `formatINR` and CSV row dates now use `DD MMM YYYY` via shared formatter.

---

## Phase 4 — UI/UX Redesign 🔄 In Progress

**Goal:** Full design system overhaul and screen-by-screen redesign. Vercel × Khatabook × Linear aesthetic. Bharat-market ready.

> **Depends On:** Phase 3 task 3.1 (dark mode tokens) must be ✅ Done first — Phase 4.0 builds on top of those token foundations.
> **Rule:** Never start a screen redesign without 4.0 (design system) being ✅ Done. All tokens must be locked before touching any screen.

---

### Phase 4.0 — Design System Foundation ⚠️ Blocks All Other 4.x Tasks

| # | Task | Status | Priority | Command | Skills | Depends On | Commit |
|---|---|---|---|---|---|---|---|
| 4.0.1 | Update `theme.ts` — new color tokens (green primary, amber accent, semantic palette) | ✅ Done | P0 | `/refactor` | `ui-ux-pro-max`, `building-native-ui`, `react-native-skills` | 3.1 ✅ | [58302ca](https://github.com/subrat8268/kredBook/commit/58302ca) |
| 4.0.2 | Fix `tailwind.config.js` — replace CSS vars with literal token values | ✅ Done | P0 | `/fix` | `refactor-engineer`, `expo-tailwind-setup`, `react-native-skills` | 4.0.1 ✅ | [58302ca](https://github.com/subrat8268/kredBook/commit/58302ca) |
| 4.0.3 | Add motion tokens — `duration-fast: 150ms`, `duration-base: 250ms`, easing curves | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | 4.0.1 ✅ | [0f5e639](https://github.com/subrat8268/kredBook/commit/0f5e639) |
| 4.0.4 | Unify icon system — migrate all icons to `lucide-react-native`, remove SVG + system mix | ✅ Done | P0 | `/refactor` | `refactor-engineer`, `code-reviewer` | 4.0.1 ✅ | [28a4307](https://github.com/subrat8268/kredBook/commit/28a4307) |
| 4.0.5 | Rebuild `StatusBadge` — filled pill + semantic color per status (Paid/Partial/Overdue/Advance) | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps` | 4.0.1 ✅ | [bf13490](https://github.com/subrat8268/kredBook/commit/bf13490) |
| 4.0.6 | Rebuild `Button` variants — primary / secondary / ghost / danger with new tokens | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | 4.0.1 ✅ | [7f271ea](https://github.com/subrat8268/kredBook/commit/7f271ea) |
| 4.0.7 | Create `Skeleton` component — shimmer loading for all list/card surfaces | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | 4.0.1 ✅ | [3049f19](https://github.com/subrat8268/kredBook/commit/3049f19) |
| 4.0.8 | Create `SpeedDialFAB` component — expandable FAB (New Entry · New Customer · Record Payment) | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | 4.0.3 ✅ | [07ddd84](https://github.com/subrat8268/kredBook/commit/07ddd84) |

**New Brand Tokens (implement in 4.0.1):**

Current `theme.ts` uses blue (`#2563EB`) as primary. Phase 4 migrates to:

```
primary:    #16A34A  (green-600)   → trust, money, growth
accent:     #F59E0B  (amber-500)   → overdue alerts, urgency
surface:    #F9FAFB  (gray-50)     → card backgrounds
ink:        #111827  (gray-900)    → primary text
muted:      #6B7280  (gray-500)    → secondary text
danger:     #DC2626  (red-600)     → errors, delete
success:    #16A34A                → same as primary (paid status)
warning:    #F59E0B                → overdue
border:     #E5E7EB  (gray-200)    → dividers
```

**Typography upgrade (implement in 4.0.1):**
- Body / numbers: **Inter** (already in use — no change)
- Headings: **Manrope** (new — replace screenTitle/sectionTitle Inter instances)

**Dead code to kill in 4.0 (before redesign starts):**
- Center FAB tab from `(main)/_layout.tsx` — replace with SpeedDialFAB
- Standalone Export tab — move to Profile screen
- `src/components/navigation/` (empty directory)
- Stub product picker state in `create.tsx` lines 91–103
- `role.tsx` unregistered route in onboarding `_layout.tsx`
- Wired-but-unused i18n `t()` calls — either fully wire or remove

#### 4.0.1 — Update theme.ts OpenCode Prompt

```
/refactor load_skills=["ui-ux-pro-max","building-native-ui","react-native-skills","code-reviewer"]

Migrate KredBook brand tokens in src/utils/theme.ts from blue-primary to green-primary.

Changes:
1. Replace primary blue (#2563EB) with green-600 (#16A34A) as the main primary color
2. Add accent token: #F59E0B (amber-500) for overdue/urgency surfaces
3. Update heroGradients: dashboardHero + customerHero/peopleHero to use green-700→green-800
4. Keep danger (#DC2626), warning (#F59E0B = accent), success (#16A34A = primary) — all correct
5. Add motion tokens object: { fast: 150, base: 250, slow: 400, easing: 'cubic-bezier(0.16,1,0.3,1)' }
6. Add Manrope font family entries alongside existing Inter entries
7. Update lightColors + darkColors to reflect all above changes
8. Keep all existing token names — only values change. No component edits in this task.

Verification: theme.ts exports unchanged API shape, no TS errors, lint clean.
```

---

### Phase 4.1 — Core Loop Screens (Daily Driver)

> Depends On: All of 4.0 ✅ Done

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.1.1 | Dashboard redesign — hero card, quick stats row, activity feed, SpeedDialFAB | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps`, `react-native-skills` | `(main)/dashboard/index.tsx` ([f690c3c](https://github.com/subrat8268/kredBook/commit/f690c3c)) |
| 4.1.2 | Tab navigation redesign — theme-aware tab bar, lucide icons, SpeedDialFAB record-payment routing fix | ✅ Done | P0 | `/refactor` | `ui-ux-pro-max`, `react-native-skills` | `(main)/_layout.tsx` ([fa4f3b2](https://github.com/subrat8268/kredBook/commit/fa4f3b24e2ca07a2edb27f42a410a94ca02ffcad)) |
| 4.1.3 | Create Entry redesign — full-screen numpad, bottom sheet customer picker, quick due-date chips | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/create.tsx` ([5d588b8](https://github.com/subrat8268/kredBook/commit/5d588b8)) |
| 4.1.3a | Create Entry bug fixes — params override draft, due-date format normalization, numpad guard, Bill/Payment toggle, recent customers first | ✅ Done | P0 | `/fix` | `systematic-debugging`, `react-native-skills`, `ui-ux-pro-max` | `(main)/entries/create.tsx`, `CustomerPicker.tsx`, `BillFooter.tsx` |
| 4.1.3b | Create Entry UX redesign — remove SpeedDialFAB, save/share split buttons, progressive disclosure, Bill Mode with line items, modern visual standards | 🔄 In Progress | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills`, `code-reviewer` | `(main)/entries/create.tsx`, `BillFooter.tsx` |
| 4.1.4 | Record Payment modal redesign — large numpad, partial toggle, payment method, WhatsApp receipt | ⏳ Not Started | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `RecordPaymentModal` (shared) |
| 4.1.5 | Customer Detail redesign — hero card, sticky balance bar, timeline view, swipe actions | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/people/[customerId].tsx` |

#### 4.1.2 — Tab Navigation Redesign ✅ Done

**Fixed tab navigation in `app/(main)/_layout.tsx` — theme-aware colors and reliable FAB routing.**

- Replaced hardcoded `backgroundColor: "#FFFFFF"` in `tabBarStyle` with `colors.surface` from `useTheme()` — tab bar now respects dark mode correctly.
- Replaced hardcoded `borderTopColor` with `colors.border` token.
- Fixed `SpeedDialFAB` record-payment action: instead of `router.setParams()` (which only worked on the Dashboard tab), it now calls `router.push({ pathname: "/(main)/dashboard", params: { action: "record-payment" } })` — customer picker opens correctly from any tab.
- Kept all 4 tabs (Home, People, Entries, Profile), existing icons, and SpeedDialFAB new-entry / new-customer actions unchanged.

**Files changed:** `app/(main)/_layout.tsx`

**Verification:** Tab bar uses surface token in both light and dark mode; record-payment FAB action tested from People and Entries tabs; `npm run lint` passes.

#### 4.1.3 — Create Entry Redesign ✅ Done (with known issues - see 4.1.3a & 4.1.3b below)

**Initial implementation completed in commit 5d588b8.**

This redesign added: full-screen numpad, bottom sheet customer picker, quick due-date chips, MMKV-backed draft persistence.

**Known issues requiring follow-up:** 
- Deep-link params can be overridden by stale draft (A1)
- Due-date format inconsistencies (A2)
- Numpad accepts invalid inputs like "." as first char (A3)
- No Bill/Payment toggle in header (A4)
- Customer list not sorted by recently added first (A5)
- Need UX refinements per 4.1.3b

---

#### 4.1.3a — Create Entry Bug Fixes

```
/fix load_skills=["systematic-debugging","react-native-skills","ui-ux-pro-max","code-reviewer"]

Fix and redesign the Create Entry screen end-to-end.
Files: app/(main)/entries/create.tsx, src/components/picker/CustomerPicker.tsx, src/components/orders/BillFooter.tsx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION A — BUG FIXES (must fix first)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A1. Params override stale draft (create.tsx:139–176)
    - Apply deep-link params AFTER draft restore, not before.
    - If customerParams exists → override selectedCustomerMeta and selectedCustomerId from params.
    - If amountParam exists → override quickAmount from params.
    - Draft must never silently win over a deep-link intent.

A2. Normalize due-date format (create.tsx:51, :663, :666)
    - ALL due dates must store as YYYY-MM-DD string only.
    - Replace computeDueDateFromPreset() .toISOString() with:
      format(date, 'yyyy-MM-dd')  ← use date-fns (already in project)
    - Replace DateRangePicker (from/to UX) with a single DateTimePicker (mode="date").
    - Custom chip shows chosen date as "12 May" after selection.

A3. Numpad input guard (create.tsx:501)
    - Reject "." as the first character → auto-insert "0." instead.
    - Strip extra leading zeros (e.g. "007" → "7").
    - Max 2 decimal places — reject further decimal digits after 2.

A4. entryType toggle in header (create.tsx:105, :216)
    - Add Bill / Payment toggle in the header row (two pill buttons, not a dropdown).
    - Bill = default. Payment = switches intent, updates footer CTA to "Record Payment".
    - Toggle must be reachable without any deep-link param.

A5. Recently added customers first (CustomerPicker.tsx:29, :153)
    - Sort customer list by created_at DESC before rendering.
    - Search results still use fuzzy match but within this sorted base.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Deep-link with customer+amount params: params win over stale draft.
- Custom due date: single date picker, stores YYYY-MM-DD, chip shows "12 May".
- Numpad: "." as first press → becomes "0." | "007" → "7" | max 2 decimal places enforced.
- Payment toggle: switch to Payment → enter amount → "Record Payment" fires handleRecordPayment().
- npm run lint passes, no TS errors.
```

---

#### 4.1.3b — Create Entry UX Redesign

```
/build load_skills=["ui-ux-pro-max","react-native-skills","code-reviewer"]

Fix and redesign the Create Entry screen end-to-end.
Files: app/(main)/entries/create.tsx, src/components/picker/CustomerPicker.tsx, src/components/orders/BillFooter.tsx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION B — UX REDESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

B1. Remove SpeedDialFAB from this screen entirely.
    The Create Entry screen is already a focused task — no FAB needed here.

B2. Split "Save & Share" into two separate bottom actions:
    - Replace BillFooter's single "Save & Share" CTA with two buttons in a row:
        LEFT:  [💾 Save Entry]         → full green, primary CTA, creates record
        RIGHT: [📤 Share on WhatsApp]  → ghost/outline, secondary
    - "Share on WhatsApp" is DISABLED until Save is complete.
    - After save: show post-save action modal:
        Primary:   "Share on WhatsApp" (pre-filled: customer name, amount, due date, business name)
        Secondary: "View Entry" → navigate to /(main)/entries/[orderId]
        Dismiss:   "Done" → router.back()
    - Remove the combined BillFooter "Save & Share" pattern from this screen.

B3. Progressive disclosure — customer first:
    - On first open (no draft, no params): show customer picker card as the ONLY visible element.
      Numpad, due date chips, note toggle all remain hidden until a customer is selected.
    - Once customer is selected: animate-in the amount section, due date chips, note toggle.
    - "Change" tappable link on the locked customer row to re-open picker.

B4. Bill / Quick mode toggle in header:
    - Two pills: [Quick Entry●] [Bill Mode]
    - Quick Entry = current flow (single amount, no line items).
    - Bill Mode = shows "+ Add Item" section above the numpad for line items.
    - Default: Quick Entry.

B5. Bill Mode — line items (only visible when Bill Mode is active):
    - "+ Add Item" button opens a bottom sheet with:
        Item Name field (text input, autocomplete from AsyncStorage cached past items)
        Qty stepper (+/- buttons, default 1)
        Rate field (uses existing numpad component)
        Total preview = qty × rate
        "Add to Bill" CTA
    - Saved items render as swipeable cards above the numpad (swipe left to delete).
    - Grand Total = sum of all line items (replaces manual amount in Bill Mode).
    - In Bill Mode, the manual numpad is hidden — total is derived from items only.
    - Item name autocomplete: cache used names in AsyncStorage key "item-name-cache",
      max 50 entries, most-recent-first.

B6. Grand Total row always visible in footer:
    - Show "Grand Total  ₹X,XXX" as a label row above the two action buttons.
    - In Quick Entry: total = entered amount + previousBalance (if any).
    - In Bill Mode: total = sum of line items + previousBalance (if any).

B7. Modern, premium visual standards (apply throughout):
    - No SpeedDial on this screen.
    - No colored side-borders on cards.
    - All cards use surface elevation (border: 1px solid colors.border, shadow-sm).
    - Numpad keys: 72px height, border radius 14, font size 24, bold.
    - Active chip: filled primary bg + white text (not just border change).
    - Previous balance warning: amber background strip, not red — red is for errors only.
    - Every TouchableOpacity must have an activeOpacity={0.75} and a visible pressed state.
    - All text sizes follow theme tokens — no hardcoded font sizes outside the theme scale.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION C — BACKEND ALIGNMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C1. Bill Mode line items must map to existing order_items schema:
    - product_id: null (nullable — existing column, no schema change needed)
    - product_name: item name string
    - price: rate (unit price)
    - quantity: qty from stepper
    - amount: price × quantity (computed, not stored separately)

C2. due_date field:
    - After A2 fix, all paths store YYYY-MM-DD.
    - Pass directly to createOrderMutation — no .toISOString() wrapping.

C3. note field cleanup:
    - The single "note" field (orderNote in state) maps to orders.note in DB.
    - Remove the confusing split between note (line-item name) and orderNote (order note).
    - In Quick Entry: note = optional order note (e.g. "Delivery Monday").
    - In Bill Mode: note = order-level note. Each line item has its own name field.
    - product_name for the Quick Entry single item = note.trim() || "Entry Amount" (keep as-is).

C4. Payment type (entryType === "payment"):
    - handleRecordPayment() flow unchanged — it correctly calls recordPayment() API.
    - Just ensure the Bill/Payment header toggle (A4) properly sets entryType state.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUT OF SCOPE FOR THIS TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- GST calculation (planned for 4.2.1)
- PDF generation changes
- Any new Supabase migrations
- note vs orderNote semantic rename in DB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Quick Entry: select customer → enter amount → Save Entry → post-save modal appears → Share on WhatsApp fires pre-filled message.
- Bill Mode: select customer → add 2 items → Grand Total auto-calculates → Save Entry works.
- Payment toggle: switch to Payment → enter amount → "Record Payment" fires handleRecordPayment().
- Deep-link with customer+amount params: params win over stale draft.
- Custom due date: single date picker, stores YYYY-MM-DD, chip shows "12 May".
- Numpad: "." as first press → becomes "0." | "007" → "7" | max 2 decimal places enforced.
- npm run lint passes, no TS errors.
```

---

### Phase 4.1 — Dashboard Redesign OpenCode Prompt

```
/build load_skills=["ui-ux-pro-max","sleek-design-mobile-apps","react-native-skills","code-reviewer"]

Redesign the KredBook Dashboard screen. All tokens from src/utils/theme.ts (Phase 4.0 must be done first).

Changes:
1. Hero card: gradient green-600 → green-700, white text, "Collect Outstanding" total with animated
   number counter on load, ↑/↓ week delta with color-coded arrow, "Record Payment" CTA in card footer
2. Personalized greeting: "Good morning, [Name] 👋" using profile name from store
3. Quick stats row: 3 mini-cards (Total Customers · Overdue Count · Collected This Month),
   each tappable to filtered list
4. Top follow-up: horizontal scroll cards (not vertical list), avatar/initials,
   days-overdue amber badge, "Collect" action
5. Recent activity feed: last 5 transactions (entry/payment) as a timeline
6. Replace center FAB tab with SpeedDialFAB component (4.0.8)
7. Skeleton loading on all cards (4.0.7 component)
8. Empty state for overdue section: "All clear! No overdue customers 🎉"
9. Pull-to-refresh: keep existing

No new DB queries. Wire to existing hooks + get_dashboard_summary RPC.
Verification: all sections render, skeleton shows on load, SpeedDialFAB expands/collapses, lint clean.
```

---

### Phase 4.2 — List Screens

> Depends On: 4.0 ✅ Done, 4.1 ✅ Done

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.2.1 | Customer List redesign — filter chips, swipe actions, sort options, alphabetical headers, empty state | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/people/index.tsx` |
| 4.2.2 | Entry List redesign — filter chips, swipe actions, date section headers, summary banner | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/index.tsx` |
| 4.2.3 | Entry Detail redesign — hero card, payment timeline, sticky "Record Payment" bar | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/[orderId].tsx` |
| 4.2.4 | Edit Entry redesign — quick due-date chips, customer reassign, unsaved changes warning | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/[orderId]/edit.tsx` |

#### 4.2.1 — Customer List OpenCode Prompt

```
/build load_skills=["ui-ux-pro-max","react-native-skills","code-reviewer"]

Redesign the Customer List screen (main)/people/index.tsx.

Changes:
1. Sticky search bar at top, autofocus on tab press
2. Filter chips (horizontal scroll, not dropdown): All · Overdue · Pending · Paid · Advance
3. List items: Avatar/initials · Name · Balance · StatusBadge · Days overdue in single row
4. Sort options: Highest balance · Most overdue · Alphabetical · Recently active
5. Swipe left: Call + WhatsApp quick actions. Swipe right: Quick Payment
6. Alphabetical section headers (A · B · C...)
7. Floating + button bottom-right (remove from header)
8. Empty state: illustration + "Add your first customer" with inline CTA + "Import from Contacts" button
9. Consolidate duplicated filter logic — remove client-side duplicate between people.ts and usePeople.ts

Verification: filters work, swipe actions fire correctly, empty state renders, lint clean.
```

---

### Phase 4.3 — Auth + Onboarding

> Depends On: 4.0 ✅ Done

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.3.1 | Welcome screen redesign — illustrated full-bleed, tagline, social proof, language toggle, Lottie animation | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps`, `react-native-skills` | `app/index.tsx` |
| 4.3.2 | Login redesign — show/hide password, Google OAuth, inline field errors, keyboard avoidance | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/login.tsx` |
| 4.3.3 | Signup redesign — remove confirm password, add name field + terms checkbox + progress pill | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/signup.tsx` |
| 4.3.4 | Reset Password redesign — full-screen success illustration state | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/resetPassword.tsx` |
| 4.3.5 | Phone Setup redesign — flag + country code input, inline OTP, skip option, progress bar | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/phone-setup.tsx` |
| 4.3.6 | Onboarding business.tsx — business type selector, logo upload, skip option | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/business.tsx` |
| 4.3.7 | Onboarding bank.tsx — make optional, add UPI ID + QR preview, prominent skip | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/bank.tsx` |
| 4.3.8 | Onboarding ready.tsx — confetti Lottie, feature highlights, "Take a Tour" trigger | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/ready.tsx` |

---

### Phase 4.4 — Profile, Export + Public Ledger

> Depends On: 4.0 ✅ Done, 4.2 ✅ Done

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.4.1 | Profile screen redesign — editable header, UPI QR, app settings section, danger zone | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/profile/index.tsx` |
| 4.4.2 | Profile Edit redesign — logo upload, UPI ID, address, sticky save bar, inline validation | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/profile/edit.tsx` |
| 4.4.3 | Export — move from standalone tab into Profile, add customer filter, email export, export history | ⏳ Not Started | P1 | `/refactor` | `refactor-engineer`, `react-native-skills` | `(main)/export/index.tsx` |
| 4.4.4 | Public Ledger redesign — business logo, UPI Pay Now button, WhatsApp CTA, mobile-responsive, KredBook footer | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `project-planner` | `app/l/[token].tsx` |

#### 4.4.4 — Public Ledger OpenCode Prompt

```
/build load_skills=["ui-ux-pro-max","project-planner","code-reviewer"]

Redesign the Public Ledger screen (app/l/[token].tsx). This is a B2C touchpoint — customers receive this link via WhatsApp.

Changes:
1. Show vendor business logo + name prominently at top
2. Outstanding amount hero: large, clear, "₹2,400 is due" — no ambiguity
3. Transaction timeline: clean, date-grouped
4. UPI Pay Now button: if vendor has UPI ID, deep-link to UPI apps (upi://pay?pa=...)
5. "Talk to Us" WhatsApp CTA linking to vendor phone
6. Expiry warning if token has TTL: "Link valid for X days"
7. Subtle "Powered by KredBook" footer
8. Fully mobile-responsive — renders cleanly in mobile browsers (customers open from WhatsApp)

Verification: renders on mobile viewport, UPI deep link fires, WhatsApp CTA works, lint clean.
```

---

## Phase 5 — Documents + Collection ⏳ Not Started

**Goal:** PDF outputs and UPI collection links for WhatsApp-first sharing.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 5.1 | PDF Customer statement — Edge Function generates PDF, stores in Supabase Storage, share via WhatsApp | ⏳ Not Started | P1 | `/build` | `supabase`, `project-planner` |
| 5.2 | Entry PDF — single Entry receipt shareable via WhatsApp | ⏳ Not Started | P2 | `/build` | `supabase`, `project-planner` |
| 5.3 | UPI collect link + QR on Customer balance screen | ⏳ Not Started | P1 | `/build` | `project-planner`, `react-native-skills` |
| 5.4 | Receipt-friendly sharing flow — polish and test end-to-end | ⏳ Not Started | P2 | `/plan` | `project-planner`, `writing-plans` |
| 5.5 | Referral prompt after successful payment — lightweight share + deep link | ⏳ Not Started | P3 | `/build` | `ui-ux-pro-max`, `project-planner` |

---

## Phase 6 — AI Assistance ⏳ Not Started

**Goal:** Opt-in AI features only. All AI goes through Supabase Edge Functions with guardrails.

> **Rule:** No AI feature is added without an opt-in UX. All AI calls are rate-limited and audit-logged. No AI feature modifies data directly.
> **Depends On:** Phase 4 (UI/UX Redesign) ✅ Done preferred — AI surfaces must use the new design system tokens.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 6.1 | Plan AI architecture — Edge Function boundary, guardrails, rate limits | ⏳ Not Started | P0 | `/plan` | `project-planner`, `writing-plans`, `supabase` |
| 6.2 | Follow-up prioritization — rank Customers by overdue + recency | ⏳ Not Started | P1 | `/build` | `project-planner`, `supabase` |
| 6.3 | Smart Customer summary — last 30 days entries/payments + suggested action | ⏳ Not Started | P1 | `/build` | `supabase`, `project-planner` |
| 6.4 | AI WhatsApp draft — generate EN/HI message variants with opt-in UX | ⏳ Not Started | P1 | `/plan` | `project-planner`, `writing-plans` |
| 6.5 | Anomaly detection — flag customers with 45+ days no payment | ⏳ Not Started | P2 | `/plan` | `project-planner`, `supabase` |
| 6.6 | Monthly insight card — collection trend summary | ⏳ Not Started | P2 | `/build` | `supabase`, `project-planner` |

---

## OpenCode Quick Reference

| Command | When to use | Default skills |
|---|---|---|
| `/plan` | Before any new feature | `project-planner`, `writing-plans` |
| `/build` | Implement a scoped feature | Add `supabase` for DB; add `ui-ux-pro-max` + `building-native-ui` + `react-native-skills` for UI |
| `/fix` | Bug with evidence | `systematic-debugging`, `code-reviewer` |
| `/refactor` | Structure change, no behavior change | `refactor-engineer`, `code-reviewer` |
| `/audit` | Health check / drift detection | `code-reviewer`, `verification-before-completion` |
| `/finish` | Commit + push | `finishing-a-development-branch`, `code-reviewer`, `verification-before-completion` |
| `/doc` | Write or update docs | `doc-coauthoring`, `internal-comms`, `writing-plans` |
| `/upgrade` | Expo SDK or major deps | `upgrading-expo`, `react-native-skills`, `expo-tailwind-setup` |

### Task Done Checklist

Before marking any task ✅ Done:

- [ ] Command used is logged here
- [ ] `load_skills` used is logged here
- [ ] Files changed are noted
- [ ] GitHub commit or migration URL is in the Commit column
- [ ] `npm run lint` passes
- [ ] `lsp_diagnostics` clean for changed files
- [ ] DB changes have a migration in `supabase/migrations/`
- [ ] Doc-sync checklist (`.agents/doc-sync-checklist.md`) is completed
- [ ] This STATUS.md is updated before closing the session

---

## Canonical Reference

| File | Purpose |
|---|---|
| `SYSTEM_CONTEXT.md` | Product contract, scope, non-goals |
| `AGENTS.md` | AI agent conventions |
| `docs/STATUS.md` | **This file — phase tracking and roadmap** |
| `docs/prd.md` | Full 5-phase PRD |
| `docs/ARCHITECTURE.md` | Stack, routes, offline-first, AI boundary |
| `schema.sql` | Live schema snapshot (no data) |
| `.agents/commands.md` | OpenCode command reference |
| `.agents/orchestration.md` | Deterministic pipelines |
| `.agents/skill-router.md` | Skill routing rules |
| `.agents/doc-sync-checklist.md` | Closeout checklist |
