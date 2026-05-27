import { useTheme } from "@/src/utils/ThemeProvider";
import Avatar from "@/src/components/ui/Avatar";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { Text, View } from "react-native";

type Props = {
  customerName: string;
  customerPhone: string;
  previousBalance: number;
};

export default function EntryCustomerCard({
  customerName,
  customerPhone,
  previousBalance,
}: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: spacing.cardRadius,
        marginHorizontal: spacing.screenPadding,
        marginBottom: spacing.sm,
        padding: spacing.lg,
      }}
      className="shadow-sm shadow-textPrimary-dark" // Subtle shadow
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ marginRight: spacing.md, flexShrink: 0 }}>
          <Avatar name={customerName} size="md" />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...typography.cardTitle,
              marginBottom: spacing.xs,
              color: colors.textPrimary,
            }}
            numberOfLines={1}
          >
            {customerName}
          </Text>
          <Text style={{ ...typography.small, color: colors.textSecondary }}>
            +91 {customerPhone}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", marginLeft: spacing.sm }}>
          <Text
            style={{
              ...typography.caption,
              marginBottom: spacing.xs,
              color: previousBalance === 0 ? colors.textMuted : colors.textSecondary,
            }}
          >
            Previous Balance
          </Text>
          {previousBalance === 0 ? (
            <Text style={{ ...typography.cardTitle, fontWeight: "700", color: colors.textMuted }}>
              ₹0 (Cleared)
            </Text>
          ) : (
            <MoneyAmount
              value={previousBalance}
              color={previousBalance > 0 ? colors.danger : colors.textPrimary}
              style={{ ...typography.cardTitle, fontWeight: "700" }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
