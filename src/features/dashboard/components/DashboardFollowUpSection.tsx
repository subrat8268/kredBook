import { AlertTriangle, CircleCheckBig } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import DashboardFollowUpCard from "./DashboardFollowUpCard";
import type { DashboardPerson } from "../types";
import { SkeletonCard } from "@/src/components/ui/Skeleton";

type Props = {
  colors: any;
  spacing: any;
  overdueTotalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  errorMessage?: string;
  followUpPeople: DashboardPerson[];
  onOpenPeople: () => void;
  onOpenPeopleOverdue: () => void;
  onOpenCustomerDetail: (customerId: string) => void;
  onCollect: (customerId: string, customerName: string) => Promise<void>;
  onRetry: () => void;
};

export default function DashboardFollowUpSection({
  colors,
  spacing,
  overdueTotalCount,
  isLoading,
  errorMessage,
  followUpPeople,
  onOpenPeople,
  onOpenPeopleOverdue,
  onOpenCustomerDetail,
  onCollect,
  onRetry,
}: Props) {
  return (
    <>
      <View className="mt-section-md flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-section-title text-ink dark:text-ink-dark">Top follow-up</Text>
          <View className="ml-2 rounded-full bg-border px-2 py-0.5 dark:bg-border-dark">
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600" }}>{overdueTotalCount}</Text>
          </View>
        </View>
        <Pressable
          onPress={onOpenPeopleOverdue}
          accessibilityRole="button"
          accessibilityLabel={`See all ${overdueTotalCount} overdue customers`}
          hitSlop={8}
        >
          <Text className="text-caption font-inter-semibold text-brand">See all</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="mt-3" style={{ gap: 10 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : errorMessage ? (
        <View className="mt-3 flex-row items-start rounded-2xl bg-danger-bg p-4 dark:bg-danger-bg-dark">
          <View className="mr-3 mt-0.5">
            <AlertTriangle size={16} color={colors.danger} strokeWidth={2.2} />
          </View>
          <View className="flex-1 pl-3">
            <Text className="text-card-title text-danger-text">Couldn&apos;t load follow-up list</Text>
            <Text className="mt-1 text-caption text-muted dark:text-muted-dark" numberOfLines={2}>
              {errorMessage}
            </Text>
            <Pressable
              onPress={onRetry}
              className="mt-3 self-start rounded-full bg-surface px-4 py-2 dark:bg-surface-dark"
              accessibilityRole="button"
              accessibilityLabel="Retry loading follow-up list"
            >
              <Text className="text-caption font-inter-semibold text-brand">Try again</Text>
            </Pressable>
          </View>
        </View>
      ) : followUpPeople.length === 0 ? (
        <View className="mt-3 flex-row items-start rounded-2xl bg-success-bg p-4 dark:bg-success-bg-dark">
          <View className="mr-3 mt-0.5">
            <CircleCheckBig size={16} color={colors.success} strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text className="text-card-title text-success-dark">All clear! No overdue customers</Text>
            <Text className="mt-1 text-caption text-muted dark:text-muted-dark">Great job - payments are on track for now.</Text>
            <Text className="mt-1 text-caption text-muted dark:text-muted-dark">When customers go overdue, they&apos;ll show up here.</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: spacing.xs,
            // Extra right inset so the last card's CTA isn't under the global FAB.
            paddingRight: spacing.screenPadding + spacing.fabSize,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
          }}
          className="mt-3"
        >
          {followUpPeople.map((person, idx) => (
            <View
              key={person.id}
              style={{ marginRight: idx === followUpPeople.length - 1 ? 0 : spacing.md }}
            >
              <DashboardFollowUpCard
                person={person}
                onCollect={onCollect}
                onPressCard={onOpenCustomerDetail}
                colors={colors}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
}
