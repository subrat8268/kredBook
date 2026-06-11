import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { FileText, ArrowDownLeft } from "lucide-react-native";
import { useTheme } from "@/src/theme/useTheme";
import { formatINR } from "@/src/utils/format";

export interface Transaction {
  id: string;
  type: "bill" | "payment";
  created_at: string;
  amount: number;
  runningBalance: number;
  billNumber?: string | null;
  status?: "Paid" | "Pending" | "Partially Paid" | string | null;
  itemCount?: number | null;
  paymentMode?: string | null;
  orderBillNumber?: string | null;
}

interface CustomerTransactionRowProps {
  tx: Transaction;
  orders?: any[];
  onPress: () => void;
  balanceState?: "overdue" | "pending" | "partial" | "settled" | "advance" | null;
}

const MODE_LABEL: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  neft: "NEFT",
  draft: "Draft",
  cheque: "Cheque",
  online: "UPI",
};

export default function CustomerTransactionRow({
  tx,
  orders = [],
  onPress,
  balanceState,
}: CustomerTransactionRowProps) {
  const t = useTheme();
  const { colors, typeStyles } = t;

  const isPayment = tx.type === "payment";

  // Resolve matching order for due date calculation
  const matchingOrder = useMemo(() => {
    if (isPayment) return null;
    return orders.find((o) => o.id === tx.id);
  }, [isPayment, orders, tx.id]);

  // Format time (e.g. 10:30 am)
  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Status mapping
  const normalizedStatus = String(tx.status || "pending").toLowerCase();
  const isPaid = normalizedStatus === "paid";

  // Resolve aging chip data
  const agingChip = useMemo(() => {
    if (isPayment || isPaid) return null;
    if (balanceState === "settled" || balanceState === "advance") return null;
    if (!matchingOrder?.due_date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(matchingOrder.due_date);

    if (dueDate < today) {
      // Overdue entry
      const diff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        type: "overdue" as const,
        label: `${diff}d overdue`,
        bg: colors.overdueSurface,
        text: colors.overdueText,
      };
    } else {
      // Pending/Partial entry with future due date
      const dateStr = dueDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      return {
        type: "pending" as const,
        label: `Due ${dateStr}`,
        bg: colors.pendingSurface,
        text: colors.pendingText,
      };
    }
  }, [isPayment, isPaid, balanceState, matchingOrder, colors]);

  // Title and subtitle
  const title = isPayment
    ? "Payment Received"
    : `Entry${tx.billNumber ? ` #${tx.billNumber}` : ""}`;

  const modeLabel = tx.paymentMode
    ? (MODE_LABEL[tx.paymentMode.toLowerCase()] ?? tx.paymentMode)
    : "Payment";

  const subtitle = isPayment
    ? `${modeLabel} · ${formatTime(tx.created_at)}`
    : `${tx.itemCount || 0} item(s) · ${formatTime(tx.created_at)}`;

  // Icon configurations
  const iconBg = isPayment
    ? colors.primaryBorderFill
    : agingChip?.type === "overdue"
      ? colors.overdueSurface
      : isPaid
        ? colors.borderSubtle
        : colors.pendingSurface;

  const iconColor = isPayment
    ? colors.primary
    : agingChip?.type === "overdue"
      ? colors.overdue
      : isPaid
        ? colors.faint
        : colors.pending;

  const amountColor = isPayment
    ? colors.primary
    : isPaid
      ? colors.muted
      : colors.overdue;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowContainer,
        {
          backgroundColor: pressed ? colors.borderSubtle : "transparent",
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      {/* Left Icon */}
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        {isPayment ? (
          <ArrowDownLeft size={16} color={iconColor} strokeWidth={2.5} />
        ) : (
          <FileText size={16} color={iconColor} strokeWidth={2} />
        )}
      </View>

      {/* Middle Text Details */}
      <View style={styles.textContainer}>
        <Text style={[typeStyles.cardTitle, { color: colors.ink }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[typeStyles.caption, { color: colors.muted, marginTop: 2 }]}>
          {subtitle}
        </Text>

        {/* Aging Chip on its own line */}
        {agingChip && (
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: agingChip.bg }]}>
              <Text style={[styles.chipText, { color: agingChip.text, fontFamily: t.fontFamily.bodyBold }]}>
                {agingChip.label}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Right Amounts */}
      <View style={styles.amountContainer}>
        <Text style={[typeStyles.amountSm as any, { color: amountColor, fontFamily: t.fontFamily.bodyBold }]}>
          {isPayment ? "+ " : ""}
          {formatINR(tx.amount)}
        </Text>
        <Text style={[typeStyles.caption, { color: colors.faint, marginTop: 4 }]}>
          Bal: {formatINR(tx.runningBalance)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  chipRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  chipText: {
    fontSize: 11,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
});
