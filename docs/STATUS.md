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

> PM-reordered on 2026-05-05. Complete the core user loop before Profile polish.
> The loop is: **Add Customer → Create Entry → View What They Owe → Record Payment → See It Reflected.**

| Priority | Task | Why Now |
|---|---|---|
| 🔴 P0 — NOW | **4.1.4** Record Payment modal redesign | Every "Collect" tap lands here. The money moment. Must feel like a cash register. |
| 🔴 P0 | **4.1.5** Customer Detail redesign | Most-viewed screen after Dashboard. Balance hero + entry timeline unlocks trust. |
| 🟠 P1 | **4.2.3** Entry Detail redesign | Audit trail screen — users need to verify amounts before collecting. |
| 🟠 P1 | **4.2.2** Entry List redesign | Gateway to Entry Detail. |
| 🟠 P1 | **4.2.1** Customer List redesign | Gateway to Customer Detail. |
| 🟡 P2 | **4.3.x** Auth + Onboarding screens | First impression. Important but not blocking daily use. |
| 🟡 P2 | **4.4.1** Profile redesign | ⚠️ Partial work already shipped (see 4.4.0 below). Align + complete. |
| 🔵 Pull Forward | **5.3** UPI collect link + QR | UPI ID already in Profile. This is the highest-value Phase 5 item. Consider pulling into 4.4. |

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
> **This is the most important block. Complete 4.1.4 and 4.1.5 before any 4.2/4.3/4.4 work.**

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.1.1 | Dashboard redesign — hero card, quick stats row, activity feed, SpeedDialFAB | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `sleek-design-mobile-apps`, `react-native-skills` | `(main)/dashboard/index.tsx` ([f690c3c](https://github.com/subrat8268/kredBook/commit/f690c3c)) |
| 4.1.2 | Tab navigation redesign — theme-aware tab bar, lucide icons, SpeedDialFAB record-payment routing fix | ✅ Done | P0 | `/refactor` | `ui-ux-pro-max`, `react-native-skills` | `(main)/_layout.tsx` ([fa4f3b2](https://github.com/subrat8268/kredBook/commit/fa4f3b24e2ca07a2edb27f42a410a94ca02ffcad)) |
| 4.1.3 | Create Entry redesign — full-screen numpad, bottom sheet customer picker, quick due-date chips | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/create.tsx` ([5d588b8](https://github.com/subrat8268/kredBook/commit/5d588b8)) |
| 4.1.3a | Create Entry bug fixes — params override draft, due-date format normalization, numpad guard, Bill/Payment toggle, recent customers first | ✅ Done | P0 | `/fix` | `systematic-debugging`, `react-native-skills`, `ui-ux-pro-max` | `(main)/entries/create.tsx`, `CustomerPicker.tsx`, `BillFooter.tsx` |
| 4.1.3b | Create Entry UX redesign — remove SpeedDialFAB, save/share split buttons, progressive disclosure, Bill Mode with line items, modern visual standards | ✅ Done | P0 | `/build` | `ui-ux-pro-max`, `react-native-skills`, `code-reviewer` | `(main)/entries/create.tsx`, `BillFooter.tsx` ([3f6ab2b](https://github.com/subrat8268/kredBook/commit/3f6ab2b6793254a8d86c9ddacf6a56ce40c10c2d)) |
| 4.1.3c | Create Entry hotfix pass — payment clarity, due-date single picker, draft cleanup, formatINR, bill-item tap-to-edit, fractional qty, haptics, +New Person shortcut, avatar fix | ✅ Done | P0 | `/fix` | `systematic-debugging`, `react-native-skills`, `ui-ux-pro-max`, `code-reviewer` | `(main)/entries/create.tsx`, `CustomerPicker.tsx`, `BillFooter.tsx` ([5b036be](https://github.com/subrat8268/kredBook/commit/5b036be62e8e12d95f916e3dfc4d61a61b4763b1)) |
| 4.1.3d | Create Entry screenshot audit fixes — header toggle cleanup, duplicate total removal, custom chip state, share CTA polish, spacing, and numpad compliance | 🔄 In Progress | P0 | `/fix` | `systematic-debugging`, `react-native-skills`, `ui-ux-pro-max`, `code-reviewer` | `(main)/entries/create.tsx`, `BillFooter.tsx` |
| **4.1.4** | **Record Payment modal redesign — large numpad, partial toggle, payment method chips, WhatsApp receipt** | **⏳ Not Started** | **P0** | `/build` | `ui-ux-pro-max`, `react-native-skills` | `RecordPaymentModal` (shared) |
| **4.1.5** | **Customer Detail redesign — hero card, sticky balance bar, entry timeline, swipe actions, one-tap Collect** | **⏳ Not Started** | **P0** | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/people/[customerId].tsx` |

### Phase 4.2 — List + Detail Screens

> Depends On: 4.0 ✅ Done. Start after 4.1.4 + 4.1.5 are done.

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.2.1 | Customer List redesign — filter chips, swipe actions, sort options, alphabetical headers, empty state | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/people/index.tsx` |
| 4.2.2 | Entry List redesign — filter chips, swipe actions, date section headers, summary banner | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/index.tsx` |
| 4.2.3 | Entry Detail redesign — hero card, payment timeline, sticky "Record Payment" bar | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/[orderId].tsx` |
| 4.2.4 | Edit Entry redesign — quick due-date chips, customer reassign, unsaved changes warning | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/entries/[orderId]/edit.tsx` |

### Phase 4.3 — Auth + Onboarding

> Depends On: 4.0 ✅ Done. Can run in parallel with 4.2 after 4.1 is complete.

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

### Phase 4.4 — Profile, Export + Public Ledger

> Depends On: 4.0 ✅ Done, 4.2 ✅ Done
> ⚠️ **4.4.0 — Profile screen has partial implementation shipped** ([f6f73dd](https://github.com/subrat8268/kredBook/commit/f6f73dd26efd79c04d6cd1e594455988cb83430b)). See Drift Watchlist.

| # | Task | Status | Priority | Command | Skills | Screen |
|---|---|---|---|---|---|---|
| 4.4.0 | Profile screen — basic screen shipped (business details, account management, app preferences) | ✅ Partial | P1 | — | — | `(main)/profile/index.tsx` ([f6f73dd](https://github.com/subrat8268/kredBook/commit/f6f73dd26efd79c04d6cd1e594455988cb83430b)) |
| 4.4.1 | Profile screen redesign — complete with editable header, UPI QR, danger zone, align to design system | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/profile/index.tsx` |
| 4.4.2 | Profile Edit redesign — logo upload, UPI ID, address, sticky save bar, inline validation | ⏳ Not Started | P2 | `/build` | `ui-ux-pro-max`, `react-native-skills` | `(main)/profile/edit.tsx` |
| 4.4.3 | Export — move from standalone tab into Profile, add customer filter, email export, export history | ⏳ Not Started | P1 | `/refactor` | `refactor-engineer`, `react-native-skills` | `(main)/export/index.tsx` |
| 4.4.4 | Public Ledger redesign — business logo, UPI Pay Now button, WhatsApp CTA, mobile-responsive, KredBook footer | ⏳ Not Started | P1 | `/build` | `ui-ux-pro-max`, `project-planner` | `app/l/[token].tsx` |

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
