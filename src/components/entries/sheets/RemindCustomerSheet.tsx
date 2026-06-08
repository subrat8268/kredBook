import React, { memo } from "react";
import { Text, Pressable, View } from "react-native";
import {
  MessageSquare,
  MessageCircle,
  ChevronRight,
} from "lucide-react-native";
import BaseBottomSheet from "@/src/components/layer2/BaseBottomSheet";
import { useTheme } from "@/src/theme/useTheme";

interface RemindCustomerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSendWhatsApp: () => void;
  onSendSMS: () => void;
  customerName: string;
  amount?: number;
  billNumber?: string;
}

export default memo(function RemindCustomerSheet({
  visible,
  onClose,
  onSendWhatsApp,
  onSendSMS,
  customerName,
}: RemindCustomerSheetProps) {
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
            {`Remind ${customerName}`}
          </Text>
          <Text
            style={{ fontFamily: t.fontFamily.body, color: t.colors.muted }}
            className="text-base font-normal leading-6 text-center"
          >
            Select how to send the payment reminder
          </Text>
        </View>

        {/* Options body */}
        <View className="w-full flex-col gap-4">
          {/* WhatsApp option */}
          <Pressable
            onPress={() => {
              onClose();
              onSendWhatsApp();
            }}
            style={{
              backgroundColor: t.colors.primarySurface,
              borderColor: t.colors.primaryBorder,
              borderWidth: 1,
            }}
            className="w-full p-4 rounded-xl flex-row items-center active:opacity-75"
          >
            <View className="w-12 h-9 pr-4 justify-center items-start">
              <View
                style={{ backgroundColor: t.colors.primaryBorderFill }}
                className="w-9 h-9 rounded-full justify-center items-center"
              >
                <MessageCircle
                  size={16}
                  color={t.colors.primary}
                  strokeWidth={2.5}
                />
              </View>
            </View>
            <View className="flex-1">
              <View className="self-stretch">
                <Text
                  style={{ fontFamily: t.fontFamily.bodySemiBold, color: t.colors.ink }}
                  className="text-sm font-semibold leading-5 text-left"
                >
                  Send via WhatsApp
                </Text>
              </View>
              <View className="self-stretch mt-0.5">
                <Text
                  style={{ fontFamily: t.fontFamily.body, color: t.colors.faint }}
                  className="text-xs font-normal leading-4 text-left"
                >
                  Opens pre-filled message
                </Text>
              </View>
            </View>
            <View className="justify-center items-end">
              <ChevronRight size={16} color={t.colors.muted} />
            </View>
          </Pressable>

          {/* SMS option */}
          <Pressable
            onPress={() => {
              onClose();
              onSendSMS();
            }}
            style={{
              backgroundColor: t.colors.partialSurface,
              borderColor: t.colors.partialBorder,
              borderWidth: 1,
            }}
            className="w-full p-4 rounded-xl flex-row items-center active:opacity-75"
          >
            <View className="w-12 h-9 pr-4 justify-center items-start">
              <View
                style={{ backgroundColor: t.colors.partialBorder }}
                className="w-9 h-9 rounded-full justify-center items-center"
              >
                <MessageSquare
                  size={16}
                  color={t.colors.partialText}
                  strokeWidth={2.5}
                />
              </View>
            </View>
            <View className="flex-1">
              <View className="self-stretch">
                <Text
                  style={{ fontFamily: t.fontFamily.bodySemiBold, color: t.colors.ink }}
                  className="text-sm font-semibold leading-5 text-left"
                >
                  Send via SMS
                </Text>
              </View>
              <View className="self-stretch mt-0.5">
                <Text
                  style={{ fontFamily: t.fontFamily.body, color: t.colors.faint }}
                  className="text-xs font-normal leading-4 text-left"
                >
                  Standard text message
                </Text>
              </View>
            </View>
            <View className="justify-center items-end">
              <ChevronRight size={16} color={t.colors.muted} />
            </View>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={onClose}
            className="w-full items-center justify-center mt-2  active:opacity-75"
          >
            <Text
              style={{ fontFamily: t.fontFamily.bodyMedium, color: t.colors.muted }}
              className="text-base font-medium leading-6 text-center"
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </BaseBottomSheet>
  );
});
