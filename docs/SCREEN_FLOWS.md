# SCREEN_FLOWS

Engineering spec for the current KredBook screen surface.

Sources cross-referenced while writing this doc:
- `docs/ARCHITECTURE.md` for route conventions and product scope
- `docs/STATUS.md` for Phase 4 redesign targets
- `src/utils/theme.ts` for canonical token names

Route convention summary:
- `/(main)` contains authenticated product screens
- `/(auth)` contains login and onboarding screens
- `/l/[token]` is the public ledger surface

## 1. `(main)/dashboard/index.tsx`

### Route & File
- File: `app/(main)/dashboard/index.tsx`
- Route: `/(main)/dashboard`

### Entry Points
- App bootstrap and auth routing land here from `app/_layout.tsx` after a valid session/profile.
- `router.replace("/(main)/dashboard")` is used from onboarding completion and auth routing guards.
- No route params are consumed.

### Exit Points
- Notifications button -> `router.push("/(main)/people")`
- Empty state CTA -> `router.push("/(main)/people/create")`
- Customer cards and collect card -> `router.push({ pathname: "/(main)/people/[customerId]", params: { customerId } })`
- FAB -> `router.push("/(main)/entries/create")`
- Customer picker selection -> opens payment modal after `fetchPersonDetail(customerId)`

### Data Layer
- Hook: `useDashboard(profile?.id)` from `src/hooks/useDashboard.ts`
- Query key: `["dashboard", vendorId]`
- API: `getDashboardData(vendorId)` via `src/api/dashboard.ts`
- Hook side effect: `syncOverdueReminders(...)` from `src/lib/notifications.ts`
- Hook: `usePeople(profile?.id, customerSearch)` from `src/hooks/usePeople.ts`
- Query key: `["customers", vendorId, { search }]`
- API: `fetchPeople(...)` via `src/api/people.ts`
- Direct API: `fetchPersonDetail(customerId)` via `src/api/people.ts`
- RPC/table touchpoints inferred from imported APIs/hooks: `get_dashboard_summary`, `get_customer_statement`, `parties`, `orders`, `payments`, `profiles`

### UI Components
- `DashboardHeader` — `@/src/components/dashboard/DashboardHeader`
- `Loader` — `@/src/components/feedback/Loader`
- `useToast` — `@/src/components/feedback/Toast`
- `RecordCustomerPaymentModal` — `@/src/components/people/RecordCustomerPaymentModal`
- `BottomSheetPicker` — `@/src/components/picker/BottomSheetPicker`
- `Avatar` — `@/src/components/ui/Avatar`
- `EmptyState` — `@/src/components/ui/EmptyState`
- `FloatingActionButton` — `@/src/components/ui/FloatingActionButton`
- `MoneyAmount` — `@/src/components/ui/MoneyAmount`

### Color Tokens
- Direct token usage: `colors.background`, `colors.textPrimary`, `colors.textSecondary`, `colors.surface`, `colors.primary`, `colors.overdue.text`, `colors.dashboard.heroText`
- Gradient token usage: `gradients.dashboardHero.start`, `gradients.dashboardHero.end`
- NativeWind semantic classes in this file map to the themed `background`, `surface`, `border`, `textPrimary`, `textSecondary`, and dashboard hero aliases.

### Buttons & Actions
- Notifications icon — inline handler — opens People list
- Empty state `Add Customer` — inline `onCta` — opens customer create route
- Collect hero card — `onPress` — opens top overdue customer detail
- `Collect Now` button — `handleCollectNow` — opens payment flow or customer picker
- Follow-up row tap — `openCustomer` — opens customer detail
- Follow-up `COLLECT` action — `openRecordPaymentForCustomer` — fetches detail then opens `RecordCustomerPaymentModal`
- `View Customers` / `See all` surface actions — inline handlers — open People list
- FAB — inline handler — opens Create Entry

### State
- Local state: `paymentContext`, `isCollecting`, `isCustomerPickerOpen`, `customerSearch`
- Local animation state: `collectScale`
- Refs: `paymentSheetRef`
- Zustand: `useAuthStore()` for `profile`
- Query state: dashboard query and people query
- Route params: none
- MMKV keys: none visible in this file

### Known Issues / Drift
- Overdue customer dedupe/sort is repeated in-screen instead of being normalized in one data layer.
- Screen fetches both `usePeople()` and `fetchPersonDetail()` before opening payment flow, which is more data than the card itself needs.
- Hardcoded English strings remain throughout the screen.
- Navigation to payment flow assumes customer detail exists; failure only shows a toast.

### Phase 4 Target
- `4.1.1` Dashboard redesign

## 2. `(main)/people/index.tsx`

### Route & File
- File: `app/(main)/people/index.tsx`
- Route: `/(main)/people`

### Entry Points
- Main tab navigation from `app/(main)/_layout.tsx`
- Onboarding completion can deep-link here with `{ action: "add" }`
- Empty-state CTA route alias `/(main)/people/create` redirects back here with `action=add`
- Route params consumed: `action?: string`

### Exit Points
- Customer row tap -> `router.push({ pathname: "/(main)/people/[customerId]", params: { customerId } })`
- Add-entry action -> `router.push({ pathname: "/(main)/entries/create", params: { customer: JSON.stringify(customer) } })`
- Post-create redirect -> `router.push({ pathname: "/(main)/entries/create", params: { customer: JSON.stringify(createdCustomer) } })`
- Empty-state CTA -> `router.push("/(main)/people/create")`
- `NewCustomerModal` is opened locally, not routed

### Data Layer
- Hook: `usePeople(profile?.id, debouncedSearch)` from `src/hooks/usePeople.ts`
- Query key: `["customers", vendorId, { search }]`
- API: `fetchPeople(...)` from `src/api/people.ts`
- Hook: `useAddPerson(profile?.id ?? "")` from `src/hooks/usePeople.ts`
- API: insert into `parties`
- Hook: `useCreateOrder(profile?.id ?? "")` from `src/hooks/useEntries.ts`
- Mutation path: `createOrder(...)` via `src/api/entries.ts`
- Tables/RPCs touched through imported APIs/hooks: `parties`, `orders`, `order_items`, `payments`, `profiles`, `create_order_transaction`

### UI Components
- `EmptyState` — `@/src/components/ui/EmptyState`
- `ErrorState` — `@/src/components/feedback/ErrorState`
- `Loader` — `@/src/components/feedback/Loader`
- `useToast` — `@/src/components/feedback/Toast`
- `Header` — `@/src/components/layer2/Header`
- `ListItem` — `@/src/components/layer2/ListItem`
- `ScreenLayout` — `@/src/components/layer2/ScreenLayout`
- `StatusBadge` — `@/src/components/layer2/StatusBadge`
- `NewCustomerModal` — `@/src/components/people/NewCustomerModal`
- `FloatingActionButton` — `@/src/components/ui/FloatingActionButton`
- `SearchBar` — `@/src/components/ui/SearchBar`
- `Avatar` — `@/src/components/ui/Avatar`

