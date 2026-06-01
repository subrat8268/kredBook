import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { OrderDetail } from "@/src/api/entries";

type Props = {
  order: OrderDetail;
  itemsSubtotal: number;
  taxAmount: number;
  grandTotal: number;
  statusKey: "Paid" | "Pending" | "Overdue" | "Partially Paid";
  fmt: (value: number) => string;
};

export default function EntryItemsSection({
  order,
  itemsSubtotal,
  taxAmount,
  grandTotal,
  fmt,
}: Props) {
  const autoExpand = order.items.length === 1;
  const [expanded, setExpanded] = useState(autoExpand);

  const itemCount = order.items.length;
  const collapsedLabel = `${itemCount} item${itemCount === 1 ? "" : "s"} · ₹${itemsSubtotal.toLocaleString("en-IN")} total`;

  const itemRows = useMemo(
    () =>
      order.items.map((item) => (
        <View key={item.id}>
          <View className="flex-row items-center py-2">
            <Text
              numberOfLines={1}
              className="flex-1 text-[14px] font-medium text-[#111827]"
            >
              {item.product_name}
            </Text>
            <Text className="mx-4 text-[13px] text-[#9ca3af]">
              {item.quantity} × {fmt(item.price)}
            </Text>
            <MoneyAmount
              value={item.subtotal}
              className="min-w-[64px] text-right text-[14px] font-semibold text-[#111827]"
            />
          </View>
          <View className="h-px bg-[#f3f4f6]" />
        </View>
      )),
    [order.items, fmt],
  );

  return (
    <View className="mx-4 mb-6 rounded-xl border border-[#e5e7eb] bg-white">
      <View className="flex-row items-center justify-between px-4 py-[14px]">
        <Text className="text-[14px] font-medium text-[#374151]">
          {collapsedLabel}
        </Text>
        <Pressable
          onPress={() => setExpanded((p) => !p)}
          hitSlop={8}
          disabled={autoExpand}
        >
          {autoExpand ? null : expanded ? (
            <ChevronUp size={20} color="#9ca3af" strokeWidth={2} />
          ) : (
            <ChevronDown size={20} color="#9ca3af" strokeWidth={2} />
          )}
        </Pressable>
      </View>

      {expanded && (
        <View className="px-4 pb-4">
          {/* Item Rows */}
          {itemRows}

          {/* Subtotal */}
          <View className="flex-row justify-between items-center pt-2">
            <Text className="text-[13px] text-[#9ca3af]">Subtotal</Text>
            <Text className="text-[13px] text-[#9ca3af]">
              ₹{fmt(itemsSubtotal)}
            </Text>
          </View>

          {/* Tax */}
          {order.tax_percent > 0 && (
            <View className="flex-row justify-between items-center pt-1">
              <Text className="text-[13px] text-[#9ca3af]">
                GST ({order.tax_percent}%)
              </Text>
              <Text className="text-[13px] text-[#9ca3af]">
                ₹{fmt(taxAmount)}
              </Text>
            </View>
          )}

          {/* Loading Charge */}
          {order.loading_charge > 0 && (
            <View className="flex-row justify-between items-center pt-1">
              <Text className="text-[13px] text-[#9ca3af]">
                Loading Charge
              </Text>
              <Text className="text-[13px] text-[#9ca3af]">
                ₹{fmt(order.loading_charge)}
              </Text>
            </View>
          )}

          {/* Previous balance */}
          {order.previous_balance > 0 && (
            <View className="flex-row justify-between items-center pt-1">
              <Text className="text-[13px] text-[#dc2626]">
                Previous Balance
              </Text>
              <Text className="text-[13px] text-[#dc2626]">
                ₹{fmt(order.previous_balance)}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View className="h-px bg-[#f3f4f6] my-2" />

          {/* Grand Total */}
          <View className="flex-row justify-between items-center">
            <Text className="text-[15px] font-semibold text-[#111827]">
              Grand Total
            </Text>
            <Text className="text-[16px] font-bold text-[#111827]">
              ₹{fmt(grandTotal)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
