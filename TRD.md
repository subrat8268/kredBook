# KredBook Technical Requirements Document (TRD)

> **Version:** 1.0  
> **Last Updated:** 2026-06-13  
> **Status:** Active · Phase 4 (UI/UX Redesign)  
> **Target:** Engineers, AI agents, and core codebase contributors  
> **counterpart to:** `PRD.md`

---

## 1. Document Purpose & Scope

This document specifies the technical architecture, data structures, state management rules, and execution workflows of the KredBook application.
* **PRD vs TRD**: `PRD.md` describes the *what* and *why* (user personas, core loops, product scope). This `TRD.md` describes the *how* and *where* (code layouts, schemas, API parameters, sync queues, and error bounds).
* **Usage**: Engineers and AI coding agents must use this document alongside `PRD.md` and `schema.sql` to implement new features, audit security constraints, and verify offline integrity.
* **Precedence**: `PRD.md` holds product precedence, while `schema.sql` defines the data layer source of truth. The TRD must never contradict either.

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
[User Touch] ──► [Hook Trigger] ──► [Zustand State / TanStack Mutate]
                      │
                      ├──► [Online] ─► [api/ Call] ─► [Supabase] ─► [Query Invalidated]
                      └──► [Offline] ─► [syncQueue] ─► [MMKV Saved] ─► [Banner Status Update]
