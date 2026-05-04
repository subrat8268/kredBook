# Graph Report - kredBook  (2026-05-04)

## Corpus Check
- 108 files · ~56,352 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 385 nodes · 467 edges · 17 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.8)
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

## God Nodes (most connected - your core abstractions)
1. `formatINR()` - 31 edges
2. `toApiError()` - 19 edges
3. `useToast()` - 14 edges
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
- `sendWhatsAppReminder()` --calls--> `formatINR()`  [INFERRED]
  app\(main)\people\[customerId].tsx → src\utils\format.ts
- `exportNetPositionReport()` --calls--> `toApiError()`  [INFERRED]
  src\api\dashboard.ts → src\lib\supabaseQuery.ts
- `fetchOrders()` --calls--> `toApiError()`  [INFERRED]
  src\api\entries.ts → src\lib\supabaseQuery.ts
- `fetchOrderDetail()` --calls--> `toApiError()`  [INFERRED]
  src\api\entries.ts → src\lib\supabaseQuery.ts

## Communities (83 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (21): fetchPersonDetail(), handleRecordPayment(), handleSaveAndShare(), performSave(), handleWhatsApp(), handleSubmit(), fmtAmount(), entryRow() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (18): createOrder(), fetchOrderDetail(), fetchOrders(), fetchPayments(), getCustomerPreviousBalance(), recordPayment(), updateOrder(), addPerson() (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (15): exportNetPositionReport(), getDashboardData(), getDashboardSummary(), getNetPositionReport(), fetchOrdersForExport(), isoRange(), fetchLedgerCsvRows(), fetchLedgerForExport() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (7): useCreateOrder(), useOrders(), useInfiniteScroll(), useNetworkSync(), useSyncStatus(), formatDate(), formatRelativeActivity()

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (15): init(), setupNotifications(), useAuth(), useFontsLoader(), fetchOverdueGroups(), getTodayDateString(), useOverdueNotifications(), createMMKVPersister() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (8): loginApi(), logoutApi(), resetPasswordApi(), signInWithGoogleApi(), signUpApi(), useGoogleSignIn(), useLogin(), useSignUp()

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (9): DashboardScreen(), OfflineToastListener(), useToast(), useDashboard(), useWhatsAppShare(), onOfflineQueued(), completeOnboarding(), handleAddPerson() (+1 more)

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

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (6): useOverdueReminderOnForeground(), useOverdueReminders(), cancelAllOverdueReminders(), ensureNotificationPermission(), scheduleOverdueReminder(), syncOverdueReminders()

### Community 13 - "Community 13"
Cohesion: 0.28
Nodes (3): useDebounce(), dedupeById(), useCustomers()

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (3): handleContinue(), proceedToNext(), usePhoneSetup()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatINR()` connect `Community 0` to `Community 1`, `Community 4`, `Community 6`, `Community 8`, `Community 11`, `Community 12`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `useToast()` connect `Community 6` to `Community 0`, `Community 1`, `Community 3`, `Community 9`, `Community 11`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `toApiError()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `formatINR()` (e.g. with `fmtAmount()` and `scheduleOverdueReminder()`) actually correct?**
  _`formatINR()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `toApiError()` (e.g. with `getDashboardSummary()` and `getDashboardData()`) actually correct?**
  _`toApiError()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `useToast()` (e.g. with `OfflineToastListener()` and `useWhatsAppShare()`) actually correct?**
  _`useToast()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._