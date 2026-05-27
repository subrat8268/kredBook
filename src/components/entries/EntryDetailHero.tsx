import { useTheme } from "@/src/utils/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import StatusBadge from "@/src/components/layer2/StatusBadge";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { formatDate } from "@/src/utils/helper";
import type { Order } from "@/src/types/entry";

type Props = {
  order: Order;
};

export default function EntryDetailHero({ order }: Props) {
  const { colors, gradients, typography } = useTheme();

  const dueDateValue =
    order && "due_date" in order && typeof order.due_date === "string"
      ? order.due_date
      : null;
  const isOverdue =
    !!order &&
    order.status !== "Paid" &&
    !!dueDateValue &&
    new Date(dueDateValue) < new Date(new Date().setHours(0, 0, 0, 0));
  const statusKey = isOverdue ? "Overdue" : (order?.status ?? "Pending");

  const getGradient = () => {
    switch (statusKey) {
      case "Paid":
        return gradients.orderPaid;
      case "Partially Paid":
        return gradients.orderPartial;
      case "Pending":
        return gradients.orderPending;
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
      className="mx-4 overflow-hidden rounded-2xl px-5 py-5"
      style={{
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View
        className="absolute inset-0 border-2 border-white/10 rounded-2xl"
      />
      <View
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full"
        style={{ backgroundColor: colors.dashboard.heroOrb + "08" }} // Reduced opacity
      />
      <Text
        style={[
          typography.overline,
          {
            color: colors.dashboard.heroTextMuted,
            letterSpacing: 0.8,
            marginBottom: 2, // Tightened spacing
          },
        ]}
      >
        Balance due
      </Text>

      <MoneyAmount
        value={order.balance_due}
        style={[
          typography.heroAmount,
          {
            color: colors.dashboard.heroText,
            marginTop: 2, // Tightened spacing
            marginBottom: 4, // Tightened spacing
          },
        ]}
      />

      <View className="mt-2 flex-row items-center justify-between">
        <StatusBadge
          status={
            statusKey as "Paid" | "Pending" | "Overdue" | "Partially Paid"
          }
        />
        <Text
          className="text-overline"
          style={{
            color: colors.dashboard.heroTextMuted,
            letterSpacing: 0.5,
          }}
          numberOfLines={1}
        >
          {formatDate(order.created_at)} · #{order.bill_number}
        </Text>
      </View>
    </LinearGradient>
  );
}
