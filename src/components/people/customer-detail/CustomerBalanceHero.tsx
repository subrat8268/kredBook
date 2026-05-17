import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

type Props = {
  outstandingBalance: number;
  isOverdue: boolean;
  pendingOrderBalance: number;
  heroMetaText: string;
  heroGradientColors: [string, string];
  isDark: boolean;
};

export default function CustomerBalanceHero({
  outstandingBalance,
  isOverdue,
  pendingOrderBalance,
  heroMetaText,
  heroGradientColors,
  isDark,
}: Props) {
  const { colors, typography } = useTheme();
  const amountLabel =
    outstandingBalance > 0 ? "Balance due" : outstandingBalance < 0 ? "Advance" : "All settled";
  const stateLabel =
    outstandingBalance > 0
      ? isOverdue
        ? "Overdue"
        : "Pending"
      : outstandingBalance < 0
        ? "Advance available"
        : "No dues";
  const stateChipTone =
    outstandingBalance > 0
      ? isOverdue
        ? { bg: colors.dangerBg, text: colors.dangerStrong }
        : { bg: colors.warningBg, text: colors.warning }
      : outstandingBalance < 0
        ? { bg: colors.primaryBlueBg, text: colors.primaryBlue }
        : { bg: colors.successBg, text: colors.successDark };

  return (
    <LinearGradient
      colors={heroGradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mx-4 mt-4 overflow-hidden rounded-xl px-5 py-5"
    >
      <View className={`absolute -right-8 -top-9 h-32 w-32 rounded-full ${isDark ? "bg-customer-hero-orb-dark" : "bg-customer-hero-orb"}`} />
      <View className={`absolute bottom-[-40px] right-8 h-24 w-24 rounded-full ${isDark ? "bg-customer-hero-orb-dark" : "bg-customer-hero-orb"}`} />

      <Text className="tracking-wider text-customer-hero-text-muted" style={[typography.label, { fontWeight: "600", fontSize: 12 }]}>
        {amountLabel.toUpperCase()}
      </Text>

      <Text className="mt-1 text-customer-hero-text" style={[typography.heroAmount, { letterSpacing: -0.5 }]}>
        {formatINR(Math.abs(outstandingBalance), { maximumFractionDigits: 2 })}
      </Text>

      <View className="mt-3 flex-row items-center justify-between gap-3">
        <View className="rounded-full border border-customer-hero-chip-border px-3 py-1.5" style={{ backgroundColor: stateChipTone.bg }}>
          <Text style={[typography.caption, { color: stateChipTone.text, fontWeight: "700", letterSpacing: 0.5 }]}>
            {stateLabel.toUpperCase()}
          </Text>
        </View>
        <Text className="text-caption text-customer-hero-text-muted flex-1" numberOfLines={1} style={{ textAlign: "right" }}>
          {heroMetaText}
        </Text>
      </View>

      {pendingOrderBalance > 0 ? (
        <View className="mt-3 rounded-lg border border-customer-hero-chip-border bg-customer-hero-chip-bg px-3 py-2">
          <Text className="text-caption text-customer-hero-text-muted" style={{ fontWeight: "600" }}>
            Open entry due: {formatINR(pendingOrderBalance, { maximumFractionDigits: 2 })}
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}
