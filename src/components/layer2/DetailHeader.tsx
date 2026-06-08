import { useTheme } from "@/src/theme/useTheme";
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
  const t = useTheme();
  const [isMenuVisible, setIsMenuVisible] = useState(false); // State for menu visibility

  return (
    <View
      style={{
        backgroundColor: t.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: t.colors.borderSubtle,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <View className="flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [pressed ? { opacity: 0.75 } : null]}
          className="mr-3"
        >
          <ArrowLeft size={22} color={t.colors.ink} strokeWidth={2.2} />
        </Pressable>

        {leadingSlot ? <View className="ml-0 mr-3">{leadingSlot}</View> : null}

        <View className="flex-1">
          <Text
            style={{
              fontFamily: t.fontFamily.displaySemiBold,
              fontSize: 17,
              fontWeight: "600",
              color: t.colors.ink,
              lineHeight: 22,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontFamily: t.fontFamily.body,
                fontSize: 13,
                color: t.colors.muted,
                lineHeight: 18,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
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
                  {
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: t.colors.surfaceRaised,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
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
              className="w-[42px] h-[42px] rounded-full items-center justify-center ml-3"
            >
              <MoreVertical
                size={22}
                color={t.colors.ink}
                strokeWidth={2.2}
              />
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

