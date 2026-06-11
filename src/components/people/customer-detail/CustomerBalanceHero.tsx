import { useTheme } from "@/src/theme/useTheme";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { formatINR } from "@/src/utils/format";
import { gradients, darkGradients } from "@/src/utils/theme";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
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

  // Render neutral state when balanceState is null
  if (balanceState === null) {
    return (
      <GradientHeroCard gradientColors={[t.colors.muted, t.colors.faint]}>
        <Text style={[styles.label, { fontFamily: t.fontFamily.bodySemiBold }]}>
          NO ENTRIES YET
        </Text>
        <Text
          style={{
            fontFamily: t.fontFamily.body,
            color: "#ffffff",
            marginTop: 8,
            fontSize: 14,
            lineHeight: 20,
            opacity: 0.9,
          }}
        >
          Add the first entry or payment to start tracking this customer&apos;s
          balance.
        </Text>
      </GradientHeroCard>
    );
  }

  const gradKey = (balanceState === "partial" ? "pending" : (balanceState || "settled")) as keyof typeof activeGradients.customerDetailHero;
  const heroGrad =
    activeGradients.customerDetailHero[gradKey] ||
    activeGradients.customerDetailHero.settled;

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
    <GradientHeroCard gradientColors={[heroGrad.start, heroGrad.end]}>
      {/* Section 1: Label */}
      <Text style={[styles.label, { fontFamily: t.fontFamily.bodySemiBold }]}>
        {getTopLabel()}
      </Text>

      {/* Section 2: Amount */}
      <Text
        style={[styles.amount, { fontFamily: t.fontFamily.displayExtraBold }]}
      >
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
          {balanceState === "advance" && (
            <CheckCircle2 size={14} color="#ffffff" style={styles.badgeIcon} />
          )}
          {(balanceState === "pending" || balanceState === "partial") && (
            <Clock3 size={14} color="#ffffff" style={styles.badgeIcon} />
          )}
          <Text
            style={[styles.badgeText, { fontFamily: t.fontFamily.bodyBold }]}
          >
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
      {balanceState !== "settled" &&
        balanceState !== "advance" &&
        openEntriesCount > 0 && (
          <Text style={[styles.summaryText, { fontFamily: t.fontFamily.body }]}>
            {openEntriesCount}{" "}
            {openEntriesCount === 1 ? "open entry" : "open entries"} ·{" "}
            {formatINR(netBalance)} due
          </Text>
        )}
    </GradientHeroCard>
  );
}

const styles = StyleSheet.create({
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
    marginVertical: 8,
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
    marginTop: 8,
  },
});
