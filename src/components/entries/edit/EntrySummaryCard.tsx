import React from "react";
import { Text, View } from "react-native";
import { formatINR } from "@/src/utils/format";
import { useTheme } from "@/src/theme/useTheme";

interface EntrySummaryCardProps {
  previousBalance: number;
  newTotal: number;
  className?: string;
}

export default function EntrySummaryCard({
  previousBalance,
  newTotal,
  className = "",
}: EntrySummaryCardProps) {
  const t = useTheme();
  const totalOutstanding = previousBalance + newTotal;

  return (
    <View
      className={`bg-surface rounded-2xl border border-border-default p-4 gap-2 ${className}`}
    >
      <View className="flex-row justify-between items-center">
        <Text
          style={{ fontFamily: t.fontFamily.body }}
          className="text-muted text-sm font-normal"
        >
          Previous Balance
        </Text>
        <Text
          style={{ fontFamily: t.fontFamily.body }}
          className="text-ink text-sm font-normal"
        >
          {formatINR(previousBalance)}
        </Text>
      </View>

      <View className="flex-row justify-between items-center">
        <Text
          style={{ fontFamily: t.fontFamily.bodyMedium }}
          className="text-muted text-sm font-medium"
        >
          New Total
        </Text>
        <Text
          style={{ fontFamily: t.fontFamily.bodySemiBold }}
          className="text-ink text-sm font-semibold"
        >
          {formatINR(newTotal)}
        </Text>
      </View>

      <View className="h-px bg-border-subtle my-1" />

      <View className="flex-row justify-between items-center pt-1">
        <Text
          style={{ fontFamily: t.fontFamily.bodyBold }}
          className="text-muted text-base font-bold"
        >
          Total Outstanding
        </Text>
        <Text
          style={{ fontFamily: t.fontFamily.bodyBold }}
          className="text-overdue text-base font-bold"
        >
          {formatINR(totalOutstanding)}
        </Text>
      </View>
    </View>
  );
}
