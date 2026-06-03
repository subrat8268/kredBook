# Graph Report - kredBook  (2026-06-03)

## Corpus Check
- 158 files · ~71,370 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 489 nodes · 568 edges · 23 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `formatINR()` - 47 edges
2. `toApiError()` - 19 edges
3. `useToast()` - 18 edges
4. `useNetworkSync()` - 10 edges
5. `readQueue()` - 10 edges
6. `executeWithOfflineQueue()` - 10 edges
7. `useTheme()` - 10 edges
8. `recordPayment()` - 9 edges
9. `buildPaymentShareMessage()` - 7 edges
10. `writeQueue()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `scheduleOverdueReminder()` --calls--> `formatINR()`  [INFERRED]
  src\lib\notifications.ts → src\utils\format.ts
- `exportNetPositionReport()` --calls--> `toApiError()`  [INFERRED]
  src\api\dashboard.ts → src\lib\supabaseQuery.ts
- `fetchOrders()` --calls--> `toApiError()`  [INFERRED]
  src\api\entries.ts → src\lib\supabaseQuery.ts
- `fetchOrderDetail()` --calls--> `toApiError()`  [INFERRED]
  src\api\entries.ts → src\lib\supabaseQuery.ts
- `fetchPayments()` --calls--> `toApiError()`  [INFERRED]
  src\api\entries.ts → src\lib\supabaseQuery.ts

## Communities (112 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (23): getCustomerPreviousBalance(), fetchPersonDetail(), DashboardRecentActivityRow(), getBalanceText(), renderRow(), handleRecordPayment(), handleSaveAndShare(), performSave() (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (7): useCreateOrder(), useOrders(), useInfiniteScroll(), useNetworkSync(), useSyncStatus(), formatDate(), formatRelativeActivity()

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (14): init(), setupNotifications(), useFontsLoader(), fetchOverdueGroups(), getTodayDateString(), useOverdueNotifications(), createMMKVPersister(), configureNotificationChannels() (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (14): exportNetPositionReport(), getDashboardData(), getDashboardSummary(), getNetPositionReport(), fetchOrdersForExport(), isoRange(), fetchLedgerCsvRows(), fetchLedgerForExport() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (14): DashboardScreen(), DashboardScreen(), OfflineToastListener(), useToast(), useDashboard(), useDashboardPaymentFlow(), useDashboardPresentation(), useWhatsAppShare() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (11): CustomerQuickActionsRow(), EntryQuickActions(), ErrorState(), Loader(), OrderSummary(), RecordPaymentAmountConsole(), QuickActionTile(), ThemeProvider() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (9): loginApi(), logoutApi(), resetPasswordApi(), signInWithGoogleApi(), signUpApi(), useAuth(), useGoogleSignIn(), useLogin() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (12): createOrder(), deleteOrder(), fetchOrderDetail(), fetchOrders(), recordPayment(), updateOrder(), addPerson(), replayMutation() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (9): fetchPayments(), usePayments(), useRecordPayment(), handleShareReceipt(), handleSubmit(), parseAmount(), resolveInitialIntent(), useRecordCustomerPaymentModal() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.32
Nodes (12): clear(), dequeue(), enqueue(), getStats(), getStorage(), incrementRetry(), isEmpty(), list() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.2
Nodes (4): useDebounce(), dedupeById(), useCustomers(), ApiError

### Community 11 - "Community 11"
Cohesion: 0.26
Nodes (8): shareCsv(), toCsv(), entryRow(), formatDate(), generateLedgerPdf(), shareLedgerPdf(), signAmount(), statusColor()

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (7): getFileExtension(), getImageContentType(), uploadBusinessLogo(), uploadImage(), uploadToBucket(), handleLogoUpload(), pickImageFromLibrary()

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (6): useOverdueReminderOnForeground(), useOverdueReminders(), cancelAllOverdueReminders(), ensureNotificationPermission(), scheduleOverdueReminder(), syncOverdueReminders()

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (3): handleContinue(), proceedToNext(), usePhoneSetup()

## Knowledge Gaps
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatINR()` connect `Community 0` to `Community 2`, `Community 4`, `Community 5`, `Community 8`, `Community 11`, `Community 14`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Community 4` to `Community 0`, `Community 1`, `Community 12`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `toApiError()` connect `Community 3` to `Community 8`, `Community 10`, `Community 7`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `formatINR()` (e.g. with `getBalanceText()` and `BalanceStatusPill()`) actually correct?**
  _`formatINR()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `toApiError()` (e.g. with `getDashboardSummary()` and `getDashboardData()`) actually correct?**
  _`toApiError()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `useToast()` (e.g. with `OfflineToastListener()` and `DashboardScreen()`) actually correct?**
  _`useToast()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._