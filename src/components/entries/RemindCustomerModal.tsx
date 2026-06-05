import { useTheme } from "@/src/utils/ThemeProvider";
import React, { memo } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { MessageSquare, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RemindCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSendWhatsApp: () => void;
  onSendSMS: () => void;
  customerName: string;
}

export default memo(function RemindCustomerModal({
  visible,
  onClose,
  onSendWhatsApp,
  onSendSMS,
  customerName,
}: RemindCustomerModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop overlay */}
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={onClose}
        />

        {/* Bottom Drawer Content */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className="bg-white dark:bg-slate-900 rounded-t-[20px] shadow-2xl items-center w-full"
        >
          {/* Top handle bar indicator */}
          <View className="self-stretch pt-2 pb-1 justify-center items-center">
            <View className="w-8 h-1 bg-gray-300 dark:bg-slate-700 rounded-full" />
          </View>

          {/* Header */}
          <View className="self-stretch pt-2 flex flex-col justify-start items-start">
            <View className="self-stretch px-4 pt-1.5 pb-2 flex flex-col justify-start items-start gap-1">
              <View className="self-stretch flex flex-col justify-start items-center">
                <Text className="text-center justify-center text-gray-900 dark:text-gray-100 text-base font-bold font-inter-bold leading-6">
                  Remind {customerName}
                </Text>
              </View>
              <View className="self-stretch flex flex-col justify-start items-center">
                <Text className="text-center justify-center text-gray-500 dark:text-gray-400 text-sm font-normal font-inter leading-5">
                  Select how to send the payment reminder
                </Text>
              </View>
            </View>
          </View>

          {/* Options body */}
          <View className="self-stretch p-4 flex flex-col gap-4">
            {/* WhatsApp option */}
            <Pressable
              onPress={() => {
                onSendWhatsApp();
                onClose();
              }}
              className="self-stretch p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl flex-row justify-between items-center active:opacity-75"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-9 h-9 bg-green-100 dark:bg-green-900/40 rounded-full justify-center items-center mr-3">
                  <MessageSquare size={16} color={colors.brand} strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-gray-100 text-sm font-semibold font-inter-semibold leading-5">
                    Send via WhatsApp
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs font-normal font-inter leading-4 mt-0.5">
                    Opens pre-filled message
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textSecondary} />
            </Pressable>

            {/* SMS option */}
            <Pressable
              onPress={() => {
                onSendSMS();
                onClose();
              }}
              className="self-stretch p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl flex-row justify-between items-center active:opacity-75"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-full justify-center items-center mr-3">
                  <MessageSquare size={16} color={colors.primaryBlue || "#2563EB"} strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 dark:text-gray-100 text-sm font-semibold font-inter-semibold leading-5">
                    Send via SMS
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs font-normal font-inter leading-4 mt-0.5">
                    Standard text message
                  </Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Cancel */}
          <Pressable
            className="self-stretch px-4 pt-2 pb-4 justify-center items-center active:opacity-75"
            onPress={onClose}
          >
            <Text className="text-center text-gray-400 dark:text-gray-500 text-base font-medium font-inter-medium leading-6">
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});
