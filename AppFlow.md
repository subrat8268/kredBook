# KredBook Application Flow & User Journeys (AppFlow.md)

This document defines every user journey, redirection constraint, and transition flow in the KredBook application. It acts as the behavioral blueprint for engineers and AI agents.

---

## 1. Document Conventions & Notation Key

To maintain precision across flows, the following notations are used to define triggers, transitions, and states:

* `→` represents a standard user interaction or routing transition (e.g., button press, path redirect).
* `⟹` represents a background system execution or query side effect (e.g., database trigger, cache invalidation).
* `✓` indicates a successful completion state or validation pass.
* `✗` indicates a validation failure or error trigger path.
* `[OFFLINE]` indicates that the operation occurs under zero network connectivity, triggering optimistic execution and queuing.
* `[VERIFY: <condition>]` tags specify check assertions that must be validated at runtime or verified in code by developers.

---

## 2. Flow Index

| Flow Code | Name | Primary Target Path | Type |
| :--- | :--- | :--- | :--- |
| **F-AUTH-01** | Welcome Walkthrough Intro | `/` | Onboarding |
| **F-AUTH-02** | Credentials Signup | `/(auth)/signup` | Authentication |
| **F-AUTH-03** | Credentials Login | `/(auth)/login` | Authentication |
| **F-AUTH-04** | Profile Phone Configuration | `/(auth)/phone-setup` | Onboarding |
| **F-AUTH-05** | Google OAuth Sign-in | `/(auth)/login` | Authentication |
| **F-AUTH-06** | Forgot Password Link | `/(auth)/resetPassword` | Authentication |
| **F-AUTH-07** | Password Update Recovery | `/(auth)/set-new-password`| Authentication |
| **F-AUTH-08** | Onboarding: Business Details | `/(auth)/onboarding/business`| Onboarding |
| **F-AUTH-09** | Onboarding: Bank Details | `/(auth)/onboarding/bank` | Onboarding |
| **F-AUTH-10** | Onboarding: Permission & Ready | `/(auth)/onboarding/ready` | Onboarding |
| **F-AUTH-11** | User Session Sign-out | `/(main)/profile` | Authentication |
| **F-DASH-01** | Outstanding Receivables Summary | `/(main)/dashboard` | Dashboard |
| **F-DASH-02** | Priority Overdue Feed | `/(main)/dashboard` | Dashboard |
| **F-DASH-03** | Collect Now Shortcut | `/(main)/dashboard` | Dashboard |
| **F-DASH-04** | View Customers switcher | `/(main)/dashboard` | Dashboard |
| **F-CUST-01** | Customer Creation | `/(main)/people/create` | Customer |
| **F-CUST-02** | Customer Search & Filter | `/(main)/people` | Customer |
| **F-CUST-03** | Customer Detail Timeline | `/(main)/people/[customerId]`| Customer |
| **F-ENTR-01** | Keypad Amount Trigger | `/(main)/entries/create` | Entries |
| **F-ENTR-02** | Line-Item Entry Creation | `/(main)/entries/create` | Entries |
| **F-ENTR-03** | Entry Detail Analysis | `/(main)/entries/[orderId]` | Entries |
| **F-PAY-01** | Scoped Entry Payment | `RecordPaymentModal` | Payments |
| **F-PAY-02** | Bulk Customer FIFO Payment | `RecordPaymentModal` | Payments |
| **F-SHARE-01** | WhatsApp Text Reminders | WhatsApp Intent | Sharing |
| **F-SHARE-02** | Public Share Link Generation | `/l/[token]` | Sharing |
| **F-SHARE-03** | Revoke Public Shared Ledger | `/(main)/people/[customerId]`| Sharing |
| **F-NOTIF-01** | Notifications Permission Flow | System Dialog | Notifications |
| **F-NOTIF-02** | Schedule Local Overdue Reminder | Background Service | Notifications |
| **F-NOTIF-03** | Cancel Local Overdue Reminder | Background Service | Notifications |
| **F-EXPORT-01**| CSV Ledger Backup | `/(main)/export` | Export |
| **F-EXPORT-02**| PDF Statement Generation | Share Sheet | Export |
| **F-PUB-01** | Unauthenticated Public View | `/l/[token]` | Public Route |
| **F-PUB-02** | Invalid Public Ledger Link | `/l/[token]` | Public Route |
| **F-PUB-03** | Expired Public Ledger Link | `/l/[token]` | Public Route |
| **F-ERR-01** | Auth Credentials Validation Error| Form Field | Error Path |
| **F-ERR-02** | Profile Resolution Failure | `/profile-error` | Error Path |
| **F-ERR-03** | Duplicate Customer Phone Block | Form Field | Error Path |
| **F-ERR-04** | Payment Overpay Validation | Modal Keypad | Error Path |
| **F-ERR-05** | Offline Replay Retry Failure | Notification Banner | Error Path |
| **F-ERR-06** | Supabase Down Read Fallback | System Banner | Error Path |
| **F-ERR-07** | Local PDF Generation Failure | Toast Alert | Error Path |
| **F-ERR-08** | Malformed Shared Link Token | `/l/[token]` | Error Path |

