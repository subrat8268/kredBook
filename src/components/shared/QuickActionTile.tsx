import { useTheme } from "@/src/utils/ThemeProvider";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type QuickActionTileProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function QuickActionTile({
  label,
  icon,
  onPress,
  disabled = false,
  loading = false,
  accent = false,
  style,
}: QuickActionTileProps) {
  const { colors } = useTheme();
  const labelColor = accent ? colors.textPrimary : colors.textSecondary;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      className={`flex-1 items-center rounded-2xl px-2 py-3 mb-2 ${
        disabled || loading ? "opacity-50" : ""
      }`}
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "rgba(17,24,39,1)",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        },
        style,
      ]}
      hitSlop={4}
      android_ripple={{
        color: colors.primaryLight || colors.primary + "20",
        borderless: false,
      }}
      unstable_pressDelay={0}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: colors.surfaceAlt,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          icon
        )}
      </View>
      <Text
        className="mt-2 text-caption"
        numberOfLines={1}
        style={{ color: labelColor, fontSize: 12, fontWeight: "600" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
