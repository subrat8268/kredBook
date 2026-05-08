import { SkeletonText } from "@/src/components/ui/Skeleton";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, ClipboardList } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import DashboardRecentActivityRow from "./DashboardRecentActivityRow";
import type { DashboardActivityItem } from "../types";

type Props = {
  colors: any;
  isLoading: boolean;
  errorMessage?: string;
  recentActivity: DashboardActivityItem[];
  onOpenEntries: () => void;
  onRetry: () => void;
};

export default function DashboardRecentActivity({
  colors,
  isLoading,
  errorMessage,
  recentActivity,
  onOpenEntries,
  onRetry,
}: Props) {
  const items = recentActivity.slice(0, 5);

  return (
    <>
      <View className="mt-section-md flex-row items-center justify-between">
        <Text className="text-section-title text-textPrimary dark:text-textPrimary-dark">Recent activity</Text>
        <Pressable
          onPress={onOpenEntries}
          accessibilityRole="button"
          accessibilityLabel="View all entries"
          hitSlop={8}
        >
          <Text className="text-caption font-inter-semibold text-brand">View entries</Text>
        </Pressable>
      </View>

      <View
        className="mt-3 rounded-2xl bg-surface p-4 dark:border dark:border-border-soft-dark dark:bg-surface-dark"
        style={{ position: "relative", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
      >
        {isLoading ? (
          <SkeletonText lines={4} />
        ) : errorMessage ? (
          <View className="flex-row rounded-xl border border-danger-light bg-danger-bg p-3 dark:border-danger-dark dark:bg-danger-bg-dark">
            <View className="mr-3 mt-0.5">
              <AlertTriangle size={16} color={colors.danger} strokeWidth={2.2} />
            </View>
            <View className="flex-1 border-l border-danger-light pl-3 dark:border-danger-dark">
              <Text className="text-card-title text-danger-text">Couldn&apos;t load recent activity</Text>
              <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={2}>
                {errorMessage}
              </Text>
              <Pressable
                onPress={onRetry}
                className="mt-3 self-start rounded-full border border-border bg-surface px-4 py-2 dark:border-border-dark dark:bg-surface-dark"
                accessibilityRole="button"
                accessibilityLabel="Retry loading recent activity"
              >
                <Text className="text-caption font-inter-semibold text-brand">Refresh</Text>
              </Pressable>
            </View>
          </View>
        ) : items.length === 0 ? (
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
          items.map((item, index) => (
            <DashboardRecentActivityRow
              key={item.id}
              item={item}
              isLast={index === items.length - 1}
              onOpenEntries={onOpenEntries}
              colors={colors}
            />
          ))
        )}

        {items.length >= 3 ? (
          <LinearGradient
            colors={["transparent", colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
            style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 16 }}
          />
        ) : null}
      </View>
    </>
  );
}
