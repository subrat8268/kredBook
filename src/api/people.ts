import { toApiError } from "../lib/supabaseQuery";
import { supabase, executeWithOfflineQueue } from "../services/supabase";
import { Person, PersonDetail } from "../types/customer";
export type { Person };

export const PAGE_SIZE = 10;

export async function fetchPeople(
  pageParam: number,
  vendorId: string,
  search?: string,
) {
  let query = supabase
    .from("parties")
    .select("id, vendor_id, name, phone, address, created_at")
    .eq("vendor_id", vendorId)
    .eq("is_customer", true)
    .order("created_at", { ascending: false })
    .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw toApiError(error);
  const people = (data ?? []) as Person[];

  // Determine overdue: balance_due > 0 AND due_date < today
  const { data: overdueOrders } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("vendor_id", vendorId)
    .gt("balance_due", 0)
    .lt("due_date", new Date().toISOString());

  const overdueIds = new Set(
    (overdueOrders ?? []).map((o: any) => o.customer_id),
  );

  // Fetch sum of balance_due per person
  const { data: balanceRows } = await supabase
    .from("orders")
    .select("customer_id, balance_due, created_at")
    .eq("vendor_id", vendorId)
    .in(
      "customer_id",
      people.map((person) => person.id),
    );

  const balanceByPerson: Record<string, number> = {};
  const lastActiveByPerson: Record<string, string> = {};
  for (const row of balanceRows ?? []) {
    balanceByPerson[row.customer_id] =
      (balanceByPerson[row.customer_id] ?? 0) + Number(row.balance_due);
    const existing = lastActiveByPerson[row.customer_id];
    if (!existing || row.created_at > existing) {
      lastActiveByPerson[row.customer_id] = row.created_at;
    }
  }

  return people.map((person) => ({
    ...person,
    isOverdue: overdueIds.has(person.id),
    outstandingBalance: balanceByPerson[person.id]
      ? Math.round(balanceByPerson[person.id] * 100) / 100
      : 0,
    lastActiveAt: lastActiveByPerson[person.id] ?? person.created_at,
  }));
}

export async function addPerson(
  vendorId: string,
  values: Omit<Person, "id" | "vendor_id" | "created_at">,
) {
  // Wrap mutation with offline queue fallback
  return executeWithOfflineQueue(
    async () => {
      const { openingBalance, ...rest } = values as any;
      const payload: Record<string, any> = { ...rest, vendor_id: vendorId };
      if (openingBalance && openingBalance > 0) {
        payload.opening_balance = openingBalance;
      }
       const { data, error } = await supabase
         .from("parties")
         .insert([
           {
             ...payload,
             is_customer: true,
           },
         ])
         .select()
         .single();
      if (error) {
        if (error.code === "23505") {
          throw new Error(
            "A person with this phone number already exists in your account.",
          );
        }
        throw error;
      }
      return data as Person;
    },
    {
      entity: 'customer',
      operation: 'CREATE',
      payload: {
        vendorId,
        ...values,
      },
    }
  );
}

// Backward-compatible aliases (deprecated)
export const fetchCustomers = fetchPeople;
export const addCustomer = addPerson;
export const fetchCustomerDetail = fetchPersonDetail;

