import { useTheme } from "@/src/utils/ThemeProvider";
import type { PaymentIntent } from "./useRecordCustomerPaymentModal";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  paymentIntent: PaymentIntent;
  onSelectFull: () => void;
  onSelectPartial: () => void;
};

export default function RecordPaymentIntentToggle({ paymentIntent, onSelectFull, onSelectPartial }: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View className="flex-row" style={{ gap: spacing.xs, marginBottom: spacing.xs }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSelectFull}
        style={{
          flex: 1,
          borderRadius: radius.full,
          borderWidth: 1,
          borderColor: paymentIntent === "full" ? colors.success : colors.border,
          backgroundColor: paymentIntent === "full" ? colors.successBg : colors.surfaceAlt,
          paddingVertical: spacing.xs,
          alignItems: "center",
        }}
      >
        <Text style={[typography.caption, { color: paymentIntent === "full" ? colors.successDark : colors.textSecondary, fontWeight: "700" }]}>Full payment</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSelectPartial}
        style={{
          flex: 1,
          borderRadius: radius.full,
          borderWidth: 1,
          borderColor: paymentIntent === "partial" ? colors.success : colors.border,
          backgroundColor: paymentIntent === "partial" ? colors.successBg : colors.surfaceAlt,
          paddingVertical: spacing.xs,
          alignItems: "center",
        }}
      >
        <Text style={[typography.caption, { color: paymentIntent === "partial" ? colors.successDark : colors.textSecondary, fontWeight: "700" }]}>Partial</Text>
      </TouchableOpacity>
    </View>
  );
}
