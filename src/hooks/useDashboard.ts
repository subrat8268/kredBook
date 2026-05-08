import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDashboardData, getNetPositionReport } from "../api/dashboard";
import { buildDashboardViewModel } from "../features/dashboard/logic";
import { syncOverdueReminders } from "../lib/notifications";
import { usePreferencesStore } from "../store/preferencesStore";

export function useDashboard(vendorId?: string) {
  const queryClient = useQueryClient();
  const remindersEnabled = usePreferencesStore(
    (s) => s.overdueRemindersEnabled,
  );
  const reminderHour = usePreferencesStore((s) => s.overdueReminderHour);
  const reminderMinute = usePreferencesStore((s) => s.overdueReminderMinute);
  const reminderSnoozes = usePreferencesStore(
    (s) => s.overdueReminderSnoozes,
  );
  const pruneReminderSnoozes = usePreferencesStore(
    (s) => s.pruneOverdueReminderSnoozes,
  );

  const query = useQuery({
    queryKey: ["dashboard", vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      return await getDashboardData(vendorId);
    },
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  const refreshDashboard = () => {
    if (vendorId)
      queryClient.invalidateQueries({ queryKey: ["dashboard", vendorId] });
  };

  useEffect(() => {
    if (!vendorId) return;
    pruneReminderSnoozes();
    // Backend contract still returns overdueCustomersList; treat as people list.
    const overduePeople = query.data?.overdueCustomersList ?? [];
    syncOverdueReminders(
      overduePeople.map((person: any) => ({
        customerId: person.id,
        customerName: person.name,
        balance: person.balance,
        daysSince: person.daysSince,
      })),
      {
        enabled: remindersEnabled,
        hour: reminderHour,
        minute: reminderMinute,
        snoozes: reminderSnoozes,
      },
    );
  }, [
    vendorId,
    remindersEnabled,
    reminderHour,
    reminderMinute,
    reminderSnoozes,
    pruneReminderSnoozes,
    query.data?.overdueCustomersList,
  ]);

  return {
    ...query,
    ...buildDashboardViewModel(query.data ?? null),
    refreshDashboard,
  };
}

export function useNetPositionReport(vendorId?: string, rangeDays = 30) {
  return useQuery({
    queryKey: ["netPositionReport", vendorId, rangeDays],
    queryFn: async () => {
      if (!vendorId) return null;
      return getNetPositionReport(vendorId, rangeDays);
    },
    enabled: !!vendorId,
    staleTime: 60_000,
  });
}
