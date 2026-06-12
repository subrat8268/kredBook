import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@/src/theme/useTheme";
import { formatINR } from "@/src/utils/format";
import { useToast } from "@/src/components/feedback/Toast";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  notes?: string | null;
  billNumber?: string | null;
  orderBillNumber?: string | null;
}

interface PaymentDetailSheetProps {
  payment: Payment | null;
  onDismiss?: () => void;
}

const MODE_LABEL: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  neft: "NEFT",
  draft: "Draft",
  cheque: "Cheque",
  online: "UPI",
};

const PaymentDetailSheet = forwardRef<BottomSheetModal, PaymentDetailSheetProps>(
  ({ payment, onDismiss }, ref) => {
    const t = useTheme();
    const { colors } = t;
    const { show: showToast } = useToast();
    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal, []);

    const snapPoints = useMemo(() => ["55%"], []);

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.4}
      />
    );

    const handleClose = () => {
      sheetRef.current?.dismiss();
    };

    const handleDeletePress = () => {
      showToast({
        message: "Delete payment capability is coming soon!",
        type: "info",
      });
    };

    // Format date & time
    const formattedDate = useMemo(() => {
      if (!payment?.payment_date) return "";
      const dateObj = new Date(payment.payment_date);
      return dateObj.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }, [payment]);

    const modeText = useMemo(() => {
      if (!payment?.payment_mode) return "Payment";
      const mode = payment.payment_mode.toLowerCase();
      return MODE_LABEL[mode] || payment.payment_mode;
    }, [payment]);

    if (!payment) return null;

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={onDismiss}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.borderDefault, width: 40 }}
        backgroundStyle={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: t.radius["3xl"],
          borderTopRightRadius: t.radius["3xl"],
        }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}>
          {/* Title */}
          <Text
            className="text-[18px] text-center"
            style={{ color: colors.ink, fontFamily: t.fontFamily.displaySemiBold }}
          >
            Payment Details
          </Text>

          {/* Amount */}
          <View className="items-center my-5">
            <Text
              className="text-[32px]"
              style={{ color: colors.primary, fontFamily: t.fontFamily.bodyBold }}
            >
              {formatINR(payment.amount)}
            </Text>
          </View>

          {/* Details Body */}
          <View
            className="px-4 py-2 mb-6"
            style={{ backgroundColor: colors.surfaceRaised, borderRadius: t.radius.lg }}
          >
            <View className="flex-row justify-between items-center py-3">
              <Text
                className="text-[14px]"
                style={{ color: colors.muted, fontFamily: t.fontFamily.body }}
              >
                Method
              </Text>
              <Text
                className="text-[14px] text-right max-w-[70%]"
                style={{ color: colors.ink, fontFamily: t.fontFamily.bodyMedium }}
              >
                Paid via {modeText}
              </Text>
            </View>

            <View
              className="h-[1px] self-stretch"
              style={{ backgroundColor: colors.borderSubtle }}
            />

            <View className="flex-row justify-between items-center py-3">
              <Text
                className="text-[14px]"
                style={{ color: colors.muted, fontFamily: t.fontFamily.body }}
              >
                Date
              </Text>
              <Text
                className="text-[14px] text-right max-w-[70%]"
                style={{ color: colors.ink, fontFamily: t.fontFamily.bodyMedium }}
              >
                {formattedDate}
              </Text>
            </View>

            {payment.orderBillNumber && (
              <>
                <View
                  className="h-[1px] self-stretch"
                  style={{ backgroundColor: colors.borderSubtle }}
                />
                <View className="flex-row justify-between items-center py-3">
                  <Text
                    className="text-[14px]"
                    style={{ color: colors.muted, fontFamily: t.fontFamily.body }}
                  >
                    Linked Entry
                  </Text>
                  <Text
                    className="text-[14px] text-right max-w-[70%]"
                    style={{ color: colors.primary, fontFamily: t.fontFamily.bodySemiBold }}
                  >
                    Entry #{payment.orderBillNumber}
                  </Text>
                </View>
              </>
            )}

            {payment.notes && payment.notes.trim().length > 0 && (
              <>
                <View
                  className="h-[1px] self-stretch"
                  style={{ backgroundColor: colors.borderSubtle }}
                />
                <View className="flex-row justify-between items-center py-3">
                  <Text
                    className="text-[14px]"
                    style={{ color: colors.muted, fontFamily: t.fontFamily.body }}
                  >
                    Note
                  </Text>
                  <Text
                    className="text-[14px] text-right max-w-[70%]"
                    style={{ color: colors.ink, fontFamily: t.fontFamily.body }}
                    numberOfLines={2}
                  >
                    {payment.notes}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* CTAs at Bottom */}
          <View className="items-center gap-4">
            <Pressable
              onPress={handleClose}
              className="py-3 self-stretch items-center active:opacity-70"
            >
              <Text
                className="text-[15px]"
                style={{ color: colors.muted, fontFamily: t.fontFamily.bodySemiBold }}
              >
                Close
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDeletePress}
              className="py-2 self-stretch items-center active:opacity-70"
            >
              <Text
                className="text-[13px]"
                style={{ color: colors.faint, fontFamily: t.fontFamily.bodyMedium }}
              >
                Delete Payment
              </Text>
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

PaymentDetailSheet.displayName = "PaymentDetailSheet";

export default PaymentDetailSheet;
