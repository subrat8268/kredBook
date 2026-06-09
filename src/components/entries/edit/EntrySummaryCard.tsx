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

  if (previousBalance <= 0) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: t.colors.surface,
        borderColor: t.colors.borderDefault,
        borderWidth: 1,
      }}
      className={`rounded-2xl p-4 gap-2 ${className}`}
    >
      <View className="flex-row justify-between items-center">
        <Text
          style={{ fontFamily: t.fontFamily.body, color: t.colors.muted }}
          className="text-sm font-normal"
        >
          Previous Balance
        </Text>
        <Text
          style={{ fontFamily: t.fontFamily.body, color: t.colors.ink }}
          className="text-sm font-normal"
        >
          {formatINR(previousBalance)}
        </Text>
      </View>

      <View className="flex-row justify-between items-center">
        <Text
          style={{ fontFamily: t.fontFamily.bodyMedium, color: t.colors.muted }}
          className="text-sm font-medium"
        >
          New Total
        </Text>
        <Text
          style={{ fontFamily: t.fontFamily.bodySemiBold, color: t.colors.ink }}
          className="text-sm font-semibold"
        >
          {formatINR(newTotal)}
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: t.colors.borderSubtle }} className="my-1" />

      <View className="flex-row justify-between items-center pt-1">
        <Text
          style={{ fontFamily: t.fontFamily.bodyBold, color: t.colors.muted }}
          className="text-base font-bold"
        >
          Total Outstanding
        </Text>
        <Text
          style={{ fontFamily: t.fontFamily.bodyBold, color: t.colors.overdue }}
          className="text-base font-bold"
        >
          {formatINR(totalOutstanding)}
        </Text>
      </View>
    </View>
  );
}
