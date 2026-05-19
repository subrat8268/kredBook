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
  const normalizedStatus = String(tx.status ?? "pending").toLowerCase();
  const isOverdue = normalizedStatus === "overdue";
  const isPaid = normalizedStatus === "paid" || normalizedStatus === "partially paid";
  const statusChipLabel = isPayment ? "" : tx.status ?? "Pending";
  const statusChipBg = isOverdue
    ? colors.danger + "15"
    : isPaid
      ? colors.success + "15"
      : colors.warning + "18";
  const statusChipText = isOverdue
    ? colors.danger
    : isPaid
      ? colors.successDark
      : colors.warning;

  const subtitle = isPayment
    ? [modeLabel || "Payment", formatTime(tx.created_at)].filter(Boolean).join(" · ")
    : [tx.itemCount ? `${tx.itemCount} items` : "Entry", formatTime(tx.created_at)].join(" · ");

  const iconBg = isPayment
    ? colors.success + "18"
    : isOverdue
      ? colors.danger + "15"
      : isPaid
        ? colors.textSecondary + "15"
        : colors.warning + "18";
  const iconColor = isPayment
    ? colors.success
    : isOverdue
      ? colors.danger
      : isPaid
        ? colors.textSecondary
        : colors.warning;

  const amountColor = isPayment
    ? colors.success
    : isPaid
      ? colors.textSecondary
      : colors.textPrimary;
  const amountWeight = isPayment || !isPaid ? "700" : "500";
  const amountPrefix = isPayment ? "+" : "";

  return (
    <View className="flex-row items-center px-3" style={{ paddingHorizontal: 14, paddingVertical: 11 }}>
      <View
        className="mr-3 items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: iconBg,
        }}
      >
        {isPayment ? (
          <ArrowDownLeft size={16} color={iconColor} strokeWidth={2.1} />
        ) : (
          <ArrowUpRight size={16} color={iconColor} strokeWidth={2.1} />
        )}
      </View>

      <View className="flex-1 pr-2">
        <Text className="text-[14px] font-semibold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
          {title}
        </Text>
        <View className="mt-0.5 flex-row items-center" style={{ minHeight: 18 }}>
          <Text className="text-[12px] text-textSecondary dark:text-textSecondary-dark" numberOfLines={1}>
            {subtitle}
          </Text>

          {!isPayment && statusChipLabel ? (
            <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: statusChipBg }}>
              <Text className="text-[10px] font-semibold uppercase" style={{ color: statusChipText, letterSpacing: 0.6 }}>
                {statusChipLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="items-end">
        <Text
          className="text-[14px]"
          style={{ color: amountColor, fontWeight: amountWeight }}
        >
          {amountPrefix}
          {formatINR(tx.amount, { maximumFractionDigits: 2 })}
        </Text>
        <Text className="mt-0.5 text-[11px] text-textMuted dark:text-textMuted-dark" numberOfLines={1}>
          Bal: {formatINR(tx.runningBalance, { maximumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
}
