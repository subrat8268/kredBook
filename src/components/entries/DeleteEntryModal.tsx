import { useTheme } from "@/src/theme/useTheme";
import React, { memo } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Trash } from "lucide-react-native";

interface DeleteEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  billNumber: string;
}

export default memo(function DeleteEntryModal({
  visible,
  onClose,
  onConfirm,
  billNumber,
}: DeleteEntryModalProps) {
  const t = useTheme();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: t.colors.surfaceOverlay }}
        onPress={onClose}
      >
        <Pressable
          className="w-80 p-6 bg-surface rounded-2xl items-center shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Trash Icon */}
          <View className="w-14 h-14 bg-overdue-surface rounded-full justify-center items-center mb-4">
            <Trash size={24} color={t.colors.overdueText} strokeWidth={2.5} />
          </View>

          {/* Title */}
          <View className="mb-2">
            <Text
              style={{ fontFamily: t.fontFamily.display }}
              className="text-ink text-lg font-bold text-center leading-6"
            >
              Delete Entry?
            </Text>
          </View>

          {/* Subtitle / Description */}
          <View className="mb-6 px-1">
            <Text
              style={{ fontFamily: t.fontFamily.body }}
              className="text-muted text-sm font-normal text-center leading-5"
            >
              Entry #{billNumber} and all its payment{"\n"}records will be permanently deleted.
            </Text>
          </View>

          {/* Stacked Actions */}
          <View className="self-stretch flex flex-col gap-2">
            {/* Delete button */}
            <Pressable
              className="self-stretch h-12 bg-overdue rounded-xl justify-center items-center active:opacity-90"
              onPress={onConfirm}
            >
              <Text
                style={{ fontFamily: t.fontFamily.bodySemiBold }}
                className="text-on-primary text-base font-semibold leading-6"
              >
                Delete Permanently
              </Text>
            </Pressable>

            {/* Cancel button */}
            <Pressable
              className="self-stretch h-12 bg-surface-raised rounded-xl justify-center items-center active:opacity-90"
              onPress={onClose}
            >
              <Text
                style={{ fontFamily: t.fontFamily.bodyMedium }}
                className="text-ink text-base font-medium leading-6"
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});
