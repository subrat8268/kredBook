import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen } from "lucide-react-native";
import { Text, View } from "react-native";

type Props = {
  outstandingBalance: number;
  isOverdue: boolean;
  pendingOrderBalance: number;
  heroMetaText: string;
};

export default function CustomerBalanceHero({
  outstandingBalance,
  isOverdue,
  pendingOrderBalance,
  heroMetaText,
}: Props) {
  const { colors, gradients, typography } = useTheme();

  const amountLabel =
    outstandingBalance > 0
      ? "Balance due"
      : outstandingBalance < 0
        ? "Advance"
        : "All settled";

  const statusLabel =
    outstandingBalance > 0
      ? isOverdue
        ? "OVERDUE"
        : "PENDING"
      : outstandingBalance < 0
        ? "ADVANCE"
        : "SETTLED";

  const chipTone =
    outstandingBalance > 0
      ? { bg: colors.customerDetail.heroChipBg, text: colors.customerDetail.heroText }
      : outstandingBalance < 0
        ? { bg: colors.customerDetail.heroChipBg, text: colors.customerDetail.heroText }
        : { bg: colors.customerDetail.heroChipBg, text: colors.customerDetail.heroText };

  const heroTone =
    outstandingBalance > 0
      ? isOverdue
        ? gradients.customerDetailHero.overdue
        : gradients.customerDetailHero.pending
      : outstandingBalance < 0
        ? gradients.customerDetailHero.advance
        : gradients.customerDetailHero.settled;

  return (
    <LinearGradient
      colors={[heroTone.start, heroTone.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mx-4 mt-4 overflow-hidden rounded-xl px-5 py-5"
      style={{
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
        <View
          className="absolute -right-8 -top-10 h-28 w-28 rounded-full"
          style={{ backgroundColor: heroTone.blobA }}
        />
        <View
          className="absolute -left-10 top-10 h-24 w-24 rounded-full"
          style={{ backgroundColor: heroTone.blobB }}
        />
        <View
          className="absolute bottom-0 left-1/3 h-16 w-16 rounded-full"
          style={{ backgroundColor: heroTone.blobB, opacity: 0.9 }}
        />
      </View>

      <Text
        style={[
          typography.caption,
          {
            color: colors.customerDetail.heroTextMuted,
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 1.4,
            marginBottom: 2,
          },
        ]}
      >
        {amountLabel.toUpperCase()}
      </Text>

      <Text
        style={[
          typography.heroAmount,
          {
            color: colors.customerDetail.heroText,
            fontWeight: "800",
            letterSpacing: -0.5,
            marginTop: 2,
            fontSize: 36,
          },
        ]}
      >
        {formatINR(Math.abs(outstandingBalance), { maximumFractionDigits: 2 })}
      </Text>

      <View className="mt-3 flex-row items-center">
        {statusLabel ? (
          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: chipTone.bg }}>
            <Text
              style={[
                typography.caption,
                {
                  color: chipTone.text,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                },
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        ) : null}

        <Text
          className="flex-1 text-caption"
          style={{
            marginLeft: statusLabel ? 8 : 0,
            color: colors.customerDetail.heroTextMuted,
            fontSize: 12,
            fontWeight: "500",
          }}
          numberOfLines={1}
        >
          {heroMetaText}
        </Text>
      </View>

      <BookOpen
        size={52}
        color={colors.customerDetail.heroText}
        strokeWidth={1.7}
        pointerEvents="none"
        style={{ position: "absolute", right: 14, bottom: 12, opacity: 0.07 }}
      />

      {pendingOrderBalance > 0 ? (
        <Text
          className="mt-1 text-caption"
          style={{
            fontWeight: "500",
            color: colors.customerDetail.heroTextMuted,
            fontSize: 11,
          }}
          numberOfLines={1}
        >
          1 open entry · {formatINR(pendingOrderBalance, { maximumFractionDigits: 2 })} due
        </Text>
      ) : null}
    </LinearGradient>
  );
}
