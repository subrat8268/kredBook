import { ChevronDown, ChevronUp, Package } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { OrderDetail } from "@/src/api/entries";
import { useTheme } from "@/src/theme/useTheme";

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
  const t = useTheme();
  const autoExpand = order.items.length === 1;
  const [expanded, setExpanded] = useState(autoExpand);

  const itemCount = order.items.length;

  const statusStyle = useMemo(() => {
    const badgeStyles: Record<string, { bg: string; text: string }> = {
      Pending: { bg: t.colors.pendingSurface, text: t.colors.pendingText },
      Paid: { bg: t.colors.paidSurface, text: t.colors.paidText },
      "Partially Paid": { bg: t.colors.partialSurface, text: t.colors.partialText },
      Partial: { bg: t.colors.partialSurface, text: t.colors.partialText },
      Overdue: { bg: t.colors.overdueSurface, text: t.colors.overdueText },
    };
    return badgeStyles[statusKey] || { bg: t.colors.borderSubtle, text: t.colors.muted };
  }, [t.colors, statusKey]);

  const itemRows = useMemo(
    () =>
      order.items.map((item) => (
        <View key={item.id}>
          <View className="flex-row items-center justify-between py-3.5">
            <View className="flex-col gap-1 flex-1 pr-4">
              <Text
                numberOfLines={1}
                style={{ color: t.colors.ink }}
                className="text-[15px] font-semibold"
              >
                {item.product_name}
              </Text>
              <Text style={{ color: t.colors.muted }} className="text-[13px] font-medium">
                {item.quantity} × ₹{fmt(item.price)}
              </Text>
            </View>
            <Text style={{ color: t.colors.ink }} className="text-[16px] font-bold">
              ₹{fmt(item.subtotal)}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: t.colors.borderSubtle }} />
        </View>
      )),
    [order.items, fmt, t.colors, t.fontFamily],
  );

  return (
    <View
      style={{
        backgroundColor: t.colors.surface,
        borderWidth: 1,
        borderColor: t.colors.borderDefault,
      }}
      className="mx-4 mb-6 rounded-xl"
    >
      <Pressable
        onPress={autoExpand ? undefined : () => setExpanded((p) => !p)}
        style={({ pressed }) => [
          pressed && !autoExpand && { backgroundColor: t.colors.borderSubtle },
          { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
        ]}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <View className="flex-row items-center gap-3">
          <View
            style={{ backgroundColor: t.colors.surfaceRaised }}
            className="h-11 w-11 items-center justify-center rounded-xl"
          >
            <Package size={20} color={t.colors.body} strokeWidth={2} />
          </View>
          <View className="flex-col">
            <Text style={{ color: t.colors.ink }} className="text-base font-semibold">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </Text>
            <Text style={{ color: t.colors.muted }} className="text-xs font-semibold mt-0.5">
              ₹{itemsSubtotal.toLocaleString("en-IN")} total
            </Text>
          </View>
        </View>

        {!autoExpand && (
          <View>
            {expanded ? (
              <ChevronUp size={20} color={t.colors.muted} strokeWidth={2} />
            ) : (
              <ChevronDown size={20} color={t.colors.muted} strokeWidth={2} />
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
            <Text style={{ color: t.colors.muted }} className="text-[14px] font-medium">
              Subtotal
            </Text>
            <Text style={{ color: t.colors.ink }} className="text-[14px] font-semibold">
              ₹{fmt(itemsSubtotal)}
            </Text>
          </View>

          {/* Tax */}
          {order.tax_percent > 0 && (
            <View className="flex-row justify-between items-center py-1">
              <Text style={{ color: t.colors.muted }} className="text-[14px] font-medium">
                GST ({order.tax_percent}%)
              </Text>
              <Text style={{ color: t.colors.ink }} className="text-[14px] font-semibold">
                ₹{fmt(taxAmount)}
              </Text>
            </View>
          )}

          {/* Loading Charge */}
          {order.loading_charge > 0 && (
            <View className="flex-row justify-between items-center py-1">
              <Text style={{ color: t.colors.muted }} className="text-[14px] font-medium">
                Loading Charge
              </Text>
              <Text style={{ color: t.colors.ink }} className="text-[14px] font-semibold">
                ₹{fmt(order.loading_charge)}
              </Text>
            </View>
          )}

          {/* Previous balance */}
          {order.previous_balance > 0 && (
            <View className="flex-row justify-between items-center py-1">
              <Text style={{ color: t.colors.overdue }} className="text-[14px] font-medium">
                Previous Balance
              </Text>
              <Text style={{ color: t.colors.overdue }} className="text-[14px] font-semibold">
                ₹{fmt(order.previous_balance)}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: t.colors.borderSubtle }} className="my-3" />

          {/* Grand Total */}
          <View className="flex-row justify-between items-center py-1">
            <View className="flex-row items-center gap-2">
              <Text style={{ color: t.colors.ink }} className="text-[16px] font-bold">
                Grand Total
              </Text>
              <View
                style={{
                  backgroundColor: statusStyle.bg,
                }}
                className="rounded-full px-2 py-0.5"
              >
                <Text
                  style={{
                    color: statusStyle.text,
                    fontSize: 10,
                  }}
                  className="font-bold uppercase tracking-wider text-[10px]"
                >
                  {statusKey}
                </Text>
              </View>
            </View>
            <Text style={{ color: t.colors.ink }} className="text-[17px] font-bold">
              ₹{fmt(grandTotal)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
