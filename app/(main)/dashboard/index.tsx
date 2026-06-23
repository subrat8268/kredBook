import { fetchPersonDetail } from "@/src/api/people";
import DashboardScreen from "@/src/features/dashboard/components/DashboardScreen";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAddPerson, usePeople } from "@/src/hooks/usePeople";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

type PaymentContext = {
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
  initialAmount?: number;
};

export default function DashboardRoute() {
  const { colors, gradients, spacing, statusBarStyle } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ action?: string }>();
  const { profile } = useAuthStore();
  const [customerSearch, setCustomerSearch] = useState("");

  const {
    toReceive,
    overdueCustomers,
    data: dashboardData,
    overdueTotalCount,
    weekDelta,
    recentActivity,
    isLoading,
    isFetching,
    error,
    refreshDashboard,
  } = useDashboard(profile?.id);

  const addCustomerMutation = useAddPerson(profile?.id ?? "");

  const {
    people: pickerPeople,
    isLoading: isPickerLoading,
    fetchNextPage: fetchMorePickerPeople,
    hasNextPage: pickerHasNextPage,
    isFetchingNextPage: pickerIsFetchingNextPage,
  } = usePeople(profile?.id, customerSearch);

  const openRecordPaymentForCustomer = useCallback(async (customerId: string, customerName: string): Promise<PaymentContext | null> => {
    if (!profile?.id) return null;
    const detail = await fetchPersonDetail(customerId, profile.id);
    if (!detail?.pendingOrderId || !detail.pendingOrderBalance) {
      return null;
    }

    return {
      orderId: detail.pendingOrderId,
      balanceDue: detail.pendingOrderBalance,
      customerId: detail.id,
      customerName,
      initialAmount: detail.pendingOrderBalance,
    };
  }, [profile?.id]);

  const clearActionParam = useCallback(() => {
    router.setParams({ action: undefined });
  }, [router]);

  const addCustomer = useCallback(
    async (values: { name: string; phone?: string; address?: string; openingBalance?: number }) => {
      await addCustomerMutation.mutateAsync({
        name: values.name,
        phone: values.phone || "",
        address: values.address,
        openingBalance: values.openingBalance,
      });
    },
    [addCustomerMutation],
  );

  const pickerList = useMemo(
    () =>
      pickerPeople.map((person) => ({
        id: person.id,
        name: person.name,
        phone: person.phone,
        balance: person.outstandingBalance ?? 0,
      })),
    [pickerPeople],
  );

  if (!profile) return null;

  return (
    <DashboardScreen
      colors={colors}
      gradients={gradients}
      spacing={spacing}
      statusBarStyle={statusBarStyle}
      profile={profile}
      actionParam={params.action}
      clearActionParam={clearActionParam}
      toReceive={toReceive}
      dashboardData={dashboardData}
      overdueCustomers={overdueCustomers}
      overdueTotalCount={overdueTotalCount}
      weekDelta={weekDelta}
      recentActivity={recentActivity}
      isLoading={isLoading}
      isFetching={isFetching}
      dashboardErrorMessage={error instanceof Error ? error.message : undefined}
      refreshDashboard={refreshDashboard}
      addCustomer={addCustomer}
      isAddingCustomer={addCustomerMutation.isPending}
      addCustomerError={addCustomerMutation.error?.message}
      pickerPeople={pickerList}
      isPickerLoading={isPickerLoading}
      pickerHasNextPage={pickerHasNextPage}
      pickerIsFetchingNextPage={pickerIsFetchingNextPage}
      fetchMorePickerPeople={fetchMorePickerPeople}
      search={customerSearch}
      setSearch={setCustomerSearch}
      openRecordPaymentForCustomer={openRecordPaymentForCustomer}
      onPressNotifications={() => router.push({ pathname: "/(main)/people", params: { filter: "Overdue" } } as never)}
      onOpenCustomerDetail={(customerId) => router.push({ pathname: "/(main)/people/[customerId]", params: { customerId } } as never)}
      onOpenEntryDetail={(orderId) => router.push(`/(main)/entries/${orderId}`)}
      onOpenPeople={() => router.push("/(main)/people" as never)}
      onOpenEntries={() => router.push("/(main)/entries" as never)}
    />
  );
}
