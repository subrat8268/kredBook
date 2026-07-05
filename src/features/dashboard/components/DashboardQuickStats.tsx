import { formatINR } from "@/src/utils/format";
import * as Haptics from "expo-haptics";
import { Clock3, Users, Wallet } from "lucide-react-native";
import React, { useMemo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import type { ColorTokens } from "@/src/utils/theme";

type Props = {
  colors: ColorTokens;
  spacing: { sm: number };
  totalCustomersCount: number;
  overdueTotalCount: number;
  collectedThisMonth: number;
  onOpenPeople: () => void;
  onOpenPeopleOverdue: () => void;
  onOpenEntries: () => void;
};

export default function DashboardQuickStats({
  colors,
  spacing,
  totalCustomersCount,
  overdueTotalCount,
  collectedThisMonth,
  onOpenPeople,
  onOpenPeopleOverdue,
  onOpenEntries,
}: Props) {
  // Fix M5: memoized
  const safeCollectedThisMonth = useMemo(() => {
    const n = Number(collectedThisMonth ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [collectedThisMonth]);

  const quickStats = useMemo(
    () => [
      { title: "Customers", value: `${totalCustomersCount}`, icon: Users, onPress: onOpenPeople },
      { title: "Overdue", value: `${overdueTotalCount}`, icon: Clock3, onPress: onOpenPeopleOverdue },
      { title: "This Month", value: formatINR(safeCollectedThisMonth), icon: Wallet, onPress: onOpenEntries },
    ] as const,
    [totalCustomersCount, overdueTotalCount, safeCollectedThisMonth, onOpenPeople, onOpenPeopleOverdue, onOpenEntries],
  );

  const handlePress = useCallback((stat: (typeof quickStats)[number]) => {
    Haptics.selectionAsync().catch(() => {});
    stat.onPress();
  }, []);

  return (
    /*
      gap uses spacing.sm token (runtime value) → must stay in style.
      Everything else is static layout → className.
    */
    <View className="mt-section-md flex-row" style={{ gap: spacing.sm }}>
      {quickStats.map((stat) => {
        const isOverdue = stat.title === "Overdue";
        return (
          <Pressable
            key={stat.title}
            onPress={() => handlePress(stat)}
            accessibilityRole="button"
            accessibilityLabel={`${stat.title}: ${stat.value}`}
            hitSlop={6}
            className={`flex-1 rounded-2xl py-3 px-3 ${
              isOverdue
                ? "bg-warning-bg dark:border dark:border-warning-dark/30 dark:bg-surface-dark"
                : "bg-surface dark:bg-surface-dark dark:border dark:border-border-soft-dark"
            }`}
            style={{
              // shadowColor is a runtime token → style prop only
              shadowColor: colors.ink,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isOverdue ? 0.04 : 0.06,
              shadowRadius: isOverdue ? 2 : 4,
              elevation: isOverdue ? 1 : 2,
            }}
          >
            {/* icon color is a runtime token → prop only */}
            <stat.icon size={16} color={isOverdue ? colors.warning : colors.brand} strokeWidth={2.2} />
            <Text className="mt-2 text-caption text-textMuted" numberOfLines={1}>
              {stat.title}
            </Text>
            <Text
              className="mt-1 text-[22px] font-inter-bold"
              // color is a runtime token → style prop only
              style={{ color: isOverdue ? colors.warning : colors.ink }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {stat.value}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
