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
    <View
      className="flex-row"
      style={{
        gap: spacing.xs,
        borderRadius: radius.full,
        padding: 4,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.borderLight,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSelectFull}
        style={{
          borderRadius: radius.full,
          borderWidth: paymentIntent === "full" ? 1 : 0,
          borderColor: colors.primary,
          backgroundColor: paymentIntent === "full" ? colors.primaryLight : "transparent",
          paddingHorizontal: spacing.md,
          paddingVertical: 6,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={[typography.caption, { color: paymentIntent === "full" ? colors.primaryDark : colors.textSecondary, fontWeight: "700" }]}>Full Payment</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSelectPartial}
        style={{
          borderRadius: radius.full,
          borderWidth: paymentIntent === "partial" ? 1 : 0,
          borderColor: colors.primary,
          backgroundColor: paymentIntent === "partial" ? colors.primaryLight : "transparent",
          paddingHorizontal: spacing.md,
          paddingVertical: 6,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={[typography.caption, { color: paymentIntent === "partial" ? colors.primaryDark : colors.textSecondary, fontWeight: "700" }]}>Partial</Text>
      </TouchableOpacity>
    </View>
  );
}
