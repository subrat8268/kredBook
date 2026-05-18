import type { Transaction } from "@/src/types/customer";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { ArrowDown, ArrowUp } from "lucide-react-native";
import { Text, View } from "react-native";

const MODE_LABEL: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  neft: "NEFT",
  draft: "Draft",
  cheque: "Cheque",
  online: "UPI",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

type Props = {
  tx: Transaction;
  withBorder: boolean;
};

export default function CustomerTransactionRow({ tx, withBorder }: Props) {
  const { colors } = useTheme();
  const isPayment = tx.type === "payment";
  const amountColorClass = isPayment ? "text-success" : "text-danger-strong";
  const iconBgClass = isPayment
    ? "bg-success-bg dark:bg-success-bg-dark"
    : "bg-danger-bg dark:bg-danger-bg-dark";

  const title = isPayment ? "Payment Received" : `Entry${tx.billNumber ? ` #${tx.billNumber}` : ""}`;
  const modeLabel = tx.paymentMode ? (MODE_LABEL[tx.paymentMode.toLowerCase()] ?? tx.paymentMode) : "";
  const entryStatus = tx.status ?? "Pending";
  const chipLabel = isPayment ? modeLabel || "Payment" : entryStatus;
  const normalizedStatus = String(entryStatus).toLowerCase();
  const isOverdueStatus = normalizedStatus === "overdue";
  const isPaidLikeStatus =
    normalizedStatus === "paid" || normalizedStatus === "partially paid";
  const isPendingStatus = normalizedStatus === "pending";
  const chipBg = isPayment
    ? "bg-success-bg dark:bg-success-bg-dark"
    : isPaidLikeStatus
      ? "bg-success-bg dark:bg-success-bg-dark"
      : isPendingStatus
        ? "bg-warning-bg dark:bg-warning-bg-dark"
        : isOverdueStatus
          ? "bg-danger-bg dark:bg-danger-bg-dark"
          : "bg-warning-bg dark:bg-warning-bg-dark";
  const chipText = isPayment
    ? colors.successDark
    : isPaidLikeStatus
      ? colors.successDark
      : isPendingStatus
        ? colors.warning
        : isOverdueStatus
          ? colors.dangerStrong
          : colors.warning;
  const subtitle = isPayment
    ? [modeLabel, tx.orderBillNumber ? `#${tx.orderBillNumber}` : formatTime(tx.created_at)]
        .filter(Boolean)
        .join(" · ")
    : [tx.itemCount ? `${tx.itemCount} items` : "Entry", formatTime(tx.created_at)].join(" · ");

  return (
    <View className={`py-2.5 ${withBorder ? "border-b border-light dark:border-border-dark" : ""}`}>
      <View className="flex-row items-center">
        <View className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${iconBgClass}`}>
          {isPayment ? (
            <ArrowDown size={18} color={colors.success} strokeWidth={2.1} />
          ) : (
            <ArrowUp size={18} color={colors.dangerStrong} strokeWidth={2.1} />
          )}
        </View>

        <View className="flex-1 pr-2">
          <Text className="text-card-title font-inter-bold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
            {title}
          </Text>
          <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={1}>
            {subtitle}
          </Text>
          <View className={`mt-1.5 self-start rounded-full px-2 py-0.5 ${chipBg}`}>
            <Text className="text-caption" style={{ color: chipText, fontWeight: "700" }}>
              {chipLabel}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className={`text-card-title font-inter-bold ${amountColorClass}`}>
            {isPayment ? "+" : ""}
            {formatINR(tx.amount, { maximumFractionDigits: 2 })}
          </Text>
          <Text className="mt-0.5 text-caption text-textMuted dark:text-textMuted-dark" numberOfLines={1}>
            Bal: {formatINR(tx.runningBalance, { maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  );
}