### Color Tokens
- Direct token usage: `colors.border`, `colors.surface`, `colors.primary`, `colors.primaryLight`, `colors.textSecondary`, `colors.success`, `colors.warning`, `colors.overdue.text`, `colors.surfaceAlt`

### Buttons & Actions
- Search field — `setSearch` — updates debounced customer query/filter state
- Filter chips — `setFilter` — filters list client-side
- Customer row — `handleOpenCustomer` — opens Customer Detail
- `Add Entry` secondary action — `handleAddEntry` — opens Create Entry with serialized customer
- Empty-state `Add Customer` — inline `onCta` — opens route alias for modal flow
- FAB — inline handler — opens `NewCustomerModal`
- Modal submit — `handleAddCustomer` — creates customer, optionally creates first entry, optionally redirects into share flow

### State
- Local state: `search`, `filter`, `isModalOpen`, `refreshing`, `redirectAfterAdd`
- Derived local state: `debouncedSearch`, `normalizedSearch`, `searchedCustomers`, `filteredCustomers`
- Query state: `people`, `hasNextPage`, `isFetchingNextPage`, `isLoading`, `error`
- Query keys: `["customers", vendorId, { search }]`
- Route params: `action`
- Zustand: `useAuthStore()` for `profile`
- MMKV keys: none visible in this file

### Known Issues / Drift
- Route param inconsistency: `action=add` is a lightweight route contract while Create Entry still receives a full serialized `customer` object.
- Route param drift: Create Entry consumes only `customer` and `amount` params; avoid pushing unused params.
- Data duplication: server-side search via `fetchPeople(search)` is layered with client-side fuzzy filtering, so matches outside the currently loaded pages can be missed.
- Component duplication risk: this screen uses `@/src/components/layer2/StatusBadge`, while Entry Detail uses a different `StatusBadge` implementation.
- No import/contact CTA in the empty state yet, although Phase 4 calls for it.

### Phase 4 Target
- `4.2.1` Customer List redesign

## 3. `(main)/people/[customerId].tsx`

### Route & File
- File: `app/(main)/people/[customerId].tsx`
- Route: `/(main)/people/[customerId]`

### Entry Points
- From People list row tap with `{ customerId }`
- From Dashboard follow-up card with `{ customerId }`
- Route params consumed: `customerId: string`, `focus?: string`
- `focus === "share"` triggers ledger share on load

### Exit Points
- Back button -> `router.back()`
- Add Entry actions -> `router.push({ pathname: "/(main)/entries/create", params: { customer: JSON.stringify(customer), customerId: customer.id } })`
- Record Payment -> opens `RecordCustomerPaymentModal`
- Ledger share -> native `Share.share(...)`
- PDF -> `Print.printToFileAsync(...)` and `Sharing.shareAsync(...)`
- Call -> `Linking.openURL("tel:...")`
- WhatsApp reminder -> `Linking.openURL("https://wa.me/...")`

### Data Layer
- Hook: `usePersonDetail(customerId)` from `src/hooks/usePeople.ts`
- Query key: `["customerDetail", customerId]`
- API: `fetchPersonDetail(customerId)` from `src/api/people.ts`
- RPC: `supabase.rpc("upsert_access_token", { p_party_id: customer.id })`
- Store side effect: `usePreferencesStore().logReminderSent(...)`
- Tables/RPCs touched: `parties`, `orders`, `payments`, `profiles`, `access_tokens`, `get_customer_statement`, `upsert_access_token`

### UI Components
- `EmptyState` — `@/src/components/ui/EmptyState`
- `Loader` — `@/src/components/feedback/Loader`
- `SyncStatus` — `@/src/components/feedback/SyncStatus`
- `useToast` — `@/src/components/feedback/Toast`
- `RecordCustomerPaymentModal` — `@/src/components/people/RecordCustomerPaymentModal`

### Color Tokens
- Direct token usage: `colors.success`, `colors.danger`, `colors.primary`, `colors.border`, `colors.textPrimary`, `colors.textSecondary`, `colors.textMuted`, `colors.overdue.text`
- Gradient token usage: `gradients.customerHero`, `gradients.zeroBalance`
- NativeWind semantic classes in this file map to themed `background`, `surface`, `search`, `border`, `primary`, `danger`, `success`, `textPrimary`, `textSecondary`, and customer hero aliases.

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- Header reminder icon — `sendWhatsAppReminder` — opens WhatsApp and logs reminder metadata
- Header call icon — `callCustomer` — opens dialer when phone exists
- `Add Entry` — inline handler — opens Create Entry with serialized customer
- `Record Payment` — `openPaymentFlow` — opens shared payment modal when a payable order exists
- Quick action row — three compact action cards in a grouped card
- Timeline rows — individual cards with left-border accent strips
- Timeline action `Add Entry` — inline handler — opens Create Entry with serialized customer
- Timeline action `Share` — `handleShareLedger`
- Timeline action `PDF` — `downloadStatement`
- Transaction tabs `All`, `Entries`, `Payments` — inline handler — switches local filter
- `View Older History` — inline handler — expands transaction history

### State
- Local state: `txFilter`, `exporting`, `historyExpanded`, `quickPaymentAmount`, `shareQueued`, `isSharingLedgerLink`
- Query state: `customer`, `isLoading`
- Query key: `["customerDetail", customerId]`
- Route params: `customerId`, `focus`
- Zustand: `useAuthStore()`, `usePreferencesStore()`
- MMKV/AsyncStorage keys: not directly visible; reminder preferences are store-backed outside this file

### Known Issues / Drift
- Route param inconsistency: empty-state Add Entry passes both serialized `customer` and `customerId`, but `entries/create.tsx` only consumes `customer`.
- Hardcoded English strings dominate despite `useTranslation()` being present.
- (Fixed) Removed unused `OverdueChip` import.
- Navigation edge-case handling is partial: call/share flows assume valid phone numbers and external apps.
- Data hook fetches more than the screen always needs: `fetchPersonDetail()` loads full statement history even when only the hero/actions are used.

### Phase 4 Target
- `4.1.5` Customer Detail redesign

## 4. `(main)/entries/index.tsx`

### Route & File
- File: `app/(main)/entries/index.tsx`
- Route: `/(main)/entries`

### Entry Points
- Main tab navigation from `app/(main)/_layout.tsx`
- No route params consumed

