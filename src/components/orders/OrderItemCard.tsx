import { formatINR } from "@/src/utils/format";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

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
  const [rateInput, setRateInput] = useState(rate > 0 ? rate.toString() : "");
  const subtotal = rate * quantity;

  const handleRateChange = (text: string) => {
    setRateInput(text);
    const value = parseFloat(text) || 0;
    onUpdateRate(value);
  };

  return (
    <View className="w-full p-3 bg-slate-300/20 rounded-lg border border-stone-300/20 flex-col gap-3">
      {/* Row 1 — Item Name & Trash Icon */}
      <View className="w-full flex-row justify-between items-start">
        <View className="flex-1 flex-col overflow-hidden">
          <Text
            className="text-gray-900 text-base font-normal font-inter"
            numberOfLines={1}
          >
            {name}
          </Text>
          {variantName ? (
            <Text
              className="text-neutral-500 text-xs font-normal font-inter mt-0.5"
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
          <Trash2 size={16} color="#ba1a1a" />
        </Pressable>
      </View>

      {/* Row 2 — Controls (Rate, Qty, Subtotal) */}
      <View className="w-full flex-row justify-between items-center pr-[0.01px]">
        {/* Rate Input Column */}
        <View className="flex-1 flex-col gap-1 mr-3">
          <Text className="text-neutral-700 text-base font-normal font-inter">
            Rate
          </Text>
          <View className="relative w-full">
            <View className="w-full pl-6 pr-2 bg-white rounded-md border border-stone-300 flex-row items-center h-9 overflow-hidden">
              <TextInput
                placeholder="0"
                value={rateInput}
                onChangeText={handleRateChange}
                keyboardType="numeric"
                style={{ paddingVertical: 0 }}
                className="flex-1 text-gray-900 text-base font-normal font-inter h-full"
              />
            </View>
            <View className="h-6 left-[8px] top-[7px] absolute justify-center items-start">
              <Text className="text-neutral-700 text-base font-normal font-inter">
                ₹
              </Text>
            </View>
          </View>
        </View>

        {/* Qty Column */}
        <View className="flex-col items-center gap-1 mr-4">
          <Text className="text-neutral-700 text-base font-normal font-inter">
            Qty
          </Text>
          <View className="bg-white rounded-md border border-stone-300 flex-row items-center h-9 overflow-hidden">
            <Pressable
              onPress={() => quantity > 1 && onUpdateQuantity(quantity - 1)}
              disabled={quantity <= 1}
              hitSlop={8}
              className="px-2.5 justify-center items-center h-full active:bg-neutral-100 disabled:opacity-40"
            >
              <Text className="text-neutral-700 text-base font-bold font-inter-bold">
                −
              </Text>
            </Pressable>
            <View className="w-10 justify-center items-center h-full">
              <Text className="text-center text-gray-900 text-base font-normal font-inter">
                {quantity}
              </Text>
            </View>
            <Pressable
              onPress={() => onUpdateQuantity(quantity + 1)}
              hitSlop={8}
              className="px-2.5 justify-center items-center h-full active:bg-neutral-100"
            >
              <Text className="text-neutral-700 text-base font-bold font-inter-bold">
                +
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Subtotal Column */}
        <View className="flex-col items-end gap-1">
          <Text className="text-neutral-700 text-base font-normal font-inter">
            Subtotal
          </Text>
          <Text className="text-gray-900 text-base font-semibold font-inter-semibold">
            {formatINR(subtotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}
