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

export default function DashboardStatsRow({ colors, totalCustomersCount, overdueTotalCount, collectedThisMonth, onOpenPeople, onOpenEntries }: Props) {
  const quickStats = [
    { title: "Customers", value: `${totalCustomersCount}`, icon: Users, onPress: onOpenPeople },
    { title: "Overdue", value: `${overdueTotalCount}`, icon: Clock3, onPress: onOpenPeople },
    { title: "This Month", value: formatINR(collectedThisMonth), icon: Wallet, onPress: onOpenEntries },
  ] as const;

  return (
    <View className="mt-4 flex-row" style={{ gap: 10 }}>
      {quickStats.map((stat) => {
        const isOverdue = stat.title === "Overdue";
        return (
          <Pressable
            key={stat.title}
            onPress={stat.onPress}
            className={`flex-1 rounded-xl border p-3 ${isOverdue ? "border-warning-light bg-warning-bg" : "border-border bg-surface dark:border-border-dark dark:bg-surface-dark"}`}
          >
            <stat.icon size={16} color={isOverdue ? colors.warning : colors.brand} strokeWidth={2.2} />
            <Text style={{ marginTop: 8, fontSize: 12, fontWeight: "400", color: colors.textMuted }} numberOfLines={1}>{stat.title}</Text>
            <Text style={{ marginTop: 4, fontSize: 22, fontWeight: "700", color: isOverdue ? colors.warning : colors.textPrimary }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{stat.value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
