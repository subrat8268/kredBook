import { Skeleton, SkeletonAvatar, SkeletonHeroCard } from "@/src/components/ui/Skeleton";
import { ScrollView, View } from "react-native";

type Props = {
  spacing: {
    screenPadding: number;
    md: number;
    screenContentBottom: number;
  };
  // Fix C4: borderSubtle is a runtime token — resolves to dark-mode value at runtime.
  colors: {
    borderSubtle: string;
  };
};

export default function DashboardSkeleton({ spacing, colors }: Props) {
  return (
    // flex-1 replaces style={{ flex: 1 }}
    <View className="flex-1">

      {/*
        1. Header Skeleton.
        borderBottomColor is a runtime token → style prop only (fix C4).
        paddingHorizontal/Vertical are runtime spacing tokens → style prop only (fix m9).
        flex-row, items-center, justify-between → className.
      */}
      <View
        className="flex-row items-center justify-between border-b"
        style={{
          paddingHorizontal: spacing.screenPadding,
          paddingVertical: spacing.md,
          borderBottomColor: colors.borderSubtle,
        }}
      >
        <View className="flex-1 flex-row items-center">
          <SkeletonAvatar size={36} />
          <View className="ml-3 flex-1 gap-1.5">
            <Skeleton width="45%" height={14} />
            <Skeleton width="30%" height={10} />
          </View>
        </View>
        <Skeleton width={44} height={44} radius={22} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          paddingBottom: spacing.screenContentBottom,
        }}
      >
        {/* 2. Hero Card Skeleton */}
        <View className="mt-4">
          <SkeletonHeroCard height={164} />
        </View>

        {/*
          3. Quick Stats Skeleton.
          gap-[10px] replaces style={{ gap: 10 }}.
          flex-1 on Skeleton replaces style={{ flex: 1 }}.
        */}
        <View className="mt-4 flex-row gap-[10px]">
          <View className="flex-1"><Skeleton height={84} radius={16} /></View>
          <View className="flex-1"><Skeleton height={84} radius={16} /></View>
          <View className="flex-1"><Skeleton height={84} radius={16} /></View>
        </View>

        {/* 4. Follow-up Section Skeleton */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between">
            <Skeleton width="40%" height={18} />
            <Skeleton width="15%" height={14} />
          </View>

          {/*
            gap-[12px] replaces style={{ gap: 12 }}.
            Card 1: w-[200px] gap-[12px] replace style={{ width: 200, gap: 12 }}.
            Card 2: w-[80px] overflow-hidden opacity-50 gap-[12px] — all pure Tailwind.
          */}
          <View className="mt-4 flex-row gap-[12px]">
            {/* Card 1 — width matches real DashboardFollowUpCard (fix m8: was 260) */}
            <View className="w-[200px] gap-[12px] rounded-2xl border border-border-subtle bg-surface p-4 dark:bg-surface-dark">
              <View className="flex-row items-center justify-between">
                <SkeletonAvatar size={36} />
                <Skeleton width={80} height={20} radius={10} />
              </View>
              <Skeleton width="60%" height={16} />
              <Skeleton width="45%" height={20} />
              <Skeleton width="100%" height={36} radius={18} />
            </View>

            {/* Card 2 — partial peek */}
            <View className="w-[80px] gap-[12px] overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 opacity-50 dark:bg-surface-dark">
              <View className="flex-row items-center justify-between">
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
          <View className="mb-4 flex-row items-center justify-between">
            <Skeleton width="45%" height={18} />
            <Skeleton width="15%" height={14} />
          </View>

          {Array.from({ length: 4 }).map((_, i) => (
            <View key={`activity-skele-${i}`} className="mb-4">
              <View className="flex-row items-start">
                <SkeletonAvatar size={32} />
                <View className="ml-3 mt-0.5 flex-1 gap-1.5">
                  <Skeleton width="65%" height={14} />
                  <Skeleton width="40%" height={10} />
                </View>
                <View className="mt-0.5 items-end gap-1.5">
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
