# Graph Report - kredBook  (2026-06-03)

## Corpus Check
- 159 files · ~71,501 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 492 nodes · 572 edges · 22 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `formatINR()` - 48 edges
2. `toApiError()` - 19 edges
3. `useToast()` - 18 edges
4. `useTheme()` - 11 edges
5. `useNetworkSync()` - 10 edges
6. `readQueue()` - 10 edges
7. `executeWithOfflineQueue()` - 10 edges
8. `recordPayment()` - 9 edges
9. `buildPaymentShareMessage()` - 7 edges
10. `writeQueue()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `scheduleOverdueReminder()` --calls--> `formatINR()`  [INFERRED]
  src\lib\notifications.ts → src\utils\format.ts
- `sendWhatsAppReminder()` --calls--> `formatINR()`  [INFERRED]
  app\(main)\people\[customerId].tsx → src\utils\format.ts
- `exportNetPositionReport()` --calls--> `toApiError()`  [INFERRED]
  src\api\dashboard.ts → src\lib\supabaseQuery.ts
- `fetchOrders()` --calls--> `toApiError()`  [INFERRED]
  src\api\entries.ts → src\lib\supabaseQuery.ts
- `fetchOrderDetail()` --calls--> `toApiError()`  [INFERRED]
  src\api\entries.ts → src\lib\supabaseQuery.ts

## Communities (111 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (20): getCustomerPreviousBalance(), fetchPersonDetail(), DashboardRecentActivityRow(), getBalanceText(), renderRow(), handleRecordPayment(), handleSaveAndShare(), performSave() (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (19): exportNetPositionReport(), getDashboardData(), getDashboardSummary(), getNetPositionReport(), fetchOrdersForExport(), isoRange(), fetchLedgerCsvRows(), fetchLedgerForExport() (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (17): createOrder(), deleteOrder(), fetchOrderDetail(), fetchOrders(), recordPayment(), updateOrder(), addPerson(), fetchPeople() (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (7): useCreateOrder(), useOrders(), useInfiniteScroll(), useNetworkSync(), useSyncStatus(), formatDate(), formatRelativeActivity()

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (15): init(), setupNotifications(), useAuth(), useFontsLoader(), fetchOverdueGroups(), getTodayDateString(), useOverdueNotifications(), createMMKVPersister() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (12): CustomerQuickActionsRow(), EntryQuickActions(), ErrorState(), Loader(), BillFooter(), OrderSummary(), RecordPaymentAmountConsole(), QuickActionTile() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (14): DashboardScreen(), DashboardScreen(), OfflineToastListener(), useToast(), useDashboard(), useDashboardPaymentFlow(), useDashboardPresentation(), useWhatsAppShare() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (8): loginApi(), logoutApi(), resetPasswordApi(), signInWithGoogleApi(), signUpApi(), useGoogleSignIn(), useLogin(), useSignUp()

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (9): fetchPayments(), usePayments(), useRecordPayment(), handleShareReceipt(), handleSubmit(), parseAmount(), resolveInitialIntent(), useRecordCustomerPaymentModal() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.32
Nodes (12): clear(), dequeue(), enqueue(), getStats(), getStorage(), incrementRetry(), isEmpty(), list() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.26
Nodes (8): shareCsv(), toCsv(), entryRow(), formatDate(), generateLedgerPdf(), shareLedgerPdf(), signAmount(), statusColor()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (7): getFileExtension(), getImageContentType(), uploadBusinessLogo(), uploadImage(), uploadToBucket(), handleLogoUpload(), pickImageFromLibrary()

### Community 13 - "Community 13"
Cohesion: 0.2
Nodes (3): buildStatementHtml(), downloadStatement(), sendWhatsAppReminder()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (3): handleContinue(), proceedToNext(), usePhoneSetup()

## Knowledge Gaps
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatINR()` connect `Community 0` to `Community 1`, `Community 4`, `Community 5`, `Community 6`, `Community 8`, `Community 10`, `Community 13`?**
  _High betweenness centrality (0.219) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Community 6` to `Community 0`, `Community 11`, `Community 3`, `Community 13`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `toApiError()` connect `Community 1` to `Community 8`, `Community 2`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `formatINR()` (e.g. with `getBalanceText()` and `BalanceStatusPill()`) actually correct?**
  _`formatINR()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `toApiError()` (e.g. with `getDashboardSummary()` and `getDashboardData()`) actually correct?**
  _`toApiError()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `useToast()` (e.g. with `OfflineToastListener()` and `DashboardScreen()`) actually correct?**
  _`useToast()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `useTheme()` (e.g. with `EntryQuickActions()` and `ErrorState()`) actually correct?**
  _`useTheme()` has 10 INFERRED edges - model-reasoned connections that need verification._