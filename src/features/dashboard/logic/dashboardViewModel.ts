import type { DashboardData, RecentActivityItem } from "@/src/api/dashboard";

type OverduePerson = {
  id: string;
  name: string;
  phone: string;
  balance: number;
  daysSince: number;
};

function dedupeOverduePeople(items: OverduePerson[]): OverduePerson[] {
  const uniqueById = new Map<string, OverduePerson>();
  for (const item of items) {
    if (!uniqueById.has(item.id)) uniqueById.set(item.id, item);
  }
  return Array.from(uniqueById.values());
}

export function buildDashboardViewModel(data: DashboardData | null) {
  const overdueCustomersAll: OverduePerson[] = data?.overdueCustomersList ?? [];
  const dedupedOverduePeople = dedupeOverduePeople(overdueCustomersAll);

  const followUpPeople = dedupedOverduePeople
    .slice()
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 5);

  const recentActivity: RecentActivityItem[] = data?.recentActivity ?? [];
  const collectedThisMonth = recentActivity
    .filter((item) => item.type === "payment")
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

  return {
    totalReceivables: data?.outstandingAmount ?? 0,
    netPosition: data?.netPosition ?? 0,
    toReceive: data?.customersOweMe ?? 0,
    toGive: data?.iOweSuppliers ?? 0,
    weekDelta: data?.weekDelta ?? 0,
    weekDeltaPct: data?.weekDeltaPct ?? 0,
    activeBuyers: data?.activeBuyers ?? 0,
    activeSuppliers: data?.activeSuppliers ?? 0,
    overduePayments: data?.overduePayments ?? 0,
    overdueSuppliers: data?.overdueSuppliersList ?? [],
    overdueCustomers: overdueCustomersAll.slice(0, 3),
    overdueCustomersAll,
    overdueTotalCount: data?.overdueCustomers ?? 0,
    recentActivity,
    followUpPeople,
    collectedThisMonth,
  };
}
