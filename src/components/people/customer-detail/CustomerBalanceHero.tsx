import { useTheme } from "@/src/theme/useTheme";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { formatINR } from "@/src/utils/format";
import { gradients, darkGradients } from "@/src/utils/theme";
import { CheckCircle2, Clock3 } from "lucide-react-native";
import React, { useCallback } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import GradientHeroCard from "../../layer2/GradientHeroCard";

interface CustomerBalanceHeroProps {
  netBalance: number;
  balanceState:
    | "overdue"
    | "pending"
    | "partial"
    | "settled"
    | "advance"
    | null;
  oldestOverdueDays: number | null;
  nearestDueDate: Date | null;
  openEntriesCount: number;
}

export default function CustomerBalanceHero({
  netBalance,
  balanceState,
  oldestOverdueDays,
  nearestDueDate,
  openEntriesCount,
}: CustomerBalanceHeroProps) {
  const t = useTheme();
  const colorMode = usePreferencesStore((s) => s.colorMode);
  const activeGradients = colorMode === "dark" ? darkGradients : gradients;

  const pulse = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      pulse.value = withRepeat(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
      return () => {
        cancelAnimation(pulse);
        pulse.value = 1;
      };
    }, [pulse]),
  );

  const pillStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  if (balanceState === null) {
    return (
      <GradientHeroCard gradientColors={[t.colors.muted, t.colors.faint]}>
        <Text className="font-semibold text-[12px] uppercase tracking-[1.4] text-white/90">
          NO ENTRIES YET
        </Text>
        <Text className="text-[14px] leading-5 text-white/90 mt-2" style={{ fontFamily: t.fontFamily.body }}>
          Add the first entry or payment to start tracking this customer&apos;s balance.
        </Text>
      </GradientHeroCard>
    );
  }

  const gradKey = (balanceState === "partial" ? "pending" : (balanceState || "settled")) as keyof typeof activeGradients.customerDetailHero;
  const heroGrad =
    activeGradients.customerDetailHero[gradKey] ||
    activeGradients.customerDetailHero.settled;

  const displayAmount = formatINR(Math.abs(netBalance));

  const getTopLabel = () => {
    switch (balanceState) {
      case "overdue":
      case "pending":
      case "partial":
        return "BALANCE DUE";
      case "advance":
        return "ADVANCE";
      case "settled":
      default:
        return "ALL SETTLED";
    }
  };

  const getBadgeText = () => {
    switch (balanceState) {
      case "overdue": return "Overdue";
      case "pending": return "Pending";
      case "partial": return "Partial";
      case "advance": return "Advance";
      case "settled":
      default: return "Settled";
    }
  };

  const formatNearestDueDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const shadow = { shadowColor: heroGrad.end };

  let badgeIcon = null;
  if (balanceState === "settled" || balanceState === "advance") {
    badgeIcon = <CheckCircle2 size={13} color="#ffffff" strokeWidth={2.5} />;
  } else if (balanceState === "overdue") {
    badgeIcon = <Clock3 size={13} color="#ffffff" strokeWidth={2.5} />;
  } else {
    badgeIcon = (
      <View style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
        className="w-2 h-2 rounded-full" />
    );
  }

  return (
    <GradientHeroCard gradientColors={[heroGrad.start, heroGrad.end]} shadow={shadow}>
      <Text className="font-semibold text-[12px] uppercase tracking-[1.4] text-white/90">
        {getTopLabel()}
      </Text>

      <Text className="text-[40px] leading-10 pb-4 text-white" style={{ fontFamily: t.fontFamily.displayExtraBold }}>
        {displayAmount}
      </Text>

      <View className="flex-row items-center justify-between pt-4 border-t border-white/20">
        <View className="flex-row items-center gap-[6px] rounded-full px-3 py-1" style={{ backgroundColor: "rgba(255,255,255,0.20)" }}>
          <Animated.View style={pillStyle} className="flex-row items-center">
            {badgeIcon}
          </Animated.View>
          <Text className="font-semibold text-[12px] text-white">
            {getBadgeText()}
          </Text>
        </View>

        {balanceState === "overdue" && oldestOverdueDays !== null && (
          <Text style={{ lineHeight: 20, color: "#ffffff", opacity: 0.9 }} className="font-medium text-[14px]">
            {oldestOverdueDays} day{oldestOverdueDays === 1 ? "" : "s"} overdue
          </Text>
        )}
        {balanceState === "pending" && nearestDueDate !== null && (
          <Text style={{ lineHeight: 20, color: "#ffffff", opacity: 0.9 }} className="font-medium text-[14px]">
            Due {formatNearestDueDate(nearestDueDate)}
          </Text>
        )}
      </View>

      {balanceState !== "settled" && balanceState !== "advance" && openEntriesCount > 0 && (
        <Text style={{ lineHeight: 20, color: "#ffffff", opacity: 0.9, marginTop: 8 }} className="font-medium text-[14px]">
          {openEntriesCount} {openEntriesCount === 1 ? "open entry" : "open entries"} · {formatINR(netBalance)} due
        </Text>
      )}
    </GradientHeroCard>
  );
}
