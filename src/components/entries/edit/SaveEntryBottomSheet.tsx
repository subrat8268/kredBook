import React from "react";
import { Text, Pressable, View } from "react-native";
import { Share2 } from "lucide-react-native";
import BaseBottomSheet from "@/src/components/layer2/BaseBottomSheet";
import { useTheme } from "@/src/theme/useTheme";

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
  const t = useTheme();

  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      withScroll={false}
      enableDynamicSizing={true}
    >
      <View style={{ backgroundColor: t.colors.surface }} className="px-4 pt-5 w-full flex-col gap-8">
        {/* Title & Subtitle */}
        <View className="w-full flex-col justify-start items-center gap-1">
          <Text
            style={{ fontFamily: t.fontFamily.display, color: t.colors.ink }}
            className="text-lg font-bold leading-7 text-center"
          >
            {`Save Entry ${billNumber}?`}
          </Text>
          <Text
            style={{ fontFamily: t.fontFamily.body, color: t.colors.muted }}
            className="text-base font-normal leading-6 text-center"
          >
            Financial ledger will be updated immediately.
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full flex-col gap-4">
          {/* Save & Share PDF Button */}
          <Pressable
            onPress={() => {
              onClose();
              onSaveAndShare();
            }}
            style={{ backgroundColor: t.colors.primaryActive }}
            className="w-full h-[52px] rounded-full flex-row justify-center items-center gap-2 active:opacity-90"
          >
            <Share2 size={18} color="#ffffff" strokeWidth={2} />
            <Text
              style={{ fontFamily: t.fontFamily.bodySemiBold, color: "#ffffff" }}
              className="text-base font-semibold leading-6 tracking-wide text-center"
            >
              Save & Share PDF
            </Text>
          </Pressable>

          {/* Save Only Button */}
          <Pressable
            onPress={() => {
              onClose();
              onSaveOnly();
            }}
            style={{
              borderColor: t.colors.primaryActive,
              borderWidth: 1,
              backgroundColor: t.colors.surface,
            }}
            className="w-full h-[52px] rounded-full flex-row justify-center items-center active:opacity-90"
          >
            <Text
              style={{
                fontFamily: t.fontFamily.bodySemiBold,
                color: t.colors.primaryActive,
              }}
              className="text-base font-semibold leading-6 tracking-wide text-center"
            >
              Save Only
            </Text>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={onClose}
            className="w-full items-center justify-center mt-2 active:opacity-75"
          >
            <Text
              style={{ color: t.colors.muted, fontFamily: t.fontFamily.bodySemiBold }}
              className="font-semibold text-base leading-6 text-center"
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </BaseBottomSheet>
  );
}
