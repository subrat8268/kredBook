import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { CheckCircle2, CircleHelp } from "lucide-react-native";
import type { PaymentIntent } from "./useRecordCustomerPaymentModal";
import { Text, View } from "react-native";

type Props = {
  paymentIntent: PaymentIntent;
  hasBalance: boolean;
  effectiveBalance: number;
  isFullPaid: boolean;
  parsedAmount: number | null;
  remainingBalance: number;
};

export default function PaymentOutcomeHint({
  paymentIntent,
  hasBalance,
  effectiveBalance,
  isFullPaid,
  parsedAmount,
  remainingBalance,
}: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  if (!hasBalance) {
    return null;
  }

  const showsEmptyPartialHelper =
    paymentIntent === "partial" && parsedAmount === null;
  const exceedsBalance =
    paymentIntent === "partial" &&
    parsedAmount !== null &&
    parsedAmount > effectiveBalance;
  const clearsBalance = paymentIntent === "full" || isFullPaid;
  const hasRemaining =
    paymentIntent === "partial" &&
    parsedAmount !== null &&
    remainingBalance > 0;
  const remainingRatio =
    effectiveBalance > 0 ? remainingBalance / effectiveBalance : 0;
  const useWarningStyle = remainingRatio > 0.25;

  const hint = exceedsBalance
    ? {
        text: `Amount cannot exceed ${formatINR(effectiveBalance)}`,
        fg: colors.danger,
        bg: colors.dangerBg,
        border: colors.danger,
        icon: CircleHelp,
      }
    : clearsBalance
      ? {
          text: "Balance will be cleared",
          fg: colors.successDark,
          bg: colors.successBg,
          border: colors.successLight,
          icon: CheckCircle2,
        }
      : hasRemaining
        ? {
            text: `Remaining ${formatINR(remainingBalance)} after payment`,
            fg: useWarningStyle ? colors.warning : colors.textSecondary,
            bg: useWarningStyle ? colors.warningBg : colors.surfaceAlt,
            border: useWarningStyle
              ? colors.warningBadgeBg
              : colors.borderLight,
            icon: CircleHelp,
          }
        : showsEmptyPartialHelper
          ? {
              text: "Enter amount received",
              fg: colors.textSecondary,
              bg: colors.surfaceAlt,
              border: colors.borderLight,
              icon: CircleHelp,
            }
          : null;

  if (!hint) {
    return null;
  }

  const Icon = hint.icon;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: hint.border,
        backgroundColor: hint.bg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
      }}
    >
      <Icon size={14} color={hint.fg} strokeWidth={2.2} />
      <Text style={[typography.caption, { color: hint.fg, fontWeight: "700" }]}>
        {hint.text}
      </Text>
    </View>
  );
}
