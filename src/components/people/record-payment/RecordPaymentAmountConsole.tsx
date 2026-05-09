import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
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
        borderColor: isFullPaid ? colors.success : colors.border,
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.md,
      }}
    >
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Amount Received</Text>
      <Text
        selectable
        style={[
          typography.h2,
          {
            color: numeric > 0 ? colors.textPrimary : colors.textMuted,
            fontWeight: "800",
            fontVariant: ["tabular-nums"],
          },
        ]}
      >
        {formatINR(numeric, { maximumFractionDigits: 2 })}
      </Text>

      <View className="mt-2 flex-row items-center" style={{ gap: spacing.xs }}>
        {isFullPaid ? <CheckCircle2 size={14} color={colors.success} strokeWidth={2.4} /> : null}
        {!hasBalance ? (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>No outstanding balance for this entry.</Text>
        ) : isFullPaid ? (
          <Text style={[typography.caption, { color: colors.success, fontWeight: "700" }]}>This will mark the entry fully paid.</Text>
        ) : (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Remaining: {formatINR(remainingBalance)}</Text>
        )}
      </View>
    </View>
  );
}
