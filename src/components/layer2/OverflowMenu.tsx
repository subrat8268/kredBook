import { useTheme } from "@/src/theme/useTheme";
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

export default memo(function OverflowMenu({
  visible,
  onClose,
  menuItems,
}: OverflowMenuProps) {
  const t = useTheme();

  const renderItem = ({ item }: { item: MenuItem }) => {
    let itemColor: string = t.colors.body;
    if (item.key === "mark-as-paid") {
      itemColor = t.colors.paid;
    } else if (item.key === "delete-entry") {
      itemColor = t.colors.error;
    } else if (item.color) {
      itemColor = item.color;
    }

    return (
      <View className="w-full">
        <Pressable
          style={({ pressed }) =>
            pressed && { backgroundColor: t.colors.borderSubtle }
          }
          className="self-stretch flex-row items-center gap-2 h-12 px-4"
          accessibilityRole="menuitem"
          onPress={() => {
            item.onPress();
            onClose();
          }}
        >
          <View className="w-5 items-center justify-center">
            {React.cloneElement(item.icon as React.ReactElement<any>, {
              size: 16,
              color: itemColor,
              strokeWidth: 2,
            })}
          </View>
          <Text
            style={{
              fontFamily: t.fontFamily.bodyMedium,
              color: itemColor,
            }}
            className="justify-center text-base font-medium leading-5"
          >
            {item.label}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.overlay, { backgroundColor: t.colors.surfaceOverlay }]}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 10,
            backgroundColor: t.colors.surface,
            borderColor: t.colors.borderDefault,
            borderWidth: 1,
          }}
          className="w-52 absolute right-4 top-[56px] rounded-xl py-1 overflow-hidden"
        >
          <FlatList
            data={menuItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View
                style={{ backgroundColor: t.colors.borderSubtle, height: 1 }}
                className="self-stretch"
              />
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
  },
});