```

### Service Boundaries
* **Client App**: Runs Expo runtime, Zustand client cache, offline MMKV queue manager, local notifications (`expo-notifications`), and local PDF generators (`expo-print`).
* **Supabase Core**: Database tables, indexes, generated column evaluations, and row recalculation triggers.
* **Edge Functions**: Used for exports (`net-position-export`) and planned Phase 5/6 payment integration/AI routines.

### Cold Start Boot Sequence
1. Boot initiates via `app/_layout.tsx` -> calls `preventAutoHideAsync()` for splash control.
2. Initialize secure storage session keys -> `getOrCreateSyncQueueKey()`.
3. In parallel, run `Promise.all`: check welcome walkthrough (`hasSeenWelcome`), resolve preferences (`loadLanguage`), and boot the local mutation replayer (`initializeSyncQueue`).
4. Read cached server state from MMKV persister via `PersistQueryClientProvider`.
5. Trigger `useAuth()` subscription -> read active session via `supabase.auth.getSession()` and setup `onAuthStateChange` listeners.
6. Verify profile settings -> redirects un-onboarded accounts, hides splash screen, and renders.

---

## 3. Database Contract

All database structures and constraints are defined in [schema.sql](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/schema.sql).

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

### Migration Guidelines
* No direct DDL execution. All schema alterations must reside in sequentially versioned scripts under `supabase/migrations/`.
* Running migrations push: `npx supabase db push`.
* Generate updated types: `npx supabase gen types typescript --project-id sfmoefgjmgkwvauyaiyz > src/types/supabase.ts`.

---

## 4. API Layer Contract

The API layer is placed inside `src/api/` and acts as the interface between the stores/hooks and Supabase.

### API Specifications

#### `auth.ts`
* `loginApi(values: LoginValues)`: Logs in using email/password. Returns `User`.
* `signUpApi(values)`: Registers user, options: `{ data: { full_name: fullName } }`. Returns `User`.
* `signInWithGoogleApi()`: Google OAuth via PKCE exchange. Handles iOS/Android WebBrowser session redirect. Returns `User`.
* `resetPasswordApi(email)`: Sends password reset email. Directs callback to `Linking.createURL("/")`.
* `logoutApi()`: Logs out session. Returns `boolean`.

#### `profiles.ts`
* `getProfile(user_id: string)`: Fetches a single profile row. Returns `Profile | null`.

#### `people.ts`
* `fetchPeople(pageParam: number, vendorId: string, search?: string)`: Paged query (`range`) returning `Person[]` with outstanding balances and overdue states.
* `addPerson(vendorId: string, values)`: Inserts customer into `parties`. Wrap with `executeWithOfflineQueue` (CREATE).
* `fetchPersonDetail(customerId: string, vendorId: string)`: Calls RPC `get_customer_full_detail` to resolve customer details, chronological timelines, and check balances.
* `updatePerson(...)` & `deletePerson(...)`: Basic CRUD mutations. Wrapped in offline queue handlers.

#### `entries.ts`
* `fetchOrders(pageParam, vendorId, search, statusFilter, sortBy)`: Fetches paged entries. Uses `.select("*, customer:parties(...)")` to perform explicit column filtering.
* `fetchOrderDetail(orderId)`: Details of an entry, order items, and associated payment history.
* `createOrder(...)`: Performs transaction write by invoking RPC `create_order_transaction` atomically.
* `updateOrder(...)`: Updates order items and loading/tax charges. Falls back to manual delete-and-insert sequence if RPC `update_order_transaction` is missing.
* `recordPayment(orderId, vendorId, amount, paymentMode, markFull, notes)`: Records a collection payment. Wrapped with `executeWithOfflineQueueResult`.
* `recordCustomerPayment(customerId, vendorId, amount, paymentMode, notes)`: Distributes a bulk payment across unpaid entries sequentially (FIFO).

#### `export.ts` & `exportCustomer.ts`
* `exportNetPositionReport(vendorId, rangeDays)`: Calls Edge Function `net-position-export` to generate PDF files.
* `exportCustomerLedgerCSV(...)`: Compiles local transaction lines into CSV rows.

#### `overdueReminders.ts`
* `fetchOverdueReminders(vendorId)`: Evaluates unpaid accounts that have passed due dates.

#### `upload.ts`
* `uploadImage(uri)`: Uploads to `avatars` bucket. Base64 decoded.
* `uploadBusinessLogo(uri, vendorId)`: Uploads to `business-logos` bucket under path `logos/${vendorId}/logo.${fileExt}` (upsert true).

### Technical Rules
1. **Explicit Selection**: All database queries must declare exact columns. No `select("*")` in large lists.
2. **Error Boundary**: Database errors must pass through `toApiError(error)` (defined in `supabaseQuery.ts`) to resolve network vs validation categories.
3. **Data Mapping**: Legacies like `parties` are mapped to `customer` and `orders` to `entries` at the API edge to comply with the naming contract.

---

## 5. State Management Contract

### Zustand Stores

| Store | Location | Scope / Persistence | Clear / Reset Trigger |
| :--- | :--- | :--- | :--- |
| `useAuthStore` | `src/store/authStore.ts` | Session, profile status, and subscription details. In-memory. | Reset to null on `logout()` |
| `usePreferencesStore` | `src/store/preferencesStore.ts` | Color theme, notification flags, snoozes, and log. Persisted to `AsyncStorage` (`preferences-store`). | Manually managed |
| `useOrderStore` | `src/store/orderStore.ts` | Draft invoice calculations (quantities, prices, loading charges, GST%). In-memory. | Reset via `clearOrder()` |
| `useLanguageStore` | `src/store/languageStore.ts` | Active UI language context. Manually stored in `AsyncStorage` key `app_language`. | Manually managed |

### TanStack Query Rules
* Local query keys: `["orders"]`, `["dashboard"]`, `["customers"]`, `["payments", orderId]`.
* Cache TTL settings: `gcTime` is locked at **24 hours**, `staleTime` is locked at **5 minutes**.
* Cache Invalidation: Replay mutations trigger explicit `queryClient.invalidateQueries` to clear caches immediately.

---

## 6. Offline Queue Specification

The offline-first engine resides in [syncQueue.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/lib/syncQueue.ts) and [useNetworkSync.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useNetworkSync.ts).

### Queue Design
* **Storage**: Encrypted MMKV instance named `kredbook-sync-queue`. The encryption key is dynamically resolved at install.
* **FIFO Bounds**: First-In-First-Out processing. Maximum queue size is **100**. If exceeded, the oldest entry is dropped to prevent memory leaks.
* **Structure**: Each item holds a unique `id` (UUID), `timestamp`, `retryCount`, `entity` type, `operation` (CREATE/UPDATE/DELETE), and `payload` JSON object.

### Sync Replay Lifecycle
1. NetInfo fires change event -> transition from offline to online triggers replay start.
2. Dequeue the oldest mutation.
3. Call matching API client function:
   * `order / CREATE` -> `createOrder()`
   * `payment / CREATE` -> `recordPayment()`
   * `customer / CREATE` -> `addPerson()`
4. **On Success**: Remove from queue, invalidate dependent query caches, and process the next item.
5. **On Failure**:
   * If non-network/validation error: drop item immediately.
   * If network error: increment `retryCount` (max 3). If `retryCount < 3`, apply backoff delay (`1000 * 2^(retry - 1)`) and re-enqueue. If `retryCount >= 3`, drop the item and emit `MutationDropped` events to restore cached views.

### Conflict Resolution
* **Reads**: The client displays cached MMKV data. Optimistic values remain active until server confirms.
* **Writes**: Optimistic updates are rendered locally immediately. On sync conflict, the server database state wins on subsequent reads.

---

## 7. Authentication & Session Contract

### Auth Flow
* **Providers**: Phone number registration/OTP and Email/Password credentials are handled via Supabase Auth.
* **Session Persist**: Auth state is stored in `SecureStore` (Chunked adapter under [secureStorage.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/lib/secureStorage.ts) to bypass the iOS 2048-byte Keychain limit by segmenting tokens into 1800-byte chunks).
* **Onboarding Gate**: If a session exists, the app checks if `profile.phone` is present and if `profile.onboarding_complete` is true. If not, it routes the user to the onboarding sequence.

### Profile Creation Fallback
If the database trigger fails to create a `profiles` row during auth signup, `useAuthStore.fetchProfile` catches the empty response and executes a client-side upsert:
```ts
await supabase.from("profiles").upsert({ user_id: userId, name: "", onboarding_complete: false })
```

### Sign Out Cleanup
When `useLogout` triggers:
1. Calls `supabase.auth.signOut()`.
2. Resets `useAuthStore` credentials and session states.
3. Clears local cached queries from TanStack Query.
4. Removes the welcome walkthrough seen indicator (`hasSeenWelcome`) from AsyncStorage to present the landing screen on the next boot.

---

## 8. Navigation & Routing Contract

KredBook navigation is managed by file-based Expo Router routes defined in the `app/` folder.

### Route Guard Guidelines
* Managed in `app/_layout.tsx`.
* **Guard Matrix**:

| Session State | Onboarding State | Target Route | Redirect Destination |
| :--- | :--- | :--- | :--- |
| Unauthenticated | N/A | `/(main)/*` | `/` or `/(auth)/login` |
| Authenticated | Missing Profile | `/(main)/*` | `/profile-error` |
| Authenticated | Missing Phone | `/(main)/*` | `/(auth)/phone-setup` |
| Authenticated | Onboarding Incomplete | `/(main)/*` | `/(auth)/onboarding/business` |
| Authenticated | Complete | `/(auth)/*` | `/(main)/dashboard` |

* **Shared Link `/l/[token]`**: Serves as a modal path with unauthenticated access enabled.

---

## 9. Theme & Design Token Contract

The design tokens reside in [theme.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/theme.ts).

### Styling Rules
1. **Zero Hardcoded Values**: Hex values, absolute spacing values, and custom sizes must not be hardcoded in React Native components. All colors and layout configurations must resolve from the active theme hook (`useTheme()`).
2. **NativeWind Mapping**: Dark mode operates via class selectors (`darkMode: "class"` in `tailwind.config.js`). Theme tokens are mirrored in Tailwind using CSS variable bindings.
3. **Style Sheets vs ClassNames**:
   * Use Tailwind utility classes (`className`) for simple padding, margins, flex layouts, and typography styles.
   * Use stylesheet configurations (`style={{ shadowColor: colors.primary }}`) for drop-shadows, animations, and dynamic calculations (e.g. safe area insets).

---

## 10. Component Architecture

### Component Hierarchy
* `ui/`: Primitive elements (buttons, avatars, skeletons, status indicators).
* `features/`: Module-bound assets (dashboard widgets, payment forms).
* `screens`: Directory layouts in `app/` composing features.

### Implementation Guidelines
* All API requests must be extracted to custom hooks (e.g. `useEntryDetail`). Screen components must never query database instances directly.
* List scrolling must use Shopify's `FlashList` for memory performance. Always define an accurate `estimatedItemSize` (e.g., `estimatedItemSize={76}` for list rows) and memoize components using `React.memo`.

---

## 11. Error Handling Contract

* **UI Boundaries**: Visual components are wrapped with React error boundaries. Uncaught runtime errors trigger fallback views.
* **Sentry Logging**: Initialized at launch via `initSentry()`. User parameters like phone numbers and business profiles are scrubbed before transmission.
* **Network vs Server Errors**:
  * Network timeouts/failures throw `isNetworkError` categories, enqueuing local mutations.
  * Server constraint violations (e.g., duplicate entries) bypass the queue, throw immediately, and display error dialogs to the user.

---

## 12. Performance Contracts

* **Cold Boots**: First meaningful paint target is `< 1200ms` on standard mid-range mobile devices.
* **Renders**: List components must maintain 60fps scrolling performance. Use virtualized height trackers and avoid inline functions inside list render scopes.
* **Media Compression**: User avatars and business logos must be resized to a maximum dimension of `600px` and compressed to `JPEG / WebP` format with a quality parameter of `0.80` before uploading to Supabase Storage.

---

## 13. Localization (i18n) Contract

* **Setup**: Powered by `i18next` and `react-i18next`. Translation templates are placed in `src/i18n/en.ts` and `src/i18n/hi.ts`.
* **String Separation**: Hardcoded copy strings are strictly forbidden in screen files. All titles, actions, headings, and input helpers must call the translation hook `t("namespace.key")`.
* **Dynamic Language Shifts**: Changing languages via `useLanguageStore.setLanguage()` updates `AsyncStorage` and calls `i18next.changeLanguage(lang)` to trigger dynamic updates across the UI without requiring an app restart.

---

## 14. Build, Environment & CI/CD

### Environment Configurations
* `EXPO_PUBLIC_SUPABASE_URL`: DB REST endpoint.
* `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Client authorization key.
* `EXPO_PUBLIC_SENTRY_DSN`: Sentry logging target.

### Expo Build Commands
* Android Dev Server: `npm run android`
* iOS Dev Server: `npm run ios`
* Biome Lint Validation: `npm run lint`

### CI Release Validation checklist
1. Validate Biome and ESLint linter run (`npm run lint`).
2. Run TypeScript compilation check (`npx tsc --noEmit`).
3. Compile and upload production source maps to Sentry.

---

## 15. Security Contracts

1. **Database RLS Policies**: Security boundaries are enforced at the database level. Client-side filters are used for user experience only, never for security enforcement.
2. **Client Keys**: The Supabase service role key must never reside in client-side code under any circumstances.
3. **Ledger Shares**: Access tokens shared via `/l/[token]` must call RPC functions scoped strictly to transaction dates and vendor business names. Shared ledger views must not contain write access or other data query paths.
4. **AI Boundaries**: Edge Functions handle LLM calculations. Client code must never access LLM APIs directly.

---

## 16. Testing Strategy

* **Unit Tests (Jest)**: Target mathematical functions (INR currency formatting, interest/GST calculation, outstanding sum reductions), schema validation schemas (Yup, Formik inputs), and offline queue serialization helpers.
* **Integration Tests (Zustand/Query)**: Validate state store actions, local MMKV cache hydration cycles, network status transitions, and offline write synchronization queues.
* **E2E / UI Automated Testing**: Focus on primary critical paths: Onboarding flow, Customer creation, Entry recording, and Payment collecting.
* **Quality Gates**: Release builds require passing test suites (100% success rate) and zero TypeScript compilation warnings.

---

## 17. Known Technical Debt

1. **Duplicate RLS Policies**: Multiple schema policies are duplicated (e.g. `order_items` contains both `"Vendors can delete own order items"` and `"delete_own_order_items"`). These should be consolidated in a future database migration sweep.
2. **Customer Balance Inconsistencies**: `parties.customer_balance` is sometimes updated programmatically in app code alongside Postgres triggers. The balance management should be delegated entirely to the database trigger `trg_sync_customer_balance`.
3. **Legacy Nomenclature**: The codebase contains reference names like `orders` (for Entries), `parties` (for Customers), and `vendor_id` (for Profile). Aligning these names in the database should be planned for future development phases.

---

## 18. Phase 5 Technical Prerequisites

1. **UPI Collection Linkage**: Requires initializing merchant profiles with a verified `upi_id` to generate standard UPI deep links:
   `upi://pay?pa={upi_id}&pn={business_name}&am={amount}&cu=INR`
2. **QR Code Generation Engine**: Requires adding `react-native-qrcode-svg` to the dependencies to render dynamic payment QR codes on-screen.
3. **AI Edge Functions Scaffolding**: Supabase Edge Functions must handle LLM completion tasks, and use input allowlists to filter prompt parameters and prevent prompt injection risks.

---

*This document is the technical source of truth for KredBook. Any AI agent, engineer, or external contributor must treat `TRD.md` as the primary reference for how the application is built and executed.*
