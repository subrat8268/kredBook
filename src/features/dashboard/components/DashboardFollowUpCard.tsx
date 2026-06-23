import Avatar from "@/src/components/ui/Avatar";
import * as Haptics from "expo-haptics";
import { formatINR } from "@/src/utils/format";
import { Pressable, Text, View } from "react-native";
import type { DashboardPerson } from "../types";
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
  person: DashboardPerson;
  onCollect: (customerId: string, customerName: string) => Promise<void>;
  onPressCard: (customerId: string) => void;
  colors: any;
};

export default function DashboardFollowUpCard({
  person,
  onCollect,
  onPressCard,
  colors,
}: Props) {
  const daysSince = person.daysSince ?? 0;
  const isUrgent = daysSince > 30;

  const chipStyles = (() => {
    if (daysSince < 7) {
      return {
        bg: colors.warningBg,
        text: colors.warning,
      };
    } else if (daysSince <= 30) {
      return {
        bg: colors.orange.bg,
        text: colors.orange.text,
      };
    } else {
      return {
        bg: colors.overdue.bg,
        text: colors.overdue.text,
      };
    }
  })();

  const pulse = useSharedValue(1);
  useFocusEffect(
    useCallback(() => {
      if (isUrgent) {
        pulse.value = withRepeat(
          withTiming(0.6, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
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

  const chipAnimStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPressCard(person.id);
      }}
      accessibilityRole="button"
      accessibilityLabel={`View account for ${person.name}. Balance: ${formatINR(person.balance)}. ${person.daysSince} days overdue.`}
      accessibilityHint="Opens customer details"
      className="rounded-2xl bg-surface p-4 dark:border dark:border-border-soft-dark dark:bg-surface-dark"
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        width: 200,
      })}
    >
      <View className="flex-row items-center justify-between">
        <Avatar name={person.name} size="sm" />
        <Animated.View
          style={[chipAnimStyle, { backgroundColor: chipStyles.bg }]}
          className="rounded-full px-2.5 py-1"
        >
          <Text
            style={{ color: chipStyles.text }}
            className="text-[11px] font-inter-semibold"
          >
            {person.daysSince}d overdue
          </Text>
        </Animated.View>
      </View>
      <Text
        className="mt-3 text-body font-inter-semibold text-ink dark:text-ink-dark"
        numberOfLines={1}
      >
        {person.name}
      </Text>
      <Text className="mt-1 text-card-title text-overdue-text dark:text-danger">
        {formatINR(person.balance)}
      </Text>
      <Pressable
        className="mt-4 rounded-full bg-success px-4 py-2.5"
        onPress={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {},
          );
          try {
            await onCollect(person.id, person.name);
          } catch {
            // Error is handled by parent/toast
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={`Collect ${formatINR(person.balance)} from ${person.name}`}
        accessibilityHint="Opens the payment form for this customer"
        importantForAccessibility="yes"
      >
        <Text className="text-center text-caption font-inter-semibold text-surface">
          Collect
        </Text>
      </Pressable>
    </Pressable>
  );
}
