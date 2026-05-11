import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentRef, useEffect, useRef } from "react";
import { Text, View } from "react-native";
import RecordPaymentIntentToggle from "./RecordPaymentIntentToggle";
import type { PaymentIntent } from "./useRecordCustomerPaymentModal";

type Props = {
  amount: string;
  paymentIntent: PaymentIntent;
  onSelectFull: () => void;
  onSelectPartial: () => void;
  onAmountChange: (value: string) => void;
  onPartialInputFocus?: () => void;
  amountError?: string;
};

export default function RecordPaymentAmountConsole({
  amount,
  paymentIntent,
  onSelectFull,
  onSelectPartial,
  onAmountChange,
  onPartialInputFocus,
  amountError,
}: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const numeric = Number(amount || "0");
  const amountInputRef =
    useRef<ComponentRef<typeof BottomSheetTextInput>>(null);

  useEffect(() => {
    if (paymentIntent !== "partial") return;
    const timer = setTimeout(() => amountInputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [paymentIntent]);

  return (
    <View
      style={{
        borderWidth: amountError ? 2 : 1,
        borderColor: amountError ? colors.danger : colors.borderLight,
        borderRadius: radius.xl,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.lg,
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

      <Text
        style={[
          typography.caption,
          {
            color: colors.textSecondary,
            textAlign: "center",
            marginBottom: spacing.xs,
          },
        ]}
      >
        AMOUNT RECEIVED
      </Text>

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
            typography.heroAmount,
            {
              color: amount.length ? colors.textPrimary : colors.textMuted,
              fontFamily: typography.headingFontFamilies.extraBold,
              fontSize: 46,
              lineHeight: 52,
              fontWeight: "800",
              fontVariant: ["tabular-nums"],
              letterSpacing: -0.6,
              paddingVertical: 0,
              textAlign: "center",
            },
          ]}
        />
      ) : (
        <Text
          selectable
          style={[
            typography.heroAmount,
            {
              color: numeric > 0 ? colors.textPrimary : colors.textMuted,
              fontFamily: typography.headingFontFamilies.extraBold,
              fontSize: 46,
              lineHeight: 52,
              fontWeight: "800",
              fontVariant: ["tabular-nums"],
              letterSpacing: -0.6,
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

      {paymentIntent === "partial" && amountError ? (
        <Text
          style={[
            typography.caption,
            { color: colors.danger, marginTop: spacing.xs },
          ]}
        >
          {amountError}
        </Text>
      ) : null}
    </View>
  );
}
