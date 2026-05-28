import MoneyAmount from "@/src/components/ui/MoneyAmount";
import StatusBadge from "@/src/components/layer2/StatusBadge";
import { Text, View } from "react-native";
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
  statusKey,
  fmt,
}: Props) {
  return (
    <View className="bg-surface rounded-2xl mx-4 mb-6 p-4 border border-border">
      {/* Section Header */}
      <Text className="text-textSecondary font-semibold text-[11px] tracking-[1.2px] uppercase pb-2">
        Items
      </Text>

      {/* Items List */}
      <View className="flex-col gap-3">
        {order.items.map((item) => (
          <View key={item.id} className="flex-row items-center">
            <Text className="flex-1 text-textPrimary text-[14px]" numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text className="text-textSecondary text-[14px] mx-4">
              {item.quantity} × {fmt(item.price)}
            </Text>
            <MoneyAmount
              value={item.subtotal}
              className="text-textPrimary font-bold text-[14px] min-w-[64px] text-right"
            />
          </View>
        ))}
      </View>

      {/* Divider */}
      <View className="h-px bg-border-soft my-3" />

      {/* Summary Section */}
      <View className="flex-col gap-1">
        {/* Subtotal */}
        <View className="flex-row justify-between items-center">
          <Text className="text-textSecondary text-[14px] font-normal">Subtotal</Text>
          <MoneyAmount
            value={itemsSubtotal}
            className="text-textSecondary text-[14px] font-normal"
          />
        </View>

        {/* Tax */}
        {order.tax_percent > 0 && (
          <View className="flex-row justify-between items-center">
            <Text className="text-textSecondary text-[14px] font-normal">
              GST ({order.tax_percent}%)
            </Text>
            <MoneyAmount
              value={taxAmount}
              className="text-textSecondary text-[14px] font-normal"
            />
          </View>
        )}
        
        {/* Loading Charge */}
        {order.loading_charge > 0 && (
          <View className="flex-row justify-between items-center">
            <Text className="text-textSecondary text-[14px] font-normal">
              Loading Charge
            </Text>
            <MoneyAmount
              value={order.loading_charge}
              className="text-textSecondary text-[14px] font-normal"
            />
          </View>
        )}

        {/* Previous balance row */}
        {order.previous_balance > 0 && (
          <View className="flex-row justify-between items-center">
            <Text className="text-danger-text text-[14px] font-normal">
              Previous Balance
            </Text>
            <MoneyAmount
              value={order.previous_balance}
              className="text-danger-text text-[14px] font-normal"
            />
          </View>
        )}

        {/* Grand Total */}
        <View className="h-px bg-border-soft my-2" />
        <View className="flex-row justify-between items-center">
          <Text className="text-textPrimary text-[15px] font-semibold">
            Grand Total
          </Text>
          <View className="flex-row items-center gap-2">
            <MoneyAmount
              value={grandTotal}
              className="text-textPrimary text-[17px] font-bold"
            />
            <StatusBadge status={statusKey} />
          </View>
        </View>
      </View>
    </View>
  );
}

