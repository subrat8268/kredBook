import { useTheme } from "@/src/utils/ThemeProvider";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import StatusBadge from "@/src/components/layer2/StatusBadge";
import { Text, View } from "react-native";
import type { Order } from "@/src/types/entry";

type Props = {
  order: Order;
  itemsSubtotal: number;
  taxAmount: number;
  grandTotal: number;
  statusKey: "Paid" | "Pending" | "Overdue" | "Partially Paid";
  fmt: (value: number) => string;
};

export default function EntryItemsSummaryCard({
  order,
  itemsSubtotal,
  taxAmount,
  grandTotal,
  statusKey,
  fmt,
}: Props) {
  const { colors, spacing, typography } = useTheme();

  const SHADOW = {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: spacing.cardRadius,
          marginHorizontal: spacing.screenPadding,
          marginBottom: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
        },
        SHADOW,
      ]}
    >
      {/* Items Header */}
      <Text
        style={{
          ...typography.label,
          color: colors.textSecondary,
          paddingBottom: 10,
        }}
      >
        Items
      </Text>

      {/* Items List */}
      {order.items.map((item, idx) => (
        <View key={item.id ?? String(idx)}>
          {idx > 0 && (
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: spacing.sm,
              }}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              paddingVertical: spacing.xs,
              alignItems: "center",
            }}
          >
            {/* Item name */}
            <Text
              style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}
              numberOfLines={1}
            >
              {item.product_name}
              {item.variant_name ? ` (${item.variant_name})` : ""}
            </Text>
            {/* qty × price */}
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginRight: 16,
                flexShrink: 0,
              }}
            >
              {item.quantity} × ₹{fmt(item.price)}
            </Text>
            {/* line total */}
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: colors.textPrimary,
                minWidth: 64,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              ₹{fmt(item.subtotal)}
            </Text>
          </View>
        </View>
      ))}

      {/* Divider between Items and Summary */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginVertical: spacing.sm,
        }}
      />

      {/* Note */}
      {order.note && order.note.trim() ? (
        <View style={{ marginBottom: spacing.sm }}>
          <Text style={{ ...typography.caption, color: colors.textSecondary }}>
            Note
          </Text>
          <Text style={{ ...typography.body, color: colors.textPrimary, marginTop: spacing.xs }}>
            {order.note}
          </Text>
        </View>
      ) : null}

      {/* Subtotal row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: spacing.xs,
        }}
      >
        <Text style={typography.subtitle}>Subtotal</Text>
        <MoneyAmount
          value={itemsSubtotal}
          style={[typography.subtitle, { color: colors.textPrimary }]}
        />
      </View>

      {/* GST row — only if tax_percent > 0 */}
      {order.tax_percent > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: spacing.xs,
          }}
        >
          <Text style={typography.subtitle}>GST ({order.tax_percent}%)</Text>
          <MoneyAmount
            value={taxAmount}
            style={[typography.subtitle, { color: colors.textPrimary }]}
          />
        </View>
      )}

      {/* Loading Charge row — only if > 0 */}
      {order.loading_charge > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: spacing.xs,
          }}
        >
          <Text style={typography.subtitle}>Loading Charge</Text>
          <MoneyAmount value={order.loading_charge} style={typography.subtitle} />
        </View>
      )}

      {/* Previous balance row — only if > 0 */}
      {order.previous_balance > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: spacing.xs,
          }}
        >
          <Text style={[typography.subtitle, { color: colors.danger }]}>
            Previous Balance
          </Text>
          <MoneyAmount
            value={order.previous_balance}
            color={colors.danger}
            style={typography.subtitle}
          />
        </View>
      )}

      {/* Divider before Grand Total */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginVertical: spacing.sm,
        }}
      />

      {/* Grand Total */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Text style={{ ...typography.screenTitle }}>Grand Total</Text>
        <View style={{ alignItems: "flex-end" }}>
          <MoneyAmount value={grandTotal} variant="title" />
          <View style={{ marginTop: spacing.xs }}>
            <StatusBadge
              status={statusKey as "Paid" | "Pending" | "Overdue" | "Partially Paid"}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
