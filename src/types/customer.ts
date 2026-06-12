export interface Person {
  id: string;
  name: string;
  phone: string;
  vendor_id: string;
  address?: string;
  /** Pre-existing balance when adding a person who already owes money */
  openingBalance?: number;
  created_at: string;
  isOverdue?: boolean;
  outstandingBalance?: number;
  /** ISO timestamp of the last order/payment activity with this person */
  lastActiveAt?: string;
}

export interface Transaction {
  id: string;
  type: "bill" | "payment";
  created_at: string;
  amount: number;
  runningBalance: number;
  // Entry fields
  billNumber?: string;
  status?: "Paid" | "Pending" | "Partially Paid";
  /** Number of line items on an entry transaction */
  itemCount?: number;
  // Payment fields
  paymentMode?: string;
  /** Entry number of the order this payment settles (e.g. "INV-042") */
  orderBillNumber?: string;
}

export interface PersonDetail {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  outstandingBalance: number;
  /** DB-maintained denormalized balance from parties.customer_balance */
  dbBalance?: number;
  /**
   * True when the client-computed outstandingBalance diverges from the
   * DB-maintained customer_balance by more than ₹0.01 — indicates a
   * trigger lag or data integrity issue.
   */
  reconciliationWarning?: boolean;
  isOverdue: boolean;
  daysSinceLastOrder: number;
  lastActiveAt?: string | null;
  // oldest pending order id (for recording payments)
  pendingOrderId?: string | null;
  pendingOrderBalance?: number;
  orders: {
    id: string;
    created_at: string;
    amount: number;
    amount_paid: number;
    balance_due: number;
    due_date?: string | null;
    status: "Paid" | "Pending" | "Partially Paid";
  }[];
  transactions: Transaction[];
}

// Backward-compatible aliases (deprecated: use Person/PersonDetail)
export type Customer = Person;
export type CustomerDetail = PersonDetail;
