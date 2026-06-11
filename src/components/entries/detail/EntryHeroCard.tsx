import { formatINR } from "@/src/utils/format";
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
import { useTheme } from "@/src/theme/useTheme";
import GradientHeroCard from "../../layer2/GradientHeroCard";

function getDueDateLabel(dueDate?: string | null): string | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((today.getTime() - due.getTime()) / 86400000);
  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  const formatted = due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `Due ${formatted}`;
}

type Props = {
  amount: number;
  statusKey: "pending" | "partial" | "paid" | "overdue";
  dueDate?: string | null;
};

export default function EntryHeroCard({ amount, statusKey, dueDate }: Props) {
  const t = useTheme();

  const GRADIENTS: Record<string, [string, string]> = {
    pending: [t.colors.pending, t.colors.pendingText],
    partial: [t.colors.partial, t.colors.partialText],
    paid: [t.colors.paid, t.colors.primaryActive],
    overdue: [t.colors.overdue, t.colors.overdueText],
  };

  const SHADOWS: Record<string, { shadowColor: string }> = {
    pending: { shadowColor: t.colors.pendingText },
    partial: { shadowColor: t.colors.partialText },
    paid: { shadowColor: t.colors.primaryActive },
    overdue: { shadowColor: t.colors.overdueText },
  };

  const gradientColors = GRADIENTS[statusKey] || GRADIENTS.pending;
  const shadow = SHADOWS[statusKey] || SHADOWS.pending;
  const dueLabel = getDueDateLabel(dueDate);
  const formattedAmount = formatINR(amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencySymbol: "₹",
  });

  const pulse = useSharedValue(1);
  useFocusEffect(
    useCallback(() => {
      pulse.value = withRepeat(
        withTiming(0.6, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      return () => {
        cancelAnimation(pulse);
        pulse.value = 1;
      };
    }, [pulse])
  );

  const pillStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const displayStatus = useCallback(() => {
    if (statusKey === "partial") return "Partial";
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  }, [statusKey])();

  return (
    <GradientHeroCard gradientColors={gradientColors} shadow={shadow}>
      {/* Always white — gradient card bg is always colored */}
      <Text
        style={{ letterSpacing: t.letterSpacing.label, color: "#ffffff" }}
        className="font-semibold text-[12px] uppercase"
      >
        BALANCE DUE
      </Text>

      <Text
        style={{
          fontFamily: t.fontFamily.displayExtraBold,
          lineHeight: 40,
          color: "#ffffff",
        }}
        className="text-[40px] pb-4"
      >
        {formattedAmount}
      </Text>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.20)",
        }}
        className="flex-row justify-between items-center pt-4"
      >
        <View
          style={{ backgroundColor: "rgba(255,255,255,0.20)" }}
          className="flex-row items-center gap-[6px] rounded-full px-3 py-1"
        >
          <Animated.View style={pillStyle} className="flex-row items-center">
            {statusKey === "paid" ? (
              <CheckCircle2 size={13} color={"#ffffff"} strokeWidth={2.5} />
            ) : statusKey === "overdue" ? (
              <Clock3 size={13} color={"#ffffff"} strokeWidth={2.5} />
            ) : (
              <View
                style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                className="w-2 h-2 rounded-full"
              />
            )}
          </Animated.View>
          <Text
            style={{ letterSpacing: 0.6, lineHeight: 16, color: "#ffffff" }}
            className="font-semibold text-[12px]"
          >
            {displayStatus}
          </Text>
        </View>

        {statusKey !== "paid" && dueLabel && (
          <Text
            style={{ lineHeight: 20, color: "#ffffff", opacity: 0.9 }}
            className="font-medium text-[14px]"
          >
            {dueLabel}
          </Text>
        )}
      </View>
    </GradientHeroCard>
  );
}
