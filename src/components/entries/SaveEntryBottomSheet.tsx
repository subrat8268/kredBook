import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Share2 } from "lucide-react-native";
import BaseBottomSheet from "@/src/components/layer2/BaseBottomSheet";

interface SaveEntryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  billNumber?: string;
  onSaveOnly: () => void;
  onSaveAndShare: () => void;
}

export default function SaveEntryBottomSheet({
  visible,
  onClose,
  billNumber = "",
  onSaveOnly,
  onSaveAndShare,
}: SaveEntryBottomSheetProps) {
  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      withScroll={false}
      enableDynamicSizing={true}
    >
      <View className="items-center px-4 pt-4 pb-6 w-full">
        {/* Title & Subtitle */}
        <View className="w-full items-center mb-8 gap-2">
          <Text className="text-gray-900 text-lg font-inter-bold leading-7 text-center">
            Save Entry {billNumber}?
          </Text>
          <Text className="text-neutral-700 text-base font-inter leading-6 text-center">
            Financial ledger will be updated immediately.
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full gap-4">
          {/* Save & Share PDF Button */}
          <TouchableOpacity
            onPress={() => {
              onClose();
              onSaveAndShare();
            }}
            className="w-full py-3.5 bg-green-800 rounded-full flex-row justify-center items-center gap-2"
            activeOpacity={0.75}
          >
            <Share2 size={18} color="#ffffff" strokeWidth={2} />
            <Text className="text-white text-base font-inter-semibold leading-6 tracking-wide text-center">
              Save & Share PDF
            </Text>
          </TouchableOpacity>

          {/* Save Only Button */}
          <TouchableOpacity
            onPress={() => {
              onClose();
              onSaveOnly();
            }}
            className="w-full py-3.5 rounded-full border border-green-800 flex-row justify-center items-center"
            activeOpacity={0.75}
          >
            <Text className="text-green-800 text-base font-inter-semibold leading-6 tracking-wide text-center">
              Save Only
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-full py-3 items-center justify-center mt-2"
            activeOpacity={0.75}
          >
            <Text className="text-neutral-500 text-base font-inter leading-6 text-center">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseBottomSheet>
  );
}
