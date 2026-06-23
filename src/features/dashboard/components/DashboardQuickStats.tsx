import { formatINR } from "@/src/utils/format";
import * as Haptics from "expo-haptics";
import { Clock3, Users, Wallet } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  colors: any;
  spacing: any;
  totalCustomersCount: number;
  overdueTotalCount: number;
  collectedThisMonth: number;
  onOpenPeople: () => void;
  onOpenPeopleOverdue: () => void;
  onOpenEntries: () => void;
};

export default function DashboardQuickStats({
  colors,
  spacing,
  totalCustomersCount,
  overdueTotalCount,
  collectedThisMonth,
  onOpenPeople,
  onOpenPeopleOverdue,
  onOpenEntries,
}: Props) {
  const safeCollectedThisMonth = (() => {
    const n = Number(collectedThisMonth ?? 0);
    return Number.isFinite(n) ? n : 0;
  })();

  const quickStats = [
    { title: "Customers", value: `${totalCustomersCount}`, icon: Users, onPress: onOpenPeople },
    { title: "Overdue", value: `${overdueTotalCount}`, icon: Clock3, onPress: onOpenPeopleOverdue },
    { title: "This Month", value: formatINR(safeCollectedThisMonth), icon: Wallet, onPress: onOpenEntries },
  ] as const;

  return (
    <View className="mt-section-md flex-row" style={{ gap: spacing.sm }}>
      {quickStats.map((stat) => {
        const isOverdue = stat.title === "Overdue";
        return (
          <Pressable
            key={stat.title}
            onPress={() => {
              console.log("[DashboardQuickStats] Stat card pressed:", stat.title, "value:", stat.value);
              Haptics.selectionAsync().catch(
                (err) => console.warn("[DashboardQuickStats] Haptic feedback failed:", err)
              );
              stat.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={`${stat.title}: ${stat.value}`}
            hitSlop={6}
            className={`flex-1 rounded-2xl py-3 px-3 ${
              isOverdue
                ? "bg-warning-bg dark:border dark:border-warning-dark/30 dark:bg-surface-dark"
                : "bg-surface dark:bg-surface-dark dark:border dark:border-border-soft-dark"
            }`}
            style={{
              shadowColor: colors.ink,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isOverdue ? 0.04 : 0.06,
              shadowRadius: isOverdue ? 2 : 4,
              elevation: isOverdue ? 1 : 2,
            }}
          >
            <stat.icon size={16} color={isOverdue ? colors.warning : colors.brand} strokeWidth={2.2} />
            <Text className="mt-2 text-caption text-textMuted" numberOfLines={1}>
              {stat.title}
            </Text>
            <Text
              className="mt-1 text-[22px] font-inter-bold"
              style={{ color: isOverdue ? colors.warning : colors.ink }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {stat.value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
