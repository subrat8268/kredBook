import { useToast } from "@/src/components/feedback/Toast";
import { useDashboardPaymentFlow } from "@/src/features/dashboard/hooks/useDashboardPaymentFlow";
import { useDashboardPresentation } from "@/src/features/dashboard/hooks/useDashboardPresentation";
import type {
  DashboardActivityItem,
  DashboardPaymentContext,
  DashboardPerson,
  DashboardPickerPerson,
} from "@/src/features/dashboard/types";
import type { ColorTokens, GradientTokens } from "@/src/utils/theme";
import React, { useCallback } from "react";
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
  // Fix M11: explicit token types instead of `any`
  colors: ColorTokens;
  gradients: GradientTokens;
  spacing: {
    screenPadding: number;
    md: number;
    sm: number;
    xs: number;
    lg: number;
    tabBarHeight: number;
    fabSize: number;
    sectionGapMd: number;
    screenContentBottom: number;
  };
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
  // Fix C3: bell and overdue-tile now have separate, dedicated handlers
  onPressNotifications: () => void;
  onOpenPeopleOverdue: () => void;
  onOpenCustomerDetail: (customerId: string) => void;
  onOpenEntryDetail: (orderId: string) => void;
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
  onPressNotifications,
  onOpenPeopleOverdue,
  onOpenCustomerDetail,
  onOpenEntryDetail,
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
    handleOpenPicker,
  } = useDashboardPaymentFlow({
    actionParam,
    clearActionParam,
    openRecordPaymentForCustomer,
  });

  // Fix m10: stable callbacks — not recreated every render
  const handleCustomerAdded = useCallback(() => {
    showToast({ message: "Customer added", type: "success" });
    refreshDashboard();
  }, [showToast, refreshDashboard]);

  const handlePaymentSuccess = useCallback(() => {
    refreshDashboard();
    showToast({ message: "Payment recorded", type: "success" });
    setPaymentContext(null);
  }, [refreshDashboard, showToast, setPaymentContext]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={["top"]}>
        <StatusBar barStyle={statusBarStyle} backgroundColor={colors.canvas} translucent={false} />
        {/* Fix C4 + m9: pass colors and spacing so skeleton uses tokens, not hardcoded values */}
        <DashboardSkeleton colors={colors} spacing={spacing} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={["top"]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.canvas} translucent={false} />

      <DashboardHeader
        colors={colors}
        spacing={spacing}
        businessName={businessName}
        overdueTotalCount={overdueTotalCount}
        onPressNotifications={onPressNotifications}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refreshDashboard} tintColor={colors.brand} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          // Bottom inset so the global SpeedDialFAB + tab bar never cover content.
          paddingBottom: spacing.tabBarHeight + spacing.fabSize + spacing.sectionGapMd,
        }}
      >
        <DashboardHeroCard
          colors={colors}
          gradients={gradients}
          weekDelta={weekDelta}
          displayOutstanding={displayOutstanding}
          totalOutstanding={totalOutstanding}
          overdueTotalCount={overdueTotalCount}
          businessName={businessName}
          isCollecting={isCollecting}
          onRecordPayment={handleOpenPicker}
        />

        <DashboardQuickStats
          colors={colors}
          spacing={spacing}
          totalCustomersCount={totalCustomersCount}
          overdueTotalCount={overdueTotalCount}
          collectedThisMonth={collectedThisMonth}
          onOpenPeople={onOpenPeople}
          // Fix C3: Overdue tile now routes to its own dedicated handler, not the bell handler
          onOpenPeopleOverdue={onOpenPeopleOverdue}
          onOpenEntries={onOpenEntries}
        />

        <DashboardFollowUpSection
          colors={colors}
          spacing={spacing}
          overdueTotalCount={overdueTotalCount}
          isLoading={isLoading}
          // Fix m3: isFetching removed — DashboardFollowUpSection no longer accepts it
          errorMessage={dashboardErrorMessage}
          followUpPeople={followUpPeople}
          onOpenPeople={onOpenPeople}
          // Fix C3: overdue link in follow-up section uses dedicated handler
          onOpenPeopleOverdue={onOpenPeopleOverdue}
          onOpenCustomerDetail={onOpenCustomerDetail}
          onCollect={handleOpenRecordPaymentForCustomer}
          onRetry={refreshDashboard}
        />

        <DashboardRecentActivity
          colors={colors}
          // Fix m4: isLoading removed — DashboardRecentActivity no longer accepts it
          errorMessage={dashboardErrorMessage}
          recentActivity={recentActivity}
          onOpenEntries={onOpenEntries}
          onOpenEntryDetail={onOpenEntryDetail}
          onRetry={refreshDashboard}
        />
      </ScrollView>

      <DashboardPaymentFlow
        isAddCustomerOpen={isAddCustomerOpen}
        setIsAddCustomerOpen={setIsAddCustomerOpen}
        addCustomer={addCustomer}
        isAddingCustomer={isAddingCustomer}
        addCustomerError={addCustomerError}
        onCustomerAdded={handleCustomerAdded}
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
        onPaymentSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
}
