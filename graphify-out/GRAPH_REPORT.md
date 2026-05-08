# Graph Report - kredBook  (2026-05-08)

## Corpus Check
- 127 files · ~62,415 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 426 nodes · 507 edges · 20 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `formatINR()` - 38 edges
2. `toApiError()` - 19 edges
3. `useToast()` - 18 edges
4. `useNetworkSync()` - 10 edges
5. `readQueue()` - 10 edges
6. `executeWithOfflineQueue()` - 9 edges
7. `recordPayment()` - 8 edges
8. `writeQueue()` - 6 edges
9. `generateBillPdf()` - 6 edges
10. `buildEntryShareMessage()` - 6 edges

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

## Communities (94 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (22): getCustomerPreviousBalance(), fetchPersonDetail(), DashboardRecentActivityRow(), getBalanceText(), renderRow(), handleRecordPayment(), handleSaveAndShare(), performSave() (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (16): createOrder(), fetchOrderDetail(), fetchOrders(), fetchPayments(), recordPayment(), updateOrder(), addPerson(), useOrderDetail() (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (15): init(), setupNotifications(), useAuth(), useFontsLoader(), fetchOverdueGroups(), getTodayDateString(), useOverdueNotifications(), createMMKVPersister() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (8): useDebounce(), useCreateOrder(), useOrders(), useInfiniteScroll(), dedupeById(), useCustomers(), formatDate(), formatRelativeActivity()

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (14): exportNetPositionReport(), getDashboardData(), getDashboardSummary(), getNetPositionReport(), fetchOrdersForExport(), isoRange(), fetchLedgerCsvRows(), fetchLedgerForExport() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (14): DashboardScreen(), DashboardScreen(), OfflineToastListener(), useToast(), useDashboard(), useDashboardPaymentFlow(), useDashboardPresentation(), useWhatsAppShare() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (8): loginApi(), logoutApi(), resetPasswordApi(), signInWithGoogleApi(), signUpApi(), useGoogleSignIn(), useLogin(), useSignUp()

### Community 7 - "Community 7"
Cohesion: 0.32
Nodes (12): clear(), dequeue(), enqueue(), getStats(), getStorage(), incrementRetry(), isEmpty(), list() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (7): ErrorState(), Loader(), OrderSummary(), ThemeProvider(), useResolvedTheme(), useTheme(), FloatingActionButton()

### Community 9 - "Community 9"
Cohesion: 0.26
Nodes (8): shareCsv(), toCsv(), entryRow(), formatDate(), generateLedgerPdf(), shareLedgerPdf(), signAmount(), statusColor()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (7): getFileExtension(), getImageContentType(), uploadBusinessLogo(), uploadImage(), uploadToBucket(), handleLogoUpload(), pickImageFromLibrary()

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (6): useOverdueReminderOnForeground(), useOverdueReminders(), cancelAllOverdueReminders(), ensureNotificationPermission(), scheduleOverdueReminder(), syncOverdueReminders()

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (3): handleContinue(), proceedToNext(), usePhoneSetup()

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatINR()` connect `Community 0` to `Community 1`, `Community 2`, `Community 5`, `Community 8`, `Community 9`, `Community 13`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Community 5` to `Community 0`, `Community 1`, `Community 10`, `Community 3`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `toApiError()` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `formatINR()` (e.g. with `getBalanceText()` and `fmtAmount()`) actually correct?**
  _`formatINR()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `toApiError()` (e.g. with `getDashboardSummary()` and `getDashboardData()`) actually correct?**
  _`toApiError()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `useToast()` (e.g. with `OfflineToastListener()` and `DashboardScreen()`) actually correct?**
  _`useToast()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._