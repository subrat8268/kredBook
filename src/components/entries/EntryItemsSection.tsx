import { ChevronDown, ChevronUp, Package } from "lucide-react-native";
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

const STATUS_BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#FEF3C7", text: "#D97706" },
  Paid: { bg: "#DCFCE7", text: "#16A34A" },
  "Partially Paid": { bg: "#DBEAFE", text: "#2563EB" },
  Partial: { bg: "#DBEAFE", text: "#2563EB" },
  Overdue: { bg: "#FEE2E2", text: "#DC2626" },
};

export default function EntryItemsSection({
  order,
  itemsSubtotal,
  taxAmount,
  grandTotal,
  statusKey,
  fmt,
}: Props) {
  const autoExpand = order.items.length === 1;
  const [expanded, setExpanded] = useState(autoExpand);

  const itemCount = order.items.length;

  const itemRows = useMemo(
    () =>
      order.items.map((item) => (
        <View key={item.id}>
          <View className="flex-row items-center justify-between py-3.5">
            <View className="flex-col gap-1 flex-1 pr-4">
              <Text
                numberOfLines={1}
                className="text-[15px] font-semibold text-[#121c2a]"
              >
                {item.product_name}
              </Text>
              <Text className="text-[13px] font-medium text-[#6B7280]">
                {item.quantity} × ₹{fmt(item.price)}
              </Text>
            </View>
            <Text className="text-[16px] font-bold text-[#121c2a]">
              ₹{fmt(item.subtotal)}
            </Text>
          </View>
          <View className="h-px bg-[#f3f4f6]" />
        </View>
      )),
    [order.items, fmt],
  );

  return (
    <View className="mx-4 mb-6 rounded-xl border border-[#e5e7eb] bg-white">
      <Pressable
        onPress={autoExpand ? undefined : () => setExpanded((p) => !p)}
        style={({ pressed }) => [
          pressed && !autoExpand && { backgroundColor: "#f9fafb" },
          { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
        ]}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#f3f4f6]">
            <Package size={20} color="#374151" strokeWidth={2} />
          </View>
          <View className="flex-col">
            <Text className="text-base font-semibold text-[#121c2a]">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </Text>
            <Text className="text-xs font-semibold text-[#3E4A3D] mt-0.5">
              ₹{itemsSubtotal.toLocaleString("en-IN")} total
            </Text>
          </View>
        </View>

        {!autoExpand && (
          <View>
            {expanded ? (
              <ChevronUp size={20} color="#9ca3af" strokeWidth={2} />
            ) : (
              <ChevronDown size={20} color="#9ca3af" strokeWidth={2} />
            )}
          </View>
        )}
      </Pressable>

      {expanded && (
        <View className="px-4 pb-4">
          {/* Item Rows */}
          {itemRows}

          {/* Subtotal */}
          <View className="flex-row justify-between items-center pt-3 pb-1">
            <Text className="text-[14px] font-medium text-[#6B7280]">
              Subtotal
            </Text>
            <Text className="text-[14px] font-semibold text-[#121c2a]">
              ₹{fmt(itemsSubtotal)}
            </Text>
          </View>

          {/* Tax */}
          {order.tax_percent > 0 && (
            <View className="flex-row justify-between items-center py-1">
              <Text className="text-[14px] font-medium text-[#6B7280]">
                GST ({order.tax_percent}%)
              </Text>
              <Text className="text-[14px] font-semibold text-[#121c2a]">
                ₹{fmt(taxAmount)}
              </Text>
            </View>
          )}

          {/* Loading Charge */}
          {order.loading_charge > 0 && (
            <View className="flex-row justify-between items-center py-1">
              <Text className="text-[14px] font-medium text-[#6B7280]">
                Loading Charge
              </Text>
              <Text className="text-[14px] font-semibold text-[#121c2a]">
                ₹{fmt(order.loading_charge)}
              </Text>
            </View>
          )}

          {/* Previous balance */}
          {order.previous_balance > 0 && (
            <View className="flex-row justify-between items-center py-1">
              <Text className="text-[14px] font-medium text-[#dc2626]">
                Previous Balance
              </Text>
              <Text className="text-[14px] font-semibold text-[#dc2626]">
                ₹{fmt(order.previous_balance)}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View className="h-px bg-[#f3f4f6] my-3" />

          {/* Grand Total */}
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-[16px] font-bold text-[#121c2a]">
                Grand Total
              </Text>
              <View
                style={{
                  backgroundColor:
                    STATUS_BADGE_STYLE[statusKey]?.bg ?? "#F3F4F6",
                }}
                className="rounded-full px-2 py-0.5"
              >
                <Text
                  style={{
                    color: STATUS_BADGE_STYLE[statusKey]?.text ?? "#6B7280",
                    fontSize: 10,
                  }}
                  className="font-bold uppercase tracking-wider text-[10px]"
                >
                  {statusKey}
                </Text>
              </View>
            </View>
            <Text className="text-[17px] font-bold text-[#121c2a]">
              ₹{fmt(grandTotal)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
