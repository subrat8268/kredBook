import React from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { Share2, Download, Pencil, Trash2 } from "lucide-react-native";
import { useTheme } from "@/src/theme/useTheme";

interface CustomerOverflowMenuProps {
  visible: boolean;
  onClose: () => void;
  onShareLedger: () => void;
  onDownloadStatement: () => void;
  onEditCustomer: () => void;
  onDeleteCustomer: () => void;
  hasTransactions: boolean;
}

export default function CustomerOverflowMenu({
  visible,
  onClose,
  onShareLedger,
  onDownloadStatement,
  onEditCustomer,
  onDeleteCustomer,
  hasTransactions,
}: CustomerOverflowMenuProps) {
  const t = useTheme();
  const { colors } = t;

  const menuItems = [
    {
      key: "share-ledger",
      label: "Share Ledger",
      icon: <Share2 size={16} color={colors.ink} />,
      onPress: onShareLedger,
      disabled: false,
    },
    {
      key: "pdf-statement",
      label: "PDF Statement",
      icon: <Download size={16} color={hasTransactions ? colors.ink : colors.faint} />,
      onPress: onDownloadStatement,
      disabled: !hasTransactions,
    },
    {
      key: "edit-customer",
      label: "Edit Customer",
      icon: <Pencil size={16} color={colors.ink} />,
      onPress: onEditCustomer,
      disabled: false,
    },
    {
      key: "delete-customer",
      label: "Delete Customer",
      icon: <Trash2 size={16} color={colors.danger} />,
      onPress: onDeleteCustomer,
      disabled: false,
      isDestructive: true,
    },
  ];

  const renderItem = ({ item }: { item: typeof menuItems[0] }) => {
    const itemColor = item.isDestructive
      ? colors.danger
      : item.disabled
        ? colors.faint
        : colors.ink;

    return (
      <Pressable
        disabled={item.disabled}
        onPress={() => {
          onClose();
          item.onPress();
        }}
        style={({ pressed }) => [
          styles.menuItem,
          {
            backgroundColor: pressed && !item.disabled ? colors.borderSubtle : "transparent",
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          {React.cloneElement(item.icon as React.ReactElement, {
            color: itemColor,
          })}
        </View>
        <Text
          style={[
            styles.menuItemText,
            {
              color: itemColor,
              fontFamily: t.fontFamily.bodyMedium,
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
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.surfaceOverlay }]}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderDefault,
            },
          ]}
        >
          <FlatList
            data={menuItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.borderSubtle }]} />
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menuCard: {
    position: "absolute",
    right: 16,
    top: 56,
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  menuItemText: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    alignSelf: "stretch",
  },
});
