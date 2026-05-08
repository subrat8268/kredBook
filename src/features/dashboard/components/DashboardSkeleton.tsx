import { Skeleton, SkeletonCard, SkeletonHeroCard } from "@/src/components/ui/Skeleton";
import { ScrollView, View } from "react-native";

type Props = {
  spacing: { screenContentBottom: number };
};

export default function DashboardSkeleton({ spacing }: Props) {
  return (
    <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: spacing.screenContentBottom }}>
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
  );
}
