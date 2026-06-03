import React from "react";
import { Text, View } from "react-native";
import { formatINR } from "@/src/utils/format";

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
  const totalOutstanding = previousBalance + newTotal;

  return (
    <View
      className={`bg-slate-300/30 rounded-xl border border-stone-300/20 p-4 gap-2 ${className}`}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-neutral-700 text-sm font-normal font-inter">
          Previous Balance
        </Text>
        <Text className="text-neutral-700 text-sm font-normal font-inter">
          {formatINR(previousBalance)}
        </Text>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-900 text-sm font-medium font-inter-medium">
          New Total
        </Text>
        <Text className="text-gray-900 text-sm font-semibold font-inter-semibold">
          {formatINR(newTotal)}
        </Text>
      </View>

      <View className="h-px bg-stone-300/50 my-1" />

      <View className="flex-row justify-between items-center pt-1">
        <Text className="text-gray-900 text-base font-bold font-inter-bold">
          Total Outstanding
        </Text>
        <Text className="text-red-700 text-base font-bold font-inter-bold">
          {formatINR(totalOutstanding)}
        </Text>
      </View>
    </View>
  );
}
