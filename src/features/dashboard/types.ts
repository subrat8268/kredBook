export type DashboardPerson = {
  id: string;
  name: string;
  daysSince: number;
  balance: number;
};

export type DashboardActivityItem = {
  id: string;
  name?: string;
  title: string;
  date: string;
  amount: number;
  type: "payment" | "bill" | string;
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid" | "Advance";
};

export type DashboardPaymentContext = {
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
  initialAmount?: number;
};

export type DashboardPickerPerson = { id: string; name: string };
