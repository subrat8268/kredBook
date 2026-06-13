# KredBook Technical Requirements Document (TRD)

> **Version:** 2.2  
> **Last Updated:** 2026-06-13  
> **Status:** Active · Phase 4 (UI/UX Redesign)  
> **Target:** Engineers, AI agents, and core codebase contributors  
> **Engineering Counterpart to:** [PRD.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/PRD.md)

---

## 1. Document Purpose & Scope

This document specifies the technical requirements, architecture, API contracts, state management guidelines, offline queues, security rules, and code standards for the KredBook mobile application.

### PRD vs. TRD Focus
* **Product Requirements Document ([PRD.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/PRD.md))**: Defines the *what* and *why* (user personas, business goals, core loops, product scope, and functional success metrics).
* **Technical Requirements Document (TRD.md)**: Defines the *how* and *where* (architectural patterns, database contracts, API function signatures, sync queue serialization, navigation guards, design system wiring, security policies, and technical debt).

### Document Usage
* **Developers & Contributors**: Must consult this document before adding features or refactoring modules to ensure they align with the design patterns (Zustand vs. TanStack Query), data consistency triggers, and offline queue policies.
* **AI Coding Agents**: Use this file as a strict technical constraint system. Any code output or implementation plan must verify it does not contradict these rules.

### Document Precedence & Traceability
If contradictions arise, the order of priority is:
1. [PRD.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/PRD.md) (Product scope & principles)
2. `Schema.md` (Database structures & constraints)
3. `TRD.md` (Engineering contract)

---

## 2. System Architecture

KredBook is built as a single-mode client application using Expo (React Native) with a Supabase PostgreSQL backend.

### ASCII Architecture Layer Diagram
```
┌────────────────────────────────────────────────────────────────────────┐
│ App Router Layer (app/ index, _layout, (auth) onboarding, (main) tabs) │
├────────────────────────────────────────────────────────────────────────┤
│ Presentation Layer (src/features/ components, screens, src/components) │
├────────────────────────────────────────────────────────────────────────┤
│ Hook Layer (src/hooks/ entries/useEntryDetail, useAuth, useNetworkSync) │
├────────────────────────────────────────────────────────────────────────┤
│ Store Layer (Zustand: authStore, preferencesStore, orderStore, lang)   │
├────────────────────────────────────────────────────────────────────────┤
│ API Client & Queue Layer (src/api/, src/lib/syncQueue, mmkvPersister)  │
├────────────────────────────────────────────────────────────────────────┤
│ Network Protocol Layer (Supabase JS Client + RLS Security Policies)    │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Execution Path
```
[User Action] ──► [Hook / Component] ──► [Zustand / TanStack Mutate]
                                                  │
               ┌──────────────────────────────────┴──────────────────────────────────┐
               ▼ (Is Network Connected?)                                             ▼
          [CONNECTED]                                                           [OFFLINE]
               │                                                                     │
         [api/ Call]                                                           [syncQueue.ts]
               │                                                                     │
    [Supabase (PostgreSQL)]                                                     [MMKV Saved]
               │                                                                     │
 [Database Triggers / RPC]                                                  [Banner Status Alert]
               │                                                                     │
      [Success Response]                                                    [Optimistic Success]
               │                                                                     │
   [Query Cache Invalidation]                                               [Pending Sync Replay]
