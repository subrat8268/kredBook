import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useTheme } from "@/src/theme/useTheme";
import { gradients, darkGradients } from "@/src/utils/theme";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { formatINR } from "@/src/utils/format";
import { AlertCircle, CheckCircle2 } from "lucide-react-native";

interface CustomerBalanceHeroProps {
  netBalance: number;
  balanceState: "overdue" | "pending" | "partial" | "settled" | "advance";
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

  // Scale shared value for the breathing blob animation
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000 }),
        withTiming(1.0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const heroGrad = activeGradients.customerDetailHero[balanceState] || activeGradients.customerDetailHero.settled;

  // Display Amount (Absolute value for display in case of advance)
  const displayAmount = formatINR(Math.abs(netBalance));

  // Determine top status label
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

  // Determine status badge text
  const getBadgeText = () => {
    switch (balanceState) {
      case "overdue":
        return "Overdue";
      case "pending":
        return "Pending";
      case "partial":
        return "Partial";
      case "advance":
        return "Advance";
      case "settled":
      default:
        return "Settled";
    }
  };

  // Format the nearest due date to a human readable format
  const formatNearestDueDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={[heroGrad.start, heroGrad.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.container, { borderRadius: t.radius["2xl"] }]}
      >
        {/* Animated Watermark Orb */}
        <Animated.View
          style={[
            styles.orb,
            animatedStyle,
            { backgroundColor: heroGrad.blobA || "rgba(255,255,255,0.12)" },
          ]}
        />

        {/* Section 1: Label */}
        <Text style={[styles.label, { fontFamily: t.fontFamily.bodySemiBold }]}>
          {getTopLabel()}
        </Text>

        {/* Section 2: Amount */}
        <Text style={[styles.amount, { fontFamily: t.fontFamily.displayExtraBold }]}>
          {displayAmount}
        </Text>

        {/* Separator Line */}
        <View style={styles.separator} />

        {/* Section 3: Status Pill & Aging Info */}
        <View style={styles.row}>
          <View style={[styles.badge, { borderRadius: t.radius.full }]}>
            {balanceState === "overdue" && (
              <AlertCircle size={14} color="#ffffff" style={styles.badgeIcon} />
            )}
            {balanceState === "settled" && (
              <CheckCircle2 size={14} color="#ffffff" style={styles.badgeIcon} />
            )}
            <Text style={[styles.badgeText, { fontFamily: t.fontFamily.bodyBold }]}>
              {getBadgeText()}
            </Text>
          </View>

          {/* Aging Info */}
          {balanceState === "overdue" && oldestOverdueDays !== null && (
            <Text style={[styles.agingText, { fontFamily: t.fontFamily.body }]}>
              Overdue · {oldestOverdueDays} days
            </Text>
          )}
          {balanceState === "pending" && nearestDueDate !== null && (
            <Text style={[styles.agingText, { fontFamily: t.fontFamily.body }]}>
              Due {formatNearestDueDate(nearestDueDate)}
            </Text>
          )}
        </View>

        {/* Section 4: Open Entries Summary */}
        {balanceState !== "settled" && balanceState !== "advance" && openEntriesCount > 0 && (
          <Text style={[styles.summaryText, { fontFamily: t.fontFamily.body }]}>
            {openEntriesCount} open {openEntriesCount === 1 ? "entry" : "entries"} · {formatINR(netBalance)} due
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  container: {
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  orb: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -10,
    right: -58,
  },
  label: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  amount: {
    fontSize: 36,
    color: "#ffffff",
    marginTop: 4,
    lineHeight: 42,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.20)",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    color: "#ffffff",
  },
  agingText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  summaryText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 12,
  },
});
