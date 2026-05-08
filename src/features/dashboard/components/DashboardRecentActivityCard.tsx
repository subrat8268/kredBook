import StatusBadge from "@/src/components/layer2/StatusBadge";
import { SkeletonText } from "@/src/components/ui/Skeleton";
import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, ClipboardList, Receipt } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type ActivityItem = {
  id: string;
  name?: string;
  title: string;
  date: string;
  amount: number;
  type: "payment" | "bill" | string;
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid" | "Advance";
};

type Props = {
  colors: any;
  isFetching: boolean;
  errorMessage?: string;
  recentActivity: ActivityItem[];
  onOpenEntries: () => void;
  onRetry: () => void;
};

export default function DashboardRecentActivityCard({ colors, isFetching, errorMessage, recentActivity, onOpenEntries, onRetry }: Props) {
  return (
    <>
      <View className="mt-section-md flex-row items-center justify-between">
        <Text className="text-section-title text-textPrimary dark:text-textPrimary-dark">Recent activity</Text>
        <Pressable onPress={onOpenEntries}>
          <Text className="text-caption font-inter-semibold text-brand">View entries</Text>
        </Pressable>
      </View>

      <View className="mt-3 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark" style={{ position: "relative", overflow: "hidden" }}>
        {isFetching ? (
          <SkeletonText lines={4} />
        ) : errorMessage ? (
          <View className="flex-row">
            <View className="mr-3 mt-0.5">
              <AlertTriangle size={16} color={colors.danger} strokeWidth={2.2} />
            </View>
            <View className="flex-1 border-l border-danger-light pl-3 dark:border-danger-dark">
              <Text className="text-card-title text-danger-text">Couldn&apos;t load recent activity</Text>
              <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={2}>{errorMessage}</Text>
              <Pressable onPress={onRetry} className="mt-3 self-start rounded-full border border-border bg-surface px-4 py-2 dark:border-border-dark dark:bg-surface-dark">
                <Text className="text-caption font-inter-semibold text-brand">Refresh</Text>
              </Pressable>
            </View>
          </View>
        ) : recentActivity.slice(0, 5).length === 0 ? (
          <View className="flex-row">
            <View className="mr-3 mt-0.5">
              <ClipboardList size={16} color={colors.textMuted} strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text className="text-card-title text-textPrimary dark:text-textPrimary-dark">No recent transactions yet</Text>
              <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark">Create an entry or record a payment to see activity here.</Text>
            </View>
          </View>
        ) : (
          recentActivity.slice(0, 5).map((item, index) => {
            const isLast = index === Math.min(recentActivity.length, 5) - 1;
            const mappedStatus: ActivityItem["status"] = item.status === "Partially Paid" ? "Partially Paid" : item.status;
            return (
              <View key={item.id}>
                <Pressable className="flex-row items-start" onPress={onOpenEntries}>
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
          <LinearGradient colors={["transparent", colors.surface]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 28 }} />
        ) : null}
      </View>
    </>
  );
}
