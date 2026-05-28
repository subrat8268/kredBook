# Entry Detail Screen: Product & UI Plan

## CONTEXT

This is the most important screen in KredBook. It's where a business owner:

- Understands the current state of a transaction
- Takes the most critical action (record payment)
- Communicates with their customer (remind/send)
- Reviews what was sold and what's owed

The screen must work perfectly across 3 states: PENDING, PARTIAL, and PAID.

## SECTION 1 — SCREEN ANATOMY (what exists today)

1.  **Header Bar**
    - Back arrow + Entry ID + Date
    - Call button (top right, conditional on phone number)

2.  **Hero Card (status-driven)**
    - Label: "BALANCE DUE"
    - Amount: Large rupee value of the balance
    - Status badge: Pending / Partial / Paid / Overdue
    - Meta: Entry creation date & Entry ID
    - Background: Status-driven gradient (orange for pending, red for overdue, blue for partial, green for paid)

3.  **Quick Actions Tile**
    - Contains three actions: Edit, Delete, Remind.
    - The "Remind" action is hidden when the entry is fully paid.

4.  **Customer Link Card**
    - A card containing the customer's avatar (initials), full name, and phone number.
    - Tapping the card navigates to the customer's detail screen.
    - Includes a "View Customer →" CTA.

5.  **Items Card**
    - Section label: "ITEMS"
    - A list of line items, each showing product name, quantity × price, and total amount.
    - A summary section with Subtotal, Tax (if applicable), and Grand Total.

6.  **Payments Card**
    - Section label: "PAYMENTS"
    - A sub-label showing "Paid ₹X of ₹Y" and a visual progress bar.
    - A list of payment rows, each showing the payment method, date, amount, and a "Received" chip.
    - An empty state with a wallet icon when no payments have been recorded.

7.  **Action Bar (bottom, sticky)**
    - **PENDING/PARTIAL states:** Two buttons, "Record Payment" (primary) and "Send Entry" (secondary).
    - **PAID state:** A single, full-width "Send Receipt" button.

## SECTION 2 — PM REASONING (why each component exists)

### Header Bar

**Job:** To provide context and standard navigation.
**Why here:** The Entry ID is the primary identifier. The date provides temporal context. The back button is a standard navigation pattern. The call button provides a shortcut for immediate communication.
**Priority:** P0
**Current problems:** The call button is small and lacks prominence for such a key action.

### Hero Card

**Job:** To show the most critical number—what's owed—at a glance.
**Why here:** This is the single most important piece of information on the screen. The large typography and status-driven color make the entry's state immediately obvious without reading anything else.
**Priority:** P0
**Current problems:** None observed. The component is clear and effective.

### Quick Actions Tile

**Job:** To provide secondary actions related to the entry itself.
**Why here:** Edit, Delete, and Remind are common lifecycle actions for an entry. Grouping them below the hero card keeps them accessible but separate from the primary payment actions.
**Priority:** P1
**Current problems:** The visual styling is inconsistent with the rest of the app, feeling less polished.

### Customer Link Card

**Job:** To identify the customer associated with the entry and provide a path to their profile.
**Why here:** The customer context is essential. Business owners often need to see the customer's full history, which is one tap away.
**Priority:** P0
**Current problems:** The card lacks proper container styling, making it feel disconnected from the UI. The avatar styling is inconsistent.

### Items Card

**Job:** To detail exactly what was sold and how the total was calculated.
**Why here:** Provides a transparent, itemized breakdown of the entry, which is crucial for resolving disputes and for customer clarity.
**Priority:** P0
**Current problems:** The layout lacks the clear structure of a professional invoice. The typography doesn't effectively differentiate between item rows and summary rows.

### Payments Card

**Job:** To provide a historical record of all payments made against the entry.
**Why here:** Tracks the payment history, showing how the balance due was reduced over time. This is critical for reconciliation and bookkeeping.
**Priority:** P0
**Current problems:** The empty state is not engaging. The payment rows could be clearer.

