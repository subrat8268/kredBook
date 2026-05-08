import { useToast } from "@/src/components/feedback/Toast";
import NewCustomerModal from "@/src/components/people/NewCustomerModal";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import BottomSheetPicker from "@/src/components/picker/BottomSheetPicker";
import Avatar from "@/src/components/ui/Avatar";
import { Skeleton, SkeletonCard, SkeletonHeroCard } from "@/src/components/ui/Skeleton";
import { motion } from "@/src/utils/theme";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, RefreshControl, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardFollowUpCarousel from "./DashboardFollowUpCarousel";
import DashboardHeader from "./DashboardHeader";
import DashboardHeroCard from "./DashboardHeroCard";
import DashboardRecentActivityCard from "./DashboardRecentActivityCard";
import DashboardStatsRow from "./DashboardStatsRow";

type PaymentContext = {
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
  initialAmount?: number;
};

type PersonItem = { id: string; name: string };

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
  overdueCustomers: { id: string; name: string; daysSince: number; balance: number }[];
  overdueTotalCount: number;
  weekDelta: number;
  recentActivity: any[];
  isLoading: boolean;
  isFetching: boolean;
  dashboardErrorMessage?: string;
  refreshDashboard: () => void;
  addCustomer: (values: { name: string; phone?: string; address?: string; openingBalance?: number }) => Promise<void>;
  isAddingCustomer: boolean;
  addCustomerError?: string;
  pickerPeople: PersonItem[];
  isPickerLoading: boolean;
  pickerHasNextPage: boolean;
  pickerIsFetchingNextPage: boolean;
  fetchMorePickerPeople: () => void;
  search: string;
  setSearch: (value: string) => void;
  openRecordPaymentForCustomer: (customerId: string, customerName: string) => Promise<PaymentContext | null>;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);

  const animatedOutstanding = useRef(new Animated.Value(0)).current;
  const [displayOutstanding, setDisplayOutstanding] = useState(0);
  const paymentSheetRef = useRef<BottomSheetModal>(null);

  const totalOutstanding = useMemo(() => Number(toReceive ?? 0), [toReceive]);
  const slowDuration = motion.duration.slow;
  const totalCustomersCount = Number((dashboardData as any)?.totalCustomersCount ?? (dashboardData as any)?.total_customers_count ?? 0);
  const collectedThisMonth = useMemo(() => recentActivity.filter((item) => item.type === "payment").reduce((sum, item) => sum + Number(item.amount ?? 0), 0), [recentActivity]);
  const businessName = ((profile as any).business_name || profile.name || "KredBook") as string;

  const followUpPeople = useMemo(() => {
    const uniqueById = new Map<string, (typeof overdueCustomers)[number]>();
    overdueCustomers.forEach((item) => {
      if (!uniqueById.has(item.id)) uniqueById.set(item.id, item);
    });
    return Array.from(uniqueById.values()).sort((a, b) => b.daysSince - a.daysSince).slice(0, 5);
  }, [overdueCustomers]);

  useEffect(() => {
    const listener = animatedOutstanding.addListener(({ value }) => {
      setDisplayOutstanding(Math.max(0, Math.round(value)));
    });

    Animated.timing(animatedOutstanding, {
      toValue: totalOutstanding,
      duration: slowDuration,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedOutstanding.removeListener(listener);
    };
  }, [animatedOutstanding, totalOutstanding, slowDuration]);

  useEffect(() => {
    if (actionParam === "record-payment") {
      setIsCustomerPickerOpen(true);
      clearActionParam();
    }
  }, [actionParam, clearActionParam]);

  const handleOpenRecordPaymentForCustomer = useCallback(
    async (customerId: string, customerName: string) => {
      setIsCollecting(true);
      try {
        const context = await openRecordPaymentForCustomer(customerId, customerName);
        if (!context) {
          showToast({ message: "No outstanding balance to collect for this customer.", type: "error" });
          return;
        }
        setPaymentContext(context);
        paymentSheetRef.current?.present();
      } catch {
        showToast({ message: "Could not open collection flow.", type: "error" });
      } finally {
        setIsCollecting(false);
      }
    },
    [openRecordPaymentForCustomer, showToast],
  );

  const handleCollectNow = useCallback(async () => {
    const first = followUpPeople[0];
    if (first) {
      await handleOpenRecordPaymentForCustomer(first.id, first.name);
      return;
    }
    setIsCustomerPickerOpen(true);
  }, [followUpPeople, handleOpenRecordPaymentForCustomer]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
        <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} translucent={false} />
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 120 }}>
          <View className="mt-4">
            <Skeleton width="55%" height={18} />
          </View>
          <View className="mt-4">
            <SkeletonHeroCard />
          </View>
          <View className="mt-4 flex-row" style={{ gap: 10 }}>
            <Skeleton height={84} style={{ flex: 1 }} />
            <Skeleton height={84} style={{ flex: 1 }} />
            <Skeleton height={84} style={{ flex: 1 }} />
          </View>
          <View className="mt-6" style={{ gap: 12 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} translucent={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refreshDashboard} tintColor={colors.brand} />}
        contentContainerStyle={{ paddingHorizontal: spacing.screenPadding, paddingBottom: 120 }}
      >
        <DashboardHeader
          colors={colors}
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

        <DashboardStatsRow
          colors={colors}
          totalCustomersCount={totalCustomersCount}
          overdueTotalCount={overdueTotalCount}
          collectedThisMonth={collectedThisMonth}
          onOpenPeople={onOpenPeople}
          onOpenEntries={onOpenEntries}
        />

        <DashboardFollowUpCarousel
          colors={colors}
          overdueTotalCount={overdueTotalCount}
          isFetching={isFetching}
          errorMessage={dashboardErrorMessage}
          followUpPeople={followUpPeople}
          onOpenPeople={onOpenPeople}
          onCollect={handleOpenRecordPaymentForCustomer}
          onRetry={refreshDashboard}
        />

        <DashboardRecentActivityCard
          colors={colors}
          isFetching={isFetching}
          errorMessage={dashboardErrorMessage}
          recentActivity={recentActivity}
          onOpenEntries={onOpenEntries}
          onRetry={refreshDashboard}
        />
      </ScrollView>

      <NewCustomerModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (values) => {
          await addCustomer({
            name: values.name,
            phone: values.phone || "",
            address: values.address,
            openingBalance: values.openingBalance,
          });
          setIsModalOpen(false);
          showToast({ message: "Customer added", type: "success" });
          refreshDashboard();
        }}
        loading={isAddingCustomer}
        errorMessage={addCustomerError}
      />

      <BottomSheetPicker
        visible={isCustomerPickerOpen}
        onClose={() => setIsCustomerPickerOpen(false)}
        title="Select customer"
        items={pickerPeople}
        isLoading={isPickerLoading}
        isFetchingNextPage={pickerIsFetchingNextPage}
        onEndReached={() => {
          if (pickerHasNextPage) fetchMorePickerPeople();
        }}
        search={search}
        setSearch={setSearch}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <Pressable
            className="flex-row items-center rounded-xl border border-soft bg-surface px-4 py-3 dark:border-border-soft-dark dark:bg-surface-dark"
            onPress={() => {
              setIsCustomerPickerOpen(false);
              handleOpenRecordPaymentForCustomer(item.id, item.name);
            }}
          >
            <Avatar name={item.name} size="sm" />
            <View className="ml-3 flex-1">
              <Text className="text-body font-inter-semibold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>{item.name}</Text>
              <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={1}>Open to record a payment</Text>
            </View>
          </Pressable>
        )}
      />

      {paymentContext ? (
        <RecordCustomerPaymentModal
          ref={paymentSheetRef}
          onSuccess={() => {
            refreshDashboard();
            showToast({ message: "Payment recorded", type: "success" });
            setPaymentContext(null);
          }}
          orderId={paymentContext.orderId}
          balanceDue={paymentContext.balanceDue}
          customerId={paymentContext.customerId}
          customerName={paymentContext.customerName}
          initialAmount={paymentContext.initialAmount}
          onDismiss={() => setPaymentContext(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}
