# Entry Detail Screen

### 1. SCREEN PURPOSE
The Entry Detail screen is the source of truth for a single transaction. It is designed for business owners to instantly understand the status of an entry (who owes them, how much, and since when), take the most critical next action (record a payment or remind a customer), and review the transaction history and details if needed.

### 2. USER MENTAL MODEL
The screen is structured to follow a business owner's thought process when reviewing an entry:
1.  **WHO** is this transaction with? (Customer Card)
2.  **HOW MUCH** is owed, and what's the status? (Hero Card)
3.  **WHAT HAPPENED** since the entry was created? (Payments Card)
4.  **DETAILS** of what was sold. (Items Card)

### 3. INFORMATION HIERARCHY
1.  **Header Bar:** Provides navigation context (Entry ID, date).
2.  **Customer Card:** Identifies the user (WHO). Promoted to the top.
3.  **Hero Card:** Shows the most critical number (HOW MUCH) and status.
4.  **Payments Card:** Shows payment history (WHAT HAPPENED). Promoted to be above Items.
5.  **Items Card:** Shows line-item details (DETAILS). Demoted and collapsed by default.
6.  **Overflow Actions:** Provides access to less frequent, administrative actions (Edit/Delete).
7.  **Action Bar:** A sticky bar with a single, dominant Call to Action.

### 4. COMPONENT SPECS

#### Header Bar
- **Purpose:** Provide clear identification and standard back navigation.
- **Visual Spec:**
    - **Layout:** `flex-row`, `justify-between`, `items-center`.
    - **Title:** `Entry #[bill_number]` using `Inter 17px/600`.
    - **Subtitle:** Entry creation date using `Inter 13px/400` with color `#9ca3af`.
- **State Variations:** None.
- **What was removed and why:** The `Call` button was removed to de-clutter the header and move all customer-related actions to the Customer Card.

#### Customer Card
- **Purpose:** Immediately identify the customer and provide quick communication actions.
- **Visual Spec:**
    - **Layout:** Full-width card with `flex-row`, `items-center`. `padding: 12px 16px`. `borderRadius: 16px`, `backgroundColor: #ffffff`, `border: 1px solid #e5e7eb`.
    - **Avatar (Left):** `44x44px` circle (`bg: #dcfce7`), containing initials (`Inter 15px/700`, `color: #16a34a`).
    - **Info (Center):** Customer name (`Inter 15px/600`, `#111827`) stacked above phone number (`Inter 13px/400`, `#9ca3af`). Phone number must strip existing country code before prepending +91 to prevent `+91 +91` duplication bug.
    - **Actions (Right):** A `Call` icon button and a `WhatsApp` icon button, both in `32x32px` circular containers with `#dcfce7` background.
- **State Variations:** None. The card is tappable in all states.
- **What was removed and why:** The standalone "View Customer →" text was removed because the entire card is now a single, clear tap target to navigate to the customer's profile.

#### Hero Card
- **Purpose:** Display the most critical financial status of the entry in a highly scannable format.
- **Visual Spec:**
    - **Layout:** Full-width card with a status-driven gradient background.
    - **Label:** "BALANCE DUE" (`Inter 11px/600`, `white`, `letter-spacing: 1.2`).
    - **Amount:** The balance due (`Inter 40px/800`, `white`).
    - **Status Badge:** A white, pill-shaped badge with colored text matching the status.
    - **Due Date Line:** Text below the badge (`Inter 13px/400`, `white` at 80% opacity).
- **State Variations:**
    - **Gradient:** Pending (orange), Partial (blue), Paid (green), Overdue (red).
    - **Due Date Text:** Shows "Due [date]" for upcoming dates, "Overdue · X days" for past dates, and is hidden for `Paid` entries.
- **What was removed and why:** The Entry ID was removed from the meta line as it's already present and more prominent in the main screen header, reducing redundancy.

#### Payments Card
- **Purpose:** Show a clear, chronological history of all payments applied to the entry.
- **Visual Spec:**
    - **Layout:** Standard card container.
    - **Header:** "PAYMENTS" label and "Paid ₹X of ₹Y" sub-label.
    - **Progress Bar:** A `4px` tall bar, with a `#e5e7eb` track and a `#16a34a` fill, representing the paid percentage.
    - **Payment Rows:** A vertical list with a `1px #f3f4f6` divider between rows. Each row has the method/date on the left and the amount/chip on the right.
    - **Empty State:** A `32px` `wallet` icon (`#d1d5db`) with the text "No payments recorded yet" below it.
