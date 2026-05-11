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
        borderColor: colors.borderLight,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        marginBottom: spacing.sm,
      }}
    >
      <View style={{ marginRight: spacing.sm }}>
        <Avatar name={customerName} size="sm" />
      </View>
      <View className="flex-1" style={{ gap: spacing.xs }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Collecting from</Text>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "700" }]}>{customerName}</Text>
      </View>
      <View
        style={{
          borderRadius: radius.full,
          backgroundColor: colors.warningBg,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        }}
      >
        <MoneyAmount value={effectiveBalance} color={colors.dangerStrong} style={[typography.caption, { fontWeight: "700" }]} />
      </View>
    </View>
  );
}
