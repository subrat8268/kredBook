import { useTheme } from "@/src/utils/ThemeProvider";
import Avatar from "@/src/components/ui/Avatar";
import { Pressable, Text, View } from "react-native";

type Props = {
  customerName: string;
  customerPhone: string;
  onCustomerTap?: () => void;
};

export default function EntryCustomerCard({
  customerName,
  customerPhone,
  onCustomerTap,
}: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Pressable
      onPress={onCustomerTap}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: spacing.cardRadius,
        marginHorizontal: spacing.screenPadding,
        marginBottom: spacing.sm,
        padding: spacing.lg,
        opacity: pressed ? 0.9 : 1,
      })}
      className="shadow-sm shadow-textPrimary-dark"
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
      </View>
      <View style={{ marginTop: spacing.md, alignItems: "flex-end" }}>
        <Text style={{ ...typography.caption, color: colors.primary, fontWeight: "600" }}>
          View Customer &rarr;
        </Text>
      </View>
    </Pressable>
  );
}