```

### Service Boundaries

* **Client App**: Runs Expo runtime, Zustand client state, offline MMKV queue manager, local push notifications (`expo-notifications`), and local PDF generators (`expo-print`).
* **Supabase Core**: Database tables, indexes, generated column evaluations, and row recalculation triggers.
* **Edge Functions**: Runs exports (`net-position-export`) and handles future Phase 5/6 UPI integrations and AI prompt prioritizing/summarizing calculations.

### Cold Start Boot Sequence
1. Boot initiates via [app/_layout.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/_layout.tsx) -> calls `preventAutoHideAsync()` for splash control.
2. Initialize secure storage session keys -> `getOrCreateSyncQueueKey()`.
3. In parallel, run `Promise.all`: check welcome walkthrough (`hasSeenWelcome`), resolve preferences (`loadLanguage`), and boot the local mutation replayer (`initializeSyncQueue`).
4. Read cached server state from MMKV persister via `PersistQueryClientProvider`.
5. Trigger `useAuth()` subscription -> read active session via `supabase.auth.getSession()` and setup `onAuthStateChange` listeners.
6. Verify profile settings -> redirects un-onboarded accounts, hides splash screen, and renders.

---

## 3. Database Contract

All database structures and constraints are defined in [Schema.md](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/Schema.md).

### Table Operations Map

| Table Name | App READ Access | App WRITE Access | Managed Natively by DB Triggers / RPC |
| :--- | :--- | :--- | :--- |
| `profiles` | Read vendor profile | Update business details | Created automatically by auth user trigger |
| `parties` | Read customer info | Create/update/delete | Sync balance trigger |
| `orders` | Read entries / bills | Create/delete | Generated column `balance_due`, status updates |
| `order_items` | Read entry line items | Create/delete | Generated column `subtotal` |
| `payments` | Read payment receipts | Insert collections | Auto-recalculates order balances |
| `access_tokens` | Read shared links | Create/delete | Handled via RPC hashing/validation |

### Generated Stored Columns (App MUST NOT Write)
* `orders.balance_due`: Evaluated as `(total_amount - amount_paid)`.
* `order_items.subtotal`: Evaluated as `(price * quantity)`.

### Trigger-Managed Fields (App MUST NOT Set Natively)
* `orders.status`: Determined by DB trigger `on_payment_upsert` (runs `update_order_status()` matching `Paid`, `Partially Paid`, or `Pending`).
* `orders.amount_paid`: Automatically updated on inserting/modifying `payments` table rows.
* `parties.customer_balance`: Recalculated as the sum of unpaid `orders.balance_due` via trigger `trg_sync_customer_balance`.

### Row-Level Security (RLS) & Scope
RLS is enabled on all client-accessible tables. The security scope restricts queries to the authenticated session:
```sql
vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```
`profiles` uses `auth.uid() = user_id` directly.

### Known Issues & Mitigations
* **Duplicate RLS Policies**: Multiple schema policies are duplicated (e.g. `order_items` contains both `"Vendors can delete own order items"` and `"delete_own_order_items"`; `orders`, `payments`, and `profiles` have similar duplicates). Consolidate these in a future database cleanup migration.
* **Customer Balance Inconsistencies**: `parties.customer_balance` is sometimes updated programmatically in app code alongside Postgres triggers. In [fetchPersonDetail](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/people.ts#L122), KredBook validates the client-calculated ledger total against `parties.customer_balance`. If they differ by more than ₹0.01, it warns in development and raises `reconciliationWarning`. The long-term fix is to remove all client-side balance write actions and delegate balance syncs entirely to `trg_sync_customer_balance`.

### Migration Guidelines
* No direct DDL execution on Supabase. All schema alterations must reside in sequentially versioned scripts under `supabase/migrations/`.
* Running migrations push: `npx supabase db push`.
* Generate updated TypeScript definitions: `npx supabase gen types typescript --project-id sfmoefgjmgkwvauyaiyz > src/types/supabase.ts`.

---

## 4. API Layer Contract (src/api/)

The API layer is placed inside [src/api/](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/) and serves as the boundary between hooks/stores and Supabase.

### API Specifications & Signatures

#### [auth.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/auth.ts)
* `loginApi(values: LoginValues): Promise<User>`
  * *Tables Touched*: Auth session.
  * *Error Shape*: Standard `Error(message)`.
* `signUpApi(values: { email: string; password: string; fullName: string }): Promise<User>`
  * *Tables Touched*: `auth.users`, `public.profiles` (via DB trigger).
* `signInWithGoogleApi(): Promise<User>`
  * *Tables Touched*: Auth session. Handles WebBrowser redirect.
* `resetPasswordApi(email: string): Promise<void>`
  * *Tables Touched*: Auth session.
* `logoutApi(): Promise<boolean>`
  * *Tables Touched*: Auth session.

#### [profiles.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/profiles.ts)
* `getProfile(user_id: string): Promise<Profile | null>`
  * *Tables Touched*: `public.profiles`.

#### [people.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/people.ts)
* `fetchPeople(pageParam: number, vendorId: string, search?: string): Promise<Person[]>`
  * *Tables Touched*: `public.parties`, `public.orders`.
* `addPerson(vendorId: string, values: Omit<Person, "id" | "vendor_id" | "created_at">): Promise<Person>`
  * *Tables Touched*: `public.parties`. Wrapped in `executeWithOfflineQueue` (CREATE).
* `fetchPersonDetail(customerId: string, vendorId: string): Promise<PersonDetail | null>`
  * *Tables Touched*: `public.parties`. Calls RPC `get_customer_full_detail` to resolve profile, orders, and statement events in a single round-trip.
* `deletePerson(customerId: string, vendorId: string): Promise<void>`
  * *Tables Touched*: `public.parties`. Wrapped in `executeWithOfflineQueue` (DELETE).
* `updatePerson(customerId: string, vendorId: string, values: { name: string; phone?: string | null; address?: string | null }): Promise<void>`
  * *Tables Touched*: `public.parties`. Wrapped in `executeWithOfflineQueue` (UPDATE).

#### [entries.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/entries.ts)
* `fetchOrders(pageParam: number, vendorId: string, search?: string, statusFilter?: string, sortBy?: "newest" | "oldest" | "high" | "low"): Promise<Order[]>`
  * *Tables Touched*: `public.orders`, `public.parties`.
  * *Query Pattern*: Explicitly selects parameters. Exception: uses `*, customer:parties(...)` where `*` is filtered through RLS.
* `fetchOrderDetail(orderId: string): Promise<OrderDetail | null>`
  * *Tables Touched*: `public.orders`, `public.parties`, `public.order_items`.
* `fetchPayments(orderId: string): Promise<Payment[]>`
  * *Tables Touched*: `public.payments`.
* `recordPayment(orderId: string, vendorId: string, amount: number, paymentMode: PaymentMode, markFull: boolean, notes?: string): Promise<{ status: "confirmed" | "queued" }>`
  * *Tables Touched*: `public.payments`, `public.orders`. Wrapped in `executeWithOfflineQueueResult` (CREATE).
* `recordCustomerPayment(customerId: string, vendorId: string, amount: number, paymentMode: PaymentMode, notes?: string): Promise<{ status: "confirmed" | "queued" }>`
  * *Tables Touched*: `public.payments`, `public.orders`. Distributes payment across unpaid orders sequentially (FIFO).
* `deleteOrder(orderId: string, vendorId: string): Promise<void>`
  * *Tables Touched*: `public.orders`. Wrapped in `executeWithOfflineQueue` (DELETE).
* `getNextBillNumber(vendorId: string, prefix?: string): Promise<string>`
  * *Tables Touched*: `public.orders`. Calls RPC `get_next_bill_number`. Fallback: `${prefix}-${Date.now().toString().slice(-6)}`.
* `getCustomerPreviousBalance(customerId: string, vendorId: string): Promise<number>`
  * *Tables Touched*: `public.orders`. Calls RPC `get_customer_previous_balance`. Fallback: sums unpaid balances.
* `createOrder(vendorId: string, customerId: string, items: OrderItemInput[], amountPaid: number, paymentMode?: PaymentMode, note?: string | null, loadingCharge?: number, taxPercent?: number, billNumberPrefix?: string, dueDate?: string | null): Promise<OrderDetail>`
  * *Tables Touched*: `public.orders`, `public.order_items`, `public.payments`. Calls RPC `create_order_transaction` atomically. Wrapped in `executeWithOfflineQueue` (CREATE).
* `updateOrder(orderId: string, vendorId: string, items: OrderItemInput[], loadingCharge: number, taxPercent: number, quickAmount: number, note?: string | null, dueDate?: string | null): Promise<OrderDetail>`
  * *Tables Touched*: `public.orders`, `public.order_items`. Calls RPC `update_order_transaction`. If missing (e.g. `PGRST202`), falls back to client-driven atomic deletion and insertion. Wrapped in `executeWithOfflineQueue` (UPDATE).

#### [dashboard.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/dashboard.ts)
* `getDashboardData(vendorId: string): Promise<DashboardData>`
  * *Tables Touched*: `public.payments`, `public.orders`, `public.parties`. Calls RPC `get_dashboard_summary`.
* `getNetPositionReport(vendorId: string, rangeDays?: number): Promise<NetPositionReport>`
  * *Tables Touched*: `public.orders`, `public.payments`, `public.parties`.
* `exportNetPositionReport(vendorId: string, rangeDays: number): Promise<{ pdfBase64: string; fileName?: string }>`
  * *Action*: Calls Edge Function `net-position-export`.

#### [export.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/export.ts) & [exportCustomer.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/exportCustomer.ts)
* `fetchOrdersForExport(vendorId: string, from?: string, to?: string): Promise<ExportOrder[]>`
  * *Tables Touched*: `public.orders`, `public.parties`, `public.order_items`.
* `fetchLedgerForExport(customerId: string, vendorId: string, from?: string, to?: string): Promise<LedgerExport>`
  * *Tables Touched*: `public.orders`, `public.payments`, `public.parties`, `public.profiles`.
* `fetchLedgerCsvRows(customerId: string, vendorId: string, from?: string, to?: string): Promise<Record<string, unknown>[]>`

#### [overdueReminders.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/overdueReminders.ts)
* `fetchOverdueReminders(vendorId: string): Promise<OverdueReminder[]>`
  * *Tables Touched*: `public.orders`, `public.parties`.

#### [upload.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/upload.ts)
* `uploadImage(uri: string): Promise<string>`
  * *Action*: Decodes base64 and uploads to `avatars` bucket.
* `uploadBusinessLogo(uri: string, vendorId: string): Promise<string>`
  * *Action*: Uploads to `business-logos` bucket under `logos/${vendorId}/logo.${fileExt}` (upsert true).

### Technical Rules
1. **Explicit Selection**: All database queries must declare exact columns. No `select("*")` in large lists.
2. **Error Boundary**: Database errors must pass through `toApiError(error)` (defined in `supabaseQuery.ts`) to resolve network vs validation categories.
3. **Data Mapping**: Legacies like `parties` are mapped to `customer` and `orders` to `entries` at the API edge to comply with the naming contract.

---

## 5. State Management Contract

### Zustand Stores

#### [useAuthStore](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/authStore.ts)
* *Shape Interface*:
  ```typescript
  interface AuthState {
    user: User | null;
    profile: Profile | null;
    isInitialized: boolean;
    isFetchingProfile: boolean;
    isRecoveryMode: boolean;
    setAuth: (user: User | null) => void;
    setProfile: (profile: Profile | null) => void;
    setRecoveryMode: (v: boolean) => void;
    fetchProfile: (userId: string) => Promise<void>;
    logout: () => void;
  }
  ```
* *Persistence*: Transient in-memory.
* *Reset Trigger*: `logout()` action resets state to default.

#### [usePreferencesStore](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/preferencesStore.ts)
* *Shape Interface*:
  ```typescript
  interface PreferencesState {
    colorMode: ColorMode;
    netPositionRange: NetPositionRange;
    remindersEnabled: boolean;
    remindersPermissionAsked: boolean;
    remindersPermissionDenied: boolean;
    overdueRemindersEnabled: boolean;
    overdueReminderHour: number;
    overdueReminderMinute: number;
    overdueReminderSnoozes: Record<string, number>; // customerId -> timestamp
    reminderLog: ReminderLogEntry[];
    // Actions
    setColorMode: (value: ColorMode) => void;
    toggleColorMode: () => void;
    setNetPositionRange: (value: NetPositionRange) => void;
    setRemindersEnabled: (value: boolean) => void;
    setRemindersPermissionAsked: (value: boolean) => void;
    setRemindersPermissionDenied: (value: boolean) => void;
    setOverdueRemindersEnabled: (value: boolean) => void;
    setOverdueReminderTime: (hour: number, minute: number) => void;
    snoozeOverdueReminder: (customerId: string, days?: number) => void;
    clearOverdueReminderSnooze: (customerId: string) => void;
    pruneOverdueReminderSnoozes: (now?: number) => void;
    logReminderSent: (entry: Omit<ReminderLogEntry, "id" | "createdAt">) => void;
  }
  ```
* *Persistence*: Persisted to `AsyncStorage` under storage key `"preferences-store"`.

#### [useOrderStore](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/orderStore.ts)
* *Shape Interface*: Tracks drafts of Entries (bill items list, GST, and loading charges).
* *Persistence*: Transient in-memory.
* *Reset Trigger*: `clearOrder()`.

#### [useLanguageStore](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/languageStore.ts)
* *Shape Interface*: Holds active language code (`'en' | 'hi'`).
* *Persistence*: Manually persisted to `AsyncStorage` under key `"app_language"`.

### TanStack Query Rules
* **Query Key Schema Map**:
  * `["orders"]`: All entries list
  * `["orders", vendorId, filters]`: Filtered entries list
  * `["order", orderId]`: Specific entry detail
  * `["payments", orderId]`: Entry payment list
  * `["customers"]`: All customers list
  * `["customer", customerId]`: Specific customer detail
  * `["dashboard"]`: Outstanding aggregates
* **Cache TTL Settings**:
  * `gcTime` is locked at **24 hours**.
  * `staleTime` is locked at **5 minutes**.
* **Cache Invalidation**: Mutation replays in `useNetworkSync.ts` must call explicit query client invalidations (`queryClient.invalidateQueries({ queryKey })`) to flush stale caches.

---

## 6. Offline Queue Specification (syncQueue.ts)

The offline-first architecture handles background replays when connectivity is restored.

### Queue Data Structure
* **Storage**: Encrypted MMKV instance named `kredbook-sync-queue`.
* **FIFO Bounds**: First-In-First-Out. Capped at a maximum size of **100** mutations. If exceeded, the oldest entry is discarded (`queue.shift()`).
* **Item Schema**:
  ```typescript
  interface QueuedMutation {
    id: string; // UUID v4
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: 'order' | 'customer' | 'payment';
    payload: Record<string, any>; // Serialization format
    timestamp: string; // ISO 8601
    retryCount: number; // Max 3
    lastAttemptAt?: string; // ISO 8601 for backoff
  }
  ```

### Dequeue & Replay Lifecycle
1. NetInfo transitions from offline to online -> triggers `processQueue()` in [useNetworkSync.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useNetworkSync.ts).
2. Read queue FIFO, check backoff constraint:
   * `backoffDelay = Math.min(1000 * 2^(retryCount - 1), 30000)` ms.
   * If elapsed time since `lastAttemptAt` is less than `backoffDelay`, skip processing (unless processing a dependent sequence).
3. Invoke matching API call:
   * `order / CREATE` -> `createOrder()`
   * `payment / CREATE` -> `recordPayment()`
   * `customer / CREATE` -> `addPerson()`
4. **On Success**: Remove mutation from queue (`syncQueue.remove(id)`), invalidate query cache keys, and process the next queue item.
5. **On Failure**:
   * If validation error (e.g. database constraint fails): drop mutation immediately and trigger cache invalidation to clean up optimistic client UI.
   * If network error: increment retry count (`syncQueue.incrementRetry(mutation)`).
     * If `retryCount < 3`, re-queue.
     * If `retryCount >= 3`, drop mutation permanently, fire `emitMutationDropped`, and invalidate query cache.

### Conflict Resolution
* **Reads**: Client reads local cache (MMKV) first. If offline, the client renders cached data with an offline warning banner.
* **Writes**: Modifications apply optimistically. On sync conflict, the server database state wins on subsequent reads.

### Visual Feedback Status Map
* **Offline** (`syncQueue.size() > 0 && isConnected === false`): Top status banner displays `"Offline - X changes saved locally"`.
* **Syncing** (`syncStatus === "syncing"`): Top status banner displays `"Syncing changes..."`.
* **Synced** (`syncStatus === "synced"`): Top status banner displays `"All changes synced"`.
* **Sync Error** (`hasSyncError === true`): Top status banner displays `"Sync failed • Tap to retry"`.

---

## 7. Authentication & Session Contract

### Auth Setup
* **Providers**: Email / Password and Google OAuth.
* **Session Storage**: Access/refresh tokens and user session data are stored chunked in iOS Keychain via [secureStorage.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/lib/secureStorage.ts) in 1800-byte segments to avoid the 2048-byte iOS SecureStore key size limit.

### Cold Start Hydration Sequence
```
[App Boot] ──► [secureStorage.getItem("sb-auth-token")]
                     │
                     ├── (Chunks found? Reassemble 1800B segments)
                     ▼
             [Hydrate Session JSON]
                     │
             [supabase.auth.getSession()]
                     │
             [setAuth(user) in useAuthStore]
                     │
             [fetchProfile(user.id) in useAuthStore]
                     ├── (Profile exists? Hydrate store & route)
                     └── (Profile missing? Trigger fallback client upsert)
