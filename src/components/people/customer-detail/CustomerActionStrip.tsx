import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ArrowDownLeft, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/useTheme";

interface CustomerActionStripProps {
  balanceState: "overdue" | "pending" | "partial" | "settled" | "advance" | null;
  onCollectPress: () => void;
  onAddEntryPress: () => void;
  collectDisabled?: boolean;
}

export default function CustomerActionStrip({
  balanceState,
  onCollectPress,
  onAddEntryPress,
  collectDisabled = false,
}: CustomerActionStripProps) {
  const t = useTheme();
  const { colors } = t;

  const isMuted = balanceState === "settled" || balanceState === "advance";

  const handleCollectPress = () => {
    if (collectDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onCollectPress();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderDefault,
          borderRadius: t.radius["2xl"],
        },
      ]}
    >
      {/* Collect / Record Payment Button (60% width) */}
      <Pressable
        onPress={handleCollectPress}
        disabled={collectDisabled}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: collectDisabled
              ? colors.borderSubtle
              : pressed
                ? colors.primaryActive
                : colors.primary,
          },
        ]}
      >
        <ArrowDownLeft size={18} color={collectDisabled ? colors.muted : "#ffffff"} style={styles.icon} />
        <Text style={[styles.primaryText, { fontFamily: t.fontFamily.bodySemiBold, color: collectDisabled ? colors.muted : "#ffffff" }]}>
          {isMuted ? "Record Payment" : "Collect Payment"}
        </Text>
      </Pressable>

      {/* Add Entry Button (36% width) */}
      <Pressable
        onPress={onAddEntryPress}
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            borderColor: colors.borderDefault,
            backgroundColor: pressed ? colors.borderSubtle : colors.surface,
          },
        ]}
      >
        <Plus size={18} color={colors.ink} style={styles.icon} />
        <Text style={[styles.secondaryText, { color: colors.ink, fontFamily: t.fontFamily.bodyMedium }]}>
          Add Entry
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  primaryButton: {
    width: "60%",
    height: 52,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 15,
  },
  secondaryButton: {
    width: "36%",
    height: 52,
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontSize: 14,
  },
  icon: {
    marginRight: 6,
  },
});
