import { colors } from "@/src/utils/theme";
import { memo } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type Status = "Paid" | "Pending" | "Overdue" | "Partially Paid" | "Advance";

type Props = {
  status: Status;
  align?: "left" | "right";
  size?: "sm" | "md";
  showDot?: boolean;
};

const statusMap: Record<Status, { bg: string; text: string; label: string }> = {
  Paid: { bg: colors.paid.bg, text: colors.paid.text, label: "PAID" },
  Pending: { bg: colors.pending.bg, text: colors.pending.text, label: "PENDING" },
  Overdue: { bg: colors.overdue.bg, text: colors.overdue.text, label: "OVERDUE" },
  "Partially Paid": { bg: colors.partial.bg, text: colors.partial.text, label: "PARTIAL" },
  Advance: { bg: colors.successLight, text: colors.success, label: "ADVANCE" },
};

export default memo(function StatusBadge({ status, align = "right", size = "md", showDot = false }: Props) {
  const selected = statusMap[status] ?? statusMap.Pending;

  const isSm = size === "sm";

  const badgeStyle: ViewStyle = {
    backgroundColor: selected.bg,
    paddingVertical: isSm ? 2 : 4,
    paddingHorizontal: isSm ? 6 : 10,
  };

  const textStyle = {
    fontSize: isSm ? 11 : 12,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
  };

  return (
    <View style={[styles.badge, badgeStyle, align === "left" ? styles.left : styles.right]}>
      {showDot && <View style={[styles.dot, { backgroundColor: selected.text }]} />}
      <Text style={[styles.label, textStyle, { color: selected.text }]}>{selected.label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  left: {
    alignSelf: "flex-start",
  },
  right: {
    alignSelf: "flex-end",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
  },
});