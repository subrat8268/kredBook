# Flow: Entry Detail Navigation

> **Last Updated**: May 28, 2026
> **Version**: v3.1

---

## 1. Entry Points
Users can navigate to the Entry Detail screen from the following locations:

- **Entries List:** Tapping any entry card in the main list (`app/(main)/entries/index.tsx`).
- **Customer Detail:** Tapping on a transaction in a specific customer's history list (`app/(main)/people/[customerId].tsx`).
- **Dashboard:** Tapping on a recent transaction from the dashboard summary (`app/(main)/index.tsx`).

---

## 2. Exit Points
Users can navigate away from this screen via these actions:

| Trigger | Action | Destination |
|---|---|---|
| **Back Arrow** | Tap | Previous screen in the navigation stack. |
| **Customer Card** | Tap | Navigates to the customer's profile (`/people/[customerId]`). |
| **Edit Action** | Tap | Navigates to the entry editor (`/entries/[orderId]/edit`). |
| **Delete Action** | Tap & Confirm | Navigates back to the previous screen after deletion. |

---

## 3. Modal & Sheet Flows

### Record Payment
- **Trigger:** Tapping the primary "Record Payment" button in the sticky `Action Bar`.
- **Flow:**
    1. The `RecordCustomerPaymentModal` is presented as a bottom sheet.
    2. The modal is pre-filled with the `orderId` and the current `balance_due`.
    3. User enters an amount, selects a payment method, and confirms.
    4. On success, the modal dismisses, relevant data is re-fetched, and a success toast is shown.
    5. On failure, an error toast is shown.

### Delete Confirmation
- **Trigger:** Tapping the "Delete entry" text in the `Overflow Actions` section.
- **Flow:**
    1. A native `Alert.alert` dialog is shown, asking for confirmation.
    2. **Cancel:** The dialog is dismissed, and no action is taken.
    3. **Delete:** The `deleteOrder` API is called. On success, the user is navigated back to the previous screen, and a success toast is shown.

### Remind Flow
- **Trigger:** Tapping the secondary "Remind" button in the sticky `Action Bar`.
- **Flow (Direct to WhatsApp):**
    1. A WhatsApp message is pre-filled with the customer's name and the balance due.
    2. The device's `Linking` module attempts to open WhatsApp.
    3. If WhatsApp is not installed, a native `Alert.alert` is shown.

### Share Flow (Send Entry / Share Receipt)
- **Trigger:** Tapping the "Send Entry" or "Share Receipt" button in the `Action Bar`.
- **Flow:**
    1. `generateBillPdf` is called to create a PDF of the entry details.
    2. The native `Sharing` sheet is presented, allowing the user to share the generated PDF to any compatible app (WhatsApp, email, etc.).

---

## 4. Edge Cases

- **Entry with No Customer:** The Customer Card will display "Unknown Person" and have no phone number. Tapping the card will have no effect. The `Call` and `WhatsApp` buttons on the card will be hidden.
- **Entry with No Items:** This is not an expected state, as an entry must have at least one item. If it occurs, the Items Card will simply show its collapsed state with "0 items" and an amount of "₹0".
- **Deleted Customer:** If the customer associated with an entry has been deleted, the Customer Card will show "Unknown Person".
