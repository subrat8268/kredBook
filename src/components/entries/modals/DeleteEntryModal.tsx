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
          style={{
            backgroundColor: t.colors.surface,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
          }}
          className="w-80 p-6 rounded-2xl items-center"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Trash Icon */}
          <View
            style={{ backgroundColor: t.colors.overdueSurface }}
            className="w-14 h-14 rounded-full justify-center items-center mb-4"
          >
            <Trash size={24} color={t.colors.overdueText} strokeWidth={2.5} />
          </View>

          {/* Title */}
          <View className="mb-2">
            <Text
              style={{ fontFamily: t.fontFamily.display, color: t.colors.ink }}
              className="text-lg font-bold text-center leading-6"
            >
              Delete Entry?
            </Text>
          </View>

          {/* Subtitle / Description */}
          <View className="mb-6 px-1">
            <Text
              style={{ fontFamily: t.fontFamily.body, color: t.colors.muted }}
              className="text-sm font-normal text-center leading-5"
            >
              Entry #{billNumber} and all its payment{"\n"}records will be permanently deleted.
            </Text>
          </View>

          {/* Stacked Actions */}
          <View className="self-stretch flex flex-col gap-2">
            {/* Delete button */}
            <Pressable
              style={{
                backgroundColor: t.colors.overdue,
              }}
              className="self-stretch h-12 rounded-xl justify-center items-center active:opacity-90"
              onPress={onConfirm}
            >
              <Text
                style={{ fontFamily: t.fontFamily.bodySemiBold, color: "#ffffff" }}
                className="text-base font-semibold leading-6"
              >
                Delete Permanently
              </Text>
            </Pressable>

            {/* Cancel button */}
            <Pressable
              style={{
                backgroundColor: t.colors.surfaceRaised,
              }}
              className="self-stretch h-12 rounded-xl justify-center items-center active:opacity-90"
              onPress={onClose}
            >
              <Text
                style={{ fontFamily: t.fontFamily.bodyMedium, color: t.colors.ink }}
                className="text-base font-medium leading-6"
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
