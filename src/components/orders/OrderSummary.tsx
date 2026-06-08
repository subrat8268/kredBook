import { formatINR } from "@/src/utils/format";
import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useTheme } from "@/src/theme/useTheme";

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
  const t = useTheme();

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
        <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-[13px] font-normal">
          Subtotal
        </Text>
        <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-[13px] font-normal">
          {formatINR(itemsTotal)}
        </Text>
      </View>

      {/* ROW 2 — Loading Charge */}
      <View className="flex-row justify-between items-center py-2">
        <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-[13px] font-normal">
          Loading Charge
        </Text>
        <View
          style={{ borderColor: t.colors.borderDefault, backgroundColor: t.colors.surface }}
          className="border rounded-lg px-2.5 py-1.5 flex-row items-center min-w-[100px] h-9"
        >
          <Text style={{ color: t.colors.faint, fontFamily: t.fontFamily.body }} className="text-[13px] font-normal mr-1">
            ₹
          </Text>
          <TextInput
            value={loadingInput}
            onChangeText={handleLoadingChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={t.colors.faint}
            textAlign="right"
            style={{ paddingVertical: 0, color: t.colors.ink, fontFamily: t.fontFamily.body }}
            className="flex-1 text-[13px] font-normal h-full"
          />
        </View>
      </View>

      {/* ROW 3 — GST */}
      <View className="flex-row justify-between items-center py-2">
        <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-[13px] font-normal">
          GST (%)
        </Text>
        <View className="flex-row items-center gap-2">
          {taxAmount > 0 ? (
            <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-[13px] font-normal">
              Tax {formatINR(taxAmount)}
            </Text>
          ) : null}
          <View
            style={{ borderColor: t.colors.borderDefault, backgroundColor: t.colors.surface }}
            className="border rounded-lg px-2.5 py-1.5 flex-row items-center min-w-[100px] h-9"
          >
            <TextInput
              value={taxInput}
              onChangeText={handleTaxChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={t.colors.faint}
              textAlign="right"
              style={{ paddingVertical: 0, color: t.colors.ink, fontFamily: t.fontFamily.body }}
              className="flex-1 text-[13px] font-normal h-full mr-1"
            />
            <Text style={{ color: t.colors.faint, fontFamily: t.fontFamily.body }} className="text-[13px] font-normal">
              %
            </Text>
          </View>
        </View>
      </View>

      {/* DIVIDER */}
      <View style={{ height: 1, backgroundColor: t.colors.borderSubtle }} className="my-1" />

      {/* ROW 4 — Grand Total */}
      <View className="flex-row justify-between items-center py-2">
        <Text style={{ color: t.colors.ink, fontFamily: t.fontFamily.bodyBold }} className="text-[16px] font-bold">
          Grand Total
        </Text>
        <Text style={{ color: t.colors.overdue, fontFamily: t.fontFamily.bodyBold }} className="text-[16px] font-bold">
          {formatINR(grandTotal)}
        </Text>
      </View>
    </View>
  );
}
