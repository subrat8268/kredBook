import { useTheme } from "@/src/utils/ThemeProvider";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type ReactNode,
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
  const iconBg = accent ? colors.primary + "18" : colors.textSecondary + "12";
  const labelColor = accent ? colors.textPrimary : colors.textSecondary;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      className={`flex-1 items-center rounded-xl border px-2 py-4 mb-2 ${
        disabled || loading ? "opacity-50" : ""
      }`}
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border + "60",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 1,
          elevation: 1,
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
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: iconBg,
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
        style={{ color: labelColor, fontSize: 12, fontWeight: "500" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
