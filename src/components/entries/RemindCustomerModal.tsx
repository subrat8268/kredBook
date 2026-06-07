import { useTheme } from "@/src/theme/useTheme";
import React, { memo } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { MessageSquare } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatINR } from "@/src/utils/format";

interface RemindCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onSendWhatsApp: () => void;
  onSendSMS: () => void;
  customerName: string;
  amount?: number;
  billNumber?: string;
}

export default memo(function RemindCustomerModal({
  visible,
  onClose,
  onSendWhatsApp,
  onSendSMS,
  customerName,
  amount = 0,
  billNumber = "",
}: RemindCustomerModalProps) {
  const t = useTheme();
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
          className="absolute inset-0"
          style={{ backgroundColor: t.colors.surfaceOverlay }}
          onPress={onClose}
        />

        {/* Bottom Drawer Content */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className="bg-surface rounded-t-2xl shadow-2xl items-center w-full p-6"
        >
          {/* Top handle bar indicator */}
          <View className="w-10 h-1 bg-border-default rounded-full self-center mb-4" />

          {/* Header Icon Circle */}
          <View className="w-14 h-14 bg-primary-surface rounded-full justify-center items-center mb-3">
            <MessageSquare size={24} color={t.colors.primary} />
          </View>

          {/* Header Text */}
          <View className="self-stretch flex flex-col justify-start items-center gap-1 mb-4">
            <Text
              style={{ fontFamily: t.fontFamily.display }}
              className="text-center text-ink text-base font-bold leading-6"
            >
              Remind {customerName}
            </Text>
            <Text
              style={{ fontFamily: t.fontFamily.body }}
              className="text-center text-muted text-sm font-normal leading-5"
            >
              Select how to send the payment reminder
            </Text>
          </View>

          {/* Message Preview Box */}
          <View className="self-stretch bg-surface-raised p-4 rounded-xl border border-border-subtle mb-4">
            <Text
              style={{ fontFamily: t.fontFamily.body }}
              className="text-muted text-xs font-semibold uppercase mb-2 tracking-wide"
            >
              Message Preview
            </Text>
            <Text
              style={{ fontFamily: t.fontFamily.body }}
              className="text-ink text-sm leading-5"
            >
              Dear{" "}
              <Text
                style={{ fontFamily: t.fontFamily.bodySemiBold }}
                className="text-primary"
              >
                {customerName}
              </Text>
              , you have an outstanding balance of{" "}
              <Text
                style={{ fontFamily: t.fontFamily.bodySemiBold }}
                className="text-paid-text"
              >
                {formatINR(amount)}
              </Text>
              {billNumber ? ` for Entry #${billNumber}` : ""}. Please settle this balance. Thank you!
            </Text>
          </View>

          {/* Options body */}
          <View className="self-stretch flex flex-col gap-3">
            {/* WhatsApp button */}
            <Pressable
              onPress={() => {
                onSendWhatsApp();
                onClose();
              }}
              className="self-stretch h-12 bg-primary rounded-xl flex-row justify-center items-center gap-2 active:opacity-90"
            >
              <MessageSquare size={18} color={t.colors.onPrimary} />
              <Text
                style={{ fontFamily: t.fontFamily.bodySemiBold }}
                className="text-on-primary text-base font-semibold"
              >
                Send via WhatsApp
              </Text>
            </Pressable>

            {/* SMS button */}
            <Pressable
              onPress={() => {
                onSendSMS();
                onClose();
              }}
              className="self-stretch h-12 bg-surface-raised border border-border-default rounded-xl flex-row justify-center items-center gap-2 active:opacity-90"
            >
              <MessageSquare size={18} color={t.colors.ink} />
              <Text
                style={{ fontFamily: t.fontFamily.bodyMedium }}
                className="text-ink text-base font-medium"
              >
                Send via SMS
              </Text>
            </Pressable>
          </View>

          {/* Cancel */}
          <Pressable
            className="self-stretch pt-4 pb-2 justify-center items-center active:opacity-75"
            onPress={onClose}
          >
            <Text
              style={{ fontFamily: t.fontFamily.body }}
              className="text-center text-faint text-base font-medium leading-6"
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});
