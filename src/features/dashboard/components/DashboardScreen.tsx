import { useToast } from "@/src/components/feedback/Toast";
import { useDashboardPaymentFlow } from "@/src/features/dashboard/hooks/useDashboardPaymentFlow";
import { useDashboardPresentation } from "@/src/features/dashboard/hooks/useDashboardPresentation";
import type {
  DashboardActivityItem,
  DashboardPaymentContext,
  DashboardPerson,
  DashboardPickerPerson,
} from "@/src/features/dashboard/types";
import { RefreshControl, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardFollowUpSection from "./DashboardFollowUpSection";
import DashboardHeader from "./DashboardHeader";
import DashboardHeroCard from "./DashboardHeroCard";
import DashboardPaymentFlow from "./DashboardPaymentFlow";
import DashboardQuickStats from "./DashboardQuickStats";
import DashboardRecentActivity from "./DashboardRecentActivity";
import DashboardSkeleton from "./DashboardSkeleton";

type Props = {
  colors: any;
  gradients: any;
  spacing: any;
  statusBarStyle: "default" | "light-content" | "dark-content";
  profile: any;
  actionParam?: string;
  clearActionParam: () => void;
  toReceive: number;
  dashboardData: any;
  overdueCustomers: DashboardPerson[];
  overdueTotalCount: number;
  weekDelta: number;
  recentActivity: DashboardActivityItem[];
  isLoading: boolean;
  isFetching: boolean;
  dashboardErrorMessage?: string;
  refreshDashboard: () => void;
  addCustomer: (values: { name: string; phone?: string; address?: string; openingBalance?: number }) => Promise<void>;
  isAddingCustomer: boolean;
  addCustomerError?: string;
  pickerPeople: DashboardPickerPerson[];
  isPickerLoading: boolean;
  pickerHasNextPage: boolean;
  pickerIsFetchingNextPage: boolean;
  fetchMorePickerPeople: () => void;
  search: string;
  setSearch: (value: string) => void;
  openRecordPaymentForCustomer: (customerId: string, customerName: string) => Promise<DashboardPaymentContext | null>;
  onOpenEntriesOverdue: () => void;
  onOpenPeople: () => void;
  onOpenEntries: () => void;
};

export default function DashboardScreen({
  colors,
  gradients,
  spacing,
  statusBarStyle,
  profile,
  actionParam,
  clearActionParam,
  toReceive,
  dashboardData,
  overdueCustomers,
  overdueTotalCount,
  weekDelta,
  recentActivity,
  isLoading,
  isFetching,
  dashboardErrorMessage,
  refreshDashboard,
  addCustomer,
  isAddingCustomer,
  addCustomerError,
  pickerPeople,
  isPickerLoading,
  pickerHasNextPage,
  pickerIsFetchingNextPage,
  fetchMorePickerPeople,
  search,
  setSearch,
  openRecordPaymentForCustomer,
  onOpenEntriesOverdue,
  onOpenPeople,
  onOpenEntries,
}: Props) {
  const { show: showToast } = useToast();

  const {
    businessName,
    totalOutstanding,
    displayOutstanding,
    totalCustomersCount,
    collectedThisMonth,
    followUpPeople,
  } = useDashboardPresentation({
    toReceive,
    profile,
    dashboardData,
    overdueCustomers,
    recentActivity,
  });

  const {
    paymentSheetRef,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    isCustomerPickerOpen,
    setIsCustomerPickerOpen,
    isCollecting,
    paymentContext,
    setPaymentContext,
    handleOpenRecordPaymentForCustomer,
    handleCollectNow,
  } = useDashboardPaymentFlow({
    actionParam,
    clearActionParam,
    openRecordPaymentForCustomer,
    followUpPeople,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
        <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} translucent={false} />
        <DashboardSkeleton spacing={spacing} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} translucent={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refreshDashboard} tintColor={colors.brand} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          // Bottom inset so the global SpeedDialFAB + tab bar never cover content.
          paddingBottom: spacing.tabBarHeight + spacing.fabSize + spacing.sectionGapMd,
        }}
      >
        <DashboardHeader
          colors={colors}
          spacing={spacing}
          businessName={businessName}
          overdueTotalCount={overdueTotalCount}
          onPressNotifications={onOpenEntriesOverdue}
        />

        <DashboardHeroCard
          colors={colors}
          gradients={gradients}
          weekDelta={weekDelta}
          displayOutstanding={displayOutstanding}
          totalOutstanding={totalOutstanding}
          businessName={businessName}
          isCollecting={isCollecting}
          onCollectNow={handleCollectNow}
        />

        <DashboardQuickStats
          colors={colors}
          spacing={spacing}
          totalCustomersCount={totalCustomersCount}
          overdueTotalCount={overdueTotalCount}
          collectedThisMonth={collectedThisMonth}
          onOpenPeople={onOpenPeople}
          onOpenEntries={onOpenEntries}
        />

        <DashboardFollowUpSection
          colors={colors}
          spacing={spacing}
          overdueTotalCount={overdueTotalCount}
          isLoading={isLoading}
          isFetching={isFetching}
          errorMessage={dashboardErrorMessage}
          followUpPeople={followUpPeople}
          onOpenPeople={onOpenPeople}
          onCollect={handleOpenRecordPaymentForCustomer}
          onRetry={refreshDashboard}
        />

        <DashboardRecentActivity
          colors={colors}
          isLoading={isLoading}
          errorMessage={dashboardErrorMessage}
          recentActivity={recentActivity}
          onOpenEntries={onOpenEntries}
          onRetry={refreshDashboard}
        />
      </ScrollView>

      <DashboardPaymentFlow
        isAddCustomerOpen={isAddCustomerOpen}
        setIsAddCustomerOpen={setIsAddCustomerOpen}
        addCustomer={addCustomer}
        isAddingCustomer={isAddingCustomer}
        addCustomerError={addCustomerError}
        onCustomerAdded={() => {
          showToast({ message: "Customer added", type: "success" });
          refreshDashboard();
        }}
        isCustomerPickerOpen={isCustomerPickerOpen}
        setIsCustomerPickerOpen={setIsCustomerPickerOpen}
        pickerPeople={pickerPeople}
        isPickerLoading={isPickerLoading}
        pickerIsFetchingNextPage={pickerIsFetchingNextPage}
        pickerHasNextPage={pickerHasNextPage}
        fetchMorePickerPeople={fetchMorePickerPeople}
        search={search}
        setSearch={setSearch}
        onSelectCustomer={handleOpenRecordPaymentForCustomer}
        paymentContext={paymentContext}
        setPaymentContext={setPaymentContext}
        paymentSheetRef={paymentSheetRef}
        onPaymentSuccess={() => {
          refreshDashboard();
          showToast({ message: "Payment recorded", type: "success" });
          setPaymentContext(null);
        }}
      />
    </SafeAreaView>
  );
}