### Exit Points
- Entry row -> `router.push({ pathname: "/(main)/entries/[orderId]", params: { orderId } })`
- Empty state CTA -> `router.push("/(main)/entries/create")`
- FAB -> `router.push("/(main)/entries/create")`

### Data Layer
- Hook: `useOrders(profile?.id, search, undefined, "newest")` from `src/hooks/useEntries.ts`
- Query keys: `["orders", vendorId]`, `["orders", vendorId, "list", debouncedSearch, statusFilter, sortBy]`
- API: `fetchOrders(...)` from `src/api/entries.ts`
- Hook: `useNetworkSync()` from `src/hooks/useNetworkSync.ts`
- Tables touched through imported APIs/hooks: `orders`, `parties`, `payments`

### UI Components
- `FloatingActionButton` — `@/src/components/ui/FloatingActionButton`
- `SearchBar` — `@/src/components/ui/SearchBar`
- `EmptyState` — `@/src/components/ui/EmptyState`
- `Header` — `@/src/components/layer2/Header`
- `ListItem` — `@/src/components/layer2/ListItem`
- `ScreenLayout` — `@/src/components/layer2/ScreenLayout`

### Color Tokens
- Direct token usage: `colors.textPrimary`, `colors.surface`, `colors.primary`, `colors.successBg`, `colors.warning`, `colors.warningBg`, `colors.overdue.text`, `colors.overdue.bg`, `colors.border`, `colors.textSecondary`

### Buttons & Actions
- Filter chips — inline handlers — filter entries client-side
- Search field — `setSearch` — updates entries query
- Entry row — `handlePressOrder` — opens Entry Detail
- Empty-state `Add Entry` — `handleCreateEntry` — opens Create Entry
- FAB — `handleCreateEntry` — opens Create Entry
- Pull to refresh — `onRefresh` — refetches query
- Infinite scroll — `handleEndReached` — loads next page

### State
- Local state: `search`, `filter`, `refreshing`
- Query state: `rawOrders`, `isLoading`, `error`, `hasNextPage`, `isFetchingNextPage`
- Query keys: `["orders", vendorId]`, `["orders", vendorId, "list", debouncedSearch, statusFilter, sortBy]`
- Zustand: `useAuthStore()` for `profile`
- Route params: none
- MMKV keys: none visible in this file

### Known Issues / Drift
- Client-side overdue logic uses `"due_date" in order` because the type contract does not cleanly expose `due_date`.
- Filter chips are still the pre-Phase 4 list surface, without the planned date header/summary layout.
- Error state is raw text, not a reusable error component.

### Phase 4 Target
- `4.2.2` Entry List redesign

## 5. `(main)/entries/create.tsx`

### Route & File
- File: `app/(main)/entries/create.tsx`
- Route: `/(main)/entries/create`

### Entry Points
- From Dashboard FAB
- From People list `Add Entry` with `{ customer: JSON.stringify(customer) }`
- From Customer Detail `Add Entry` with `{ customer: JSON.stringify(customer), customerId }`
- From Entry Detail quick payment flow with `{ customer: JSON.stringify(customer), amount }`
- Route params consumed: `customer?: string`, `amount?: string`

### Exit Points
- Back icon -> `router.back()`
- Create bill success -> `router.replace({ pathname: "/(main)/entries/[orderId]", params: { orderId } })`
- Payment-mode success -> `router.back()`
- PDF/share -> native `Sharing.shareAsync(...)` or `Share.share(...)`

### Data Layer
- API: `getCustomerPreviousBalance(customerId, vendorId)` from `src/api/entries.ts`
- API: `recordPayment(...)` from `src/api/entries.ts`
- API: `fetchPersonDetail(customerId)` from `src/api/people.ts`
- Hook: `useCreateOrder(vendorId)` from `src/hooks/useEntries.ts`
- Query invalidations: `["orders", profile.id]`, `["customers", profile.id]`, `["customerDetail", selectedCustomerId]`, `["dashboard", profile.id]`
- Tables/RPCs touched through imported APIs/hooks: `orders`, `payments`, `parties`, `order_items`, `profiles`, `get_customer_previous_balance`, `get_customer_statement`, `create_order_transaction`

### UI Components
- `Loader` — `@/src/components/feedback/Loader`
- `SyncStatus` — `@/src/components/feedback/SyncStatus`
- `useToast` — `@/src/components/feedback/Toast`
- `BillFooter` — `@/src/components/orders/BillFooter`
- `CustomerPicker` — `@/src/components/picker/CustomerPicker`
- `Input` — `@/src/components/ui/Input`

### Color Tokens
- Direct token usage: `colors.danger`, `colors.warning`, `colors.primary`, `colors.avatarPalette`
- NativeWind semantic classes in this file map to themed `background`, `surface`, `border`, `primary`, `textPrimary`, `textSecondary`, `danger`

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- Customer picker selection — `handleSelectPerson` — stores customer and fetches previous balance
- Note expander — inline handler — toggles note field visibility
- Primary footer action in bill mode — `performSave` — creates order, optionally generates PDF/share, clears draft, routes to detail
- Primary footer action in payment mode — `handleRecordPayment` — validates pending order, records payment, invalidates caches, returns to previous route

### State
- Local state: `selectedCustomerMeta`, `previousBalance`, `isFetchingBalance`, `quickAmount`, `note`, `orderNote`, `orderNoteExpanded`, `entryType`
- Route params: `customer`, `amount`
- Query client: manual invalidation only
- Zustand: `useAuthStore()`, `useOrderStore()` for `setCustomer`, `selectedCustomerId`, `items`, `clearOrder`
- MMKV keys: not visible in this file; draft behavior is store-backed, not keyed in-screen

### Known Issues / Drift
- Route param inconsistency: `customerId` and `next` are passed in some flows but not consumed here.
- (Fixed) Guarded parsing of `customer` route param; invalid payload now shows toast and navigates back.
- Hardcoded color: `"transparent"` is used in local style creation instead of a token.
- Duplicate component usage: file renders `CustomerPicker` inline and also maintains picker-related state that Phase 4 already marks as dead/stub behavior.

### Phase 4 Target
- `4.1.3` Create Entry redesign

## 6. `(main)/entries/[orderId].tsx`

### Route & File
- File: `app/(main)/entries/[orderId].tsx`
- Route: `/(main)/entries/[orderId]`

### Entry Points
- From Entries list row tap with `{ orderId }`
- From Create Entry success via `router.replace(...)`
- Route params consumed: `orderId: string`

