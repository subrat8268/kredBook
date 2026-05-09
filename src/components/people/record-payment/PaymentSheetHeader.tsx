import { useTheme } from "@/src/utils/ThemeProvider";
import { Text, View } from "react-native";

type Props = {
  customerName: string;
};

export default function PaymentSheetHeader({ customerName }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={[typography.screenTitle, { color: colors.textPrimary, fontWeight: "700" }]}>Record Payment</Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>Collect from {customerName} and update balance instantly.</Text>
    </View>
  );
}
