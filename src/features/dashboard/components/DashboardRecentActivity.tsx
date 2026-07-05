import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, ClipboardList } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import DashboardRecentActivityRow from "./DashboardRecentActivityRow";
import type { DashboardActivityItem } from "../types";
import type { ColorTokens } from "@/src/utils/theme";

type Props = {
  colors: ColorTokens;
  // Fix m4: isLoading removed — parent renders DashboardSkeleton instead
  errorMessage?: string;
  recentActivity: DashboardActivityItem[];
  onOpenEntries: () => void;
  onOpenEntryDetail: (orderId: string) => void;
  onRetry: () => void;
};

export default function DashboardRecentActivity({
  colors,
  errorMessage,
  recentActivity,
  onOpenEntries,
  onOpenEntryDetail,
  onRetry,
}: Props) {
  const items = recentActivity.slice(0, 5);

  return (
    <>
      {/* Section header */}
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-section-title" style={{ color: colors.ink }}>
          Recent activity
        </Text>
        <Pressable
          onPress={onOpenEntries}
          accessibilityRole="button"
          accessibilityLabel="View all entries"
          hitSlop={8}
        >
          <Text className="text-caption font-inter-semibold text-brand">
            View entries
          </Text>
        </Pressable>
      </View>

      {/*
        Card container.
        Fix C1: gradient uses colors.surface runtime value (not NativeWind string).
        Fix M6: shadowColor uses colors.ink token.
        `relative overflow-hidden` replaces style={{ position: "relative", overflow: "hidden" }}.
        Shadow props must stay in style (no Tailwind equivalent for cross-platform RN shadows).
      */}
      <View
        className="mt-3 relative overflow-hidden rounded-2xl bg-surface p-4 dark:border dark:border-border-soft-dark dark:bg-surface-dark"
        style={{
          shadowColor: colors.ink,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        {errorMessage ? (
          <View className="flex-row rounded-xl border border-danger-light bg-danger-bg p-3 dark:border-danger-dark dark:bg-danger-bg-dark">
            <View className="mr-3 mt-0.5">
              <AlertTriangle
                size={16}
                color={colors.danger}
                strokeWidth={2.2}
              />
            </View>
            <View className="flex-1 border-l border-danger-light pl-3 dark:border-danger-dark">
              <Text className="text-card-title text-danger-text">
                Couldn&apos;t load recent activity
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
                className="mt-3 self-start rounded-full border border-border bg-surface px-4 py-2 dark:border-border-dark dark:bg-surface-dark"
                accessibilityRole="button"
                accessibilityLabel="Retry loading recent activity"
              >
                <Text className="text-caption font-inter-semibold text-brand">
                  Refresh
                </Text>
              </Pressable>
            </View>
          </View>
        ) : items.length === 0 ? (
          <View className="flex-row">
            <View className="mr-3 mt-0.5">
              <ClipboardList
                size={16}
                color={colors.textMuted}
                strokeWidth={2.2}
              />
            </View>
            <View className="flex-1">
              <Text className="text-card-title" style={{ color: colors.ink }}>
                No recent transactions yet
              </Text>
              <Text
                className="mt-1 text-caption"
                style={{ color: colors.muted }}
              >
                Create an entry or record a payment to see activity here.
              </Text>
            </View>
          </View>
        ) : (
          items.map((item, index) => (
            <DashboardRecentActivityRow
              key={item.id}
              item={item}
              isLast={index === items.length - 1}
              onOpenEntryDetail={onOpenEntryDetail}
              colors={colors}
            />
          ))
        )}

        {/*
          Fix C1: gradient end uses colors.surface (runtime token), not a NativeWind string.
          `absolute inset-x-0 bottom-0 h-4` replaces style={{ position:"absolute", left:0,
          right:0, bottom:0, height:16 }} — pure Tailwind.
        */}
        {items.length >= 3 ? (
          <LinearGradient
            colors={["transparent", colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
            className="absolute inset-x-0 bottom-0 h-4"
          />
        ) : null}
      </View>
    </>
  );
}