### Exit Points
- Back icon -> `router.back()`
- Edit icon -> `router.push(`/(main)/entries/${order.id}/edit`)`
- Quick payment shortcut -> `router.push({ pathname: "/(main)/entries/create", params: { customer: JSON.stringify(order.customer), amount } })`
- Record Payment -> opens `RecordCustomerPaymentModal`
- Share actions -> native `Share.share(...)` / `Sharing.shareAsync(...)`
- Call -> `Linking.openURL("tel:...")`
- WhatsApp -> `Linking.openURL("whatsapp://...")` or `https://wa.me/...`

### Data Layer
- Hook: `useOrderDetail(orderId)` from `src/hooks/useEntries.ts`
- Query key: `["orderDetail", orderId]`
- API: `fetchOrderDetail(orderId)` from `src/api/entries.ts`
- Hook: `usePayments(orderId, profile?.id)` from `src/hooks/usePayments.ts`
- Query key: `["payments", orderId]`
- RPC: `supabase.rpc("upsert_access_token", { p_party_id: order.customer_id })`
- Query invalidation path after payment: `["orders", vendorId]`, `["orderDetail", orderId]`, `["payments", orderId]`, `["customers", vendorId]`, `["customerDetail", customerId]`, `["dashboard", vendorId]`
- Tables/RPCs touched through imported APIs/hooks: `orders`, `order_items`, `payments`, `parties`, `profiles`, `access_tokens`, `upsert_access_token`

### UI Components
- `EmptyState` — `@/src/components/feedback/EmptyState`
- `Loader` — `@/src/components/feedback/Loader`
- `useToast` — `@/src/components/feedback/Toast`
- `RecordCustomerPaymentModal` — `@/src/components/people/RecordCustomerPaymentModal`
- `StatusBadge` — `@/src/components/dashboard/StatusBadge`
- `Avatar` — `@/src/components/ui/Avatar`
- `Button` — `@/src/components/ui/Button`
- `Card` — `@/src/components/ui/Card`
- `MoneyAmount` — `@/src/components/ui/MoneyAmount`
- `OverflowMenu` — `@/src/components/layer2/OverflowMenu.tsx`
- `DetailHeader` — `@/src/components/layer2/DetailHeader.tsx`

### Color Tokens
- Direct token usage: `colors.paid.bg`, `colors.paid.text`, `colors.partial.bg`, `colors.partial.text`, `colors.overdue.bg`, `colors.warning`, `colors.pending.bg`, `colors.pending.text`, `colors.successBg`, `colors.primaryDark`, `colors.textPrimary`, `colors.textSecondary`, `colors.surface`, `colors.border`, `colors.danger`, `colors.success`, `colors.primary`, `colors.surfaceAlt`

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- ⋮ overflow icon — inline handler — opens OverflowMenu modal with 6 items:
   Edit Entry → Edit Entry route,
   Share Invoice → native share,
   View Customer → Customer Detail,
   Print → native print,
   Mark as Paid → RecordCustomerPaymentModal pre-filled,
   Delete Entry → delete confirm bottom sheet
- Message icon / `Send Entry` button — `handleSendEntry` — shares entry PDF/text and falls back to WhatsApp
- Phone icon — `handleCall` — opens dialer
- WhatsApp remind button — `handleWhatsApp` — opens WhatsApp reminder
- `Record Payment` button — `openPaymentFlow` — opens shared modal

### State
- Local state: `sendingEntry`, `sharingLedgerLink`, `quickPaymentAmount`
- Route params: `orderId`
- Query keys: `["orderDetail", orderId]`, `["payments", orderId]`
- Zustand: `useAuthStore()`
- MMKV keys: none visible in this file

### Known Issues / Drift
- (Fixed) Added local `fmt()` helper for item/summary rendering.
- Component duplication: this screen imports `@/src/components/dashboard/StatusBadge`, while other list/detail screens use `@/src/components/layer2/StatusBadge`.
- Route param inconsistency: serialized `customer` object is passed into Create Entry instead of just an ID.
- Navigation edge handling is inconsistent: WhatsApp uses multiple URL styles and phone sanitization differs from Customer Detail.
- OverflowMenu icon props must be bare Lucide elements — no View wrapper.
  View wrappers collapse flexDirection:row and stack icon above label.
  (Active bug being fixed in 4.2.3-P2 polish pass.)
- Header call/WhatsApp/share icons removed from header in Phase 4.
  All admin actions accessed exclusively via ⋮ overflow.
  Customer communication actions (Call, WhatsApp) live on the Customer Card only.

### Phase 4 Target
- 4.2.3 Entry Detail redesign — 🔄 IN PROGRESS
  Component build log: Header ✅ | OverflowMenu 🔄 polish | Customer Card ⏳ | Hero ⏳ | Payments ⏳ | Items ⏳ | Action Bar ⏳

## 7. `RecordPaymentModal` (shared component)

### Route & File
- File: `src/components/people/RecordCustomerPaymentModal.tsx`
- Route: no Expo route; shared component used from Dashboard, Customer Detail, and Entry Detail

### Entry Points
- Opened via `BottomSheetModal` refs from:
- `app/(main)/dashboard/index.tsx`
- `app/(main)/people/[customerId].tsx`
- `app/(main)/entries/[orderId].tsx`
- Props consumed: `orderId`, `balanceDue`, `customerId`, `customerName`, `initialAmount`, `onSuccess`, `onDismiss`

### Exit Points
- Success -> `onSuccess()` callback
- Success -> `ref.current.dismiss()` when possible
- Close -> `onDismiss()` callback via `BaseBottomSheet`
- Share receipt -> native `Share.share(...)`

### Data Layer
- Hook: `useRecordPayment(orderId, profile?.id, customerId)` from `src/hooks/usePayments.ts`
- Mutation path: `recordPayment(...)` from `src/api/entries.ts`
- Query invalidation path inside hook: `["orders", vendorId]`, `["orderDetail", orderId]`, `["payments", orderId]`, `["customers", vendorId]`, `["customerDetail", customerId]`, `["dashboard", vendorId]`
- Tables touched through imported APIs/hooks: `payments`, `orders`, `parties`

### UI Components
- `BaseBottomSheet` — `@/src/components/layer2/BaseBottomSheet`
- `Avatar` — `@/src/components/ui/Avatar`
- `Button` — `@/src/components/ui/Button`
- `Input` — `@/src/components/ui/Input`
- `MoneyAmount` — `@/src/components/ui/MoneyAmount`

### Color Tokens
- Direct token usage: `colors.background`, `colors.border`, `colors.textSecondary`, `colors.primary`, `colors.danger`, `colors.surface`
- NativeWind semantic classes in this file map to themed `textPrimary`, `primary`, `surface`, `border`, `textSecondary`

### Buttons & Actions
- `Full balance` hint — inline handler — fills payment amount to full due
- Payment mode chips — inline handlers — switch `mode`
- Submit button `Record Payment` / `Mark Full Paid` — `handleSubmit` — records payment, shares receipt, resets local state, calls `onSuccess`, dismisses sheet