### Action Bar

**Job:** To present the primary, most urgent action(s) to the user.
**Why here:** A sticky bottom bar ensures that the main CTA ("Record Payment") is always visible and accessible, which is the most common action on this screen for an unpaid entry.
**Priority:** P0
**Current problems:** The bar floats over content without a top border, which can make it hard to distinguish from scrolling content beneath it.

## SECTION 3 — STATE MATRIX

| Component      | PENDING            | PARTIAL            | PAID              |
| -------------- | ------------------ | ------------------ | ----------------- |
| Hero bg colour | orange             | blue               | green             |
| Hero label     | BALANCE DUE        | BALANCE DUE        | BALANCE DUE       |
| Status badge   | Pending            | Partial            | Paid              |
| Quick Actions  | Edit·Delete·Remind | Edit·Delete·Remind | Edit·Delete       |
| Items badge    | Pending            | Partial            | Paid              |
| Payments card  | empty state        | payment rows       | all rows          |
| Action bar     | Record+Send        | Record+Send        | Send Receipt only |

## SECTION 4 — ISSUES FOUND (current build)

**CRITICAL (breaks usability):**

- [ ] Phone number in Customer Card sometimes shows "+91 +91XXXXXXXXXX" due to a data duplication bug.

**HIGH (degrades quality):**

- [ ] In Quick Actions, the "Remind" label is bolded while "Edit" and "Delete" are not, creating visual inconsistency.
- [ ] The progress bar in the Payments section is invisible when at 0% because the track color blends with the background.
- [ ] The bottom Action Bar lacks a top border, causing it to visually merge with scrollable content.

**MEDIUM (polish):**

- [ ] The icon background circles in the Quick Actions tile are too large and visually heavy.
- [ ] In the paid state, the Action Bar only offers "Send Receipt", leaving no secondary options or whitespace.

## SECTION 5 — MISSING FEATURES (PM wishlist)

1.  **Due Date on Hero**
    - **Why:** Business owners need to know if an entry is overdue at a glance.
2.  **Overdue state**
    - **Why:** A distinct visual state (e.g., a red hero card) for overdue entries creates urgency and prompts action.
3.  **Note/Remarks field**
    - **Why:** Allows for adding critical context like "Advance paid", "Disputed", or "Deliver after 5pm".
4.  **Payment method breakdown**
    - **Why:** A summary line like "Cash ₹100 · UPI ₹50" helps business owners who settle accounts by payment method.
5.  **Edit payment row**
    - **Why:** Entering the wrong payment amount is a common mistake with no current fix path. A long-press to edit/delete is needed.
6.  **Share entry as image**
    - **Why:** WhatsApp is a primary communication tool in Bharat; sharing a clean image of the entry is often preferable to a PDF.

## SECTION 6 — REDESIGN DECISIONS

### Hero Card

**Decision:** Keep as-is
**Rationale:** The component is clear, effective, and communicates the most critical information well.
**Sprint:** Current

### Quick Actions Tile

**Decision:** Polish
**Rationale:** The functionality is correct, but the visual styling is inconsistent with the rest of the app and needs to be updated to match the design system.
**Sprint:** Current

### Customer Link Card

**Decision:** Redesign
**Rationale:** The current implementation lacks proper card styling and feels disconnected. A redesign is needed to present the information in a clean, professional card that matches the "Integrated Action" pattern.
**Sprint:** Current

### Items Card

**Decision:** Redesign
**Rationale:** The current layout lacks the structure of a professional invoice. The "Invoice-style" redesign will improve clarity, scannability, and trustworthiness.
**Sprint:** Current

### Payments Card

**Decision:** Redesign
**Rationale:** The current implementation is functional but can be improved. The "Timeline Style" redesign will provide a clearer chronological history and a more engaging empty state.
**Sprint:** Current

### Action Bar

**Decision:** Polish
**Rationale:** The component is functionally sound, but needs a top border to visually separate it from the content area.
**Sprint:** Current
