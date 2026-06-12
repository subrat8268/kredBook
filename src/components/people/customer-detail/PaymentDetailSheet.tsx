import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowDownLeft,
  Calendar,
  CreditCard,
  FileText,
  Trash2,
} from "lucide-react-native";
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
  created_at: string;
  paymentMode: string;
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

const PaymentDetailSheet = forwardRef<
  BottomSheetModal,
  PaymentDetailSheetProps
>(({ payment, onDismiss }, ref) => {
  const t = useTheme();
  const { colors } = t;
  const { show: showToast } = useToast();
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal, []);

  const snapPoints = useMemo(() => ["61%"], []);

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
    if (!payment?.created_at) return "";
    const dateObj = new Date(payment.created_at);
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
    if (!payment?.paymentMode) return "Payment";
    const mode = payment.paymentMode.toLowerCase();
    return MODE_LABEL[mode] || payment.paymentMode;
  }, [payment]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: colors.borderDefault,
        width: 40,
      }}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: t.radius["3xl"],
        borderTopRightRadius: t.radius["3xl"],
      }}
    >
      {payment && (
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 32) + 24,
          }}
        >
          {/* Top Icon Badge */}
          <View className="items-center mt-2 mb-3">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primaryBorderFill }}
            >
              <ArrowDownLeft
                size={24}
                color={colors.primary}
                strokeWidth={2.5}
              />
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-[18px] text-center"
            style={{
              color: colors.ink,
              fontFamily: t.fontFamily.displaySemiBold,
            }}
          >
            Payment Details
          </Text>

          {/* Amount */}
          <View className="items-center mt-1 mb-5">
            <Text
              className="text-[32px]"
              style={{
                color: colors.primary,
                fontFamily: t.fontFamily.bodyBold,
              }}
            >
              {formatINR(payment.amount)}
            </Text>
          </View>

          {/* Details Body Container */}
          <View
            className="px-4 py-1 mb-6 border"
            style={{
              backgroundColor: colors.surfaceRaised,
              borderColor: colors.borderSubtle,
              borderRadius: t.radius.xl,
            }}
          >
            {/* Method Row */}
            <View className="flex-row justify-between items-center py-3.5">
              <View className="flex-row items-center gap-2">
                <CreditCard size={16} color={colors.muted} />
                <Text
                  className="text-[14px]"
                  style={{ color: colors.muted, fontFamily: t.fontFamily.body }}
                >
                  Method
                </Text>
              </View>
              <Text
                className="text-[14px]"
                style={{
                  color: colors.ink,
                  fontFamily: t.fontFamily.bodyMedium,
                }}
              >
                Paid via {modeText}
              </Text>
            </View>

            <View
              className="h-[1px] self-stretch"
              style={{ backgroundColor: colors.borderSubtle }}
            />

            {/* Date Row */}
            <View className="flex-row justify-between items-center py-3.5">
              <View className="flex-row items-center gap-2">
                <Calendar size={16} color={colors.muted} />
                <Text
                  className="text-[14px]"
                  style={{ color: colors.muted, fontFamily: t.fontFamily.body }}
                >
                  Date
                </Text>
              </View>
              <Text
                className="text-[14px]"
                style={{
                  color: colors.ink,
                  fontFamily: t.fontFamily.bodyMedium,
                }}
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
                {/* Linked Entry Row */}
                <View className="flex-row justify-between items-center py-3.5">
                  <View className="flex-row items-center gap-2">
                    <FileText size={16} color={colors.muted} />
                    <Text
                      className="text-[14px]"
                      style={{
                        color: colors.muted,
                        fontFamily: t.fontFamily.body,
                      }}
                    >
                      Linked Entry
                    </Text>
                  </View>
                  <Text
                    className="text-[14px]"
                    style={{
                      color: colors.primary,
                      fontFamily: t.fontFamily.bodySemiBold,
                    }}
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
                {/* Notes Row */}
                <View className="flex-row justify-between items-center py-3.5">
                  <View className="flex-row items-center gap-2">
                    <FileText size={16} color={colors.muted} />
                    <Text
                      className="text-[14px]"
                      style={{
                        color: colors.muted,
                        fontFamily: t.fontFamily.body,
                      }}
                    >
                      Note
                    </Text>
                  </View>
                  <Text
                    className="text-[14px] text-right max-w-[65%]"
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
          <View className="items-center gap-4 mt-2">
            <Pressable
              onPress={handleClose}
              className="h-12 rounded-xl items-center justify-center self-stretch active:opacity-85"
              style={{ backgroundColor: colors.surfaceRaised }}
            >
              <Text
                className="text-[15px]"
                style={{ color: colors.ink, fontFamily: t.fontFamily.bodyBold }}
              >
                Close
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDeletePress}
              className="flex-row items-center justify-center py-2.5 px-4 active:opacity-70"
            >
              <Trash2 size={14} color={colors.overdue} className="mr-2" />
              <Text
                className="text-base ml-1"
                style={{
                  color: colors.overdue,
                  fontFamily: t.fontFamily.bodyMedium,
                }}
              >
                Delete Payment
              </Text>
            </Pressable>
          </View>
        </BottomSheetScrollView>
      )}
    </BottomSheetModal>
  );
});

PaymentDetailSheet.displayName = "PaymentDetailSheet";

export default PaymentDetailSheet;
