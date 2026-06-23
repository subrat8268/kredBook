import { Skeleton, SkeletonAvatar, SkeletonHeroCard } from "@/src/components/ui/Skeleton";
import { ScrollView, View } from "react-native";

type Props = {
  spacing: { screenContentBottom: number };
};

export default function DashboardSkeleton({ spacing }: Props) {
  return (
    <View style={{ flex: 1 }}>
      {/* 1. Header Skeleton */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6", // colors.borderSubtle light-mode default
        }}
      >
        <View className="flex-row items-center flex-1">
          <SkeletonAvatar size={36} />
          <View className="ml-3 flex-1 gap-1.5">
            <Skeleton width="45%" height={14} />
            <Skeleton width="30%" height={10} />
          </View>
        </View>
        <Skeleton width={44} height={44} radius={22} />
      </View>

      <ScrollView
        className="px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.screenContentBottom }}
      >
        {/* 2. Hero Card Skeleton */}
        <View className="mt-4">
          <SkeletonHeroCard height={164} />
        </View>

        {/* 3. Quick Stats Skeleton */}
        <View className="mt-4 flex-row" style={{ gap: 10 }}>
          <Skeleton height={84} radius={16} style={{ flex: 1 }} />
          <Skeleton height={84} radius={16} style={{ flex: 1 }} />
          <Skeleton height={84} radius={16} style={{ flex: 1 }} />
        </View>

        {/* 4. Follow-up Section Skeleton */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center">
            <Skeleton width="40%" height={18} />
            <Skeleton width="15%" height={14} />
          </View>

          <View className="mt-4 flex-row" style={{ gap: 12 }}>
            {/* Card 1 */}
            <View
              className="p-4 bg-surface dark:bg-surface-dark border border-border-subtle rounded-2xl"
              style={{ width: 260, gap: 12 }}
            >
              <View className="flex-row justify-between items-center">
                <SkeletonAvatar size={36} />
                <Skeleton width={80} height={20} radius={10} />
              </View>
              <Skeleton width="60%" height={16} />
              <Skeleton width="45%" height={20} />
              <Skeleton width="100%" height={36} radius={18} />
            </View>

            {/* Card 2 (partially visible peak) */}
            <View
              className="p-4 bg-surface dark:bg-surface-dark border border-border-subtle rounded-2xl"
              style={{ width: 80, overflow: "hidden", opacity: 0.5, gap: 12 }}
            >
              <View className="flex-row justify-between items-center">
                <SkeletonAvatar size={36} />
              </View>
              <Skeleton width="100%" height={16} />
              <Skeleton width="100%" height={20} />
              <Skeleton width="100%" height={36} radius={18} />
            </View>
          </View>
        </View>

        {/* 5. Recent Activity Section Skeleton */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Skeleton width="45%" height={18} />
            <Skeleton width="15%" height={14} />
          </View>

          {/* Mock Activity Rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={`activity-skele-${i}`} className="mb-4">
              <View className="flex-row items-start">
                <SkeletonAvatar size={32} />
                <View className="ml-3 flex-1 gap-1.5 mt-0.5">
                  <Skeleton width="65%" height={14} />
                  <Skeleton width="40%" height={10} />
                </View>
                <View className="items-end gap-1.5 mt-0.5">
                  <Skeleton width={70} height={14} />
                  <Skeleton width={50} height={12} radius={6} />
                </View>
              </View>
              {i < 3 && <View className="mt-4 h-px bg-border-soft dark:bg-border-soft-dark" />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
