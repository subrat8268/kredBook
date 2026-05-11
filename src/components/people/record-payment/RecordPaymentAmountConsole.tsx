import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import BalanceStatusPill from "@/src/components/ui/BalanceStatusPill";
import RecordPaymentIntentToggle from "./RecordPaymentIntentToggle";
import type { PaymentIntent } from "./useRecordCustomerPaymentModal";

type Props = {
  amount: string;
  hasBalance: boolean;
  isFullPaid: boolean;
  remainingBalance: number;
  paymentIntent: PaymentIntent;
  onSelectFull: () => void;
  onSelectPartial: () => void;
  onAmountChange: (value: string) => void;
  onPartialInputFocus?: () => void;
  amountError?: string;
};

export default function RecordPaymentAmountConsole({
  amount,
  hasBalance,
  isFullPaid,
  remainingBalance,
  paymentIntent,
  onSelectFull,
  onSelectPartial,
  onAmountChange,
  onPartialInputFocus,
  amountError,
}: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const numeric = Number(amount || "0");
  const amountInputRef = useRef<any>(null);

  useEffect(() => {
    if (paymentIntent !== "partial") return;
    const timer = setTimeout(() => amountInputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [paymentIntent]);


  return (
    <View
      style={{
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.borderLight,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[`${colors.success}14`, `${colors.success}05`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: -16,
          top: -24,
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: `${colors.success}10`,
        }}
      />

      <Text style={[typography.caption, { color: colors.textSecondary, textAlign: "center", marginBottom: spacing.xs }]}>AMOUNT RECEIVED</Text>

      {paymentIntent === "partial" ? (
        <BottomSheetTextInput
          ref={amountInputRef}
          value={amount}
          onChangeText={onAmountChange}
          onFocus={onPartialInputFocus}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          style={[
            typography.h2,
            {
              color: amount.length ? colors.textPrimary : colors.textMuted,
              fontWeight: "800",
              fontVariant: ["tabular-nums"],
              letterSpacing: -0.3,
              paddingVertical: 0,
              textAlign: "center",
            },
          ]}
        />
      ) : (
        <Text
          selectable
          style={[
            typography.h2,
            {
              color: numeric > 0 ? colors.textPrimary : colors.textMuted,
              fontWeight: "800",
              fontVariant: ["tabular-nums"],
              letterSpacing: -0.3,
              textAlign: "center",
            },
          ]}
        >
          {formatINR(numeric, { maximumFractionDigits: 2 })}
        </Text>
      )}

      <View className="items-center" style={{ marginTop: spacing.sm }}>
        <RecordPaymentIntentToggle
          paymentIntent={paymentIntent}
          onSelectFull={onSelectFull}
          onSelectPartial={onSelectPartial}
        />
      </View>

      <View className="mt-2 flex-row items-center justify-center" style={{ gap: spacing.xs }}>
        <BalanceStatusPill
          state={!hasBalance ? "noBalance" : isFullPaid ? "fullyPaid" : "remaining"}
          remainingAmount={remainingBalance}
        />
      </View>
      {paymentIntent === "partial" && amountError ? (
        <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.xs }]}>{amountError}</Text>
      ) : null}
    </View>
  );
}
