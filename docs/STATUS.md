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

## ⚡ Next Up (Priority Queue)

> Updated 2026-06-09. Entry Detail (all states P0–P10) is fully built,
> audited, and locked. Edit Entry 4.2.4a + 4.2.4b are done.
> Immediate next tasks in order:
> 1. 4.1.5d.5 — Customer Detail final safe-area verification (closeout)
> 2. 4.2.4c — Edit Entry screenshot polish
> 3. 4.2.1a — Customer List audit (do NOT start before 4.1.5d.5 is closed)

---

## Active Product Surface

| Area | Status | Notes |
|---|---|---|
| Authentication | ✅ Working | `app/_layout.tsx` owns auth/onboarding redirects |
| Dashboard | ✅ Working | Outstanding-first overview, overdue collection hero |
| People (Customers) | ✅ Working | Add / list / search / detail |
| Entries | ✅ Working | Create / list / detail |
| Payments | ✅ Working | Record + context |
| Profile | ✅ Working | Business details, account management, app preferences, CSV export — [f6f73dd](https://github.com/subrat8268/kredBook/commit/f6f73dd26efd79c04d6cd1e594455988cb83430b) |
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
- **4.4.1 (Profile redesign) is partially done** — basic screen shipped in [f6f73dd](https://github.com/subrat8268/kredBook/commit/f6f73dd26efd79c04d6cd1e594455988cb83430b). Full design-system-aligned redesign still pending. Do not mark 4.4.1 Done until UPI QR + danger zone + settings section are complete.
- Customer picker bottom-sheet now reserves explicit footer space + Android bottom inset to avoid list clipping behind gesture navigation.
- **Customer Detail sticky collect bar** — `useSafeAreaInsets` must be wired so `paddingBottom` respects Android gesture nav area. This is the last open item in 4.1.5d before closeout.
- **Global FAB removed from Customer Detail** — Detail screens use contextual actions only. FAB belongs on broad/global screens (Dashboard, Customer List, Entry List).
- **Header icons on Customer Detail** — Share and PDF removed from header; they exist in Quick Actions only. Call and WhatsApp remain in header.
- **Shared detail header migration** — `DetailHeader` now powers Entry Detail, Entry Edit, Customer Detail, and Profile Edit. Keep future detail screens on the same back/action chip pattern.
- **Entry Detail P0 component build COMPLETE** — all P0 components are built, verified, and locked.
- **P6 Success State**: The 4-second inline success banner has been completely removed. It is replaced permanently by the custom full-screen `PaymentSuccessAnimation` overlay that triggers immediately on payment record.
- **OverflowMenu component** — new shared component at
  `src/components/layer2/OverflowMenu.tsx`. Used by Entry Detail header.
  Icon prop must be a bare Lucide element — no View wrapper.
- **DetailHeader shared component** — `src/components/layer2/DetailHeader.tsx`
  now powers Entry Detail, Edit Entry, Customer Detail, Profile Edit.
  Entry Detail uses: back + title + date + ⋮ overflow only. No call button in header.
- **EntrySummaryCard component** — new shared component at `src/components/entries/EntrySummaryCard.tsx`. Used by both Create Entry and Edit Entry screens to display outstanding balance summary.
- **EntryQuickActions dead code** — `src/components/entries/EntryQuickActions.tsx` is completely unused. Edit/Delete live in overflow. Remind lives in Action Bar. Scheduled for deletion.

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
| 2.7 | Regenerate `database.types.ts` from live Supabase | ✅ Done | `/fix` | `supabase`, `project-planner` | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eaca2f793956d2) |
| 2.8 | Refresh `schema.sql` from live Supabase (no-data ref) | ✅ Done | `/audit` | `supabase` | [22cbed5](https://github.com/subrat8268/kredBook/commit/22cbed521a992fe0d032fcbf74eace2f793956d2) |
| 2.9 | Rename storage bucket `product-images` → `avatars` | ✅ Done | `/refactor` | `refactor-engineer`, `supabase` | [dea2297](https://github.com/subrat8268/kredBook/commit/dea22974108ac94a7f677919d9c37234cb2d9b18) |
| 2.10 | Add RPC `get_dashboard_summary` (single-query dashboard) | ✅ Done | `/build` | `project-planner`, `supabase` | [dea2297](https://github.com/subrat8268/kredBook/commit/dea22974108ac94a7f677919d9c37234cb2d9b18) |

---

## Phase 3 — Experience Upgrades ✅ Done

**Goal:** Dark mode, WhatsApp-first sharing, overdue polish, offline resilience.

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
| 3.11 | Customer search improvements — debounce + fuzzy match + highlight | ✅ Done | P2 | `/build` | `react-native-skills`, `project-planner`, `code-reviewer` |
| 3.12 | Entries + People filter chips | ✅ Done | P2 | `/plan` | `project-planner`, `writing-plans` |
| 3.13 | Export hardening — validate CSV totals, locale-safe formatting | ✅ Done | P2 | `/audit` | `supabase`, `code-reviewer` |
| 3.14 | Pre-Phase 4 bug sweep — 7 screen flow bugs fixed | ✅ Done | P0 | `/fix` | `systematic-debugging`, `code-reviewer` | [4346bda](https://github.com/subrat8268/kredBook/commit/4346bda) |

---

## Phase 4 — UI/UX Redesign 🔄 In Progress

### Mandatory Screen Redesign Routine

Apply this routine to every remaining Phase 4 screen before marking it `✅ Done`.

1. Functional audit
2. Component extraction / refactor if screen is too large
3. Premium redesign implementation
4. Screenshot audit
5. Bug + UX polish pass
6. Flow verification
7. Docs/status closeout

#### Completion Criteria (Required)

- `npm run lint` passes
- Main happy path works end-to-end
- Empty/loading/error states checked
- Keyboard and safe-area behavior checked
- Dark mode checked
- Screenshots reviewed
- No broken navigation contracts
- Docs updated
- Status row updated only after screenshot audit

#### Phase 4 Quality Note

- Dashboard is the quality benchmark.
- No remaining Phase 4 screen should be marked `✅ Done` after only one build pass.
- Use sub-rows like `4.x.a` refactor, `4.x.b` redesign, `4.x.c` screenshot polish when needed.

### Phase 4.0 — Design System Foundation ✅ Done

> ⚠️ This block gates all other 4.x tasks. All 4.0.x are done.

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

### Phase 4.1 — Core Loop Screens (Daily Driver) 🔄 In Progress

> Depends On: All of 4.0 ✅ Done
> **This is the most important block. Complete 4.1.1x, 4.1.4, and 4.1.5 before any 4.2/4.3/4.4 work.**

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.1.1 | Dashboard redesign — hero card, quick stats row, activity feed, SpeedDialFAB | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps`, `react-native-skills` | `(main)/dashboard/index.tsx` ([f690c3c](https://github.com/subrat8268/kredBook/commit/f690c3c)) |

### Phase 4.1.1x — Dashboard code health & UX polish

> Depends On: 4.1.1 ✅ Done
> **Do not start any 4.2/4.3/4.4 work until every row in this block is ✅ Done.**

| # | Task | Status | Priority | Command | Skills | Screen/Files |
|---|---|---|---|---|---|---|
| 4.1.1x.1 | Split the dashboard route into a thin wrapper plus `DashboardScreen` orchestrator | ✅ Done | P0 | `/refactor` | `refactor-engineer`, `code-reviewer` | `app/(main)/dashboard/index.tsx`, `src/features/dashboard/**/*` |
| 4.1.1x.2 | Normalize dashboard data access and derived metrics into a feature hook + logic layer | ✅ Done | P0 | `/refactor` | `refactor-engineer`, `systematic-debugging` | `src/hooks/useDashboard.ts`, `src/api/dashboard.ts`, `src/features/dashboard/logic/**/*` |
| 4.1.1x.3 | Extract dashboard hero, stats, activity, empty, and payment-flow UI into token-aligned components | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `building-native-ui`, `react-native-skills` | `src/features/dashboard/components/**/*`, `src/components/dashboard/DashboardHeader.tsx`, `src/components/dashboard/StatusBadge.tsx` |
| 4.1.1x.4 | Tighten loading, empty, error, and quick-action states without changing core flows | ✅ Done | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `src/features/dashboard/components/**/*`, `src/components/ui/Skeleton.tsx` |
| 4.1.1x.5 | Split brand vs success vs hero token usage and wire Dashboard semantics | ✅ Done | P1 | `/refactor` | `refactor-engineer`, `ui-ux-pro-max` | `src/utils/theme.ts`, `tailwind.config.js`, `src/features/dashboard/components/**/*` |
| 4.1.1x.6 | Normalize Dashboard section spacing and typography rhythm with shared tokens | ✅ Done | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `src/utils/theme.ts`, `tailwind.config.js`, `src/features/dashboard/components/**/*` |
| 4.1.1x.7 | Improve dark-mode contrast and light/dark parity for Dashboard token surfaces | ✅ Done | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `src/utils/theme.ts`, `src/features/dashboard/components/**/*` |
| 4.1.1x.8 | Strengthen follow-up and activity empty/error affordances with semantic cues | ✅ Done | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `src/features/dashboard/components/**/*` |
| 4.1.2 | Tab navigation redesign — theme-aware tab bar, lucide icons, SpeedDialFAB record-payment routing fix | ✅ Done | P0 | `/refactor` | `ui-ux-pro-max`, `react-native-skills` | `(main)/_layout.tsx` ([fa4f3b2](https://github.com/subrat8268/kredBook/commit/fa4f3b24e2ca07a2edb27f42a410a94ca02ffcad)) |
| 4.1.3 | Create Entry redesign — full-screen numpad, bottom sheet customer picker, quick due-date chips | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/create.tsx` ([5d588b8](https://github.com/subrat8268/kredBook/commit/5d588b8)) |
| 4.1.3a | Create Entry bug fixes — params override draft, due-date format normalization, numpad guard, Bill/Payment toggle, recent customers first | ✅ Done | P0 | `/fix` | `systematic-debugging`, `react-native-skills`, `ui-ux-pro-max` | `(main)/entries/create.tsx`, `CustomerPicker.tsx`, `BillFooter.tsx` |
| 4.1.3b | Create Entry UX redesign — remove SpeedDialFAB, save/share split buttons, progressive disclosure, Bill Mode with line items, modern visual standards | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills`, `code-reviewer` | `(main)/entries/create.tsx`, `BillFooter.tsx` ([3f6ab2b](https://github.com/subrat8268/kredBook/commit/3f6ab2b6793254a8d86c9ddacf6a56ce40c10c2d)) |
| 4.1.3c | Create Entry hotfix pass — payment clarity, due-date single picker, draft cleanup, formatINR, bill-item tap-to-edit, fractional qty, haptics, +New Person shortcut, avatar fix | ✅ Done | P0 | `/fix` | `systematic-debugging`, `react-native-skills`, `ui-ux-pro-max`, `code-reviewer` | `(main)/entries/create.tsx`, `CustomerPicker.tsx`, `BillFooter.tsx` ([5b036be](https://github.com/subrat8268/kredBook/commit/5b036be62e8e12d95f916e3dfc4d61a61b4763b1)) |
| 4.1.3d | Create Entry screenshot audit fixes — header toggle cleanup, duplicate total removal, custom chip state, share CTA polish, spacing, and numpad compliance | 🔄 In Progress | P0 | `/fix` | `systematic-debugging`, `react-native-skills`, `ui-ux-pro-max`, `code-reviewer` | `(main)/entries/create.tsx`, `BillFooter.tsx` |
| 4.1.3e | Customer picker redesign — compact rows, recents, balance-first hierarchy, default due-first selection UX | ✅ Done | P0 | `/build` | `react-native-skills`, `ui-ux-pro-max` | `CustomerPickerSheet.tsx`, `(main)/entries/create.tsx`, `recentCustomers.ts` |
| **4.1.4** | **Record Payment modal redesign — customer-led header, amount hero, Full/Partial intent, native keyboard, payment method cards, notes collapsed, intent-specific CTA** | **✅ Done** | **P0** | `/build` | `ui-ux-pro-max`, `react-native-skills` | `RecordCustomerPaymentModal` (shared) |
| 4.1.4a | Record Payment payment-console form pass — shared numpad util, stable sheet sizing, intent toggle, compact chips, collapsed notes | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills`, `code-reviewer` | `RecordPaymentModal` (shared), `src/utils/numpad.ts` |
| 4.1.4b | Record Payment result/receipt polish — confirmed + queued premium receipt states and CTA hierarchy | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `code-reviewer`, `verification-before-completion` | `RecordPaymentResult.tsx`, `docs/flows/record-payment.md` ([40203532](https://github.com/subrat8268/kredBook/commit/40203532f66dfb1bf6cb540934b7c359d481cb53)) |
| **4.1.5** | **Customer Detail redesign — identity header, balance hero, sticky collect bar (scroll-triggered), transaction timeline, contextual quick actions** | **🔄 In Progress** | **P0** | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/people/[customerId].tsx` |
| 4.1.5a | Customer Detail refactor — extract route UI into focused customer-detail components without behavior change | ✅ Done | P0 | `/build` | `refactor-engineer`, `code-reviewer`, `verification-before-completion` | `(main)/people/[customerId].tsx`, `src/components/people/customer-detail/*` ([363018262](https://github.com/subrat8268/kredBook/commit/363018262172e5acf7de6c6d6ec89c66747703b3)) |
| 4.1.5b | Customer Detail premium redesign — identity header, balance hero labels, sticky collect bar, secondary quick actions, timeline polish | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `frontend-design`, `code-reviewer` | `(main)/people/[customerId].tsx`, `src/components/people/customer-detail/*`, `docs/flows/customer-detail.md` ([6b6a66f](https://github.com/subrat8268/kredBook/commit/6b6a66f3093c2793207c694918f211d15a038ebe)) |
| 4.1.5c | Customer Detail screenshot polish — hero label contrast, quick-action press states, sticky bar shadow/elevation, haptics on Collect, timeline padding, share toast, WhatsApp error message, lint clean | ✅ Done | P0 | `/fix` | `ui-ux-pro-max`, `code-reviewer`, `verification-before-completion` | `(main)/people/[customerId].tsx`, `src/components/people/customer-detail/*` ([53c95fea](https://github.com/subrat8268/kredBook/commit/53c95feab2d4d6f43ac32e22a4ea874e1f744b1f)) |
| 4.1.5d | Customer Detail top-section polish — header cleanup (remove Share/PDF from header), hero metadata group, scroll-triggered sticky collect bar | 🔄 In Progress | P0 | `/build` | `ui-ux-pro-max`, `frontend-design`, `verification-before-completion` | `(main)/people/[customerId].tsx`, `src/components/people/customer-detail/*` |

---

### 4.1.5d Sub-passes

| Sub-pass | Description | Status | Commit |
|---|---|---|---|
| 4.1.5d.1 | Header cleanup — remove Share/PDF from header, keep back/avatar/name/subtitle/Call/WhatsApp only | ✅ Done | [4e6d349](https://github.com/subrat8268/kredBook/commit/4e6d3494b487ac89e9f563173d5b2f37132665da) |
| 4.1.5d.2 | Hero refinement — compact metadata row (status chip + last bill), semantic status colors, demote open-entry-due line | ✅ Done | [498fb5e](https://github.com/subrat8268/kredBook/commit/498fb5e2070f6812c269ba1354ee85c9149f96a1) |
| 4.1.5d.3 | Scroll-triggered sticky collect bar — hidden at top, appears after ~220–280px scroll, hides on scroll up, safe-area + shadow | ✅ Done | [a11a77e](https://github.com/subrat8268/kredBook/commit/a11a77e3efaadb283eec217e7e1e1850b729f3df) |
| 4.1.5d.4 | Quick actions + timeline density — `CustomerQuickActionsRow` + `CustomerTransactionTimeline` extracted, bottom padding adjusted | ✅ Done | [4e6d349](https://github.com/subrat8268/kredBook/commit/4e6d3494b487ac89e9f563173d5b2f37132665da) |
| 4.1.5d.5 | Final screenshot verification + closeout — verify safe-area on gesture-nav Android, confirm Collect opens modal with correct orderId/balance, Reminder quick action confirmed present/absent | ⏳ Pending manual verification | — |

**Open item for 4.1.5d.5 before closeout:**
- [ ] Wire `useSafeAreaInsets` in `CustomerStickyCollectBar` — `paddingBottom: Math.max(insets.bottom, 12)` — to avoid bar clipping into Android gesture area.
- [ ] Verify Collect opens `RecordCustomerPaymentModal` with correct `pendingOrderId` and `pendingOrderBalance` for a customer with a live order.
- [ ] Confirm Reminder quick action status (present or intentionally removed — document decision).
- [ ] Dark mode header/hero/sticky bar checked.
- [ ] `npm run lint` passes.

---

### 4.1.5d.1-fix — pendingOrderId gate + DB balance sync

**Status:** ✅ Done  
**Date:** 2026-05-18

What was fixed:
- Hardened pending-order detection in `fetchPersonDetail` (`src/api/people.ts`):
  - Detects open orders by financial truth (`balance_due > 0`) first, status as secondary signal.
  - Added fallback: computes due from `total_amount - amount_paid` if `balance_due` is null.
  - `usePersonDetail` signature and `PersonDetail` return shape unchanged.
- Applied Supabase migration: `sync_customer_balance_from_orders` (project: `sfmoefgjmgkwvauyaiyz`)
  - Backfilled `parties.customer_balance` from unpaid `orders.balance_due` for all customers.
  - Created trigger function `public.sync_party_customer_balance()`.
  - Attached trigger `trg_sync_customer_balance` on `public.orders` `AFTER INSERT OR UPDATE OR DELETE`.
  - DELETE path safe: trigger uses `COALESCE(NEW.customer_id, OLD.customer_id)`.

Verification:
- All 10 customers: `parties.customer_balance = expected SUM(orders.balance_due)` ✅
- Happy Singh: `customer_balance = 12555.00`, `pendingOrderId` resolves non-null ✅
- `stale_count = 0` ✅
- No schema contract changes. No modal API changes. No offline queue changes.

---

### Phase 4.2 — Detail + List Screens (Audit → Redesign → Polish)

> Depends On: 4.0 ✅ Done. **Start with Entry Detail (4.2.3) — it's closest to the money/audit flow.**
> **Each screen follows the mandatory redesign routine: audit → redesign → screenshot polish.**
> **Order: Entry Detail → Edit Entry → Customer List → Entry List**

### Phase 4.2.3 — Entry Detail P0 Component Build (Component-by-Component)

> Build order is fixed. Approve one component before moving to the next.
> Each component is locked independently — no rollbacks once approved.

| # | Component | Status | Notes | Commit |
|---|---|---|---|---|
| 4.2.3-H | Header — back, title, date, ⋮ overflow only | ✅ Done | Call button removed from header. Overflow icon is sole admin entry point. | [ddf9d9c](https://github.com/subrat8268/kredBook/commit/ddf9d9cc0cee06aef5cc4696b26ddb27b37fa7e2) |
| 4.2.3-P2 | ⋮ Overflow Menu — 6 items, icon+label inline, dividers, backdrop | ✅ Done | Icon+label stacking bug resolved. Bare Lucide elements confirmed. No View wrapper. | [ddf9d9c](https://github.com/subrat8268/kredBook/commit/ddf9d9cc0cee06aef5cc4696b26ddb27b37fa7e2) |
| 4.2.3-C | Customer Card — green avatar, name, phone, call+chat icons, tappable | ✅ Done | Call and chat handlers wired. Deleted customer edge case handled. |  |
| 4.2.3-Hero | Hero Card — orange gradient, balance due, pending pill, due date | ✅ Done | Status-driven gradient. Orange/Red/Blue/Green. Watermark circle top-right. |  |
| 4.2.3-Pay | Payments Card — progress track, empty state, payment rows | ✅ Done | Progress bar, payment rows, empty state. No pagination in v1. |  |
| 4.2.3-Items | Items Card — collapsed subtotal, expand/collapse, item rows | ✅ Done | Collapsed default. Auto-expand on 1 item. Subtotal ≠ grand total. |  |
| 4.2.3-AB | Action Bar — sticky bottom, Remind secondary + Record Payment primary | ✅ Done | Sticky bottom. Record Payment + Remind. Full-width Share Receipt on PAID. |  |
| 4.2.3-States | PARTIAL (P9) + PAID (P10) + OVERDUE (P8) states | ✅ Done | P8 Overdue, P9 Partial, P10 Paid all built and verified. |  |

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|---|
| 4.2.4a | Edit Entry audit + extraction | ✅ Done | P2 | `/audit` | `code-reviewer`, `refactor-engineer` | `(main)/entries/[orderId]/edit.tsx` | [41580ae](https://github.com/subrat8268/kredBook/commit/41580ae) |
| 4.2.4b | Edit Entry premium redesign | ✅ Done | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/[orderId]/edit.tsx` | [41580ae](https://github.com/subrat8268/kredBook/commit/41580ae) |
| 4.2.4c | Edit Entry screenshot polish + verification | ⏳ Not Started | P2 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(main)/entries/[orderId]/edit.tsx` |
| 4.2.1a | Customer List audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(main)/people/index.tsx` |
| 4.2.1b | Customer List premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/people/index.tsx` |
| 4.2.1c | Customer List screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(main)/people/index.tsx` |
| 4.2.2a | Entry List audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(main)/entries/index.tsx` |
| 4.2.2b | Entry List premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/index.tsx` |
| 4.2.2c | Entry List screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(main)/entries/index.tsx` |

### Phase 4.3 — Auth + Onboarding (Audit → Redesign → Polish)

> Depends On: 4.0 ✅ Done. Can run in parallel with 4.2 after 4.1 is complete.
> **Each screen follows the mandatory redesign routine: audit → redesign → screenshot polish.**
> **Order: Welcome → Login → Signup → Reset Password → Phone Setup → Onboarding Business → Onboarding Bank → Onboarding Ready**

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.3.1a | Welcome screen audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `app/index.tsx` |
| 4.3.1b | Welcome screen premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps`, `react-native-skills` | `app/index.tsx` |
| 4.3.1c | Welcome screen screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `app/index.tsx` |
| 4.3.2a | Login audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(auth)/login.tsx` |
| 4.3.2b | Login premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/login.tsx` |
| 4.3.2c | Login screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(auth)/login.tsx` |
| 4.3.3a | Signup audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(auth)/signup.tsx` |
| 4.3.3b | Signup premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/signup.tsx` |
| 4.3.3c | Signup screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(auth)/signup.tsx` |
| 4.3.4a | Reset Password audit + extraction | ⏳ Not Started | P2 | `/audit` | `code-reviewer`, `refactor-engineer` | `(auth)/resetPassword.tsx` |
| 4.3.4b | Reset Password premium redesign | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/resetPassword.tsx` |
| 4.3.4c | Reset Password screenshot polish + verification | ⏳ Not Started | P2 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(auth)/resetPassword.tsx` |
| 4.3.5a | Phone Setup audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(auth)/phone-setup.tsx` |
| 4.3.5b | Phone Setup premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/phone-setup.tsx` |
| 4.3.5c | Phone Setup screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(auth)/phone-setup.tsx` |
| 4.3.6a | Onboarding Business audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(auth)/onboarding/business.tsx` |
| 4.3.6b | Onboarding Business premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/business.tsx` |
| 4.3.6c | Onboarding Business screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(auth)/onboarding/business.tsx` |
| 4.3.7a | Onboarding Bank audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(auth)/onboarding/bank.tsx` |
| 4.3.7b | Onboarding Bank premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/bank.tsx` |
| 4.3.7c | Onboarding Bank screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(auth)/onboarding/bank.tsx` |
| 4.3.8a | Onboarding Ready audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(auth)/onboarding/ready.tsx` |
| 4.3.8b | Onboarding Ready premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(auth)/onboarding/ready.tsx` |
| 4.3.8c | Onboarding Ready screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(auth)/onboarding/ready.tsx` |

### Phase 4.4 — Profile, Export + Public Ledger (Audit → Redesign → Polish)

> Depends On: 4.0 ✅ Done, 4.1 ✅ Done, 4.2 + 4.3 ✅ Done
> ⚠️ **4.4.0 — Profile screen has partial implementation shipped** ([f6f73dd](https://github.com/subrat8268/kredBook/commit/f6f73dd26efd79c04d6cd1e594455988cb83430b)). See Drift Watchlist.
> **Each screen follows the mandatory redesign routine: audit → redesign → screenshot polish.**
> **Order: Profile → Profile Edit → Export → Public Ledger**

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.4.1a | Profile audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(main)/profile/index.tsx` |
| 4.4.1b | Profile premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/profile/index.tsx` |
| 4.4.1c | Profile screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(main)/profile/index.tsx` |
| 4.4.2a | Profile Edit audit + extraction | ⏳ Not Started | P2 | `/audit` | `code-reviewer`, `refactor-engineer` | `(main)/profile/edit.tsx` |
| 4.4.2b | Profile Edit premium redesign | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/profile/edit.tsx` |
| 4.4.2c | Profile Edit screenshot polish + verification | ⏳ Not Started | P2 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(main)/profile/edit.tsx` |
| 4.4.3a | Export audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `(main)/export/index.tsx` |
| 4.4.3b | Export premium redesign | ⏳ Not Started | P1 | `/refactor` | `refactor-engineer`, `react-native-skills` | `(main)/export/index.tsx` |
| 4.4.3c | Export screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `(main)/export/index.tsx` |
| 4.4.4a | Public Ledger audit + extraction | ⏳ Not Started | P1 | `/audit` | `code-reviewer`, `refactor-engineer` | `app/l/[token].tsx` |
| 4.4.4b | Public Ledger premium redesign | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `project-planner` | `app/l/[token].tsx` |
| 4.4.4c | Public Ledger screenshot polish + verification | ⏳ Not Started | P1 | `/fix` | `systematic-debugging`, `verification-before-completion` | `app/l/[token].tsx` |

---

## Phase 5 — Documents + Collection ⏳ Not Started

> 💡 **Pull-forward candidate:** 5.3 (UPI collect link) can move into Phase 4.4 since UPI ID is already in Profile. Discuss before starting Phase 4.4.

| # | Task | Status | Priority | Command | Skills |
|---|---|---|---|---|---|
| 5.1 | PDF Customer statement — Edge Function generates PDF, stores in Supabase Storage, share via WhatsApp | ⏳ Not Started | P1 | `/build` | `supabase`, `project-planner` |
| 5.2 | Entry PDF — single Entry receipt shareable via WhatsApp | ⏳ Not Started | P2 | `/build` | `supabase`, `project-planner` |
| 5.3 | UPI collect link + QR on Customer balance screen | ⏳ Not Started | P1 | `/build` | `project-planner`, `react-native-skills` |
| 5.4 | Receipt-friendly sharing flow — polish and test end-to-end | ⏳ Not Started | P2 | `/plan` | `project-planner`, `writing-plans` |
| 5.5 | Referral prompt after successful payment — lightweight share + deep link | ⏳ Not Started | P3 | `/build` | `ui-ux-pro-max`, `project-planner` |

---

## Phase 6 — AI Assistance ⏳ Not Started

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
