import { AlertTriangle, CircleCheckBig } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import DashboardFollowUpCard from "./DashboardFollowUpCard";
import type { DashboardPerson } from "../types";
import { SkeletonCard } from "@/src/components/ui/Skeleton";
import type { ColorTokens } from "@/src/utils/theme";

type Props = {
  colors: ColorTokens;
  spacing: {
    xs: number;
    md: number;
    lg: number;
    screenPadding: number;
    fabSize: number;
  };
  overdueTotalCount: number;
  isLoading: boolean;
  // Fix m3: isFetching removed
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
  onOpenPeople: _onOpenPeople,
  onOpenPeopleOverdue,
  onOpenCustomerDetail,
  onCollect,
  onRetry,
}: Props) {
  return (
    <>
      {/* Section header */}
      <View className="mt-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-section-title" style={{ color: colors.ink }}>
            Top follow-up
          </Text>
          {/* Fix M7: show "--" on error state */}
          <View className="ml-2 rounded-full bg-border px-2 py-0.5 dark:bg-border-dark">
            <Text
              className="text-[11px] font-inter-semibold"
              // textMuted is a runtime token → style only
              style={{ color: colors.textMuted }}
            >
              {errorMessage ? "--" : overdueTotalCount}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onOpenPeopleOverdue}
          accessibilityRole="button"
          accessibilityLabel={`See all ${overdueTotalCount} overdue customers`}
          hitSlop={8}
        >
          <Text className="text-caption font-inter-semibold text-brand">
            See all
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        // gap-[10px] replaces style={{ gap: 10 }}
        <View className="gap-[10px]">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : errorMessage ? (
        <View className="flex-row items-start rounded-2xl bg-danger-bg p-4 dark:bg-danger-bg-dark">
          <View className="mr-3 mt-0.5">
            {/* danger is a runtime token → prop only */}
            <AlertTriangle size={16} color={colors.danger} strokeWidth={2.2} />
          </View>
          <View className="flex-1 pl-3">
            <Text className="text-card-title text-danger-text">
              Couldn&apos;t load follow-up list
            </Text>
            <Text
              className="mt-1 text-caption"
              style={{ color: colors.muted }}
              numberOfLines={2}
            >
              {errorMessage}
            </Text>
            <Pressable
              onPress={onRetry}
              className="mt-3 self-start rounded-full bg-surface px-4 py-2 dark:bg-surface-dark"
              accessibilityRole="button"
              accessibilityLabel="Retry loading follow-up list"
            >
              <Text className="text-caption font-inter-semibold text-brand">
                Try again
              </Text>
            </Pressable>
          </View>
        </View>
      ) : followUpPeople.length === 0 ? (
        <View className="flex-row items-start rounded-2xl bg-success-bg p-4 dark:bg-success-bg-dark">
          <View className="mr-3 mt-0.5">
            <CircleCheckBig
              size={16}
              color={colors.success}
              strokeWidth={2.2}
            />
          </View>
          <View className="flex-1">
            <Text className="text-card-title text-success-dark">
              All clear! No overdue customers
            </Text>
            <Text className="mt-1 text-caption" style={{ color: colors.muted }}>
              Great job - payments are on track for now.
            </Text>
            <Text className="mt-1 text-caption" style={{ color: colors.muted }}>
              When customers go overdue, they&apos;ll show up here.
            </Text>
          </View>
        </View>
      ) : (
        /*
          Fix m3-scroll: keyboardShouldPersistTaps added.
          contentContainerStyle uses runtime spacing tokens → style prop only.
        */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingLeft: spacing.xs,
            paddingRight: spacing.screenPadding + spacing.fabSize,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
          }}
        >
          {followUpPeople.map((person, idx) => (
            <View
              key={person.id}
              style={{
                marginRight: idx === followUpPeople.length - 1 ? 0 : spacing.md,
              }}
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
