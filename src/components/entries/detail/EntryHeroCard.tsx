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
import { CheckCircle2, Clock3 } from "lucide-react-native";
import { useTheme } from "@/src/theme/useTheme";

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

  const displayStatus = useCallback(() => {
    if (statusKey === "partial") return "Partial";
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  }, [statusKey])();

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
      </View>
    </LinearGradient>
  );
}