### State
- Local state: `amount`, `mode`, `notes`
- Derived state: `parsedAmount`, `isFullPaid`
- Zustand: `useAuthStore()` for `profile`
- Query keys: indirect through `useRecordPayment()`
- Route params: none
- MMKV keys: none visible in this file

### Known Issues / Drift
- No silent submit path; a share sheet is always opened after success.
- Parent and child both participate in dismissal, so responsibility is split.
- Styling is mixed between style objects and NativeWind classes.

### Phase 4 Target
- `4.1.4` Record Payment modal redesign

## 8. `(main)/_layout.tsx`

### Route & File
- File: `app/(main)/_layout.tsx`
- Route: `/(main)` layout

### Entry Points
- Mounted by root `app/_layout.tsx` when authenticated routing enters the main app stack
- No route params consumed

### Exit Points
- Tab route `dashboard`
- Tab route `people`
- Tab route `new-entry`
- Tab route `entries`
- Tab route `profile`
- Hidden route `export` with `href: null`
- Center FAB -> `router.push("/(main)/new-entry")`

### Data Layer
- No hooks to React Query or Supabase
- No tables or RPCs touched

### UI Components
- Uses asset icons from `@/assets/icons/main` instead of `src/components/`
- No `src/components` imports in this file

### Color Tokens
- Direct token usage: `colors.primary`, `colors.textSecondary`, `colors.surface`, `colors.border`, `colors.textPrimary`, `colors.fabBg`

### Buttons & Actions
- Tab buttons — Expo Router tab navigation — switch main screen route
- Center FAB — inline handler — opens `/(main)/new-entry`

### State
- No local `useState`
- No query keys
- No route params
- Safe-area inset state only
- MMKV keys: none

### Known Issues / Drift
- Component duplication: mixed icon system (`CustomerIcon`, `HomeIcon`, Lucide icons) is explicitly called out for cleanup in Phase 4.
- Navigation edge handling: `/(main)/new-entry` is a hidden route contract tied to the phantom tab/FAB pattern and should be simplified.
- Hidden export route conflicts with the planned move into Profile.

### Phase 4 Target
- `4.1.2` Tab navigation redesign

## 9. `app/index.tsx`

### Route & File
- File: `app/index.tsx`
- Route: `/`

### Entry Points
- First-launch route when `hasSeenWelcome` is absent
- Root auth/layout guard can send logged-out users here
- No route params consumed

### Exit Points
- `Get Started` -> `router.push("/(auth)/signup")`
- `Log In` -> `router.push("/(auth)/login")`

### Data Layer
- Async storage write: `AsyncStorage.setItem("hasSeenWelcome", "true")`
- No hooks, APIs, RPCs, or Supabase tables touched

### UI Components
- No `src/components` imports

### Color Tokens
- Direct token usage from static theme import: `colors.primaryDark`, `colors.primary`, `colors.textPrimary`, `colors.textSecondary`
- (Fixed) Removed `bg-white` usage; uses themed `bg-background`.

### Buttons & Actions
- `Get Started` — `handleStart` — marks welcome seen and opens Signup
- `Log In` — inline handler — opens Login

### State
- No local `useState`
- AsyncStorage key: `hasSeenWelcome`
- Route params: none
- MMKV keys: none

### Known Issues / Drift
- (Fixed) Container uses themed `bg-background`.
- Static `colors` import means the screen does not respect runtime theme mode.
- No language toggle or richer onboarding surface yet.

### Phase 4 Target
- `4.3.1` Welcome screen redesign

## 10. `(auth)/login.tsx`

### Route & File
- File: `app/(auth)/login.tsx`
- Route: `/(auth)/login`

### Entry Points
- Welcome screen `Log In`
- Logout flow via root routing
- No route params consumed

### Exit Points
- Back button -> `router.back()`
- `Forgot password?` -> `router.push("/(auth)/resetPassword")`
- Bottom CTA -> `router.push("/(auth)/signup")`
- Successful auth relies on `useAuth()` + root layout routing rather than direct navigation here

### Data Layer
- Hook: `useLogin()` from `src/hooks/useAuth.ts`
- Hook: `useGoogleSignIn()` from `src/hooks/useAuth.ts`
- Validation schema: `LoginSchema` from `src/utils/schemas.ts`
- AsyncStorage side effect through hooks: `hasSeenWelcome`
- Supabase/auth touchpoints through hooks: `loginApi`, `signInWithGoogleApi`, `supabase.auth`

### UI Components
- `AuthCard` — `../../src/components/ui/AuthCard`
- `AuthDivider` — `../../src/components/ui/AuthDivider`
- `AuthHeader` — `../../src/components/ui/AuthHeader`
- `Button` — `../../src/components/ui/Button`
- `GoogleButton` — `../../src/components/ui/GoogleButton`
- `Input` — `../../src/components/ui/Input`

### Color Tokens
- Direct token usage from static theme import: `colors.textPrimary`, `colors.textSecondary`, `colors.primary`, `colors.dangerBg`, `colors.danger`, `colors.dangerStrong`
- Static spacing/typography imports: `spacing`, `typography`

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- Password eye toggle — inline handler — toggles `showPassword`
- `Forgot password?` — inline handler — opens Reset Password
- `Sign In` — Formik `handleSubmit` — runs login mutation
- Google button — inline handler — runs Google sign-in mutation
- `Sign Up` — inline handler — opens Signup

### State
- Local state: `showPassword`
- Form state: `email`, `password`
- Mutation state: `loginMutation`, `googleSignIn`
- AsyncStorage key through hooks: `hasSeenWelcome`
- Route params: none
- MMKV keys: none visible

### Known Issues / Drift
- Static `colors` import means auth screen does not follow runtime theme mode.
- Several navigation calls still use `as any` elsewhere in the auth flow, though this file is cleaner.
- Error rendering is generic and merges multiple failure paths.

### Phase 4 Target
- `4.3.2` Login redesign

## 11. `(auth)/signup.tsx`

### Route & File
- File: `app/(auth)/signup.tsx`
- Route: `/(auth)/signup`

### Entry Points
- Welcome screen `Get Started`
- Login screen `Sign Up`
- No route params consumed

### Exit Points
- Back button -> `router.back()`
- Bottom CTA -> `router.replace("/(auth)/login")`
- Successful signup relies on root auth/layout routing rather than direct navigation here

### Data Layer
- Hook: `useSignUp()` from `src/hooks/useAuth.ts`
- Hook: `useGoogleSignIn()` from `src/hooks/useAuth.ts`
- Validation schema: `SignUpSchema` from `src/utils/schemas.ts`
- AsyncStorage side effect through hooks: `hasSeenWelcome`
- Supabase/auth touchpoints through hooks: `signUpApi`, `signInWithGoogleApi`, `supabase.auth`

