# Graph Report - kredBook  (2026-05-09)

## Corpus Check
- 126 files · ~63,010 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 433 nodes · 519 edges · 21 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `formatINR()` - 38 edges
2. `toApiError()` - 19 edges
3. `useToast()` - 18 edges
4. `useNetworkSync()` - 10 edges
5. `readQueue()` - 10 edges
6. `recordPayment()` - 9 edges
7. `executeWithOfflineQueue()` - 9 edges
8. `writeQueue()` - 6 edges
9. `generateBillPdf()` - 6 edges
10. `buildEntryShareMessage()` - 6 edges

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

## Communities (95 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (24): fetchPersonDetail(), DashboardRecentActivityRow(), getBalanceText(), renderRow(), handleRecordPayment(), handleSaveAndShare(), performSave(), handleWhatsApp() (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (16): exportNetPositionReport(), getDashboardData(), getDashboardSummary(), getNetPositionReport(), fetchOrdersForExport(), isoRange(), fetchLedgerCsvRows(), fetchLedgerForExport() (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (8): useDebounce(), useCreateOrder(), useOrders(), useInfiniteScroll(), dedupeById(), useCustomers(), formatDate(), formatRelativeActivity()

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (14): init(), setupNotifications(), useFontsLoader(), fetchOverdueGroups(), getTodayDateString(), useOverdueNotifications(), createMMKVPersister(), configureNotificationChannels() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (16): createOrder(), fetchOrderDetail(), fetchOrders(), fetchPayments(), getCustomerPreviousBalance(), recordPayment(), updateOrder(), addPerson() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (14): DashboardScreen(), DashboardScreen(), OfflineToastListener(), useToast(), useDashboard(), useDashboardPaymentFlow(), useDashboardPresentation(), useWhatsAppShare() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (9): loginApi(), logoutApi(), resetPasswordApi(), signInWithGoogleApi(), signUpApi(), useAuth(), useGoogleSignIn(), useLogin() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.32
Nodes (12): clear(), dequeue(), enqueue(), getStats(), getStorage(), incrementRetry(), isEmpty(), list() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (7): ErrorState(), Loader(), OrderSummary(), ThemeProvider(), useResolvedTheme(), useTheme(), FloatingActionButton()

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (7): getFileExtension(), getImageContentType(), uploadBusinessLogo(), uploadImage(), uploadToBucket(), handleLogoUpload(), pickImageFromLibrary()

### Community 11 - "Community 11"
Cohesion: 0.2
Nodes (3): buildStatementHtml(), downloadStatement(), sendWhatsAppReminder()

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (6): useOverdueReminderOnForeground(), useOverdueReminders(), cancelAllOverdueReminders(), ensureNotificationPermission(), scheduleOverdueReminder(), syncOverdueReminders()

### Community 14 - "Community 14"
Cohesion: 0.32
Nodes (3): handleShareReceipt(), handleSubmit(), buildPaymentShareMessage()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (3): handleContinue(), proceedToNext(), usePhoneSetup()

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatINR()` connect `Community 0` to `Community 3`, `Community 5`, `Community 8`, `Community 11`, `Community 13`, `Community 14`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Community 5` to `Community 0`, `Community 9`, `Community 2`, `Community 11`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `toApiError()` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `formatINR()` (e.g. with `getBalanceText()` and `fmtAmount()`) actually correct?**
  _`formatINR()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `toApiError()` (e.g. with `getDashboardSummary()` and `getDashboardData()`) actually correct?**
  _`toApiError()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `useToast()` (e.g. with `OfflineToastListener()` and `DashboardScreen()`) actually correct?**
  _`useToast()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._