```

### Profile Creation Fallback
If the database trigger fails to create a `profiles` row during auth signup, `useAuthStore.fetchProfile` catches the empty response and executes a client-side upsert:
```ts
await supabase.from("profiles").upsert({ user_id: userId, name: "", onboarding_complete: false })
```

### Sign Out Cleanup
When `useLogout` is executed:
1. Calls `supabase.auth.signOut()`.
2. Resets `useAuthStore` credentials and session states.
3. Clears local cached queries from TanStack Query.
4. Removes the welcome walkthrough seen indicator (`hasSeenWelcome`) from AsyncStorage to present the landing screen on the next boot.

### Profile Error Boundary
If an authenticated session is active but profile loading fails permanently, the app redirects to `/profile-error` to prompt retry or logout.

---

## 8. Navigation & Routing Contract

### Route Guard Matrix
Managed inside [app/_layout.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/_layout.tsx#L110).

| Session State | Profile State | Target Route | Redirect Destination |
| :--- | :--- | :--- | :--- |
| Unauthenticated | N/A | `/(main)/*` | `/` or `/(auth)/login` |
| Authenticated | Missing Profile | `/(main)/*` | `/profile-error` |
| Authenticated | Missing Phone Number | `/(main)/*` | `/(auth)/phone-setup` |
| Authenticated | Onboarding Incomplete | `/(main)/*` | `/(auth)/onboarding/business` |
| Authenticated | Onboarding Complete | `/(auth)/*` | `/(main)/dashboard` |

### Deep Link Ledger Sharing
* **Public Route**: `app/l/[token].tsx` renders a read-only ledger details screen.
* **Authentication**: Bypasses auth checks and routing guards entirely.
* **Access Rules**: Unauthenticated user can view transaction history corresponding to the customer token. No write operations or other client records are exposed.

### Tab Navigator Structure
Defined under `app/(main)/_layout.tsx` containing:
1. **Dashboard** (`dashboard/index`)
2. **People** (`people/index`)
3. **Entries** (`entries/index`)
4. **Profile** (`profile/index`)

### Back Button Behaviors
* **(auth) Onboarding**: Hardware back buttons are disabled to prevent leaving the flow in an inconsistent state.
* **(main) Screens**: Pressing back on People, Entries, or Profile tabs returns the user to the Dashboard tab.
* **Modals**: Pressing back dismisses active bottom sheets or overlays.

---

## 9. Theme & Design Token Contract

All styling attributes must align to the tokens defined in [src/utils/theme.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts).

### Core Token Constraints
* **Colors**: Light mode (`colors`) and Dark mode (`darkColors`). Must use theme context hooks `useTheme()`.
* **Zero Hardcoding**: Hardcoded hex values, layout margins, or font sizes outside `theme.ts` are forbidden.
* **Dark Mode switching**: Handled via Class selectors. Tailwind maps custom variables configured in `global.css` and `tailwind.config.js`.

### Style Sheets vs ClassNames
* **Use ClassNames** (`className` NativeWind attributes) for:
  * Layout alignments (flex, flex-row, justify-between, items-center).
  * Padding and margin utilities (px-4, py-2, mb-4).
  * Typography font sizing and family bindings (text-body, font-inter-semibold).
* **Use Style Sheets** (`StyleSheet.create` or inline style props) for:
  * Dynamic values (e.g. progress bar width calculations).
  * Platform-specific shadows (`shadowColor`, `elevation`).
  * Safe area layout boundaries.

---

## 10. Component Architecture

### Structural Layers
* `src/components/ui/`: Presentation primitives (e.g. `Button.tsx`, `Input.tsx`, `OfflineBanner.tsx`).
* `src/features/`: Complex scoped components (e.g. `DashboardCard.tsx`).
* `app/`: Routing views composing presentation layouts.

### Implementation Guidelines
* **Hook Extraction**: Screens must not query the database client directly. All data fetching, queries, and mutations must be written inside custom hooks (e.g. `useEntryDetail`).
* **Shopify FlashList**: All scroll lists must be wrapped in `FlashList` from `@shopify/flash-list`.
  * Always provide an explicit `estimatedItemSize` (e.g., `estimatedItemSize={76}` for list rows).
  * Provide a unique `keyExtractor`.
  * Memoize list item renderers using `React.memo` to prevent redundant rendering cycles during scroll updates.
* **Bottom Sheets**: Implement overlays using `@gorhom/bottom-sheet`.
  * Specify explicit snap point lists (e.g. `['50%', '90%']`).
  * Always mount `BottomSheetBackdrop` as a backdrop handler.
  * Register `BottomSheetTextInput` inside sheet containers to handle keyboard offsets.

---

## 11. Error Handling Contract

### UI Error Boundaries
All top-level views and screen containers must wrap in React `ErrorBoundary` components to catch runtime crashes and display fallback screens with retry triggers.

### Sentry Logging
* **Initialization**: Handled at startup via `initSentry()`.
* **PII Scrubbing**: Sentry breadcrumbs and exception objects must strip customer names, phone numbers, and addresses.
  ```typescript
  // Example sanitization pattern in Sentry options
  beforeSend(event) {
    if (event.user) {
      delete event.user.username;
      delete event.user.email;
    }
    return event;
  }
  ```

### API Error Handling Flow
All API queries must route exceptions through `toApiError(error)`:
```
Supabase client exception ──► toApiError(error) ──► Type evaluation
                                                         │
         ┌───────────────────────────────────────────────┴───────────────────────────────────────────────┐
         ▼ (Is network failure?)                                                                         ▼
   [NetworkError] ──► Queue mutation & return optimistic success.                                 [ValidationError] ──► Propagate to client.
```

---

## 12. Performance Contracts

### Performance Budgets

| Metric | Target | Verification Method |
| :--- | :--- | :--- |
| **Cold Start Time** | `< 1200ms` | Measured via Sentry SDK performance traces |
| **Screen Transition Latency** | `< 200ms` | Tested with React Native Performance Profiler |
| **Customer Search Response** | `< 300ms` | Local query filtering execution check |
| **Scroll Frame Rate** | `60fps` | Measured via React Native frame monitors |

### Virtualization & List Optimizations
* Always configure Shopify `FlashList` with explicit `estimatedItemSize` (e.g. `estimatedItemSize={76}`).
* Avoid passing inline arrow functions to list `renderItem` props. Extract item rendering to static functions.

### Image Optimization
* All user avatars and business logos must be resized to a maximum dimension of `600px` and compressed to `JPEG / WebP` format with a quality parameter of `0.80` before uploading to Supabase Storage.

---

## 13. Localization (i18n) Contract

### Namespace Structure
* Location: `src/i18n/locales/`
* Languages supported: English (`en`), Hindi (`hi`).
* namespaces:
  * `common`: Generic app copy (buttons, loading indicators).
  * `dashboard`: Dashboard statistics and priority card labels.
  * `people`: Customers list and customer detail screens.
  * `entries`: Entry creation and detail strings.
  * `onboarding`: Welcome and setup screens.

### Technical Rule
* **No hardcoded text**: User-facing copy must be resolved through translation helpers: `t("namespace.key")`.
* **Dynamic Updates**: Modifying language in `useLanguageStore.setLanguage()` calls `i18next.changeLanguage()` to update the UI immediately without requiring an app restart.

---

## 14. Build, Environment & CI/CD

### Environment Variables

| Variable Name | Purpose | Production Requirement |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase endpoint | **Mandatory** |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | **Mandatory** |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry tracking URL | Optional for Dev / **Mandatory** for Release |

### CLI Commands
* **Run Linter**: `npm run lint` (runs ESLint and Biome).
* **Build Android**: `npm run android` (`expo run:android`).
* **Build iOS**: `npm run ios` (`expo run:ios`).
* **Typescript Type Generation**:
  `npx supabase gen types typescript --project-id sfmoefgjmgkwvauyaiyz > src/types/supabase.ts`

### Pre-release Quality Checklist
- [ ] Run `npm run lint` and verify zero compilation errors and warnings.
- [ ] Run typescript type compiler check: `npx tsc --noEmit`.
- [ ] Validate RLS coverage checks on all database tables.
- [ ] Confirm Sentry source maps upload successfully on compilation builds.

---

## 15. Security Contracts

### Row Level Security (RLS)
Database RLS policies serve as the primary security boundary. Client-side query filters are for layout control only, not security enforcement.

### API Credentials Safety
* **Service Role Key**: The Supabase service role key must never be bundled inside or accessed by client-side code under any circumstances.
* **Credentials Storage**: `.env` and `.env.local` files must never be committed to repository control. Ensure they are listed in `.gitignore`.

### Public Share Links
* **Shared Ledgers**: Read-only ledger sharing endpoints (`app/l/[token]`) must only query Postgres RPC functions scoped strictly to transaction details.
* **Token revocation**: Tapping revoke deletes the access token row from `access_tokens` table, disabling the link immediately.

---

## 16. Testing Strategy

### Automated Testing Scopes

* **Unit Tests (Jest)**: Target mathematical functions (INR currency formatting, interest/GST calculation, outstanding sum reductions), schema validation schemas (Yup, Formik inputs), and offline queue serialization helpers.
* **Integration Tests (Zustand/Query)**: Validate state store actions, local MMKV cache hydration cycles, network status transitions, and offline write synchronization queues.
* **End-to-End Tests (Maestro/Detox)**: Focus on primary critical paths: Onboarding flow, Customer creation, Entry recording, and Payment collecting.

### Quality Gate Metrics
* **Code Coverage**: Minimum of **70%** code coverage required for core business hooks (`src/hooks/entries/*`, `src/hooks/people/*`) before releasing production builds.
* **Build Status**: Compiling release bundles requires 100% test pass rates and zero linter warnings.

---

## 17. Known Technical Debt

### Duplicated RLS Policies
* **Affected Tables**: `order_items`, `orders`, `payments`, `profiles`.
* **Cleanup Plan**: Consolidate duplicate policies into unified named policies in the next migration sweep.

### Customer Balance Syncing
* **Issue**: The customer's total outstanding balance is managed programmatically in some client-side hooks alongside the database trigger `trg_sync_customer_balance`.
* **Cleanup Plan**: Remove all client-side balance write actions and delegate balance syncs entirely to `trg_sync_customer_balance` to avoid data drift.

### Nomenclature Alignment
* **Issue**: The database contains reference names like `orders` (for Entries), `parties` (for Customers), and `vendor_id` (for Profile).
* **Cleanup Plan**: Map legacy names to canonical terms at the API boundary, and plan a database column renaming migration in a future major release.

---

## 18. Phase 5 Technical Prerequisites

### UPI Collection Integration
* **UPI URL Deep-Linking**: Generate standard UPI payment links using verified merchant profile variables:
  `upi://pay?pa={upi_id}&pn={business_name}&am={amount}&cu=INR`
* **QR Code Engine**: Install `react-native-qrcode-svg` to render dynamic payment QR codes on-screen.

### AI Edge Functions Scaffolding
* **Allowed Use Cases**: AI follow-up prioritization and draft WhatsApp reminders.
* **Security boundary**: Scaffolding must route through Supabase Edge Functions. Use input allowlists to filter prompt parameters and prevent prompt injection risks.

---

*This document is the technical source of truth for KredBook. Any AI agent, engineer, or external contributor must treat `TRD.md` as the primary reference for how the application is built and executed.*