### UI Components
- `AuthCard` — `../../src/components/ui/AuthCard`
- `AuthDivider` — `../../src/components/ui/AuthDivider`
- `AuthHeader` — `../../src/components/ui/AuthHeader`
- `Button` — `../../src/components/ui/Button`
- `GoogleButton` — `../../src/components/ui/GoogleButton`
- `Input` — `../../src/components/ui/Input`

### Color Tokens
- Direct token usage from static theme import: `colors.textPrimary`, `colors.textSecondary`, `colors.primary`, `colors.dangerBg`, `colors.danger`, `colors.dangerStrong`
- Static spacing/typography imports: `spacing`, `typography`

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- Password eye toggle — inline handler — toggles `showPassword`
- Confirm-password eye toggle — inline handler — toggles `showConfirmPassword`
- `Create Account` — Formik `handleSubmit` — runs signup mutation
- Google button — inline handler — runs Google sign-in mutation
- `Log In` — inline handler — replaces with Login screen

### State
- Local state: `showPassword`, `showConfirmPassword`
- Form state: `fullName`, `email`, `password`, `confirmPassword`
- Mutation state: `signUpMutation`, `googleSignIn`
- AsyncStorage key through hooks: `hasSeenWelcome`
- Route params: none
- MMKV keys: none visible

### Known Issues / Drift
- Static `colors` import means auth screen does not follow runtime theme mode.
- Product drift: current screen still uses `confirmPassword`, while Phase 4 explicitly removes it and adds a terms checkbox/progress pill.
- Navigation style is inconsistent with Login: Signup uses `replace` back to Login, Login uses `push` to Signup.

### Phase 4 Target
- `4.3.3` Signup redesign

## 12. `(auth)/resetPassword.tsx`

### Route & File
- File: `app/(auth)/resetPassword.tsx`
- Route: `/(auth)/resetPassword`

### Entry Points
- Login screen `Forgot password?`
- No route params consumed

### Exit Points
- Success state CTA -> `router.replace("/(auth)/login")`
- Default state bottom CTA -> `router.back()`

### Data Layer
- Hook: `useResetPassword()` from `src/hooks/useAuth.ts`
- Validation schema: `ResetPasswordSchema` from `src/utils/schemas.ts`
- Supabase/auth touchpoint through hook: `resetPasswordApi`

### UI Components
- `Button` — `../../src/components/ui/Button`
- `Input` — `../../src/components/ui/Input`

### Color Tokens
- Direct token usage from static theme import: `colors.background`, `colors.paid.bg`, `colors.primaryDark`, `colors.textPrimary`, `colors.textSecondary`, `colors.primary`, `colors.overdue.bg`, `colors.overdue.text`, `colors.danger`
- Static spacing/typography imports: `spacing`, `typography`

### Buttons & Actions
- `Send Reset Link` — Formik `handleSubmit` — submits reset-password mutation
- `Back to Login` — inline handler — replaces with Login
- `Sign In` text CTA — inline handler — goes back in history

### State
- No local `useState`
- Form state: `email`
- Mutation state: `resetMutation`
- Route params: none
- MMKV keys: none visible

### Known Issues / Drift
- Static `colors` import means auth screen does not follow runtime theme mode.
- Navigation edge case: `router.back()` for `Sign In` depends on stack history and is weaker than a direct route.
- Product drift: full-screen illustration target is not yet implemented.

### Phase 4 Target
- `4.3.4` Reset Password redesign

## 13. `(auth)/phone-setup.tsx`

### Route & File
- File: `app/(auth)/phone-setup.tsx`
- Route: `/(auth)/phone-setup`

### Entry Points
- Root auth/layout guard sends signed-in users here when `profile.phone` is missing
- No route params consumed

### Exit Points
- Success/no-ledgers path -> `router.replace("/(auth)/onboarding/business")`
- Discovered-ledgers `Continue to KredBook` -> `router.replace("/(auth)/onboarding/business")`
- `Skip for now` -> `router.replace("/(auth)/onboarding/business")`

### Data Layer
- Hook: `usePhoneSetup()` from `src/hooks/usePhoneSetup.ts`
- Hook internals: `supabase.from("profiles").update({ phone })`, `findLedgersByPhone(normalizedPhone)`
- Zustand: `useAuthStore()` for `profile`
- Tables/RPCs touched through imported hook/utilities: `profiles`, public-ledger discovery helpers in `src/utils/accessToken.ts`

### UI Components
- `Button` — `@/src/components/ui/Button`
- `Input` — `@/src/components/ui/Input`

### Color Tokens
- Direct token usage from static theme import: `colors.successBg`, `colors.success`, `colors.textSecondary`, `colors.textPrimary`, `colors.primary`, `colors.danger`, `colors.border`, `colors.surface`, `colors.primaryLight`
- Static spacing/typography imports: `spacing`, `typography`

### Buttons & Actions
- `Continue` — `handleContinue` — validates/saves phone, optionally shows discovered ledgers, else advances
- `Continue to KredBook` — `proceedToNext` — advances to business onboarding
- `Skip for now (you can add it later)` — `proceedToNext` — bypasses save flow

### State
- Local state: `phone`, `showLedgers`
- Hook state: `loading`, `error`, `discoveredLedgers`
- Route params: none
- Zustand: `useAuthStore()`
- MMKV keys: none visible

### Known Issues / Drift
- Static `colors` import means auth/onboarding screen does not follow runtime theme mode.
- UI hardcodes `+91`, while the hook validates broader formats and normalizes separately.
- `discoveredLedgers.map(... key={index})` is unstable.
- Product drift: no flag selector, no OTP, no progress bar.

### Phase 4 Target
- `4.3.5` Phone Setup redesign

## 14. `(auth)/onboarding/business.tsx`

### Route & File
- File: `app/(auth)/onboarding/business.tsx`
- Route: `/(auth)/onboarding/business`

### Entry Points
- Phone setup success/skip route
- Root auth/layout guard sends incomplete users into onboarding stack
- No route params consumed

### Exit Points
- Back icon -> `router.back()`
- Continue -> `router.push("/(auth)/onboarding/bank")`
- Skip -> `router.push("/(auth)/onboarding/ready")`

### Data Layer
- Direct Supabase write: `supabase.from("profiles").update(updates).eq("user_id", user.id)`
- Zustand: `useAuthStore()` for `user`, `profile`, `setProfile`
- Tables touched: `profiles`

### UI Components
- `Button` — `@/src/components/ui/Button`
- `Input` — `@/src/components/ui/Input`

