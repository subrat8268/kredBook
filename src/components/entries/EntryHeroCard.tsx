import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const GRADIENTS: Record<string, [string, string]> = {
  Pending: ["#f59e0b", "#ea580c"],
  Partial: ["#3b82f6", "#2563eb"],
  Paid: ["#16a34a", "#15803d"],
  Overdue: ["#ef4444", "#dc2626"],
};

const SHADOWS: Record<string, { shadowColor: string }> = {
  Pending: { shadowColor: "#ea580c" },
  Partial: { shadowColor: "#2563eb" },
  Paid: { shadowColor: "#15803d" },
  Overdue: { shadowColor: "#dc2626" },
};

function getDueDateLabel(dueDate?: string | null): string | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((today.getTime() - due.getTime()) / 86400000);
  if (diffDays > 0) {
    return `Overdue · ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  }
  const formatted = due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `Due: ${formatted}`;
}

type Props = {
  amount: number;
  status: "Pending" | "Partial" | "Paid" | "Overdue";
  dueDate?: string | null;
};

export default function EntryHeroCard({ amount, status, dueDate }: Props) {
  const gradientColors = GRADIENTS[status] || GRADIENTS.Pending;
  const shadow = SHADOWS[status] || SHADOWS.Pending;
  const dueLabel = getDueDateLabel(dueDate);
  const formattedAmount = formatINR(amount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencySymbol: "₹",
  });

  const pulse = useSharedValue(1);
  useFocusEffect(
    useCallback(() => {
      if (status === "Pending") {
        pulse.value = withRepeat(
          withTiming(0.3, {
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
        pulse.value = 1;
      };
    }, [status, pulse]),
  );

  const pillStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const blobScale = useSharedValue(1);
  useFocusEffect(
    useCallback(() => {
      blobScale.value = withRepeat(
        withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
      return () => {
        blobScale.value = 1;
      };
    }, [blobScale]),
  );
  const blobStyle = useAnimatedStyle(() => ({
    transform: [{ scale: blobScale.value }],
  }));

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        {
          borderRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
          elevation: 8,
        },
        shadow,
      ]}
      className="mx-4 overflow-hidden px-6 py-6"
    >
      <Animated.View
        className="absolute -top-10"
        style={[
          blobStyle,
          {
            right: -58,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: "rgba(255,255,255,0.15)",
            pointerEvents: "none",
          },
        ]}
      />

      <View className="flex-col gap-2 w-full">
        <Text className="font-semibold text-[12px] text-white/90 uppercase">
          BALANCE DUE
        </Text>

        <Text
          style={{
            fontFamily: "PlusJakartaSans_800ExtraBold",
            lineHeight: 40,
          }}
          className="text-[40px] text-white pb-4"
        >
          {formattedAmount}
        </Text>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.20)",
          }}
          className="flex-row justify-between border-t border-white/20 items-center pt-4"
        >
          <View className="flex-row items-center gap-[6px] bg-white/20 rounded-full px-3 py-1">
            <Animated.View
              style={pillStyle}
              className="w-2 h-2 rounded-full bg-white"
            />
            <Text
              style={{ letterSpacing: 0.6, lineHeight: 16, width: 48 }}
              className="font-semibold text-[12px] text-white"
            >
              {status}
            </Text>
          </View>

          {status !== "Paid" && dueLabel && (
            <Text
              style={{ lineHeight: 20 }}
              className="font-medium text-[14px] text-white/90"
            >
              {dueLabel}
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}
