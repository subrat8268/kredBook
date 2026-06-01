import { useTheme } from "@/src/utils/ThemeProvider";
import React, { memo } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

export type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: string; // Hex color for icon and text
  isDestructive?: boolean;
  isDivider?: boolean;
};

type OverflowMenuProps = {
  visible: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
};

const OVERLAY_COLOR = "rgba(0,0,0,0.3)";

export default memo(function OverflowMenu({
  visible,
  onClose,
  menuItems,
}: OverflowMenuProps) {
  const { colors, spacing, radius, typography } = useTheme();

  const renderItem = ({ item }: { item: MenuItem }) => {
    if (item.isDivider) {
      return (
        <View
          style={{
            height: 1,
            backgroundColor: "#f3f4f6", // colors.borderLight
            marginHorizontal: spacing.xl,
          }}
        />
      );
    }

    const itemColor = item.color || "#111827"; // colors.textPrimary
    const iconColor = item.color || "#374151"; // colors.textSecondary

    return (
      <Pressable
        accessibilityRole="menuitem"
        onPress={() => {
          item.onPress();
          onClose();
        }}
        style={({ pressed }) => [
          styles.menuItem,
          {
            paddingVertical: 20,
            paddingHorizontal: 20,
            gap: 12,
          },
          pressed && { backgroundColor: colors.surfaceAlt },
        ]}
      >
        {React.cloneElement(item.icon as React.ReactElement<any>, {
          size: 20,
          color: iconColor,
          strokeWidth: 2,
        })}
        <Text
          style={[
            typography.body,
            {
              color: itemColor,
              fontWeight: "400",
              fontSize: 15,
            },
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.menuCard,
            {
              backgroundColor: "#ffffff", // colors.surface
              borderRadius: 12,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 5,
              right: spacing.md,
              top: 56,
            },
          ]}
        >
          <FlatList
            data={menuItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: "transparent" }} />
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  menuCard: {
    position: "absolute",
    width: 260,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44, // Ensure touch target size
  },
});
