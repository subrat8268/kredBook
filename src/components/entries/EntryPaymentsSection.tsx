import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { formatDate } from "@/src/utils/helper";
import { ActivityIndicator, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  Banknote,
  Landmark,
  QrCode,
  ReceiptText,
  Ellipsis,
  Wallet,
} from "lucide-react-native";

const MODE_STYLE: Record<
  string,
  { circleBg: string; accent: string; icon: React.ElementType }
> = {
  Cash: { circleBg: "#DCFCE7", accent: "#16A34A", icon: Banknote },
  UPI: { circleBg: "#EDE9FE", accent: "#7C3AED", icon: QrCode },
  NEFT: { circleBg: "#DBEAFE", accent: "#2563EB", icon: Landmark },
  Cheque: { circleBg: "#FEF3C7", accent: "#D97706", icon: ReceiptText },
};

const DEFAULT_MODE = { circleBg: "#F3F4F6", accent: "#6B7280", icon: Ellipsis };

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
  paymentsError: boolean;
  paymentRows: PaymentRow[];
  grandTotal: number;
  paidAmount: number;
  statusKey?: "pending" | "partial" | "paid" | "overdue";
};

export default function EntryPaymentsSection({
  paymentsLoading,
  paymentsError,
  paymentRows,
  grandTotal,
  paidAmount,
  statusKey,
}: Props) {
  const progress = grandTotal > 0 ? (paidAmount / grandTotal) * 100 : 0;

  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
  }, [progress, widthAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

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
            className="text-[12px] font-bold text-[#3E4A3D] uppercase"
          >
            PAYMENTS
          </Text>
        </View>
        <Text
          style={{ lineHeight: 20 }}
          className="text-[13px] font-medium text-[#3E4A3D]"
        >
          Paid <MoneyAmount value={paidAmount} variant="inherit" /> of{" "}
          <MoneyAmount value={grandTotal} variant="inherit" />
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-2 w-full relative overflow-hidden rounded-full bg-[#f1f5f9] dark:bg-slate-800">
        <Animated.View
          style={[animatedStyle, { height: "100%" }]}
          className="absolute left-0 top-0"
        >
          <LinearGradient
            colors={["#22C55E", "#15803D"]} // Sleek forest-emerald green gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: "100%", height: "100%", borderRadius: 9999 }}
          />
        </Animated.View>
      </View>

      {/* Content */}
      {paymentsError ? (
        <View className="items-center justify-center pb-6 pt-8">
          <Text
            style={{ lineHeight: 20 }}
            className="text-center text-[13px] text-[#9ca3af]"
          >
            Could not load payments
          </Text>
        </View>
      ) : paymentsLoading ? (
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
          {paymentRows.map(({ payment }, idx) => {
            const paymentDate = new Date(payment.payment_date);
            const today = new Date();
            const isToday =
              paymentDate.getDate() === today.getDate() &&
              paymentDate.getMonth() === today.getMonth() &&
              paymentDate.getFullYear() === today.getFullYear();

            const modeStyle = MODE_STYLE[payment.payment_mode] ?? DEFAULT_MODE;
            const IconComp = modeStyle.icon;

            return (
              <View
                key={payment.id}
                className={`flex-row items-center justify-between py-4 ${
                  idx === paymentRows.length - 1
                    ? ""
                    : "border-b border-[#f3f4f6]"
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={{ backgroundColor: modeStyle.circleBg }}
                  >
                    <IconComp
                      size={20}
                      color={modeStyle.accent}
                      strokeWidth={2}
                    />
                  </View>
                  <View className="flex-col">
                    <Text className="text-base font-medium text-[#121C2A]">
                      {payment.payment_mode}
                    </Text>
                    <Text className="text-xs leading-5 font-medium text-[#6B7280]">
                      {isToday
                        ? "Today"
                        : formatDate(payment.payment_date, "dd MMM")}
                    </Text>
                  </View>
                </View>

                <MoneyAmount
                  value={payment.amount}
                  showPlusForPositive
                  variant="inherit"
                  className="text-lg font-semibold tracking-wide"
                  color={modeStyle.accent}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