---

## 3. Detailed Step-by-Step Journeys

### 3.1 Authentication & Onboarding Stack

#### F-AUTH-01: Welcome Walkthrough Intro
1. User boots app for the first time.
2. App reads `AsyncStorage.getItem("hasSeenWelcome")` ⟹ null.
3. App renders `app/index.tsx` welcome screen.
4. User reviews features (Fast Entry, Always Visible, Works Offline) → taps **Get Started**.
5. App sets `hasSeenWelcome = "true"` in `AsyncStorage` ⟹ routes to `/(auth)/signup`.

#### F-AUTH-02: Credentials Signup
1. User lands on signup screen (`app/(auth)/signup.tsx`).
2. User provides Email, Password, and Full Name → taps **Sign Up**.
3. App invokes `signUpApi()` ⟹ inserts credentials into `auth.users`.
4. Database trigger `handle_new_user` inserts default matching profile in `public.profiles` ⟹ returns user session.
5. App routes to `/(auth)/phone-setup`.
   - `[VERIFY: profiles row is created with onboarding_complete = false]`

#### F-AUTH-03: Credentials Login
1. User lands on login screen (`app/(auth)/login.tsx`).
2. User enters Email and Password → taps **Sign In**.
3. App invokes `loginApi()` ⟹ resolves credentials with Supabase.
4. App hydrates user and profile state in `useAuthStore` ⟹ checks profile properties:
   - If profile phone is missing → redirect to `/(auth)/phone-setup`.
   - If `onboarding_complete` is false → redirect to `/(auth)/onboarding/business`.
   - If complete → redirect to `/(main)/dashboard`.

#### F-AUTH-04: Profile Phone Configuration
1. User lands on `app/(auth)/phone-setup.tsx`.
2. User inputs a 10-digit Indian phone number → taps **Save & Continue**.
3. App validates phone format (`[6-9][0-9]{9}`) ⟹ updates `profiles.phone` column.
4. App redirects to `/(auth)/onboarding/business`.

#### F-AUTH-05: Google OAuth Sign-in
1. User taps **Google Sign In** on login or signup screen.
2. App invokes `signInWithGoogleApi()` ⟹ requests OAuth URL from Supabase.
3. App launches an in-app browser using `WebBrowser.openAuthSessionAsync` → user authorizes.
4. Browser redirects back to scheme `Linking.createURL("/")` ⟹ extracts code/token parameters.
5. App exchanges code for session via `supabase.auth.exchangeCodeForSession` ⟹ checks profile:
   - If profile missing ⟹ triggers client-side upsert fallback in `fetchProfile`.
   - Pushes user to appropriate onboarding step or dashboard.

#### F-AUTH-06: Forgot Password Link
1. User taps **Forgot password?** on login screen.
2. User enters Email Address → taps **Send Recovery Email**.
3. App invokes `resetPasswordApi()` ⟹ sends password recovery email with redirect link: `Linking.createURL("/")`.
4. Toast displays: `"Password reset link sent to your email."`

