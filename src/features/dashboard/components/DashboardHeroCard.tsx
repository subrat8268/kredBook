import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { Pressable, Share, Text, View } from "react-native";

type Props = {
  colors: any;
  gradients: any;
  weekDelta: number;
  displayOutstanding: number;
  totalOutstanding: number;
  businessName: string;
  isCollecting: boolean;
  onCollectNow: () => Promise<void>;
};

export default function DashboardHeroCard({
  colors,
  gradients,
  weekDelta,
  displayOutstanding,
  totalOutstanding,
  businessName,
  isCollecting,
  onCollectNow,
}: Props) {
  return (
    <LinearGradient colors={[gradients.dashboardHero.end, gradients.dashboardHero.start]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="mt-section-md overflow-hidden rounded-2xl px-5 py-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-caption uppercase tracking-widest text-dashboard-hero-text-muted">Collect Outstanding</Text>
        <View className="rounded-full border border-dashboard-hero-chip-border bg-dashboard-hero-chip-bg px-3 py-1">
          <Text className="text-[11px] font-inter-semibold text-dashboard-hero-text">Outstanding</Text>
        </View>
      </View>
      <Text className="mt-2 text-[34px] font-inter-bold text-dashboard-hero-text">{formatINR(displayOutstanding)}</Text>

      <View className="mt-2 flex-row items-center">
        {weekDelta >= 0 ? <ArrowUpRight size={16} color={colors.successLight} strokeWidth={2.4} /> : <ArrowDownRight size={16} color={colors.warningBg} strokeWidth={2.4} />}
        <Text className="ml-1 text-caption text-dashboard-hero-text-muted">
          {weekDelta >= 0 ? "Up" : "Down"} {formatINR(Math.abs(weekDelta))} vs last week
        </Text>
      </View>

      <View className="mt-4 flex-row items-center" style={{ gap: 10 }}>
        <Pressable
          onPress={onCollectNow}
          disabled={isCollecting}
          className="flex-1 rounded-full bg-surface px-3 py-3"
          style={{
            opacity: isCollecting ? 0.65 : 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 3,
          }}
          accessibilityRole="button"
          accessibilityLabel="Record payment"
          accessibilityHint="Opens customer picker to record a payment"
          accessibilityState={{ disabled: isCollecting }}
        >
          <Text className="text-center font-inter-semibold text-success-dark">Record Payment</Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            await Share.share({
              message: `Hi, you have an outstanding amount of ${formatINR(totalOutstanding)} with ${businessName}. Please make the payment at your earliest. Thank you!`,
            });
          }}
          className="flex-1 rounded-full border border-dashboard-hero-chip-border bg-dashboard-hero-chip-bg px-3 py-3"
          accessibilityRole="button"
          accessibilityLabel="Send reminder"
          accessibilityHint="Shares a payment reminder via the system share sheet"
        >
          <Text className="text-center font-inter-semibold text-dashboard-hero-text">Send Reminder</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
