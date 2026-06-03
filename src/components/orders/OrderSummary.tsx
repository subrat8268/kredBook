import { formatINR } from "@/src/utils/format";
import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

interface OrderSummaryProps {
  itemsTotal: number;
  loadingCharge: number;
  taxPercent: number;
  taxAmount: number;
  previousBalance: number;
  grandTotal: number;
  onLoadingChargeChange?: (value: number) => void;
  onTaxChange?: (value: number) => void;
}

export default function OrderSummary({
  itemsTotal,
  loadingCharge,
  taxPercent,
  taxAmount,
  grandTotal,
  onLoadingChargeChange,
  onTaxChange,
}: OrderSummaryProps) {
  const [loadingInput, setLoadingInput] = useState(
    loadingCharge > 0 ? loadingCharge.toString() : ""
  );
  const [taxInput, setTaxInput] = useState(
    taxPercent > 0 ? taxPercent.toString() : ""
  );

  useEffect(() => {
    setLoadingInput(loadingCharge > 0 ? loadingCharge.toString() : "");
  }, [loadingCharge]);

  useEffect(() => {
    setTaxInput(taxPercent > 0 ? taxPercent.toString() : "");
  }, [taxPercent]);

  const handleLoadingChange = (text: string) => {
    setLoadingInput(text);
    const value = parseFloat(text) || 0;
    onLoadingChargeChange?.(value);
  };

  const handleTaxChange = (text: string) => {
    setTaxInput(text);
    const value = parseFloat(text) || 0;
    onTaxChange?.(value);
  };

  return (
    <View className="w-full flex-col gap-0">
      {/* ROW 1 — Subtotal */}
      <View className="flex-row justify-between items-center py-2">
        <Text className="text-[#6b7280] text-[13px] font-normal font-inter">
          Subtotal
        </Text>
        <Text className="text-[#6b7280] text-[13px] font-normal font-inter">
          {formatINR(itemsTotal)}
        </Text>
      </View>

      {/* ROW 2 — Loading Charge */}
      <View className="flex-row justify-between items-center py-2">
        <Text className="text-[#6b7280] text-[13px] font-normal font-inter">
          Loading Charge
        </Text>
        <View
          className="bg-white border rounded-lg px-2.5 py-1.5 flex-row items-center min-w-[100px] h-9"
          style={{ borderColor: "#e5e7eb" }}
        >
          <Text className="text-[#9ca3af] text-[13px] font-normal font-inter mr-1">
            ₹
          </Text>
          <TextInput
            value={loadingInput}
            onChangeText={handleLoadingChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9ca3af"
            textAlign="right"
            style={{ paddingVertical: 0 }}
            className="flex-1 text-[#111827] text-[13px] font-normal font-inter h-full"
          />
        </View>
      </View>

      {/* ROW 3 — GST */}
      <View className="flex-row justify-between items-center py-2">
        <Text className="text-[#6b7280] text-[13px] font-normal font-inter">
          GST (%)
        </Text>
        <View className="flex-row items-center gap-2">
          {taxAmount > 0 ? (
            <Text className="text-[#6b7280] text-[13px] font-normal font-inter">
              Tax {formatINR(taxAmount)}
            </Text>
          ) : null}
          <View
            className="bg-white border rounded-lg px-2.5 py-1.5 flex-row items-center min-w-[100px] h-9"
            style={{ borderColor: "#e5e7eb" }}
          >
            <TextInput
              value={taxInput}
              onChangeText={handleTaxChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9ca3af"
              textAlign="right"
              style={{ paddingVertical: 0 }}
              className="flex-1 text-[#111827] text-[13px] font-normal font-inter h-full mr-1"
            />
            <Text className="text-[#9ca3af] text-[13px] font-normal font-inter">
              %
            </Text>
          </View>
        </View>
      </View>

      {/* DIVIDER */}
      <View className="h-px bg-[#e5e7eb] my-1" />

      {/* ROW 4 — Grand Total */}
      <View className="flex-row justify-between items-center py-2">
        <Text className="text-[#111827] text-[16px] font-bold font-inter-bold">
          Grand Total
        </Text>
        <Text className="text-[#ef4444] text-[16px] font-bold font-inter-bold">
          {formatINR(grandTotal)}
        </Text>
      </View>
    </View>
  );
}
