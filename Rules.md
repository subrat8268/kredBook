# KredBook Engineering & Contribution Rules (Rules.md)

> **KredBook** is a Bharat-first credit ledger (khata) app designed for kirana owners, traders, and small merchants in India. 
> This document defines the mandatory engineering practices, visual guidelines, database protocols, and contribution workflows that **every AI coding agent and human developer MUST strictly follow**. 

---

## 1. Naming Contracts & Domain Vocabulary

To prevent confusion and cognitive drift, all components, database mappings, and documentation must use unified terminology:

* **Canonical Domain Nouns**:
  - **Customer**: A buyer/merchant who has outstanding credit. Do *not* refer to customers as "Parties" in front-end UI.
  - **Entry**: A recorded sale transaction (invoice / credit bill). Do *not* refer to entries as "Orders" in front-end UI.
  - **Payment**: A recorded credit repayment made by a customer.
* **App Tabs & Screens**:
  - **Dashboard**: Outstanding overview and overdue collections.
  - **People**: The directory of customers.
  - **Entries**: Chronological lists of entries.
  - **Profile**: Business details, bank settings, preferences, and CSV exports.
* **Deprecated & Legacy Nouns**:
  - *Supplier* and *Product* features are completely out of scope. Do not create screens or routes for them.
* **Code-Level Exceptions**:
  - Where database tables still use legacy terms (e.g., `parties` table or `orders` table), you must wrap the front-end code with alias selectors and add inline comments: `/* legacy/transitional database wrapper */`.

---

## 2. Database Schema & Migration Rules

* **No Schema Guessing**: Never guess the database layout. Always inspect [Schema.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/Schema.md) or introspect the active Supabase project `sfmoefgjmgkwvauyaiyz` using Supabase MCP/CLI tools.
* **Migrations First**: All DDL changes, trigger updates, and constraint creations must be written as migration files under `supabase/migrations/` first. Direct production changes are strictly forbidden.
* **Composite Foreign Keys**: All entries/payments relationships must use composite foreign keys on `(id, vendor_id)` to prevent cross-vendor data exposure.
* **Audit Compliance**: Under **DPDP Act §9(3) compliance**, the deletion of any customer record must trigger `public.audit_party_delete()`. Never bypass, delete, or disable the `trg_audit_party_delete` trigger on the `parties` table.
* **Case-Insensitive Constraints**: Ensure order/entry statuses are validated case-insensitively using checked constraints (`orders.status IN ('Paid', 'Pending', 'Partially Paid')`).

---

## 3. UI/UX & Design Token Rules

All components must strictly align with the design specifications detailed in [DESIGN.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/DESIGN.md).

* **No Hardcoded Values**:
  - Hardcoded hex colors and pixel paddings are forbidden in components.
  - Query tokens dynamically using the `useTheme()` hook:
    ```typescript
    import { useTheme } from "@/src/theme/useTheme";
    const t = useTheme();
    // Use t.colors.canvas, t.spacing[4], t.radius.lg, etc.
    ```
* **Platform Shadow Enforcement**:
  - **iOS/Web**: Must use explicit styling: `shadowColor`, `shadowOffset`, `shadowRadius`, `shadowOpacity`.
  - **Android**: Must use native `elevation` attribute.
  - **Dark Mode**: Avoid bright shadow halos; drop shadow opacities to zero or use pure black offsets as specified in *DESIGN.md Section 11*.
* **Touch Targets & Geometry**:
  - Minimum touch targets: **44 x 44 dp** (iOS) and **48 x 48 dp** (Android).
  - Main app Tab Bar height is locked at **64px** (+ bottom safe area inset).
* **Iconography**:
  - Standard library is `lucide-react-native`.
  - Use stroke-based icons only. Outlined and filled variants must never be mixed in the same container.
* **Tabular Numbers**:
  - All numerical currency displays must use tabular formatting (`"tnum"`) to maintain correct vertical alignment.

---

## 4. State Management & Data Fetching Rules

* **Offline-First Integrity**:
  - KredBook uses TanStack Query (React Query) backed by MMKV persistent caching.
  - Offline mutation states are queued in `src/lib/syncQueue.ts` and replayed on reconnection.
  - Never bypass the sync queue or remove offline caching handlers during refactoring.
* **Query Key Invalidation**:
  - After mutations (e.g., recording a payment), always invalidate all relevant cache keys to keep components in sync:
    ```typescript
    queryClient.invalidateQueries({ queryKey: orderKeys.all(profile.id) });
    queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
    ```
* **Data Loaders**:
  - Use loading skeleton indicators (`SkeletonCard`, `SkeletonHeroCard`) instead of full-screen loaders where possible to maintain perceived loading speed.

---

## 5. Navigation, Routes & Safe Area Rules

* **Entrypoint Guarding**:
  - `app/_layout.tsx` is the root coordinator of all routing, auth sessions, and onboarding checks. Modifying redirect logic here must be done with extreme care.
* **Header Layout Rules**:
  - Screen headers must remain lightweight. Actions like PDF Download or Share belong in contextual lists or the ⋮ header overflow menu, not as standalone top header buttons.
* **Safe Insets**:
  - All absolute bottom-pinned buttons, sheets, and tab bars must inspect and respect bottom safe area insets via `useSafeAreaInsets` to prevent clipping behind OS gesture navigation pills:
    ```typescript
    const insets = useSafeAreaInsets();
    const paddingBottom = Math.max(insets.bottom, 12);
    ```

---

## 6. Documentation Sync Rule

To prevent outdated documentation ("doc drift"):
> **Rule**: Any change to application behavior, API signatures, database schemas, styling tokens, or routing structures **MUST update the corresponding markdown document in the same commit**.

* Update [PRD.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/PRD.md) for product changes.
* Update [TRD.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/TRD.md) for database/API changes.
* Update [AppFlow.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/AppFlow.md) for routing or flow modifications.
* Update [DESIGN.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/DESIGN.md) for styling adjustments.
* Update [Schema.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/Schema.md) for tables/triggers changes.
* Update [docs/STATUS.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/docs/STATUS.md) to log completed steps.

---

## 7. Pre-Commit Quality Checks

Before submitting any commit or claiming a task is complete, developers and AI agents must verify:

- [ ] **Linting**: Run `npm run lint` and verify zero errors.
- [ ] **LSP Diagnostics**: Ensure code files are clean of syntax warnings.
- [ ] **Layout Parity**: Test on both iOS and Android to check for safe-area clipping and scroll boundaries.
- [ ] **Theme Parity**: Verify design components look consistent in both Light and Dark modes.
- [ ] **Offline Replay**: Test offline recording and verify queue replay mechanics.
