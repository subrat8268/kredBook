import React from "react";
import { Text, Pressable, View } from "react-native";
import { Share2, Check } from "lucide-react-native";
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
      <View className="items-center px-4 pt-4 pb-6 w-full bg-surface">
        {/* Title & Subtitle */}
        <View className="w-full items-center mb-8 gap-2">
          <Text
            style={{ fontFamily: t.fontFamily.display }}
            className="text-ink text-lg font-bold leading-7 text-center"
          >
            Save changes?
          </Text>
          <Text
            style={{ fontFamily: t.fontFamily.body }}
            className="text-muted text-sm leading-5 text-center"
          >
            {"This will update the person's ledger and payment history."}
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full gap-4">
          {/* Save & Share PDF Button */}
          <Pressable
            onPress={() => {
              onClose();
              onSaveAndShare();
            }}
            className="w-full h-12 bg-primary rounded-xl flex-row justify-center items-center gap-2 active:opacity-90"
          >
            <Share2 size={18} color={t.colors.onPrimary} strokeWidth={2} />
            <Text
              style={{ fontFamily: t.fontFamily.bodySemiBold }}
              className="text-on-primary text-base font-semibold leading-6 tracking-wide text-center"
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
            className="w-full h-12 bg-surface border border-primary-border rounded-xl flex-row justify-center items-center gap-2 active:opacity-90"
          >
            <Check size={18} color={t.colors.primary} strokeWidth={2} />
            <Text
              style={{ fontFamily: t.fontFamily.bodySemiBold }}
              className="text-primary text-base font-semibold leading-6 tracking-wide text-center"
            >
              Save Only
            </Text>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={onClose}
            className="w-full py-3 items-center justify-center mt-2 active:opacity-75"
          >
            <Text
              style={{ fontFamily: t.fontFamily.body }}
              className="text-faint text-base leading-6 text-center"
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </BaseBottomSheet>
  );
}
