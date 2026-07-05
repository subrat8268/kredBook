import StatusBadge from "@/src/components/layer2/StatusBadge";
import * as Haptics from "expo-haptics";
import { formatINR } from "@/src/utils/format";
import { Receipt } from "lucide-react-native";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import type { DashboardActivityItem } from "../types";
import type { ColorTokens } from "@/src/utils/theme";

type Props = {
  item: DashboardActivityItem;
  isLast: boolean;
  onOpenEntryDetail: (orderId: string) => void;
  colors: ColorTokens;
};

export default function DashboardRecentActivityRow({ item, isLast, onOpenEntryDetail, colors }: Props) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onOpenEntryDetail(item.id);
  }, [item.id, onOpenEntryDetail]);

  // Payment = positive (green), bill = negative (red) — runtime token colours
  const amountColor = item.type === "payment" ? colors.success : colors.danger;
  const amountPrefix = item.type === "payment" ? "+" : "-";

  return (
    <View>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${item.name || item.title}, ${item.type === "payment" ? "payment" : "bill"}, ${formatINR(item.amount)}, status ${item.status}`}
        accessibilityHint="Opens entry details"
        className="flex-row items-start"
      >
        {/* Icon circle — bg is a NativeWind token class */}
        <View className="mr-3 mt-1 h-8 w-8 items-center justify-center rounded-full bg-surface-raised dark:bg-surface-dark">
          {/* muted is a runtime token → prop only */}
          <Receipt size={16} color={colors.muted} strokeWidth={2} />
        </View>

        {/* Middle block */}
        <View className="flex-1">
          <Text className="text-body font-inter-semibold" style={{ color: colors.ink }} numberOfLines={1}>
            {item.name || item.title}
          </Text>
          <Text className="mt-0.5 text-caption" style={{ color: colors.muted }}>
            {item.title} · {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          </Text>
        </View>

        {/* Right block — amount + badge */}
        <View className="items-end">
          {/* amountColor is a runtime token → style prop only */}
          <Text className="text-body font-inter-semibold" style={{ color: amountColor }}>
            {amountPrefix}{formatINR(item.amount)}
          </Text>
          <View className="mt-1">
            <StatusBadge status={item.status} size="sm" />
          </View>
        </View>
      </Pressable>

      {/* Divider — pure NativeWind */}
      {!isLast && <View className="my-3 h-px bg-border-soft dark:bg-border-soft-dark" />}
    </View>
  );
}
