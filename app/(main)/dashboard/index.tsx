import StatusBadge from "@/src/components/layer2/StatusBadge";
import { useToast } from "@/src/components/feedback/Toast";
import NewCustomerModal from "@/src/components/people/NewCustomerModal";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import BottomSheetPicker from "@/src/components/picker/BottomSheetPicker";
import Avatar from "@/src/components/ui/Avatar";
import { Skeleton, SkeletonCard, SkeletonHeroCard, SkeletonText } from "@/src/components/ui/Skeleton";
import { fetchPersonDetail } from "@/src/api/people";
import { useDashboard } from "@/src/hooks/useDashboard";
import { useAddPerson, usePeople } from "@/src/hooks/usePeople";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { motion } from "@/src/utils/theme";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowDownRight, ArrowUpRight, Bell, Clock3, Receipt, Users, Wallet } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, RefreshControl, ScrollView, Share, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentContext = {
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
  initialAmount?: number;
};

function getGreetingOnly() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function getBusinessInitials(name: string | undefined) {
  const source = (name ?? "").trim();
  if (!source) return "KB";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function DashboardScreen() {
  const { colors, gradients, spacing, statusBarStyle } = useTheme();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { show: showToast } = useToast();

  const {
    toReceive,
    overdueCustomers,
    data: dashboardData,
    overdueTotalCount,
    weekDelta,
    recentActivity,
    isLoading,
    isFetching,
    refreshDashboard,
  } = useDashboard(profile?.id);

  const addCustomerMutation = useAddPerson(profile?.id ?? "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);

  const animatedOutstanding = useRef(new Animated.Value(0)).current;
  const [displayOutstanding, setDisplayOutstanding] = useState(0);

  const paymentSheetRef = useRef<BottomSheetModal>(null);

  const {
    people: pickerPeople,
    isLoading: isPickerLoading,
    fetchNextPage: fetchMorePickerPeople,
    hasNextPage: pickerHasNextPage,
    isFetchingNextPage: pickerIsFetchingNextPage,
  } = usePeople(profile?.id, customerSearch);

  const totalOutstanding = useMemo(() => Number(toReceive ?? 0), [toReceive]);
  const slowDuration = motion.duration.slow;
  const totalCustomersCount = Number((dashboardData as any)?.totalCustomersCount ?? (dashboardData as any)?.total_customers_count ?? 0);
  const collectedThisMonth = useMemo(
    () => recentActivity.filter((item) => item.type === "payment").reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [recentActivity],
  );

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

  const openRecordPaymentForCustomer = useCallback(
    async (customerId: string, customerName: string) => {
      setIsCollecting(true);
      try {
        const detail = await fetchPersonDetail(customerId);
        if (!detail?.pendingOrderId || !detail.pendingOrderBalance) {
          showToast({ message: "No outstanding balance to collect for this customer.", type: "error" });
          return;
        }

        setPaymentContext({
          orderId: detail.pendingOrderId,
          balanceDue: detail.pendingOrderBalance,
          customerId: detail.id,
          customerName,
          initialAmount: detail.pendingOrderBalance,
        });

        paymentSheetRef.current?.present();
      } catch {
        showToast({ message: "Could not open collection flow.", type: "error" });
      } finally {
        setIsCollecting(false);
      }
    },
    [showToast],
  );

  const handleCollectNow = useCallback(async () => {
    const first = followUpPeople[0];
    if (first) {
      await openRecordPaymentForCustomer(first.id, first.name);
      return;
    }
    setIsCustomerPickerOpen(true);
  }, [followUpPeople, openRecordPaymentForCustomer]);

  const quickStats = [
    {
      title: "Customers",
      value: `${totalCustomersCount}`,
      icon: Users,
      onPress: () => router.push("/(main)/people" as never),
    },
    {
      title: "Overdue",
      value: `${overdueTotalCount}`,
      icon: Clock3,
      onPress: () => router.push("/(main)/people" as never),
    },
    {
      title: "This Month",
      value: formatINR(collectedThisMonth),
      icon: Wallet,
      onPress: () => router.push("/(main)/entries" as never),
    },
  ] as const;

  if (!profile) return null;

  if (isLoading && totalCustomersCount === 0) {
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
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refreshDashboard} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingHorizontal: spacing.screenPadding, paddingBottom: 120 }}
      >
        <View style={{ paddingHorizontal: 4, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: colors.surface, fontSize: 14, fontWeight: "700" }}>{getBusinessInitials((profile as any).business_name || profile.name)}</Text>
            </View>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>{((profile as any).business_name || profile.name || "KredBook") as string}</Text>
              <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>{getGreetingOnly()} 👋</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: "/(main)/entries", params: { filter: "Overdue" } } as never)}
            style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
          >
            <Bell size={22} color={colors.textMuted} strokeWidth={2} />
            {overdueTotalCount > 0 ? <View style={{ position: "absolute", right: 6, top: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} /> : null}
          </Pressable>
        </View>

        <LinearGradient
          colors={[gradients.dashboardHero.end, gradients.dashboardHero.start]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mt-4 overflow-hidden rounded-2xl px-5 py-5"
        >
          <Text className="text-caption uppercase tracking-widest text-dashboard-hero-text-muted">Collect Outstanding</Text>
          <Text className="mt-2 text-[34px] font-inter-bold text-dashboard-hero-text">{formatINR(displayOutstanding)}</Text>

          <View className="mt-2 flex-row items-center">
            {weekDelta >= 0 ? (
              <ArrowUpRight size={16} color={colors.successLight} strokeWidth={2.4} />
            ) : (
              <ArrowDownRight size={16} color={colors.warningBg} strokeWidth={2.4} />
            )}
            <Text className="ml-1 text-caption text-dashboard-hero-text-muted">
              {weekDelta >= 0 ? "Up" : "Down"} {formatINR(Math.abs(weekDelta))} vs last week
            </Text>
          </View>

          <View style={{ marginTop: 16, flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={handleCollectNow}
              disabled={isCollecting}
              className="flex-1 rounded-full bg-surface px-4 py-3"
              style={{ opacity: isCollecting ? 0.65 : 1 }}
            >
              <Text className="text-center font-inter-semibold text-primary">Record Payment</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                const businessName = ((profile as any).business_name || profile.name || "KredBook") as string;
                await Share.share({
                  message: `Hi, you have an outstanding amount of ${formatINR(totalOutstanding)} with ${businessName}. Please make the payment at your earliest. Thank you!`,
                });
              }}
              className="flex-1 rounded-full px-4 py-3"
              style={{ borderWidth: 1.5, borderColor: colors.surface }}
            >
              <Text className="text-center font-inter-semibold" style={{ color: colors.surface }}>Send Reminder</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View className="mt-4 flex-row" style={{ gap: 10 }}>
          {quickStats.map((stat) => {
            const isOverdue = stat.title === "Overdue";
            return (
            <Pressable key={stat.title} onPress={stat.onPress} className="flex-1 rounded-xl border border-border bg-surface p-3 dark:border-border-dark dark:bg-surface-dark">
              <stat.icon size={16} color={isOverdue ? colors.warning : colors.primary} strokeWidth={2.2} />
              <Text style={{ marginTop: 8, fontSize: 12, fontWeight: "400", color: colors.textMuted }} numberOfLines={1}>{stat.title}</Text>
              <Text style={{ marginTop: 4, fontSize: 22, fontWeight: "700", color: isOverdue ? colors.warning : colors.textPrimary }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{stat.value}</Text>
            </Pressable>
            );
          })}
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-section-title text-textPrimary dark:text-textPrimary-dark">Top follow-up</Text>
            <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: colors.surfaceAlt }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600" }}>{overdueTotalCount}</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push("/(main)/people" as never)}>
            <Text className="text-caption font-inter-semibold text-primary">See all</Text>
          </Pressable>
        </View>

        {isFetching ? (
          <View className="mt-3" style={{ gap: 10 }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : followUpPeople.length === 0 ? (
          <View className="mt-3 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
            <Text className="text-card-title text-textPrimary dark:text-textPrimary-dark">All clear! No overdue customers 🎉</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            {followUpPeople.map((person) => (
              <View key={person.id} className="mr-3 w-64 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <View className="flex-row items-center justify-between">
                  <Avatar name={person.name} size="sm" />
                  <View className="rounded-full bg-warning-bg px-2 py-1">
                    <Text className="text-[11px] font-inter-semibold text-warning-dark">{person.daysSince}d overdue</Text>
                  </View>
                </View>
                <Text className="mt-3 text-body font-inter-semibold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>{person.name}</Text>
                <Text className="mt-1 text-card-title text-overdue-text">{formatINR(person.balance)}</Text>
                <Pressable className="mt-3 rounded-full bg-primary px-4 py-2" onPress={() => openRecordPaymentForCustomer(person.id, person.name)}>
                  <Text className="text-center text-caption font-inter-semibold text-surface">Collect</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-section-title text-textPrimary dark:text-textPrimary-dark">Recent activity</Text>
          <Pressable onPress={() => router.push("/(main)/entries" as never)}>
            <Text className="text-caption font-inter-semibold text-primary">View entries</Text>
          </Pressable>
        </View>

        <View className="mt-3 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark" style={{ position: "relative", overflow: "hidden" }}>
          {isFetching ? (
            <SkeletonText lines={4} />
          ) : recentActivity.slice(0, 5).length === 0 ? (
            <Text className="text-caption text-textSecondary dark:text-textSecondary-dark">No recent transactions yet.</Text>
          ) : (
            recentActivity.slice(0, 5).map((item, index) => {
              const isLast = index === Math.min(recentActivity.length, 5) - 1;
              const mappedStatus = item.status === "Partially Paid" ? "Partially Paid" : item.status;
              return (
                <View key={item.id}>
                  <Pressable className="flex-row items-start" onPress={() => router.push("/(main)/entries" as never)}>
                    <View className="mr-3 mt-1 h-8 w-8 items-center justify-center rounded-full bg-surface-alt dark:bg-surface-dark">
                      <Receipt size={16} color={colors.textSecondary} strokeWidth={2} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-body font-inter-semibold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>{item.name || item.title}</Text>
                      <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark">{item.title} · {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-body font-inter-semibold" style={{ color: item.type === "payment" ? colors.success : colors.danger }}>{item.type === "payment" ? `+${formatINR(item.amount)}` : `-${formatINR(item.amount)}`}</Text>
                      <View className="mt-1">
                        <StatusBadge status={mappedStatus} size="sm" />
                      </View>
                    </View>
                  </Pressable>
                  {!isLast ? <View className="my-3 h-px bg-border" /> : null}
                </View>
              );
            })
          )}
          {!isFetching && recentActivity.slice(0, 5).length > 0 ? (
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              pointerEvents="none"
              style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 28 }}
            />
          ) : null}
        </View>
      </ScrollView>

      <NewCustomerModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (values) => {
          await addCustomerMutation.mutateAsync({
            name: values.name,
            phone: values.phone || "",
            address: values.address,
            openingBalance: values.openingBalance,
          });
          setIsModalOpen(false);
          showToast({ message: "Customer added", type: "success" });
          refreshDashboard();
        }}
        loading={addCustomerMutation.isPending}
        errorMessage={addCustomerMutation.error?.message}
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
        search={customerSearch}
        setSearch={setCustomerSearch}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <Pressable
            className="flex-row items-center rounded-xl border border-soft bg-surface px-4 py-3 dark:border-border-soft-dark dark:bg-surface-dark"
            onPress={() => {
              setIsCustomerPickerOpen(false);
              openRecordPaymentForCustomer(item.id, item.name);
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
