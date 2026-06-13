import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
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
  balanceState?:
    | "overdue"
    | "pending"
    | "partial"
    | "settled"
    | "advance"
    | null;
}

const MODE_LABEL: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  neft: "NEFT",
  draft: "Draft",
  cheque: "Cheque",
  online: "UPI",
};

const CustomerTransactionRow = React.memo(function CustomerTransactionRow({
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
      const diff = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
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

  const formattedDate = new Date(tx.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const a11yLabel = isPayment
    ? `Payment of ${formatINR(tx.amount)} on ${formattedDate}`
    : `Entry of ${formatINR(tx.amount)} on ${formattedDate}, balance ${formatINR(tx.runningBalance)}`;

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
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      className="flex-row items-center p-4"
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.borderSubtle : "transparent",
      })}
    >
      {/* Left Icon (Figma: w-10 h-10 rounded-lg) */}
      <View
        className="w-10 h-10 rounded-md items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        {isPayment ? (
          <ArrowDownLeft size={18} color={iconColor} strokeWidth={2.5} />
        ) : (
          <FileText size={18} color={iconColor} strokeWidth={2} />
        )}
      </View>

      {/* Middle Text Details */}
      <View className="flex-1 pr-2">
        {/* Title and Aging Chip in same row (Figma gap-2) with shrink protection */}
        <View className="flex-row items-center gap-2" style={{ flexShrink: 1 }}>
          <Text
            style={[typeStyles.cardTitle, { color: colors.ink, flexShrink: 1 }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {agingChip && (
            <View
              className="px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: agingChip.bg }}
            >
              <Text
                style={{
                  color: agingChip.text,
                  fontSize: 11,
                  fontWeight: "700",
                  fontFamily: t.fontFamily.bodyBold,
                }}
              >
                {agingChip.label}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[typeStyles.caption, { color: colors.muted, marginTop: 4 }]}
        >
          {subtitle}
        </Text>
      </View>

      {/* Right Amounts */}
      <View className="items-end justify-center gap-[2px]">
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: amountColor,
            fontFamily: t.fontFamily.bodyBold,
            lineHeight: 24,
          }}
        >
          {isPayment ? "+ " : ""}
          {formatINR(tx.amount)}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.muted,
            fontFamily: t.fontFamily.body,
            lineHeight: 16,
          }}
        >
          Bal: {formatINR(tx.runningBalance)}
        </Text>
      </View>
    </Pressable>
  );
});

export default CustomerTransactionRow;
