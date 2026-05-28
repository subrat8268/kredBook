import { useTheme } from "@/src/utils/ThemeProvider";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { formatDate } from "@/src/utils/helper";
import { ActivityIndicator, Text, View } from "react-native";
import { Wallet } from "lucide-react-native";

type PaymentRow = {
  payment: {
    id: string;
    payment_date: string;
    payment_mode: string;
    amount: number;
  };
  remaining: number;
};

type Props = {
  paymentsLoading: boolean;
  paymentRows: PaymentRow[];
  fmt: (value: number) => string;
  PAYMENT_MODE_COLORS: Record<string, { bg: string; text: string }>;
  grandTotal: number;
  paidAmount: number;
};

export default function EntryPaymentsSection({
  paymentsLoading,
  paymentRows,
  PAYMENT_MODE_COLORS,
  grandTotal,
  paidAmount,
}: Props) {
  const { colors } = useTheme();
  const progress = grandTotal > 0 ? (paidAmount / grandTotal) * 100 : 0;

  return (
    <View className="bg-surface rounded-2xl mx-4 mb-6 p-4 border border-border">
      {/* Section Header */}
      <View className="mb-3">
        <Text className="text-textSecondary font-semibold text-[11px] tracking-[1.2px] uppercase">
          Payments
        </Text>
        <Text className="text-[13px] text-textSecondary mt-1">
          Paid <MoneyAmount value={paidAmount} /> of <MoneyAmount value={grandTotal} />
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-1 rounded-full bg-border-soft w-full mb-4">
        <View
          style={{ width: `${progress}%` }}
          className="h-1 rounded-full bg-primary"
        />
      </View>

      {/* Content */}
      {paymentsLoading ? (
        <View className="py-10 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : paymentRows.length === 0 ? (
        <View className="py-8 items-center justify-center">
          <Wallet size={32} color={colors.border} strokeWidth={1.5} />
          <Text className="text-textSecondary text-[14px] mt-2">
            No payments recorded yet
          </Text>
        </View>
      ) : (
        <View className="flex-col">
          {paymentRows.map(({ payment }, idx) => {
            const modeStyle =
              PAYMENT_MODE_COLORS[payment.payment_mode] ?? PAYMENT_MODE_COLORS["Cash"];
            return (
              <View
                key={payment.id}
                className={`flex-row justify-between items-center py-3 ${
                  idx === paymentRows.length - 1 ? "" : "border-b border-border-soft"
                }`}
              >
                <View>
                  <Text className="text-[14px] font-semibold text-textPrimary">
                    {payment.payment_mode}
                  </Text>
                  <Text className="text-[13px] text-textSecondary mt-0.5">
                    {formatDate(payment.payment_date, "dd MMM")}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MoneyAmount
                    value={payment.amount}
                    showPlusForPositive
                    className="text-[15px] font-bold text-success"
                  />
                  <View
                    style={{ backgroundColor: modeStyle.bg, borderRadius: 99 }}
                    className="px-2 py-0.5"
                  >
                    <Text
                      style={{ color: modeStyle.text }}
                      className="text-[11px] font-bold"
                    >
                      RECEIVED
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
