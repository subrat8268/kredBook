import Button from "@/src/components/ui/Button";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Check, CheckCircle2, Clock3, Share2 } from "lucide-react-native";
import { Text, View } from "react-native";

type Props = {
  stage: "confirmed" | "queued";
  customerName: string;
  lastPaidAmount: number;
  lastRemainingBalance: number;
  isSharingReceipt: boolean;
  onShareReceipt: () => void;
  onDone: () => void;
};

export default function RecordPaymentResult({
  stage,
  customerName,
  lastPaidAmount,
  lastRemainingBalance,
  isSharingReceipt,
  onShareReceipt,
  onDone,
}: Props) {
  const { colors, spacing, typography } = useTheme();
  const isConfirmed = stage === "confirmed";
  const title = isConfirmed ? "Payment recorded" : "Saved offline";
  const subtitle = isConfirmed
    ? "Receipt is ready to share."
    : "This receipt will sync when you're online.";
  const remainingLabel =
    lastRemainingBalance === 0 ? "Balance cleared" : "Remaining balance";
  const statusLabel = isConfirmed ? "Confirmed" : "Queued";

  return (
    <View style={{ paddingTop: spacing.sm, gap: spacing.md }}>
      <View
        className="rounded-2xl border p-4"
        style={{
          borderColor: isConfirmed ? colors.success : colors.warning,
          backgroundColor: isConfirmed ? colors.successBg : colors.warningBg,
        }}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 44,
              height: 44,
              backgroundColor: isConfirmed ? colors.success : colors.warning,
            }}
          >
            {isConfirmed ? (
              <Check size={20} color={colors.surface} strokeWidth={3} />
            ) : (
              <Clock3 size={20} color={colors.surface} strokeWidth={2.5} />
            )}
          </View>
          <View
            className="flex-row items-center rounded-full"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderLight,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              gap: spacing.xs,
            }}
          >
            {isConfirmed ? (
              <CheckCircle2 size={13} color={colors.successDark} strokeWidth={2.4} />
            ) : (
              <Clock3 size={13} color={colors.warning} strokeWidth={2.4} />
            )}
            <Text
              style={[
                typography.caption,
                {
                  color: isConfirmed ? colors.successDark : colors.warning,
                  fontWeight: "700",
                },
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {subtitle}
        </Text>

        <View
          className="mt-3 rounded-xl border"
          style={{
            borderColor: colors.borderLight,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <Text style={[typography.overline, { color: colors.textSecondary }]}>Amount received</Text>
          <MoneyAmount
            value={lastPaidAmount}
            style={[
              typography.heroAmount,
              {
                color: isConfirmed ? colors.successDark : colors.textPrimary,
                fontFamily: typography.headingFontFamilies.extraBold,
                fontSize: 34,
                lineHeight: 40,
                marginTop: 2,
              },
            ]}
            color={isConfirmed ? colors.successDark : colors.textPrimary}
          />
        </View>
      </View>

      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
          Payment receipt
        </Text>
        <View className="flex-row items-center justify-between">
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Customer</Text>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>{customerName}</Text>
        </View>

        <View
          className="my-3"
          style={{ borderTopWidth: 1, borderTopColor: colors.borderLight }}
        />

        <View className="flex-row items-center justify-between">
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Amount received</Text>
          <MoneyAmount
            value={lastPaidAmount}
            style={[typography.body, { fontWeight: "700" }]}
            color={colors.success}
          />
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{remainingLabel}</Text>
          <MoneyAmount
            value={lastRemainingBalance}
            style={[typography.body, { fontWeight: "700" }]}
            color={lastRemainingBalance === 0 ? colors.success : colors.danger}
          />
        </View>
      </View>

      {isConfirmed ? (
        <View style={{ gap: spacing.sm }}>
          <Button
            title={isSharingReceipt ? "Opening..." : "Share receipt"}
            onPress={onShareReceipt}
            disabled={isSharingReceipt}
            icon={<Share2 size={16} color={colors.surface} strokeWidth={2.4} />}
          />
          <Button variant="secondary" title="Done" onPress={onDone} />
        </View>
      ) : (
        <View>
          <Button title="Done" onPress={onDone} />
        </View>
      )}
    </View>
  );
}
