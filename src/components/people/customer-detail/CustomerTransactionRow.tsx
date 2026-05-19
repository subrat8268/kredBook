import type { Transaction } from "@/src/types/customer";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
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
};

export default function CustomerTransactionRow({ tx }: Props) {
  const { colors } = useTheme();
  const isPayment = tx.type === "payment";

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
  const leftAccent = isPayment
    ? colors.success
    : isOverdueStatus
      ? colors.danger
      : isPaidLikeStatus
        ? colors.textSecondary
        : colors.warning;
  const iconColor = isPayment
    ? colors.success
    : isPaidLikeStatus
      ? colors.textSecondary
      : colors.warning;
  const iconBg = isPayment
    ? colors.success + "15"
    : isPaidLikeStatus
      ? colors.textSecondary + "15"
      : colors.warning + "15";
  const amountColor = isPayment
    ? colors.success
    : isPaidLikeStatus
      ? colors.textSecondary
      : colors.textPrimary;
  const amountWeight: "700" | "500" = isPayment || !isPaidLikeStatus ? "700" : "500";
  const amountPrefix = isPayment ? "+" : "";

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: colors.surface,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        overflow: "hidden",
        flexDirection: "row",
      }}
    >
      <View style={{ width: 4, alignSelf: "stretch", backgroundColor: leftAccent }} />

      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              height: 32,
              width: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: iconBg,
              marginRight: 10,
            }}
          >
            {isPayment ? (
              <ArrowDownLeft size={16} color={iconColor} strokeWidth={2.1} />
            ) : (
              <ArrowUpRight size={16} color={iconColor} strokeWidth={2.1} />
            )}
          </View>

          <View style={{ flex: 1, paddingRight: 10 }}>
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

          <View style={{ alignItems: "flex-end" }}>
            <Text className="text-card-title" style={{ color: amountColor, fontWeight: amountWeight }}>
              {amountPrefix}
              {formatINR(tx.amount, { maximumFractionDigits: 2 })}
            </Text>
            <Text className="mt-0.5 text-caption text-textMuted dark:text-textMuted-dark" numberOfLines={1}>
              Bal: {formatINR(tx.runningBalance, { maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
