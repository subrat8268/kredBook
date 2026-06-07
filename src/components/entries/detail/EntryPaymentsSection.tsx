import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { formatDate } from "@/src/utils/helper";
import { ActivityIndicator, Text, View } from "react-native";
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
import { useTheme } from "@/src/theme/useTheme";

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
  isOverpaid?: boolean;
};

export default function EntryPaymentsSection({
  paymentsLoading,
  paymentsError,
  paymentRows,
  grandTotal,
  paidAmount,
  statusKey,
  isOverpaid: isOverpaidProp,
}: Props) {
  const t = useTheme();

  const MODE_STYLE: Record<
    string,
    { circleBg: string; accent: string; icon: React.ElementType }
  > = {
    Cash: {
      circleBg: t.colors.paidSurface,
      accent: t.colors.paid,
      icon: Banknote,
    },
    UPI: {
      circleBg: t.colors.advanceSurface,
      accent: t.colors.advance,
      icon: QrCode,
    },
    NEFT: {
      circleBg: t.colors.partialSurface,
      accent: t.colors.partial,
      icon: Landmark,
    },
    Cheque: {
      circleBg: t.colors.pendingSurface,
      accent: t.colors.pending,
      icon: ReceiptText,
    },
  };

  const DEFAULT_MODE = {
    circleBg: t.colors.borderSubtle,
    accent: t.colors.muted,
    icon: Ellipsis,
  };

  const isOverpaid = isOverpaidProp ?? paidAmount > grandTotal;
  const overpaidAmount = Math.max(0, paidAmount - grandTotal);
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
        backgroundColor: t.colors.surface,
        borderRadius: t.radius.lg,
      }}
      className="mx-4 mb-4 gap-4 p-5"
    >
      {/* Header */}
      <View className="flex-col">
        <View className="pb-1">
          <Text
            style={{
              letterSpacing: t.letterSpacing.micro,
              color: t.colors.muted,
            }}
            className="text-[12px] font-bold uppercase"
          >
            PAYMENTS
          </Text>
        </View>
        <Text
          style={[
            t.typeStyles.caption,
            {
              color: isOverpaid ? t.colors.advance : t.colors.muted,
              lineHeight: 20,
            },
          ]}
        >
          {isOverpaid ? (
            <>
              Overpaid by{" "}
              <MoneyAmount value={overpaidAmount} variant="inherit" />
            </>
          ) : (
            <>
              Paid <MoneyAmount value={paidAmount} variant="inherit" /> of{" "}
              <MoneyAmount value={grandTotal} variant="inherit" />
            </>
          )}
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 4,
          backgroundColor: t.colors.borderDefault,
          borderRadius: t.radius.full,
          position: "relative",
          overflow: "hidden",
        }}
        className="w-full"
      >
        {progress === 0 ? (
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: t.colors.primary,
              position: "absolute",
              left: 0,
              top: 0,
            }}
          />
        ) : (
          <Animated.View
            style={[
              animatedStyle,
              {
                height: "100%",
                backgroundColor: t.colors.primary,
                borderRadius: t.radius.full,
                position: "absolute",
                left: 0,
                top: 0,
              },
            ]}
          />
        )}
      </View>

      {/* Content */}
      {paymentsError ? (
        <View className="items-center justify-center pb-6 pt-8">
          <Text
            style={[
              t.typeStyles.caption,
              { color: t.colors.faint, textAlign: "center" },
            ]}
          >
            Could not load payments
          </Text>
        </View>
      ) : paymentsLoading ? (
        <View className="items-center justify-center py-10">
          <ActivityIndicator size="small" color={t.colors.primary} />
        </View>
      ) : paymentRows.length === 0 ? (
        <View
          style={{
            alignItems: "center",
            gap: 0,
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          <View
            style={{
              marginBottom: 12,
              height: 48,
              width: 48,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              backgroundColor: t.colors.borderSubtle,
            }}
          >
            <Wallet size={20} color={t.colors.faint} strokeWidth={1.5} />
          </View>
          <Text
            style={[
              t.typeStyles.caption,
              { color: t.colors.faint, textAlign: "center" },
            ]}
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
                style={
                  idx === paymentRows.length - 1
                    ? undefined
                    : {
                        borderBottomWidth: 1,
                        borderBottomColor: t.colors.borderSubtle,
                      }
                }
                className="flex-row items-center justify-between py-4"
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
                    <Text
                      style={{ color: t.colors.ink }}
                      className="text-base font-medium"
                    >
                      {payment.payment_mode}
                    </Text>
                    <Text
                      style={{ color: t.colors.muted }}
                      className="text-xs leading-5 font-medium"
                    >
                      {isToday
                        ? "Today"
                        : formatDate(payment.payment_date, "dd MMM")}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <View
                    style={{
                      backgroundColor: t.colors.primaryBorderFill,
                      paddingHorizontal: t.components.badge.paddingH,
                      paddingVertical: t.components.badge.paddingV,
                      borderRadius: t.radius.full,
                    }}
                  >
                    <Text
                      style={[t.typeStyles.micro, { color: t.colors.primary }]}
                    >
                      Received
                    </Text>
                  </View>
                  <MoneyAmount
                    value={payment.amount}
                    showPlusForPositive
                    variant="inherit"
                    style={{ fontSize: 18, fontFamily: t.fontFamily.bodyBold }}
                    color={modeStyle.accent}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
