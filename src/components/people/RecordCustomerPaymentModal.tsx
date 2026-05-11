import BaseBottomSheet from "@/src/components/layer2/BaseBottomSheet";
import Button from "@/src/components/ui/Button";
import { useTheme } from "@/src/utils/ThemeProvider";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
import { forwardRef, useCallback, useEffect } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RecordPaymentForm from "./record-payment/RecordPaymentForm";
import RecordPaymentResult from "./record-payment/RecordPaymentResult";
import { useRecordCustomerPaymentModal } from "./record-payment/useRecordCustomerPaymentModal";

type Props = {
  onSuccess: () => void;
  orderId: string;
  balanceDue: number;
  customerId: string;
  customerName: string;
  onDismiss?: () => void;
  initialAmount?: number;
  autoPresent?: boolean;
};

const RecordCustomerPaymentModal = forwardRef<BottomSheetModal, Props>(
  (
    {
      onSuccess,
      orderId,
      balanceDue,
      customerId,
      customerName,
      onDismiss,
      initialAmount,
      autoPresent = false,
    },
    ref,
  ) => {
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const { i18n } = useTranslation();

    const vm = useRecordCustomerPaymentModal({
      orderId,
      customerId,
      customerName,
      balanceDue,
      initialAmount,
      locale: i18n.language,
      onSuccess,
    });
    const { reset } = vm;

    useEffect(() => {
      reset();
    }, [reset]);

    useEffect(() => {
      if (!autoPresent) return;
      if (!ref || typeof ref === "function") return;
      const timer = setTimeout(() => {
        ref.current?.present();
      }, 0);
      return () => clearTimeout(timer);
    }, [autoPresent, ref]);

    const handleDone = useCallback(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const renderFormFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={insets.bottom}>
          <View
            className="px-4 pt-3 pb-3 bg-surface"
            style={{
              shadowColor: colors.textPrimary,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Button
              title={
                vm.isRecording
                  ? "Recording..."
                  : vm.isFullPaid
                    ? "Mark Fully Paid"
                    : "Record Payment"
              }
              onPress={vm.submit}
              disabled={!vm.canSubmit}
              size="lg"
              loading={vm.isRecording}
              icon={
                !vm.isRecording && vm.isFullPaid ? (
                  <Check size={16} color={colors.surface} strokeWidth={3} />
                ) : undefined
              }
            />
          </View>
        </BottomSheetFooter>
      ),
      [
        colors.surface,
        colors.textPrimary,
        insets.bottom,
        spacing,
        vm.canSubmit,
        vm.isFullPaid,
        vm.isRecording,
        vm.submit,
      ],
    );

    return (
      <BaseBottomSheet
        ref={ref}
        onClose={() => {
          reset();
          onDismiss?.();
        }}
        snapPoints={["90%"]}
        enableDynamicSizing={false}
        footer={vm.stage === "form" ? renderFormFooter : undefined}
        withScroll
      >
        {vm.stage === "form" ? (
          <>
            <RecordPaymentForm
              customerName={customerName}
              amount={vm.amount}
              effectiveBalance={vm.effectiveBalance}
              hasBalance={vm.hasBalance}
              isFullPaid={vm.isFullPaid}
              remainingBalance={vm.remainingBalance}
              paymentIntent={vm.paymentIntent}
              mode={vm.mode}
              modes={vm.modes}
              notes={vm.notes}
              onSelectFull={vm.selectFullPayment}
              onSelectPartial={vm.selectPartialPayment}
              onAppendAmountKey={vm.appendAmountKey}
              onBackspaceAmount={vm.backspaceAmount}
              onModeChange={vm.setMode}
              onNotesChange={vm.setNotes}
            />
            <View style={{ height: spacing.screenContentBottom }} />
          </>
        ) : (
          <RecordPaymentResult
            stage={vm.stage}
            customerName={customerName}
            lastPaidAmount={vm.lastPaidAmount}
            lastRemainingBalance={vm.lastRemainingBalance}
            isSharingReceipt={vm.isSharingReceipt}
            onShareReceipt={vm.shareReceipt}
            onDone={handleDone}
          />
        )}
      </BaseBottomSheet>
    );
  },
);

RecordCustomerPaymentModal.displayName = "RecordCustomerPaymentModal";

export default RecordCustomerPaymentModal;
