import Button from "@/src/components/ui/Button";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Check, Clock3, Share2 } from "lucide-react-native";
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
    ? "Payment saved successfully."
    : "This payment will sync when you're online.";

  return (
    <View style={{ paddingTop: spacing.sm }}>
      <View
        className="items-center rounded-2xl border p-4"
        style={{
          borderColor: isConfirmed ? colors.success : colors.warning,
          backgroundColor: isConfirmed ? colors.successBg : colors.warningBg,
        }}
      >
        <View
          className="mb-3 items-center justify-center rounded-full"
          style={{ width: 44, height: 44, backgroundColor: isConfirmed ? colors.success : colors.warning }}
        >
          {isConfirmed ? (
            <Check size={20} color={colors.surface} strokeWidth={3} />
          ) : (
            <Clock3 size={20} color={colors.surface} strokeWidth={2.5} />
          )}
        </View>
        <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text className="mt-1 text-center" style={[typography.caption, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>

      <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>Payment receipt</Text>
        <View className="flex-row items-center justify-between">
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Customer</Text>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>{customerName}</Text>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Amount received</Text>
          <MoneyAmount value={lastPaidAmount} style={[typography.body, { fontWeight: "700" }]} color={colors.success} />
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Remaining balance</Text>
          <MoneyAmount
            value={lastRemainingBalance}
            style={[typography.body, { fontWeight: "700" }]}
            color={lastRemainingBalance === 0 ? colors.success : colors.danger}
          />
        </View>
      </View>

      {isConfirmed ? (
        <View className="mt-5" style={{ gap: spacing.sm }}>
          <Button
            title={isSharingReceipt ? "Opening..." : "Share receipt"}
            onPress={onShareReceipt}
            disabled={isSharingReceipt}
            icon={<Share2 size={16} color={colors.surface} strokeWidth={2.4} />}
          />
          <Button variant="secondary" title="Done" onPress={onDone} />
        </View>
      ) : (
        <View className="mt-5">
          <Button title="Done" onPress={onDone} />
        </View>
      )}
    </View>
  );
}