export async function fetchPersonDetail(
  customerId: string,
  vendorId: string,
): Promise<PersonDetail | null> {
  const { data: person, error: custErr } = await supabase
    .from("parties")
    .select("id, vendor_id, name, phone, address, customer_balance")
    .eq("id", customerId.trim())
    .eq("vendor_id", vendorId)
    .eq("is_customer", true)
    .maybeSingle();

  if (custErr) {
    console.error("Error fetching person:", custErr.message);
    return null;
  }
  if (!person) return null;

  // Single RPC: orders + statement in 1 round-trip
  const { data: detailRow, error: detailErr } = await supabase
    .rpc("get_customer_full_detail", {
      p_customer_id: customerId,
      p_vendor_id: vendorId,
    })
    .maybeSingle();

  if (detailErr) {
    console.error("Error fetching customer detail:", detailErr.message);
    return null;
  }
  if (!detailRow) return null;

  // PostgREST wraps scalar returns under the function-name key
  const detail = (detailRow as any)?.get_customer_full_detail as any;
  const orderList = (detail?.orders ?? []) as any[];

  const outstandingBalance =
    Math.round(
      orderList.reduce((sum, o) => sum + Number(o.balance_due), 0) * 100,
    ) / 100;

  // Fix #2: compare client-computed balance with DB trigger balance
  const dbBalance =
    person.customer_balance != null
      ? Math.round(Number(person.customer_balance) * 100) / 100
      : null;
  const reconciliationWarning =
    dbBalance !== null && Math.abs(outstandingBalance - dbBalance) > 0.01;

  if (__DEV__ && reconciliationWarning) {
    console.error(
      `[kredBook] Balance reconciliation mismatch for customer ${customerId}: ` +
        `computed=${outstandingBalance}, db=${dbBalance}. ` +
        `Possible trigger lag or data integrity issue.`,
    );
  }

  // Overdue: outstanding balance AND most recent order is >30 days old
  const lastOrder = orderList[orderList.length - 1];
  const lastOrderDate = lastOrder?.created_at ?? null;
  const daysSinceLastOrder = lastOrderDate
    ? Math.floor(
        (Date.now() - new Date(lastOrderDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const isOverdue = outstandingBalance > 0 && daysSinceLastOrder > 30;

  // Map RPC statements to unified entry list
  const allEvents = (detail?.statements ?? []).map((s: any) => ({
    id: s.id,
    type: s.type as "bill" | "payment",
    created_at: s.created_at,
    amount: Number(s.amount),
    runningBalance: Number(s.running_balance),
    billNumber: s.bill_number,
    status: s.status as "Paid" | "Pending" | "Partially Paid" | undefined,
    itemCount: Number(s.item_count),
    paymentMode: s.payment_mode ? s.payment_mode : undefined,
    orderBillNumber: s.order_bill_number ? s.order_bill_number : undefined,
  }));

  // Fix #7: normalize status casing when finding oldest pending order
  const pendingOrder = orderList.find(
    (o) => o.status?.toLowerCase() !== "paid" && Number(o.balance_due) > 0,
  );

  return {
    id: person.id,
    name: person.name,
    phone: person.phone,
    address: person.address,
    outstandingBalance,
    dbBalance: dbBalance ?? undefined,
    reconciliationWarning: reconciliationWarning || undefined,
    isOverdue,
    daysSinceLastOrder,
    lastActiveAt: lastOrderDate,
    pendingOrderId: pendingOrder?.id ?? null,
    pendingOrderBalance: pendingOrder ? Number(pendingOrder.balance_due) : 0,
    orders: orderList
      .slice()
      .reverse()
      .map((o) => ({
        id: o.id,
        created_at: o.created_at,
        amount: Number(o.total_amount),
        amount_paid: Number(o.amount_paid),
        balance_due: Number(o.balance_due),
        due_date: o.due_date,
        status: o.status as "Paid" | "Pending" | "Partially Paid",
      })),
    transactions: allEvents,
  };
}

export async function deletePerson(
  customerId: string,
  vendorId: string,
): Promise<void> {
  return executeWithOfflineQueue(
    async () => {
      const { error } = await supabase
        .from("parties")
        .delete()
        .eq("id", customerId);
      if (error) throw error;
    },
    {
      entity: "customer",
      operation: "DELETE",
      payload: { id: customerId, vendorId },
    }
  );
}

export async function updatePerson(
  customerId: string,
  vendorId: string,
  values: { name: string; phone?: string | null; address?: string | null }
): Promise<void> {
  return executeWithOfflineQueue(
    async () => {
      const { error } = await supabase
        .from("parties")
        .update({
          name: values.name,
          phone: values.phone || null,
          address: values.address || null,
        })
        .eq("id", customerId);
      if (error) throw error;
    },
    {
      entity: "customer",
      operation: "UPDATE",
      payload: { id: customerId, vendorId, ...values },
    }
  );
}
