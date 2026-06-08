import { formatINR } from "@/src/utils/format";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "@/src/theme/useTheme";

interface OrderItemCardProps {
  id: string;
  name: string;
  variantName?: string;
  rate: number;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateRate: (rate: number) => void;
  onRemove: () => void;
}

export default function OrderItemCard({
  name,
  variantName,
  rate,
  quantity,
  onUpdateQuantity,
  onUpdateRate,
  onRemove,
}: OrderItemCardProps) {
  const t = useTheme();
  const [rateInput, setRateInput] = useState(rate > 0 ? rate.toString() : "");
  const subtotal = rate * quantity;

  const handleRateChange = (text: string) => {
    setRateInput(text);
    const value = parseFloat(text) || 0;
    onUpdateRate(value);
  };

  return (
    <View
      style={{
        backgroundColor: t.colors.surfaceRaised,
        borderColor: t.colors.borderDefault,
        borderWidth: 1,
      }}
      className="w-full p-3 rounded-lg flex-col gap-3"
    >
      {/* Row 1 — Item Name & Trash Icon */}
      <View className="w-full flex-row justify-between items-start">
        <View className="flex-1 flex-col overflow-hidden">
          <Text
            style={{ color: t.colors.ink, fontFamily: t.fontFamily.body }}
            className="text-base font-normal"
            numberOfLines={1}
          >
            {name}
          </Text>
          {variantName ? (
            <Text
              style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }}
              className="text-xs font-normal mt-0.5"
            >
              {variantName}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          className="p-1 rounded-full justify-center items-center active:opacity-70"
        >
          <Trash2 size={16} color={t.colors.error} />
        </Pressable>
      </View>

      {/* Row 2 — Controls (Rate, Qty, Subtotal) */}
      <View className="w-full flex-row justify-between items-center pr-[0.01px]">
        {/* Rate Input Column */}
        <View className="flex-1 flex-col gap-1 mr-3">
          <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-base font-normal">
            Rate
          </Text>
          <View className="relative w-full">
            <View
              style={{
                backgroundColor: t.colors.surface,
                borderColor: t.colors.borderDefault,
                borderWidth: 1,
              }}
              className="w-full pl-6 pr-2 rounded-md flex-row items-center h-9 overflow-hidden"
            >
              <TextInput
                placeholder="0"
                value={rateInput}
                onChangeText={handleRateChange}
                keyboardType="numeric"
                style={{ paddingVertical: 0, color: t.colors.ink, fontFamily: t.fontFamily.body }}
                className="flex-1 text-base font-normal h-full"
              />
            </View>
            <View className="h-6 left-[8px] top-[7px] absolute justify-center items-start">
              <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-base font-normal">
                ₹
              </Text>
            </View>
          </View>
        </View>

        {/* Qty Column */}
        <View className="flex-col items-center gap-1 mr-4">
          <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-base font-normal">
            Qty
          </Text>
          <View
            style={{
              backgroundColor: t.colors.surface,
              borderColor: t.colors.borderDefault,
              borderWidth: 1,
            }}
            className="rounded-md flex-row items-center h-9 overflow-hidden"
          >
            <Pressable
              onPress={() => quantity > 1 && onUpdateQuantity(quantity - 1)}
              disabled={quantity <= 1}
              hitSlop={8}
              style={({ pressed }) => ({
                opacity: quantity <= 1 ? 0.4 : 1,
                backgroundColor: pressed ? t.colors.borderSubtle : t.colors.surface,
              })}
              className="px-2.5 justify-center items-center h-full"
            >
              <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.bodyBold }} className="text-base font-bold">
                −
              </Text>
            </Pressable>
            <View className="w-10 justify-center items-center h-full">
              <Text style={{ color: t.colors.ink, fontFamily: t.fontFamily.body }} className="text-center text-base font-normal">
                {quantity}
              </Text>
            </View>
            <Pressable
              onPress={() => onUpdateQuantity(quantity + 1)}
              hitSlop={8}
              style={({ pressed }) => ({
                backgroundColor: pressed ? t.colors.borderSubtle : t.colors.surface,
              })}
              className="px-2.5 justify-center items-center h-full"
            >
              <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.bodyBold }} className="text-base font-bold">
                +
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Subtotal Column */}
        <View className="flex-col items-end gap-1">
          <Text style={{ color: t.colors.muted, fontFamily: t.fontFamily.body }} className="text-base font-normal">
            Subtotal
          </Text>
          <Text style={{ color: t.colors.ink, fontFamily: t.fontFamily.bodySemiBold }} className="text-base font-semibold">
            {formatINR(subtotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}
