import { formatINR } from "@/src/utils/format";
import { Clock3, Users, Wallet } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  colors: any;
  totalCustomersCount: number;
  overdueTotalCount: number;
  collectedThisMonth: number;
  onOpenPeople: () => void;
  onOpenEntries: () => void;
};

export default function DashboardQuickStats({
  colors,
  totalCustomersCount,
  overdueTotalCount,
  collectedThisMonth,
  onOpenPeople,
  onOpenEntries,
}: Props) {
  const quickStats = [
    { title: "Customers", value: `${totalCustomersCount}`, icon: Users, onPress: onOpenPeople },
    { title: "Overdue", value: `${overdueTotalCount}`, icon: Clock3, onPress: onOpenPeople },
    { title: "This Month", value: formatINR(collectedThisMonth), icon: Wallet, onPress: onOpenEntries },
  ] as const;

  return (
    <View className="mt-section-md flex-row" style={{ gap: 10 }}>
      {quickStats.map((stat) => {
        const isOverdue = stat.title === "Overdue";
        return (
          <Pressable
            key={stat.title}
            onPress={stat.onPress}
            className={`flex-1 rounded-xl border p-3 ${
              isOverdue
                ? "border-warning-light bg-warning-bg dark:border-warning-dark dark:bg-warning-bg-dark"
                : "border-border-soft bg-surface dark:border-border-dark dark:bg-surface-dark"
            }`}
          >
            <stat.icon size={16} color={isOverdue ? colors.warning : colors.brand} strokeWidth={2.2} />
            <Text className="mt-2" style={{ fontSize: 12, fontWeight: "400", color: colors.textMuted }} numberOfLines={1}>
              {stat.title}
            </Text>
            <Text
              className="mt-1"
              style={{ fontSize: 22, fontWeight: "700", color: isOverdue ? colors.warning : colors.textPrimary }}
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
