import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2 } from "lucide-react-native";
import { Text, View } from "react-native";

type Props = {
  amount: string;
  hasBalance: boolean;
  isFullPaid: boolean;
  remainingBalance: number;
};

export default function RecordPaymentAmountConsole({ amount, hasBalance, isFullPaid, remainingBalance }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const numeric = Number(amount || "0");

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

      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Amount Received</Text>
      <Text
        selectable
        style={[
          typography.h2,
          {
            color: numeric > 0 ? colors.textPrimary : colors.textMuted,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
            letterSpacing: -0.3,
          },
        ]}
      >
        {formatINR(numeric, { maximumFractionDigits: 2 })}
      </Text>

      <View className="mt-2 flex-row items-center" style={{ gap: spacing.xs }}>
        {isFullPaid ? <CheckCircle2 size={14} color={colors.success} strokeWidth={2.4} /> : null}
        <View
          style={{
            borderRadius: radius.full,
            backgroundColor: isFullPaid ? colors.successBg : colors.surface,
            borderWidth: isFullPaid ? 0 : 1,
            borderColor: colors.borderLight,
            paddingHorizontal: spacing.sm,
            paddingVertical: 4,
          }}
        >
          {!hasBalance ? (
            <Text style={[typography.caption, { color: colors.textSecondary }]}>No balance due</Text>
          ) : isFullPaid ? (
            <Text style={[typography.caption, { color: colors.successDark, fontWeight: "700" }]}>Fully paid</Text>
          ) : (
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Remaining {formatINR(remainingBalance)}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
