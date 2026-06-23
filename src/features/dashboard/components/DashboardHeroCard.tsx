import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
} from "lucide-react-native";
import { Pressable, Share, Text, View } from "react-native";
import { useTheme } from "@/src/theme/useTheme";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  colors: any;
  gradients: any;
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

  const dashboardState = (() => {
    if (totalOutstanding > 0 && overdueTotalCount > 0) return "overdue";
    if (totalOutstanding < 0) return "advance";
    if (totalOutstanding === 0 && overdueTotalCount === 0) return "settled";
    return "pending";
  })();

  const gradient =
    gradients.customerDetailHero[dashboardState] ||
    gradients.customerDetailHero.pending;
  const isSendReminderDisabled =
    dashboardState === "settled" || dashboardState === "advance";

  const getHeroLabel = () => {
    if (dashboardState === "settled") return "ALL SETTLED";
    if (dashboardState === "advance") return "ADVANCE";
    return "COLLECT OUTSTANDING";
  };

  const getPillLabel = () => {
    if (dashboardState === "overdue") return "Overdue";
    if (dashboardState === "pending") return "Pending";
    if (dashboardState === "settled") return "Settled";
    return "Advance";
  };

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

  let badgeIcon = null;
  if (dashboardState === "settled" || dashboardState === "advance") {
    badgeIcon = (
      <CheckCircle2 size={12} color="white" style={{ marginRight: 4 }} />
    );
  } else if (dashboardState === "overdue") {
    badgeIcon = <Clock3 size={12} color="white" style={{ marginRight: 4 }} />;
  } else {
    badgeIcon = (
      <View
        style={{ backgroundColor: "rgba(255,255,255,0.9)", marginRight: 4 }}
        className="w-1.5 h-1.5 rounded-full"
      />
    );
  }

  return (
    <LinearGradient
      colors={[gradient.end, gradient.start]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-5 py-5 overflow-hidden mt-section-md rounded-2xl"
    >
      <View className="flex-row items-center justify-between">
        <Text className="tracking-widest uppercase text-caption text-dashboard-hero-text-muted">
          {getHeroLabel()}
        </Text>
        <View className="px-3 py-1 border rounded-full border-dashboard-hero-chip-border bg-dashboard-hero-chip-bg flex-row items-center">
          <Animated.View style={pillStyle} className="flex-row items-center">
            {badgeIcon}
          </Animated.View>
          <Text className="text-[11px] font-inter-semibold text-dashboard-hero-text">
            {getPillLabel()}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontFamily: t.fontFamily.displayExtraBold,
          fontSize: 36,
          lineHeight: 44,
          color: "#ffffff",
        }}
        className="mt-2"
      >
        {formatINR(displayOutstanding)}
      </Text>

      <View className="flex-row items-center mt-2">
        {weekDelta === 0 ? (
          <Text className="text-caption text-dashboard-hero-text-muted">
            Same as last week
          </Text>
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

      <View className="flex-row items-center mt-4" style={{ gap: 10 }}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
              () => {},
            );
            onRecordPayment();
          }}
          disabled={isCollecting}
          className="flex-1 px-3 py-3 rounded-full bg-surface"
          style={{
            opacity: isCollecting ? 0.65 : 1,
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
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {},
            );
            await Share.share({
              message: `Hi, you have an outstanding amount of ${formatINR(totalOutstanding)} with ${businessName}. Please make the payment at your earliest. Thank you!`,
            });
          }}
          disabled={isSendReminderDisabled}
          className="flex-1 px-3 py-3 border rounded-full border-dashboard-hero-chip-border bg-dashboard-hero-chip-bg"
          style={{
            opacity: isSendReminderDisabled ? 0.45 : 1,
          }}
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
