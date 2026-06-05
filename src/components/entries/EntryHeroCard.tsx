import { formatINR } from "@/src/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { CheckCircle2, Clock3 } from "lucide-react-native";

const GRADIENTS: Record<string, [string, string]> = {
  pending: ["#f59e0b", "#ea580c"],
  partial: ["#3b82f6", "#2563eb"],
  paid: ["#16a34a", "#15803d"],
  overdue: ["#ef4444", "#dc2626"],
};

const SHADOWS: Record<string, { shadowColor: string }> = {
  pending: { shadowColor: "#ea580c" },
  partial: { shadowColor: "#2563eb" },
  paid: { shadowColor: "#15803d" },
  overdue: { shadowColor: "#dc2626" },
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
  statusKey: "pending" | "partial" | "paid" | "overdue";
  dueDate?: string | null;
};

export default function EntryHeroCard({ amount, statusKey, dueDate }: Props) {
  const gradientColors = GRADIENTS[statusKey] || GRADIENTS.pending;
  const shadow = SHADOWS[statusKey] || SHADOWS.pending;
  const dueLabel = getDueDateLabel(dueDate);
  const formattedAmount = formatINR(amount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencySymbol: "₹",
  });

  const pulse = useSharedValue(1);
  useFocusEffect(
    useCallback(() => {
      pulse.value = withRepeat(
        withTiming(0.3, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
      return () => {
        pulse.value = 1;
      };
    }, [pulse]),
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

  const displayStatus = useMemo(() => {
    if (statusKey === "partial") return "Partial";
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  }, [statusKey]);

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
      className="mx-4 overflow-hidden px-6 py-6 mb-4"
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
        <Text
          style={{ letterSpacing: 1.4 }}
          className="font-semibold text-[12px] text-white/90 uppercase"
        >
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
            <Animated.View style={pillStyle} className="flex-row items-center">
              {statusKey === "paid" ? (
                <CheckCircle2 size={13} color="#ffffff" strokeWidth={2.5} />
              ) : statusKey === "overdue" ? (
                <Clock3 size={13} color="#ffffff" strokeWidth={2.5} />
              ) : (
                <View className="w-2 h-2 rounded-full bg-white" />
              )}
            </Animated.View>
            <Text
              style={{ letterSpacing: 0.6, lineHeight: 16 }}
              className="font-semibold text-[12px] text-white"
            >
              {displayStatus}
            </Text>
          </View>

          {statusKey !== "paid" && dueLabel && (
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
