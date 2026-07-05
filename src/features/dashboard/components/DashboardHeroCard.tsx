import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Minus,
} from "lucide-react-native";
import React, { useMemo, useCallback } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { useTheme } from "@/src/theme/useTheme";
import { useFocusEffect } from "expo-router";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { ColorTokens, GradientTokens } from "@/src/utils/theme";

type Props = {
  colors: ColorTokens;
  gradients: GradientTokens;
  weekDelta: number;
  displayOutstanding: number;
  totalOutstanding: number;
  overdueTotalCount: number;
  businessName: string;
  isCollecting: boolean;
  onRecordPayment: () => void;
};

export default function DashboardHeroCard({
  colors,
  gradients,
  weekDelta,
  displayOutstanding,
  totalOutstanding,
  overdueTotalCount,
  businessName,
  isCollecting,
  onRecordPayment,
}: Props) {
  const t = useTheme();

  // Fix M2: memoized dashboardState
  const dashboardState = useMemo(() => {
    if (totalOutstanding > 0 && overdueTotalCount > 0) return "overdue";
    if (totalOutstanding < 0) return "advance";
    if (totalOutstanding === 0 && overdueTotalCount === 0) return "settled";
    return "pending";
  }, [totalOutstanding, overdueTotalCount]);

  const gradient =
    gradients.customerDetailHero[dashboardState] ||
    gradients.customerDetailHero.pending;

  const isSendReminderDisabled =
    dashboardState === "settled" || dashboardState === "advance";

  const heroLabel = useMemo(() => {
    if (dashboardState === "settled") return "ALL SETTLED";
    if (dashboardState === "advance") return "ADVANCE";
    return "COLLECT OUTSTANDING";
  }, [dashboardState]);

  const pillLabel = useMemo(() => {
    if (dashboardState === "overdue") return "Overdue";
    if (dashboardState === "pending") return "Pending";
    if (dashboardState === "settled") return "Settled";
    return "Advance";
  }, [dashboardState]);

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

  const badgeIcon = useMemo(() => {
    if (dashboardState === "settled" || dashboardState === "advance") {
      return <CheckCircle2 size={12} color="white" className="mr-1" />;
    }
    if (dashboardState === "overdue") {
      return <Clock3 size={12} color="white" className="mr-1" />;
    }
    // Indicator dot: backgroundColor is a runtime token → style prop only
    return (
      <View
        style={{
          backgroundColor:
            colors.dashboard.heroIndicatorDot ?? "rgba(255,255,255,0.9)",
        }}
        className="w-1.5 h-1.5 rounded-full mr-1"
      />
    );
  }, [dashboardState, colors]);

  const handleRecordPayment = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onRecordPayment();
  }, [onRecordPayment]);

  const handleSendReminder = useCallback(async () => {
    const message = `Hi, you have an outstanding amount of ${formatINR(totalOutstanding)} with ${businessName}. Please make the payment at your earliest. Thank you!`;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share({ message });
    } catch {
      // Share cancellation is not an error
    }
  }, [totalOutstanding, businessName]);

  return (
    <LinearGradient
      colors={[gradient.end, gradient.start]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-5 py-5 overflow-hidden mt-section-md rounded-2xl"
    >
      {/* Row 1 — label + pill */}
      <View className="flex-row items-center justify-between">
        <Text className="tracking-widest uppercase text-caption text-dashboard-hero-text-muted">
          {heroLabel}
        </Text>
        <View className="flex-row gap-1 items-center px-3 py-1 border rounded-full border-dashboard-hero-chip-border bg-dashboard-hero-chip-bg">
          <Animated.View style={pillStyle} className="flex-row items-center">
            {badgeIcon}
          </Animated.View>
          <Text className="text-[11px] font-inter-semibold text-dashboard-hero-text">
            {pillLabel}
          </Text>
        </View>
      </View>

      {/*
        Row 2 — outstanding amount.
        Fix C2: colour uses colors.dashboard.heroText token, not hardcoded "#ffffff".
        fontFamily must stay in style (no Tailwind equivalent for custom font family).
        fontSize/lineHeight could use className but Inter ExtraBold 36/44 has no preset
        NativeWind class — keep in style for precision.
      */}
      <Text
        style={{
          fontFamily: t.fontFamily.displayExtraBold,
          fontSize: 36,
          lineHeight: 44,
          color: colors.dashboard.heroText,
        }}
        className="mt-2"
      >
        {formatINR(displayOutstanding)}
      </Text>

      {/* Row 3 — week delta */}
      <View className="flex-row items-center mt-2">
        {weekDelta === 0 ? (
          <View className="flex-row items-center">
            {/* color is a runtime token → style prop only */}
            <Minus
              size={14}
                color={colors.dashboard.arrowDown}
              strokeWidth={2.4}
            />
            <Text className="ml-1 text-caption text-dashboard-hero-text-muted">
              No change vs last week
            </Text>
          </View>
        ) : (
          <>
            {weekDelta > 0 ? (
              <ArrowUpRight
                size={16}
                color={colors.dashboard.arrowUp}
                strokeWidth={2.4}
              />
            ) : (
              <ArrowDownRight
                size={16}
              color={colors.dashboard.arrowDown}
                strokeWidth={2.4}
              />
            )}
            <Text className="ml-1 text-caption text-dashboard-hero-text-muted">
              {weekDelta > 0 ? "Up" : "Down"} {formatINR(Math.abs(weekDelta))}{" "}
              vs last week
            </Text>
          </>
        )}
      </View>

      {/* Row 4 — action buttons */}
      {/*
        gap-[10px] replaces style={{ gap: 10 }}.
        Button opacity is dynamic → stays in style. Shadow tokens → style.
      */}
      <View className="flex-row items-center mt-4 gap-[10px]">
        <Pressable
          onPress={handleRecordPayment}
          disabled={isCollecting}
          className="flex-1 px-3 py-3 rounded-full bg-surface"
          style={{
            opacity: isCollecting ? 0.65 : 1,
            // shadowColor is a runtime token
            shadowColor: colors.ink,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          accessibilityRole="button"
          accessibilityLabel="Record payment"
          accessibilityHint="Opens customer picker to record a payment"
          accessibilityState={{ disabled: isCollecting }}
        >
          <Text className="text-center font-inter-semibold text-success-dark">
            Record Payment
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSendReminder}
          disabled={isSendReminderDisabled}
          className="flex-1 px-3 py-3 border rounded-full border-dashboard-hero-chip-border bg-dashboard-hero-chip-bg"
          style={{ opacity: isSendReminderDisabled ? 0.45 : 1 }}
          accessibilityRole="button"
          accessibilityLabel="Send reminder"
          accessibilityHint="Shares a payment reminder via the system share sheet"
          accessibilityState={{ disabled: isSendReminderDisabled }}
        >
          <Text className="text-center font-inter-semibold text-dashboard-hero-text">
            Send Reminder
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
