import Avatar from "@/src/components/ui/Avatar";
import * as Haptics from "expo-haptics";
import { formatINR } from "@/src/utils/format";
import React, { useMemo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import type { DashboardPerson } from "../types";
import { useFocusEffect } from "expo-router";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { ColorTokens } from "@/src/utils/theme";

type Props = {
  person: DashboardPerson;
  onCollect: (customerId: string, customerName: string) => Promise<void>;
  onPressCard: (customerId: string) => void;
  colors: ColorTokens;
};

export default function DashboardFollowUpCard({
  person,
  onCollect,
  onPressCard,
  colors,
}: Props) {
  const daysSince = person.daysSince ?? 0;
  const isUrgent = daysSince > 30;

  // Fix m6: memoized — chip colours are runtime tokens, must stay in style prop
  const chipStyles = useMemo(() => {
    if (daysSince < 7) return { bg: colors.warningBg, text: colors.warning };
    if (daysSince <= 30) return { bg: colors.orange?.bg, text: colors.orange?.text };
    return { bg: colors.overdue?.bg, text: colors.overdue?.text };
  }, [daysSince, colors]);

  const pulse = useSharedValue(1);
  useFocusEffect(
    useCallback(() => {
      if (isUrgent) {
        pulse.value = withRepeat(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        );
      } else {
        pulse.value = 1;
      }
      return () => {
        cancelAnimation(pulse);
        pulse.value = 1;
      };
    }, [isUrgent, pulse]),
  );

  const chipAnimStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const handleCardPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPressCard(person.id);
  }, [person.id, onPressCard]);

  const handleCollect = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await onCollect(person.id, person.name);
    } catch {
      // Error handled by parent toast
    }
  }, [person.id, person.name, onCollect]);

  /**
   * FIX C5 — flat sibling Pressable structure so Collect is always
   * reachable by Android TalkBack (was nested inside card Pressable).
   */
  return (
    // w-[200px] replaces style={{ width: 200 }}
    <View className="w-[200px] rounded-2xl bg-surface dark:border dark:border-border-soft-dark dark:bg-surface-dark overflow-hidden">

      {/* Card tap area — navigates to customer detail */}
      <Pressable
        onPress={handleCardPress}
        accessibilityRole="button"
        accessibilityLabel={`View account for ${person.name}. Balance: ${formatINR(person.balance)}. ${person.daysSince} days overdue.`}
        accessibilityHint="Opens customer details"
        // p-4 covers padding; opacity is dynamic so must stay in style
        className="p-4"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View className="flex-row items-center justify-between">
          <Avatar name={person.name} size="sm" />
          {/*
            backgroundColor is a runtime token → must stay in style.
            All layout/border/padding stays in className.
          */}
          <Animated.View
            style={[chipAnimStyle, { backgroundColor: chipStyles.bg }]}
            className="rounded-full px-2.5 py-1"
          >
            {/* color is a runtime token → style prop only */}
            <Text style={{ color: chipStyles.text }} className="text-[11px] font-inter-semibold">
              {person.daysSince}d overdue
            </Text>
          </Animated.View>
        </View>

        <Text className="mt-3 text-body font-inter-semibold" style={{ color: colors.ink }} numberOfLines={1}>
          {person.name}
        </Text>
        <Text className="mt-1 text-card-title" style={{ color: colors.danger }}>
          {formatINR(person.balance)}
        </Text>
      </Pressable>

      {/* Collect button — sibling NOT child (fixes C5 TalkBack) */}
      <Pressable
        onPress={handleCollect}
        accessibilityRole="button"
        accessibilityLabel={`Collect ${formatINR(person.balance)} from ${person.name}`}
        accessibilityHint="Opens the payment form for this customer"
        className="mx-4 mb-4 rounded-full bg-success px-4 py-2.5"
      >
        <Text className="text-center text-caption font-inter-semibold text-surface">
          Collect
        </Text>
      </Pressable>
    </View>
  );
}
