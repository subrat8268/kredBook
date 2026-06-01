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
  grandTotal,
  paidAmount,
}: Props) {
  const progress = grandTotal > 0 ? (paidAmount / grandTotal) * 100 : 0;

  return (
    <View
      style={{
        shadowColor: "rgba(27,20,10,1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      }}
      className="mx-4 mb-4 gap-4 rounded-xl bg-white p-5"
    >
      {/* Header */}
      <View className="flex-col">
        <View className="pb-1">
          <Text
            style={{ letterSpacing: 0.6, lineHeight: 16 }}
            className="text-[12px] font-bold text-[#404040] uppercase"
          >
            PAYMENTS
          </Text>
        </View>
        <Text
          style={{ lineHeight: 20 }}
          className="text-[12px] font-medium text-[#404040]"
        >
          Paid <MoneyAmount value={paidAmount} /> of{" "}
          <MoneyAmount value={grandTotal} />
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-1.5 w-full relative overflow-hidden rounded-full bg-[#e0f2fe]">
        {progress === 0 && (
          <View className="absolute left-0 top-0 h-1.5 w-1 rounded-full bg-[#16a34a]" />
        )}
        {progress > 0 && (
          <View
            style={{ width: `${progress}%` }}
            className="absolute left-0 top-0 h-1.5 rounded-full bg-[#16a34a]"
          />
        )}
      </View>

      {/* Content */}
      {paymentsLoading ? (
        <View className="items-center justify-center py-10">
          <ActivityIndicator size="small" />
        </View>
      ) : paymentRows.length === 0 ? (
        <View className="items-center gap-0 pb-6 pt-8">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#e0f2fe]">
            <Wallet size={20} color="#374151" strokeWidth={1.5} />
          </View>
          <Text
            style={{ lineHeight: 20 }}
            className="text-center text-[14px] font-medium text-[#404040]"
          >
            No payments recorded yet
          </Text>
        </View>
      ) : (
        <View className="flex-col">
          {paymentRows.map(({ payment }, idx) => (
            <View
              key={payment.id}
              className={`flex-row items-center justify-between py-3 ${
                idx === paymentRows.length - 1
                  ? ""
                  : "border-b border-[#f3f4f6]"
              }`}
            >
              <View>
                <Text className="text-[14px] font-semibold text-[#111827]">
                  {payment.payment_mode}
                </Text>
                <Text className="mt-0.5 text-[13px] text-[#9ca3af]">
                  {formatDate(payment.payment_date, "dd MMM")}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <MoneyAmount
                  value={payment.amount}
                  showPlusForPositive
                  style={{ lineHeight: 20 }}
                  className="text-[15px] font-bold text-[#16a34a]"
                />
                <View className="rounded-full bg-[#dcfce7] px-2 py-[3px]">
                  <Text className="text-[11px] font-semibold text-[#16a34a]">
                    Received
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
