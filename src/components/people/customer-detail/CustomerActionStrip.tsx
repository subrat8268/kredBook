import React from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { ArrowDownLeft, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/useTheme";

interface CustomerActionStripProps {
  onCollectPress: () => void;
  onAddEntryPress: () => void;
  collectDisabled?: boolean;
}

export default function CustomerActionStrip({
  onCollectPress,
  onAddEntryPress,
  collectDisabled = false,
}: CustomerActionStripProps) {
  const t = useTheme();
  const { colors } = t;

  const handleCollectPress = () => {
    if (collectDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onCollectPress();
  };

  return (
    <View
      className="flex-row items-center border mx-4 mb-4 px-4 py-3.5 gap-2.5 self-stretch rounded-xl"
      style={{
        borderColor: colors.borderDefault,
        backgroundColor: colors.surface,
      }}
    >
      {/* Collect Payment Button (Proportionate width via flex) */}
      <Pressable
        onPress={handleCollectPress}
        disabled={collectDisabled}
        className="flex-row items-center justify-center rounded-lg flex-1 h-12 px-3 active:opacity-85"
        style={{
          backgroundColor: colors.primary,
          opacity: collectDisabled ? 0.5 : 1,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <ArrowDownLeft
          size={18}
          color={colors.onPrimary}
          style={{ marginRight: 8 }}
        />
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.onPrimary,
            fontFamily: t.fontFamily.bodySemiBold,
          }}
        >
          Collect Payment
        </Text>
      </Pressable>

      {/* Add Entry Button (Fixed width of 128 for consistent padding) */}
      <Pressable
        onPress={onAddEntryPress}
        className="flex-row items-center justify-center border rounded-lg h-12 px-3 active:opacity-85"
        style={{
          width: 128,
          borderColor: colors.borderDefault,
          backgroundColor: colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            },
            android: {
              elevation: 1,
            },
          }),
        }}
      >
        <Plus size={18} color={colors.body} style={{ marginRight: 8 }} />
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.body,
            fontFamily: t.fontFamily.bodySemiBold,
          }}
        >
          Add Entry
        </Text>
      </Pressable>
    </View>
  );
}