#### F-AUTH-07: Password Update Recovery
1. User clicks email recovery link on device ⟹ OS redirects deep link to app.
2. Root listener in `app/_layout.tsx` catches `PASSWORD_RECOVERY` auth event state.
3. App sets `isRecoveryMode = true` in `useAuthStore` ⟹ routes to `/(auth)/set-new-password`.
4. User enters New Password → taps **Update Password**.
5. App updates password via `supabase.auth.updateUser()` ⟹ sets `isRecoveryMode = false` ⟹ routes to `/(main)/dashboard`.

#### F-AUTH-08: Onboarding: Business Details
1. User lands on `app/(auth)/onboarding/business.tsx`.
2. User inputs Business Name (required), optional GSTIN, and UPI ID → taps business logo.
3. App opens picker ⟹ uploads image to storage bucket `business-logos` ⟹ returns logo URL.
4. User taps **Continue** ⟹ updates profile values ⟹ routes to `/(auth)/onboarding/bank`.

#### F-AUTH-09: Onboarding: Bank Details
1. User lands on `app/(auth)/onboarding/bank.tsx`.
2. User inputs Bank Name, Account Number, and IFSC code → taps **Continue** (or taps **Skip**).
3. App updates profile details ⟹ routes to `/(auth)/onboarding/ready`.

#### F-AUTH-10: Onboarding: Permission & Ready
1. User lands on `app/(auth)/onboarding/ready.tsx`.
2. App triggers system push notification alert ⟹ user responds:
   - If allowed → schedules overdue notifications.
   - If denied → sets `remindersPermissionDenied = true` in preferences.
3. User taps **Let's Go** ⟹ updates `profiles.onboarding_complete = true` ⟹ routes to `/(main)/dashboard`.

#### F-AUTH-11: User Session Sign-out
1. User navigates to Settings tab (`/(main)/profile`) → taps **Sign Out**.
2. App invokes `useLogout` mutation ⟹ triggers `supabase.auth.signOut()`.
3. App clears session states, purges TanStack Query client cache ⟹ removes `hasSeenWelcome` from `AsyncStorage`.
4. App redirects to `/(auth)/login`.
   - `[VERIFY: AsyncStorage hasSeenWelcome is deleted so next launch starts at Welcome]`

---

### 3.2 Dashboard Screen Flows

#### F-DASH-01: Outstanding Receivables Summary
1. User opens Dashboard tab (`app/(main)/dashboard/index.tsx`).
2. App fetches dashboard summary data ⟹ calls `getDashboardData()`.
3. UI renders outstanding totals:
   - Hero card displays aggregate `outstandingAmount` (receivables) in tabular numerals.
   - Percentage indicator displays `weekDeltaPct` (positive or negative change).

#### F-DASH-02: Priority Overdue Feed
1. Dashboard outstanding summary resolves.
2. App checks overdue list returned from `get_dashboard_summary` RPC.
3. If outstanding balances are past their due dates → lists up to 3 priority customer cards.
4. Cards display: Customer name, total balance overdue, and days since due.

#### F-DASH-03: Collect Now Shortcut
1. User reviews priority list or hero card → taps **Collect Now** on hero.
2. If priority overdue list is populated → opens Record Payment Sheet pre-filled with top priority customer.
3. If no priority entries → opens customer picker sheet.

#### F-DASH-04: View Customers Switcher
1. User taps **View Customers** button pill on dashboard hero card.
2. App changes active tab index ⟹ redirects user to the People Tab (`/(main)/people`).

---

### 3.3 Customer Management

#### F-CUST-01: Customer Creation
1. User navigates to People tab (`/(main)/people`) → taps Floating Add Button (FAB).
2. Screen pushes route `/(main)/people/create`.
3. User enters Name, Phone (optional), Address, and optional Opening Balance → taps **Save**.
4. App checks connection status:
   - If online: sends POST request to `parties` table.
   - [OFFLINE]: serializes details ⟹ enqueues creation mutation in sync queue ⟹ returns optimistic customer object.
5. Pushes route back to customer list, invalidating query cache.

#### F-CUST-02: Customer Search & Filter
1. User opens People screen.
2. User typing in search field triggers filter.
3. App runs case-insensitive local query (`fetchPeople`) mapping inputs against Name or Phone.
4. Rendered names highlight matched search characters (e.g. searching "Rajan" highlights "**Raj**an").
5. User toggles filter pills to sort list alphabetically or by outstanding balance sizes.

