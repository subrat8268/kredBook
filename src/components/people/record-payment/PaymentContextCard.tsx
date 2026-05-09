import Avatar from "@/src/components/ui/Avatar";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Text, View } from "react-native";

type Props = {
  customerName: string;
  effectiveBalance: number;
};

export default function PaymentContextCard({ customerName, effectiveBalance }: Props) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View
      className="flex-row items-center"
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.md,
      }}
    >
      <View style={{ marginRight: spacing.md }}>
        <Avatar name={customerName} size="md" />
      </View>
      <View className="flex-1" style={{ gap: spacing.xs }}>
        <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>{customerName}</Text>
        <View className="flex-row items-center" style={{ gap: spacing.xs }}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Outstanding</Text>
          <MoneyAmount value={effectiveBalance} color={colors.danger} style={[typography.caption, { fontWeight: "700" }]} />
        </View>
      </View>
    </View>
  );
}
