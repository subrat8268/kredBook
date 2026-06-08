import OrderItemCard from "@/src/components/orders/OrderItemCard";
import { DraftOrderItem } from "@/src/store/orderStore";
import { ChevronDown, ChevronUp, Pencil, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/src/theme/useTheme";

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
  const t = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const N = items.length;
  const countLabel = N > 0 ? ` (${N})` : "";

  return (
    <View
      style={{
        backgroundColor: t.colors.surface,
        borderColor: t.colors.borderDefault,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      className="mx-4 mb-3 rounded-xl overflow-hidden"
    >
      {/* Accordion Header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={{
          backgroundColor: t.colors.surfaceRaised,
          borderBottomWidth: expanded ? 1 : 0,
          borderBottomColor: t.colors.borderDefault,
        }}
        className="w-full flex-row justify-between items-center p-4"
      >
        <View className="flex-row items-center gap-1.5">
          <Pencil size={15} color={t.colors.primary} />
          <Text
            style={{
              fontFamily: t.fontFamily.bodySemiBold,
              color: t.colors.ink,
            }}
            className="text-base font-semibold"
          >
            Itemized Details{countLabel}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={20} color={t.colors.body} />
        ) : (
          <ChevronDown size={20} color={t.colors.body} />
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
            <Plus size={15} color={t.colors.primary} />
            <Text
              style={{
                fontFamily: t.fontFamily.bodySemiBold,
                color: t.colors.primary,
              }}
              className="text-base font-semibold"
            >
              Add item
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