#### F-CUST-03: Customer Detail Timeline
1. User taps a customer card in People list.
2. App pushes route `/(main)/people/[customerId]`.
3. App fetches details ⟹ calls `fetchPersonDetail` API ⟹ executes `get_customer_full_detail` RPC.
4. Renders details:
   - Balance card: uses rose gradient if overdue bills exist, blue for advance balance, green for settled.
   - Timeline: Chronological list of mixed entries (bills) and payments.
   - Reconciliation warning: alerts if customer table balance differs from calculated timeline balance.
     - `[VERIFY: warning displays only if difference > 0.01]`

---

### 3.4 Entry & Payment Operations

#### F-ENTR-01: Keypad Amount Trigger
1. User taps **Add Entry** FAB.
2. App opens `app/(main)/entries/create.tsx` amount keypad screen.
3. User enters numeric amount (e.g. `1500`) → taps **Continue**.
4. App opens Customer Picker Bottom Sheet ⟹ user selects customer.
5. Keypad value passes to entry creation form details.

#### F-ENTR-02: Line-Item Entry Creation
1. User lands on entry details configuration form.
2. User enters optional note, sets due date chip.
3. User taps **Add Items** → inputs item names, quantities, and unit rates.
4. User selects GST tax rate (5%, 12%, 18%) or adds loading charges ⟹ UI recalculates totals.
5. User taps **Save & Share** (or **Save Only**):
   - App runs `createOrder()` API ⟹ calls RPC `create_order_transaction` (atomic insert).
   - If "Save & Share": generates statement PDF via `expo-print` ⟹ launches native OS share sheet.
   - Routes user to Entry Detail view (`/(main)/entries/[orderId]`).

#### F-ENTR-03: Entry Detail Analysis
1. User navigates to Entry Detail screen (`app/(main)/entries/[orderId]/index.tsx`).
2. Renders invoice totals: Subtotal, loading fee, GST tax amount, total amount, amount paid, and balance due.
3. Status badge indicates: Paid (green), Partially Paid (blue), Pending (amber), or Overdue (red).
4. Renders lists: item details cards and historic payment logs against the invoice.

#### F-PAY-01: Scoped Entry Payment
1. User taps **Record Payment** from Entry Detail page.
2. Bottom sheet slides up, displaying invoice total outstanding.
3. User selects **Full Payment** or inputs custom partial payment amount.
4. User selects Payment Mode (Cash/UPI/NEFT/Cheque) → taps **Record Payment**.
5. App calls `recordPayment` API ⟹ writes to `payments` table.
6. DB trigger `on_payment_upsert` updates parent order paid amount and status badge ⟹ Query cache invalidated.
7. Bottom sheet displays confirmation checkmark screen.

#### F-PAY-02: Bulk Customer FIFO Payment
1. User taps **Record Payment** from Customer Detail ledger.
2. Bottom sheet slides up, showing total customer balance.
3. User enters payment amount (e.g. ₹5000) and payment mode → taps **Record Payment**.
4. App calls `recordCustomerPayment` API ⟹ fetches all unpaid customer orders sorted by oldest first (`created_at ASC`).
5. Loops through unpaid entries:
   - Dedacts balance from oldest order first, inserting matching payment row.
   - Carries remaining amount over to subsequent unpaid orders sequentially (FIFO).
6. Updates customer balance ⟹ Invalidates query cache.

---

### 3.5 Sharing & Export Tasks

#### F-SHARE-01: WhatsApp Text Reminders
1. User taps **Remind** on Customer detail header.
2. App reads customer name, balance due, and outstanding invoice details.
3. Generates pre-formatted WhatsApp reminder text using locale translations.
4. Opens WhatsApp deep link: `whatsapp://send?text=...`.
5. Customer receives text containing transaction totals and payment links.

#### F-SHARE-02: Public Share Link Generation
1. User taps **Share Ledger Link** on Customer detail view.
2. App calls `upsert_access_token` RPC ⟹ generates unique link token in `access_tokens`.
3. App builds URL: `https://kredbook.app/l/[token]`.
4. Copies link to clipboard and launches native device share utility.

