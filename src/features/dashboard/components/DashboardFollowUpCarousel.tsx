import Avatar from "@/src/components/ui/Avatar";
import { SkeletonCard } from "@/src/components/ui/Skeleton";
import { formatINR } from "@/src/utils/format";
import { Pressable, ScrollView, Text, View } from "react-native";

type FollowUpPerson = {
  id: string;
  name: string;
  balance: number;
  daysSince: number;
};

type Props = {
  colors: any;
  overdueTotalCount: number;
  isFetching: boolean;
  errorMessage?: string;
  followUpPeople: FollowUpPerson[];
  onOpenPeople: () => void;
  onCollect: (customerId: string, customerName: string) => Promise<void>;
  onRetry: () => void;
};

export default function DashboardFollowUpCarousel({ colors, overdueTotalCount, isFetching, errorMessage, followUpPeople, onOpenPeople, onCollect, onRetry }: Props) {
  return (
    <>
      <View className="mt-6 flex-row items-center justify-between">
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
        <View className="mt-3 rounded-2xl border border-danger-light bg-danger-bg p-4 dark:border-danger-dark dark:bg-danger-bg-dark">
          <Text className="text-card-title text-danger-text">Couldn&apos;t load follow-up list</Text>
          <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={2}>{errorMessage}</Text>
          <Pressable onPress={onRetry} className="mt-3 self-start rounded-full bg-surface px-4 py-2 dark:bg-surface-dark">
            <Text className="text-caption font-inter-semibold text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : followUpPeople.length === 0 ? (
        <View className="mt-3 rounded-2xl border border-success-light bg-success-bg p-4 dark:border-success-dark dark:bg-success-bg-dark">
          <Text className="text-card-title text-success-dark">All clear! No overdue customers</Text>
          <Text className="mt-1 text-caption text-textSecondary dark:text-textSecondary-dark">Great job - payments are on track for now.</Text>
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
              <Pressable className="mt-3 rounded-full bg-success px-4 py-2" onPress={() => onCollect(person.id, person.name)}>
                <Text className="text-center text-caption font-inter-semibold text-surface">Collect</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
}
