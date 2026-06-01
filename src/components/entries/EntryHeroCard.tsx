import { useTheme } from "@/src/utils/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import StatusBadge from "@/src/components/layer2/StatusBadge";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { formatDate } from "@/src/utils/helper";

type Props = {
  balanceDue: number;
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid";
  billNumber: string;
  createdAt: string;
  isOverdue: boolean;
};

export default function EntryHeroCard({
  balanceDue,
  status,
  billNumber,
  createdAt,
  isOverdue,
}: Props) {
  const { colors, gradients, typography, spacing } = useTheme();

  const getGradient = () => {
    const effectiveStatus = isOverdue ? "Overdue" : status;

    switch (effectiveStatus) {
      case "Paid":
        return gradients.orderPaid;
      case "Partially Paid":
        return gradients.orderPartial; // This is amber, need teal/info
      case "Pending":
        return gradients.orderPending; // This is amber as well
      case "Overdue":
        return gradients.orderOverdue;
      default:
        return gradients.orderPending;
    }
  };

  const heroTone = getGradient();

  return (
    <LinearGradient
      colors={[heroTone.start, heroTone.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mx-4 overflow-hidden px-5 py-5"
      style={{
        borderRadius: spacing.cardRadius,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View
        className="absolute inset-0 border-2 border-white/10"
        style={{ borderRadius: spacing.cardRadius }}
      />
      <View
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full"
        style={{ backgroundColor: colors.dashboard.heroOrb + "08" }}
      />
      <View
        className="absolute -right-8 -bottom-16 w-48 h-48 rounded-full"
        style={{ backgroundColor: colors.dashboard.heroOrb + "08" }}
      />
      <Text
        style={[
          typography.overline,
          {
            color: colors.dashboard.heroTextMuted,
            letterSpacing: 0.8,
            marginBottom: 2,
          },
        ]}
      >
        BALANCE DUE
      </Text>

      <MoneyAmount
        value={balanceDue}
        style={[
          typography.heroAmount,
          {
            color: colors.dashboard.heroText,
            marginTop: 2,
            marginBottom: 4,
          },
        ]}
      />

      <View className="mt-2 flex-row items-center justify-between">
        <StatusBadge
          status={status} // Use the original status prop for the badge
        />
        <Text
          className="text-overline"
          style={{
            color: colors.dashboard.heroTextMuted,
            letterSpacing: 0.5,
          }}
          numberOfLines={1}
        >
          {formatDate(createdAt)} · #{billNumber}
        </Text>
      </View>
    </LinearGradient>
  );
}