#### F-SHARE-03: Revoke Public Shared Ledger
1. User opens Customer detail menu option → selects **Revoke Access Token**.
2. App calls `delete` action on `access_tokens` matching customer ID.
3. Token row is removed from database ⟹ subsequent unauthenticated hits to `/l/[token]` return error.

#### F-EXPORT-01: CSV Ledger Backup
1. User navigates to `/(main)/profile` settings → taps **Download CSV Backup**.
2. App calls `fetchOrdersForExport()` ⟹ parses JSON rows into comma-separated text values.
3. Creates a local temporary file using `expo-file-system`.
4. Opens native OS share sheet to download or transmit CSV file.

#### F-EXPORT-02: PDF Statement Generation
1. User taps **Download PDF Statement** from Customer details page.
2. App fetches chronological transaction history.
3. Compiles HTML template containing business name, logo, customer details, and statement table.
4. Invokes `expo-print` ⟹ generates PDF file locally ⟹ launches share sheet.

---

### 3.6 Public Ledger Endpoints

#### F-PUB-01: Unauthenticated Public View
1. Client hits shared ledger link on browser: `https://kredbook.app/l/[token]`.
2. App router resolves `/l/[token]` route without triggering auth layout guards.
3. App calls RPC `get_ledger_by_token` using token parameter.
4. RPC validates token exists, `is_revoked = false`, and `expires_at > now`.
5. Resolves matching customer transactions, rendering read-only ledger timeline.

#### F-PUB-02: Invalid Public Ledger Link
1. User visits `/l/[token]` using non-existent or malformed token string.
2. RPC query returns empty result or error response.
3. App catches error ⟹ redirects view to invalid link error boundary: `"This link is invalid or has expired."`

#### F-PUB-03: Expired Public Ledger Link
1. User visits `/l/[token]` using a token where `expires_at` is less than current date.
2. RPC validation checks fail ⟹ returns access error.
3. App catches error ⟹ renders token expired visual panel.

---

### 3.7 Notifications Flow

#### F-NOTIF-01: Notifications Permission Flow
1. Settings toggle or onboarding ready triggers permission check.
2. App checks system status: `Notifications.getPermissionsAsync()`.
3. If unasked → calls `requestPermissionsAsync()`.
   - User grants: stores permissions ⟹ schedules reminders.
   - User denies: sets `remindersPermissionDenied = true` in preferences.
4. If previously denied and user toggles setting → redirects user to system settings (`Linking.openSettings()`).

#### F-NOTIF-02: Schedule Local Overdue Reminder
1. App fetches overdue reminders using `fetchOverdueReminders()` API.
2. Loops through unpaid entries where due date has passed.
3. Invokes `Notifications.scheduleNotificationAsync()` for each unique customer.
4. Sets local alert trigger to the hour and minute configured in user preferences.

#### F-NOTIF-03: Cancel Local Overdue Reminder
1. Customer payment recorded, reducing outstanding balance to ₹0.00.
2. System calls `cancelOverdueReminder(customerId)`.
3. Notification engine removes scheduled alert from local trigger index.

---

### 3.8 System Error Flows

#### F-ERR-01: Auth Credentials Validation Error
1. User submits invalid email format or weak password (under 6 characters) on signup/login.
2. Formik validation checks fail ⟹ prevents API call ⟹ renders inline warning under input fields.
3. If API fails due to rate limits or wrong password ⟹ `useLogin` catches error ⟹ displays warning toast.

#### F-ERR-02: Profile Resolution Failure
1. User successfully log in, but database returns null profile row.
2. Layout route listener detects missing profile.
3. Redirects user session to `/profile-error` screen.
4. User must tap **Retry** to reload profile, or **Sign Out** to clear session.

#### F-ERR-03: Duplicate Customer Phone Block
1. User attempts to save customer with a phone number already assigned to another client.
2. Supabase unique constraint `parties_vendor_phone_unique` throws database exception code `23505`.
3. API catches code ⟹ transforms exception into validation message: `"A person with this phone number already exists in your account."`
4. Form displays inline block alert.

#### F-ERR-04: Payment Overpay Validation
1. User inputs collection amount exceeding outstanding balance.
2. Form checks input value: `inputAmount > balanceDue`.
3. Keypad validation disables submit CTA and renders warning: `"Amount cannot exceed ₹due"`.