- **State Variations:** Displays the empty state if no payments have been made, otherwise displays the list of payment rows.

#### Items Card
- **Purpose:** Provide a detailed, itemized breakdown of the transaction, accessible on demand.
- **Visual Spec:**
    - **Default State (Collapsed):** A single row within the card container showing "N items · ₹total" and a `chevron-down` icon. The entire row is tappable.
    - **Expanded State:** On tap, expands to show the full list of items, subtotal, and grand total, same as the previous design. The icon changes to `chevron-up`.
    - **Exception:** The card should expand by default if the entry contains only one line item, as collapsing a single row adds friction with no benefit.
- **State Variations:** Toggles between collapsed and expanded states.
- **What was removed and why:** The card is now collapsed by default. This is based on the insight that users open this screen primarily for payment status, not to re-check items they've already sold. The details are secondary and available on tap.

#### Overflow Actions
- **Purpose:** Provide access to administrative, less-frequent actions.
- **Visual Spec:** A simple text row below the Items Card. "Edit entry" is left-aligned. "Delete entry" is right-aligned with a `#ef4444` danger color.
- **State Variations:** None.
- **What was removed and why:** The prominent Quick Actions tile was replaced with this subtle text row because Edit and Delete are rare, high-consequence actions that shouldn't compete for visual attention with primary tasks like recording payments. "Remind" was moved to the Action Bar as it's a communication task.

#### Action Bar
- **Purpose:** To provide a single, clear, dominant call to action.
- **Visual Spec:** A sticky bottom bar with a full-width primary button and an optional, smaller secondary button.
- **State Variations:**
    - **Pending/Partial/Overdue:** A solid green "Record Payment" button, with a small, secondary "Remind" ghost button next to it.
    - **Paid:** A single, solid green "Share Receipt" button with a WhatsApp icon.
- **What was removed and why:** The two equal-weight buttons ("Record Payment" and "Send Entry") were replaced with a single dominant CTA to guide the user to the most likely next action, reducing cognitive load.

### 5. STATE MATRIX

| Component            | PENDING                               | PARTIAL                               | PAID                              | OVERDUE                               |
|----------------------|---------------------------------------|---------------------------------------|-----------------------------------|---------------------------------------|
| **Hero Gradient**    | Orange                                | Blue                                  | Green                             | Red                                   |
| **Hero Amount**      | Shows balance                         | Shows balance                         | Shows `₹0`                        | Shows balance                         |
| **Due Date Line**    | "Due [date]"                          | "Due [date]"                          | Hidden                            | "Overdue · X days"                    |
| **Customer Card**    | Normal                                | Normal                                | Normal                            | Normal                                |
| **Payments Card**    | empty state                           | Has payment rows                      | Has all payment rows              | Empty state or has rows               |
| **Items Card**       | Collapsed                             | Collapsed                             | Collapsed                         | Collapsed                             |
| **Overflow Actions** | Edit · Delete                         | Edit · Delete                         | Edit · Delete                     | Edit · Delete                         |
| **Action Bar (Pri)** | Record Payment                        | Record Payment                        | Share Receipt                     | Record Payment                        |
| **Action Bar (Sec)** | Remind                                | Remind                                | —                                 | Remind (urgent)                       |

### 6. WHAT CHANGED AND WHY

| Old                                 | New                                           | Reason                                             |
|-------------------------------------|-----------------------------------------------|----------------------------------------------------|
| Customer card below Quick Actions   | Customer card at TOP                          | **WHO** before **HOW MUCH**: Users think about the person first. |
| Quick Actions tile                  | Overflow row + Action bar secondary           | Remind is communication; Edit/Delete are rare admin tasks. |
| Items card above Payments           | Items card below Payments, collapsed by default | Payment history is the primary need on this screen.      |
| Two equal-weight CTAs in Action Bar | One dominant CTA                              | A single clear action reduces cognitive load.        |
| No due date on hero                 | Due date / overdue line on hero               | Due date is critical, missing context.             |
| Entry ID on hero and header         | Removed from hero (kept in header)            | Reduces redundant information.                       |

### 7. OPEN QUESTIONS
- [ ] Should the Items card be collapsed by default or expanded for the first view of an entry?
- [ ] Should the "Remind" action in the action bar open a modal with options or go directly to WhatsApp?
- [ ] What is the overdue threshold? (e.g., 1 day past due, or should this be a business setting?)
- [ ] Should payment rows be tappable for editing/deleting, and if so, should it be a tap or long-press action?
