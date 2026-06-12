# Graph Report - kredBook  (2026-06-12)

## Corpus Check
- 165 files · ~77,738 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 532 nodes · 646 edges · 22 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 82 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `formatINR()` - 52 edges
2. `useTheme()` - 37 edges
3. `useToast()` - 24 edges
4. `toApiError()` - 19 edges
5. `executeWithOfflineQueue()` - 12 edges
6. `useNetworkSync()` - 10 edges
7. `readQueue()` - 10 edges
8. `recordPayment()` - 9 edges
9. `generateBillPdf()` - 7 edges
10. `buildEntryShareMessage()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `usePersonDetail()` --calls--> `useToast()`  [INFERRED]
  src\hooks\usePeople.ts → src\components\feedback\Toast.tsx
- `useUpdatePerson()` --calls--> `useToast()`  [INFERRED]
  src\hooks\usePeople.ts → src\components\feedback\Toast.tsx
- `scheduleOverdueReminder()` --calls--> `formatINR()`  [INFERRED]
  src\lib\notifications.ts → src\utils\format.ts
- `exportNetPositionReport()` --calls--> `toApiError()`  [INFERRED]
  src\api\dashboard.ts → src\lib\supabaseQuery.ts
- `handleSubmit()` --calls--> `recordPayment()`  [INFERRED]
  src\components\people\RecordCustomerPaymentModal.tsx → src\api\entries.ts

## Communities (107 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (13): CustomerDetailSectionShell(), CustomerQuickActionsRow(), EntryQuickActions(), ErrorState(), Loader(), BillFooter(), OrderSummary(), RecordPaymentAmountConsole() (+5 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (21): DashboardRecentActivityRow(), getBalanceText(), renderRow(), handleWhatsApp(), useEntryDetail(), useOrderDetail(), useUpdateOrder(), usePayments() (+13 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (20): exportNetPositionReport(), getDashboardData(), getDashboardSummary(), getNetPositionReport(), deleteOrder(), fetchOrderDetail(), fetchOrders(), fetchPayments() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (21): createOrder(), getCustomerPreviousBalance(), recordPayment(), addPerson(), deletePerson(), fetchPeople(), fetchPersonDetail(), updatePerson() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (14): DashboardScreen(), DashboardScreen(), OfflineToastListener(), useToast(), useDashboard(), useDashboardPaymentFlow(), useDashboardPresentation(), useWhatsAppShare() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (15): init(), setupNotifications(), useAuth(), useFontsLoader(), fetchOverdueGroups(), getTodayDateString(), useOverdueNotifications(), createMMKVPersister() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (6): useCreateOrder(), useOrders(), useInfiniteScroll(), useNetworkSync(), useSyncStatus(), formatRelativeActivity()

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (8): loginApi(), logoutApi(), resetPasswordApi(), signInWithGoogleApi(), signUpApi(), useGoogleSignIn(), useLogin(), useSignUp()

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (7): useRecordPayment(), handleShareReceipt(), handleSubmit(), parseAmount(), resolveInitialIntent(), useRecordCustomerPaymentModal(), buildPaymentShareMessage()

### Community 9 - "Community 9"
Cohesion: 0.32
Nodes (12): clear(), dequeue(), enqueue(), getStats(), getStorage(), incrementRetry(), isEmpty(), list() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.26
Nodes (8): shareCsv(), toCsv(), entryRow(), formatDate(), generateLedgerPdf(), shareLedgerPdf(), signAmount(), statusColor()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (7): getFileExtension(), getImageContentType(), uploadBusinessLogo(), uploadImage(), uploadToBucket(), handleLogoUpload(), pickImageFromLibrary()

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (6): useOverdueReminderOnForeground(), useOverdueReminders(), cancelAllOverdueReminders(), ensureNotificationPermission(), scheduleOverdueReminder(), syncOverdueReminders()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (3): handleContinue(), proceedToNext(), usePhoneSetup()

## Knowledge Gaps
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatINR()` connect `Community 1` to `Community 0`, `Community 3`, `Community 4`, `Community 5`, `Community 8`, `Community 10`, `Community 14`?**
  _High betweenness centrality (0.244) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Community 0` to `Community 1`, `Community 12`, `Community 4`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Community 4` to `Community 11`, `Community 1`, `Community 3`, `Community 6`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `formatINR()` (e.g. with `getBalanceText()` and `BalanceStatusPill()`) actually correct?**
  _`formatINR()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `useTheme()` (e.g. with `ErrorState()` and `Loader()`) actually correct?**
  _`useTheme()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `useToast()` (e.g. with `OfflineToastListener()` and `useDashboardPaymentFlow()`) actually correct?**
  _`useToast()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `toApiError()` (e.g. with `getDashboardSummary()` and `getDashboardData()`) actually correct?**
  _`toApiError()` has 11 INFERRED edges - model-reasoned connections that need verification._