import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { AlertCircle } from "lucide-react-native";
import { Image, Text, View } from "react-native";

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
          <View
            className="flex-row items-center rounded-full"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.22)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
            }}
          >
            {statusLabel === "OVERDUE" ? (
              <AlertCircle
                size={11}
                color="rgba(255,255,255,1.0)"
                strokeWidth={2.2}
                style={{ marginRight: 4 }}
              />
            ) : null}
            <Text
              style={[
                typography.caption,
                {
                  color: "rgba(255,255,255,1.0)",
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.8,
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

      <Image
        source={require("../../../../assets/images/bg-wallet.png")}
        resizeMode="contain"
        style={{
          position: "absolute",
          right: 0,
          bottom: -50,
          width: 100,
          height: 200,
          opacity: 0.9,
        }}
      />

      {pendingOrderBalance > 0 ? (
        <Text
          className="mt-1 text-caption"
          style={{
            fontWeight: "500",
            color: "rgba(255,255,255,0.45)",
            fontSize: 11,
            marginTop: 5,
          }}
          numberOfLines={1}
        >
          1 open entry ·{" "}
          {formatINR(pendingOrderBalance, { maximumFractionDigits: 2 })} due
        </Text>
      ) : null}
    </LinearGradient>
  );
}
