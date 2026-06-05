import { useTheme } from "@/src/utils/ThemeProvider";
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
  const { colors } = useTheme();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        onPress={onClose}
      >
        <Pressable
          className="w-80 p-6 bg-slate-50 dark:bg-slate-900 rounded-[20px] items-center shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Trash Icon */}
          <View className="w-14 h-16 pb-4 items-center justify-center">
            <View className="w-14 h-14 bg-rose-200 dark:bg-rose-950/50 rounded-full justify-center items-center">
              <Trash size={24} color={colors.dangerStrong} strokeWidth={2.5} />
            </View>
          </View>

          {/* Title */}
          <View className="mb-2">
            <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold font-inter-bold text-center leading-6">
              Delete Entry?
            </Text>
          </View>

          {/* Subtitle / Description */}
          <View className="mb-6 px-1">
            <Text className="text-slate-600 dark:text-slate-400 text-sm font-normal font-inter text-center leading-6">
              Entry #{billNumber} and all its payment{"\n"}records will be permanently deleted.
            </Text>
          </View>

          {/* Stacked Actions */}
          <View className="self-stretch flex flex-col gap-2">
            {/* Delete button */}
            <Pressable
              className="self-stretch h-12 bg-red-700 rounded-full justify-center items-center active:bg-red-800"
              onPress={onConfirm}
            >
              <Text className="text-white text-base font-semibold font-inter-semibold leading-6">
                Delete Permanently
              </Text>
            </Pressable>

            {/* Cancel button */}
            <Pressable
              className="self-stretch h-12 bg-sky-100 dark:bg-slate-800 rounded-full justify-center items-center active:bg-sky-200 dark:active:bg-slate-700"
              onPress={onClose}
            >
              <Text className="text-gray-900 dark:text-gray-200 text-base font-medium font-inter-medium leading-6">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});