#### F-ERR-05: Offline Replay Retry Failure
1. Reconnection triggers background sync queue replay.
2. Mutation API fails 3 times due to persistent errors.
3. Queue manager drops the item (`syncQueue.incrementRetry` returns false) ⟹ emits `MutationDropped` event.
4. App invalidates local TanStack cache to revert optimistic updates and align UI with actual server state.
5. Displays toast alert: `"Some changes failed to sync. Local ledger reverted."`

#### F-ERR-06: Supabase Down Read Fallback
1. App attempts to fetch list views when Supabase server is down.
2. REST calls fail or timeout.
3. TanStack Query resolves cache from MMKV persister.
4. App displays cached data and renders warning banner: `Offline • Showing cached results`.

#### F-ERR-07: Local PDF Generation Failure
1. PDF printer fails during HTML compiling or logo asset loading.
2. App catches printing exception ⟹ cancels share sheet.
3. Toast alert surfaces: `"Could not generate PDF statement. Please try again."`

#### F-ERR-08: Malformed Shared Link Token
1. Public route loader parses malformed URL parameter token.
2. Cryptographic check or database lookup fails.
3. Renders invalid page displaying: `"Link unavailable. Check link format or ask merchant for a new link."`

---

## 4. Appendix: Flow Cross-Reference Matrix

The table below maps user flow codes to routes, components, and API hook boundaries:

| Flow Code | App Route Path | Screen View / Modal Component | Hook / Service Location |
| :--- | :--- | :--- | :--- |
| **F-AUTH-01** | `/` | `WelcomePage` | [app/index.tsx](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/app/index.tsx) |
| **F-AUTH-02** | `/(auth)/signup` | `SignupPage` | [useSignUp](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useAuth.ts#L94) |
| **F-AUTH-03** | `/(auth)/login` | `LoginPage` | [useLogin](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useAuth.ts#L57) |
| **F-AUTH-04** | `/(auth)/phone-setup` | `PhoneSetupPage` | [usePhoneSetup](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/usePhoneSetup.ts) |
| **F-AUTH-05** | `/(auth)/login` | `LoginPage` | [useGoogleSignIn](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useAuth.ts#L75) |
| **F-AUTH-06** | `/(auth)/resetPassword` | `ResetPasswordPage` | [useResetPassword](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useAuth.ts#L140) |
| **F-AUTH-07** | `/(auth)/set-new-password`| `SetNewPasswordPage` | [useAuthStore](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/authStore.ts) |
| **F-AUTH-08** | `/(auth)/onboarding/business`| `BusinessSetupPage` | [useAuthStore](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/store/authStore.ts) |
| **F-AUTH-11** | `/(main)/profile` | `ProfilePage` | [useLogout](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useAuth.ts#L150) |
| **F-DASH-01** | `/(main)/dashboard` | `DashboardPage` | [useDashboard](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useDashboard.ts) |
| **F-CUST-01** | `/(main)/people/create` | `CreateCustomerPage` | [usePeople](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/usePeople.ts) |
| **F-CUST-03** | `/(main)/people/[customerId]`| `CustomerDetailPage` | [useParties](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useParties.ts) |
| **F-ENTR-02** | `/(main)/entries/create` | `CreateEntryForm` | [useEntries](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useEntries.ts) |
| **F-PAY-01** | Modal Overlay | `RecordPaymentModal` | [usePayments](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/usePayments.ts) |
| **F-SHARE-02** | `/(main)/people/[customerId]`| `CustomerDetailPage` | [accessToken.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/accessToken.ts) |
| **F-NOTIF-02** | Background Job | Local Alert | [useOverdueNotifications](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useOverdueNotifications.ts) |
| **F-EXPORT-02**| `/(main)/people/[customerId]`| `CustomerDetailPage` | [exportLedgerPdf.ts](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/utils/exportLedgerPdf.ts) |
| **F-PUB-01** | `/l/[token]` | `PublicLedgerPage` | [get_ledger_by_token](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/api/people.ts) |
| **F-ERR-05** | Notification Banner | `OfflineBanner` | [useNetworkSync](file:///c:/Users/Subrat/OneDrive/Desktop/kredBook/src/hooks/useNetworkSync.ts) |