### Color Tokens
- Direct token usage from static theme import: `colors.textPrimary`, `colors.textSecondary`, `colors.textMuted`
- Static spacing/typography imports: `spacing`, `typography`
- Hardcoded Tailwind color utilities present: `bg-neutral-200`, `bg-neutral-100`

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- `Advanced Settings (optional)` — inline handler — toggles advanced fields
- `Continue` — `handleContinue` — validates and saves business profile, advances to bank step
- `Skip for now` — `handleSkip` — skips to ready screen

### State
- Local state: `businessName`, `gstin`, `billPrefix`, `nameError`, `loading`, `showAdvanced`
- Route params: none
- Zustand: `useAuthStore()`
- MMKV keys: none visible

### Known Issues / Drift
- Static `colors` import means onboarding screen does not follow runtime theme mode.
- Hardcoded neutral utility colors bypass theme tokens.
- Header comment and progress copy disagree on onboarding step numbering.
- Product drift: no business type selector and no logo upload yet.

### Phase 4 Target
- `4.3.6` Onboarding business redesign

## 15. `(auth)/onboarding/bank.tsx`

### Route & File
- File: `app/(auth)/onboarding/bank.tsx`
- Route: `/(auth)/onboarding/bank`

### Entry Points
- Business onboarding continue route
- No route params consumed

### Exit Points
- Back icon -> `router.back()`
- Continue -> `router.push("/(auth)/onboarding/ready")`
- Skip -> `router.push("/(auth)/onboarding/ready")`

### Data Layer
- Direct Supabase write: `supabase.from("profiles").update(updates).eq("user_id", user.id)`
- Zustand: `useAuthStore()` for `user`, `profile`, `setProfile`
- Tables touched: `profiles`

### UI Components
- `Button` — `@/src/components/ui/Button`
- `Input` — `@/src/components/ui/Input`

### Color Tokens
- Direct token usage from static theme import: `colors.textPrimary`, `colors.textSecondary`
- Static spacing/typography imports: `spacing`, `typography`

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- `Continue` — `handleContinue` — saves payment info and marks onboarding complete
- `Skip for now` — `handleSkip` — marks onboarding complete and advances

### State
- Local state: `upiId`, `bankName`, `accountNumber`, `ifscCode`, `error`, `loading`
- Route params: none
- Zustand: `useAuthStore()`
- MMKV keys: none visible

### Known Issues / Drift
- Static `colors` import means onboarding screen does not follow runtime theme mode.
- (Fixed) Normalized `onboarding_complete` writes to boolean `true` in both continue and skip flows.
- Product drift: no QR preview, no stronger optional-state treatment.

### Phase 4 Target
- `4.3.7` Onboarding bank redesign

## 16. `(auth)/onboarding/ready.tsx`

### Route & File
- File: `app/(auth)/onboarding/ready.tsx`
- Route: `/(auth)/onboarding/ready`

### Entry Points
- Business onboarding skip path
- Bank onboarding continue/skip path
- No route params consumed

### Exit Points
- `Add Your First Customer` -> `router.replace({ pathname: "/(main)/people", params: { action: "add" } })`
- `Go to Dashboard` -> `router.replace("/(main)/dashboard")`

### Data Layer
- Toast hook: `useToast()`
- Zustand: `useAuthStore()` for `user`, `profile`, `fetchProfile`
- Direct Supabase write: `supabase.from("profiles").update({ onboarding_complete: true }).eq("user_id", user.id)`
- Tables touched: `profiles`

### UI Components
- `useToast` — `@/src/components/feedback/Toast`
- `Button` — `@/src/components/ui/Button`

### Color Tokens
- Direct token usage from static theme import: `colors.textSecondary`, `colors.success`, `colors.border`, `colors.primary`
- Static spacing/typography imports: `spacing`, `typography`
- (Fixed) Replaced `bg-white` with themed `bg-surface` in chip surfaces.

### Buttons & Actions
- `Add Your First Customer` — `handleAddPerson` — completes onboarding and opens People with `action=add`
- `Go to Dashboard` — `handleGoDashboard` — completes onboarding and opens Dashboard

### State
- Local state: `isLoading`
- Route params: none
- Zustand: `useAuthStore()`
- MMKV keys: none visible

### Known Issues / Drift
- Static `colors` import means onboarding screen does not follow runtime theme mode.
- (Fixed) Replaced `bg-white` with themed `bg-surface`.
- Route param contract `action=add` is reused here; keep it documented because it drives modal behavior on the People screen.
- `onboarding_complete` may already be set in the bank step, so this screen can duplicate the completion write.

### Phase 4 Target
- `4.3.8` Onboarding ready redesign

## 17. `(main)/profile/index.tsx`

### Route & File
- File: `app/(main)/profile/index.tsx`
- Route: `/(main)/profile`

### Entry Points
- Main tab navigation from `app/(main)/_layout.tsx`
- No route params consumed

### Exit Points
- Back icon -> `router.back()`
- `Edit Profile` -> `router.push("/(main)/profile/edit")`
- Export row -> `router.push("/(main)/export")`
- Sign out success -> `router.replace("/(auth)/login")`

### Data Layer
- Zustand: `useAuthStore()` for `user`, `profile`, `logout`
- Zustand: `useLanguageStore()` for `language`, `setLanguage`
- Zustand: `usePreferencesStore()` for `colorMode`, `toggleColorMode`, `remindersEnabled`
- Hook: `useOverdueNotifications()` for `remindersPermissionDenied`, `setReminderToggle`
- Supabase auth call: `supabase.auth.signOut()`
- Tables/hooks touched through imports: auth session, notification scheduling, `orders`, `parties`, `profiles`

### UI Components
- `Avatar` — `@/src/components/ui/Avatar`
- `Button` — `@/src/components/ui/Button`
- `ListItem` — `@/src/components/layer2/ListItem`

### Color Tokens
- Direct token usage: `colors.primary`, `colors.primaryLight`, `colors.textPrimary`, `colors.textSecondary`, `colors.border`, `colors.surface`, `colors.warning`
- NativeWind semantic classes in this file map to themed `background`, `surface`, `border`, `primary`, `textPrimary`, `textSecondary`

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- `Edit Profile` — inline handler — opens Profile Edit
- Language toggles `EN` and `HI` — inline handlers — update language store
- Dark mode switch — inline handler — toggles color mode
- Overdue reminders switch — inline handler — updates reminder preference and notification scheduling
- `Contact Support` row — inline handler — shows support alert
- `About` row — inline handler — shows app info alert
- `Export All Data / CSV backup` row — inline handler — opens Export screen
- `Sign Out` — inline handler with confirm alert — signs out and routes to Login

