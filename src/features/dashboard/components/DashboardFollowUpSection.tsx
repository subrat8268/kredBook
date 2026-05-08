import { AlertTriangle, CircleCheckBig } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import DashboardFollowUpCard from "./DashboardFollowUpCard";
import type { DashboardPerson } from "../types";
import { SkeletonCard } from "@/src/components/ui/Skeleton";

type Props = {
  colors: any;
  overdueTotalCount: number;
  isFetching: boolean;
  errorMessage?: string;
  followUpPeople: DashboardPerson[];
  onOpenPeople: () => void;
  onCollect: (customerId: string, customerName: string) => Promise<void>;
  onRetry: () => void;
};

export default function DashboardFollowUpSection({
  colors,
  overdueTotalCount,
  isFetching,
  errorMessage,
  followUpPeople,
  onOpenPeople,
  onCollect,
  onRetry,
}: Props) {
  return (
    <>
      <View className="mt-section-md flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-section-title text-textPrimary dark:text-textPrimary-dark">Top follow-up</Text>
          <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: colors.surfaceAlt }}>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600" }}>{overdueTotalCount}</Text>
          </View>
        </View>
        <Pressable onPress={onOpenPeople}>
          <Text className="text-caption font-inter-semibold text-brand">See all</Text>
        </Pressable>
      </View>

      {isFetching ? (
        <View className="mt-3" style={{ gap: 10 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : errorMessage ? (
        <View className="mt-3 flex-row rounded-2xl border border-danger-light bg-danger-bg p-4 dark:border-danger-dark dark:bg-danger-bg-dark">
          <View className="mr-3 mt-0.5">
            <AlertTriangle size={16} color={colors.danger} strokeWidth={2.2} />
          </View>
          <View className="flex-1 border-l border-danger-light pl-3 dark:border-danger-dark">
            <Text className="text-card-title text-danger-text">Couldn&apos;t load follow-up list</Text>
            <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={2}>
              {errorMessage}
            </Text>
            <Pressable onPress={onRetry} className="mt-3 self-start rounded-full bg-surface px-4 py-2 dark:bg-surface-dark">
              <Text className="text-caption font-inter-semibold text-brand">Try again</Text>
            </Pressable>
          </View>
        </View>
      ) : followUpPeople.length === 0 ? (
        <View className="mt-3 rounded-2xl border border-success-light bg-success-bg p-4 dark:border-success-dark dark:bg-success-bg-dark">
          <View className="flex-row items-start">
            <View className="mr-3 mt-0.5">
              <CircleCheckBig size={16} color={colors.success} strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text className="text-card-title text-success-dark">All clear! No overdue customers</Text>
              <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark">Great job - payments are on track for now.</Text>
              <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark">When customers go overdue, they&apos;ll show up here.</Text>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          {followUpPeople.map((person) => (
            <DashboardFollowUpCard key={person.id} person={person} onCollect={onCollect} />
          ))}
        </ScrollView>
      )}
    </>
  );
}
