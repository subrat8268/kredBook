import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
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
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.ink, fontFamily: t.fontFamily.displaySemiBold }]}>
            Payment Details
          </Text>

          {/* Amount */}
          <View style={styles.amountWrapper}>
            <Text style={[styles.amount, { color: colors.primary, fontFamily: t.fontFamily.bodyBold }]}>
              {formatINR(payment.amount)}
            </Text>
          </View>

          {/* Details Body */}
          <View style={[styles.detailBox, { backgroundColor: colors.surfaceRaised, borderRadius: t.radius.lg }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.muted, fontFamily: t.fontFamily.body }]}>
                Method
              </Text>
              <Text style={[styles.value, { color: colors.ink, fontFamily: t.fontFamily.bodyMedium }]}>
                Paid via {modeText}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.muted, fontFamily: t.fontFamily.body }]}>
                Date
              </Text>
              <Text style={[styles.value, { color: colors.ink, fontFamily: t.fontFamily.bodyMedium }]}>
                {formattedDate}
              </Text>
            </View>

            {payment.orderBillNumber && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: colors.muted, fontFamily: t.fontFamily.body }]}>
                    Linked Entry
                  </Text>
                  <Text style={[styles.value, { color: colors.primary, fontFamily: t.fontFamily.bodySemiBold }]}>
                    Entry #{payment.orderBillNumber}
                  </Text>
                </View>
              </>
            )}

            {payment.notes && payment.notes.trim().length > 0 && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: colors.muted, fontFamily: t.fontFamily.body }]}>
                    Note
                  </Text>
                  <Text style={[styles.value, { color: colors.ink, fontFamily: t.fontFamily.body }]} numberOfLines={2}>
                    {payment.notes}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* CTAs at Bottom */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.closeText, { color: colors.muted, fontFamily: t.fontFamily.bodySemiBold }]}>
                Close
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDeletePress}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.deleteText, { color: colors.faint, fontFamily: t.fontFamily.bodyMedium }]}>
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

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
  },
  amountWrapper: {
    alignItems: "center",
    marginVertical: 20,
  },
  amount: {
    fontSize: 32,
  },
  detailBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    textAlign: "right",
    maxWidth: "70%",
  },
  divider: {
    height: 1,
    alignSelf: "stretch",
  },
  footer: {
    alignItems: "center",
    gap: 16,
  },
  closeButton: {
    paddingVertical: 12,
    alignSelf: "stretch",
    alignItems: "center",
  },
  closeText: {
    fontSize: 15,
  },
  deleteButton: {
    paddingVertical: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 13,
  },
});