### State
- No local `useState`
- Zustand stores: `useAuthStore()`, `useLanguageStore()`, `usePreferencesStore()`
- Route params: none
- AsyncStorage-backed state inferred from language/preferences stores
- MMKV keys: not visible in this file

### Known Issues / Drift
- Navigation edge case: sign-out path has no explicit fallback if `supabase.auth.signOut()` fails.
- Export remains a standalone route even though Phase 4 plans to fold it into Profile.
- Support/about strings are hardcoded.

### Phase 4 Target
- `4.4.1` Profile screen redesign

## 18. `(main)/profile/edit.tsx`

### Route & File
- File: `app/(main)/profile/edit.tsx`
- Route: `/(main)/profile/edit`

### Entry Points
- Profile screen `Edit Profile`
- No route params consumed

### Exit Points
- Back icon -> `router.back()`
- Save success -> `router.back()`

### Data Layer
- API: `uploadBusinessLogo(uri, profile.id)` from `src/api/upload.ts`
- Utility: `pickImageFromLibrary()` from `src/utils/imagePicker.ts`
- Direct Supabase write: `supabase.from("profiles").update(...)`
- Zustand: `useAuthStore()` for `profile`, `setProfile`
- Tables/storage touched: `profiles`, Supabase Storage bucket `business-logos`

### UI Components
- `useToast` — `@/src/components/feedback/Toast`
- `Button` — `@/src/components/ui/Button`
- `Input` — `@/src/components/ui/Input`

### Color Tokens
- Direct token usage: `colors.background`, `colors.surface`, `colors.border`, `colors.textPrimary`, `colors.textSecondary`, `colors.primary`

### Buttons & Actions
- Back icon — inline handler — returns to previous route
- Section headers — `toggleSection` — expands or collapses each form section
- `Upload Logo` — `handleLogoUpload` — picks image, uploads to storage, updates profile logo URL, updates store, shows toast/alert
- `Save Changes` — `handleSave` — validates and updates profile fields, updates store, shows toast, returns to previous route

### State
- Local state: `businessName`, `billingAddress`, `gstin`, `billPrefix`, `bankName`, `accountNumber`, `ifscCode`, `upiId`, `logoUrl`, `logoUploading`, `isSaving`, `expandedSection`
- Zustand: `useAuthStore()`
- Route params: none
- MMKV keys: none visible

### Known Issues / Drift
- Uses many hardcoded font sizes/weights instead of shared typography tokens.
- Navigation edge case: no unsaved-changes guard.
- No file-size/type validation before upload.
- Expand/collapse chevrons are raw text arrows instead of a shared icon/button pattern.

### Phase 4 Target
- `4.4.2` Profile Edit redesign

## 19. `(main)/export/index.tsx`

### Route & File
- File: `app/(main)/export/index.tsx`
- Route: `/(main)/export`

### Entry Points
- Profile screen export row
- Hidden `export` route exists in `app/(main)/_layout.tsx`
- No route params consumed

### Exit Points
- No internal route navigation from this screen
- PDF export -> native share flow
- CSV export -> native share flow

### Data Layer
- API: `fetchLedgerForExport(customerId, vendorId, from, to)` from `src/api/exportCustomer.ts`
- API: `fetchLedgerCsvRows(customerId, vendorId, from, to)` from `src/api/exportCustomer.ts`
- Utility: `shareLedgerPdf(ledger)` from `src/utils/exportLedgerPdf.ts`
- Utility: `toCsv(rows)`, `shareCsv(csv, filename)` from `src/utils/exportCsv.ts`
- `CustomerPicker` internally depends on people/customer list hooks
- Tables/RPCs touched through imported APIs: `orders`, `order_items`, `payments`, `parties`, `profiles`

### UI Components
- `EmptyState` — `@/src/components/feedback/EmptyState`
- `Header` — `@/src/components/layer2/Header`
- `ScreenLayout` — `@/src/components/layer2/ScreenLayout`
- `CustomerPicker` — `@/src/components/picker/CustomerPicker`
- `DateRangePicker` — `@/src/components/ui/DateRangePicker`

### Color Tokens
- Direct token usage: `colors.surface`, `colors.border`, `colors.background`, `colors.textSecondary`, `colors.textPrimary`, `colors.primary`, `colors.surfaceAlt`, `colors.primaryBlueBg`, `colors.borderLight`, `colors.fab`

### Buttons & Actions
- Customer selector — inline handler — opens `CustomerPicker`
- `PDF` button — `handleExportPdf` — validates selection, fetches ledger, shares PDF
- `CSV` button — `handleExportCsv` — validates selection, fetches CSV rows, builds CSV, shares file
- Picker close/select — inline handlers — close picker and set selected customer

### State
- Local state: `customerPickerVisible`, `selectedCustomer`, `dateRange`, `loading`
- Zustand: `useAuthStore()` for `profile`
- Route params: none
- MMKV keys: none visible

### Known Issues / Drift
- Component/API drift: `EmptyState`, `Stack`, `useRouter`, and `SafeAreaView` imports are unused.
- Naming drift: screen is Customer-facing, but picker prop/state naming still uses `selectedPerson` in related code.
- (Fixed) Export screen now opens/closes `DateRangePicker` via `visible` + `onClose` bindings.
- Product drift: Phase 4 plans to move export into Profile and add email/export history.

### Phase 4 Target
- `4.4.3` Export refactor into Profile

## 20. `app/l/[token].tsx`

### Route & File
- File: `app/l/[token].tsx`
- Route: `/l/[token]`

### Entry Points
- Public share links created through access-token flows such as `upsert_access_token`
- Route param consumed: `token: string`

### Exit Points
- No in-app navigation actions
- No external CTAs in the current implementation

### Data Layer
- Direct RPC: `supabase.rpc("get_ledger_by_token", { p_token: token })`
- Tables hidden behind RPC contract but logically tied to `access_tokens`, `parties`, `profiles`, `orders`, `payments`

### UI Components
- No `src/components` imports in this file

### Color Tokens
- Direct token usage: `colors.background`, `colors.surface`, `colors.primary`, `colors.textPrimary`, `colors.textSecondary`, `colors.border`, `colors.danger`, `colors.success`, `colors.dangerBg`, `colors.successBg`

### Buttons & Actions
- No tappable actions in the current implementation

### State
- Local state: `loading`, `error`, `ledger`
- Derived state: sorted `transactions`
- Route params: `token`
- Zustand: none
- MMKV keys: none

### Known Issues / Drift
- Product drift is high: no business logo, no UPI CTA, no WhatsApp CTA, no expiry warning, no footer branding.
- Date formatting is client-local and may be timezone-sensitive.
- This screen is much simpler than the public-ledger target in Phase 4.

### Phase 4 Target
- `4.4.4` Public Ledger redesign
