import { useTheme } from "@/src/utils/ThemeProvider";
import { ArrowLeft, MoreVertical } from "lucide-react-native";
import { memo, type ReactNode, useState } from "react";
import { Pressable, Text, View } from "react-native";
import OverflowMenu, { type MenuItem } from "./OverflowMenu"; // Import the new component

type HeaderAction = {
  key: string;
  icon: ReactNode;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  leadingSlot?: ReactNode;
  actions?: HeaderAction[];
  overflow?: boolean;
  menuItems?: MenuItem[]; // Add menuItems prop
};

export default memo(function DetailHeader({
  title,
  subtitle,
  onBack,
  leadingSlot,
  actions = [],
  overflow = false,
  menuItems = [], // Initialize menuItems
}: Props) {
  const { colors } = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false); // State for menu visibility

  return (
    <View className="bg-surface border-b border-border px-4 py-3">
      <View className="flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [pressed ? { opacity: 0.75 } : null]}
          className="mr-3"
        >
          <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>

        {leadingSlot ? <View className="ml-0 mr-3">{leadingSlot}</View> : null}

        <View className="flex-1">
          <Text
            className="text-card-title text-textPrimary"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-caption text-textSecondary mt-1" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {actions.length > 0 ? (
          <View className="flex-row items-center gap-2 ml-3">
            {actions.map((action) => (
              <Pressable
                key={action.key}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel}
                onPress={action.onPress}
                hitSlop={10}
                disabled={action.disabled}
                style={({ pressed }) => [
                  action.disabled
                    ? { opacity: 0.45 }
                    : pressed
                      ? { opacity: 0.75 }
                      : null,
                ]}
                className="w-[42px] h-[42px] rounded-full bg-icon items-center justify-center"
              >
                {action.icon}
              </Pressable>
            ))}
          </View>
        ) : null}

        {overflow && menuItems.length > 0 ? ( // Only show overflow if overflow is true and there are menu items
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="More options"
              onPress={() => setIsMenuVisible(true)}
              hitSlop={10}
              className="w-[42px] h-[42px] rounded-full bg-icon items-center justify-center ml-3"
            >
              <MoreVertical size={22} color={colors.textPrimary} strokeWidth={2.2} />
            </Pressable>
            <OverflowMenu
              visible={isMenuVisible}
              onClose={() => setIsMenuVisible(false)}
              menuItems={menuItems}
            />
          </>
        ) : null}
      </View>
    </View>
  );
});
