import OrderItemCard from "@/src/components/orders/OrderItemCard";
import { DraftOrderItem } from "@/src/store/orderStore";
import { ChevronDown, ChevronUp, Pencil, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  items: DraftOrderItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdateRate: (id: string, rate: number) => void;
  onRemove: (id: string) => void;
  onAddItem: () => void;
  defaultExpanded?: boolean;
};

export default function EditItemizedSection({
  items,
  onUpdateQuantity,
  onUpdateRate,
  onRemove,
  onAddItem,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const N = items.length;
  const countLabel = N > 0 ? ` (${N})` : "";

  return (
    <View
      className="bg-white mx-4 mb-3 rounded-xl border border-stone-300/30 overflow-hidden shadow-sm"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Accordion Header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="w-full flex-row justify-between items-center p-4 bg-indigo-50/30 border-b border-stone-300/30"
      >
        <View className="flex-row items-center gap-1.5">
          <Pencil size={15} color="#006B2C" />
          <Text className="text-gray-900 text-base font-semibold font-inter-semibold">
            Itemized Details{countLabel}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={20} color="#374151" />
        ) : (
          <ChevronDown size={20} color="#374151" />
        )}
      </Pressable>

      {/* Expanded Body */}
      {expanded && (
        <View className="p-4 flex-col gap-4">
          {items.map((item) => (
            <OrderItemCard
              key={item.id}
              id={item.id}
              name={item.product_name}
              variantName={item.variant_name ?? undefined}
              rate={item.price}
              quantity={item.quantity}
              onUpdateQuantity={(qty) => onUpdateQuantity(item.id, qty)}
              onUpdateRate={(rate) => onUpdateRate(item.id, rate)}
              onRemove={() => onRemove(item.id)}
            />
          ))}

          {/* Add Item Trigger */}
          <Pressable
            onPress={onAddItem}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="flex-row items-center gap-1.5 mt-2 pl-1"
          >
            <Plus size={15} color="#006B2C" />
            <Text className="text-[#006B2C] text-base font-semibold font-inter-semibold">
              Add item
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
