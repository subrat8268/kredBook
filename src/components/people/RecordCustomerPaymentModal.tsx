import { useTheme } from "@/src/utils/ThemeProvider";
import {
	BottomSheetBackdrop,
	BottomSheetFooter,
	type BottomSheetFooterProps,
	BottomSheetModal,
	BottomSheetScrollView,
	type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/src/components/ui";
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
		const { height: viewportHeight } = useWindowDimensions();
		const { i18n } = useTranslation();
		const sheetRef = useRef<BottomSheetModal>(null);
		const [footerHeight, setFooterHeight] = useState(0);

		useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal, []);

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
			const timer = setTimeout(() => {
				sheetRef.current?.present();
			}, 0);
			return () => clearTimeout(timer);
		}, [autoPresent]);

		const handleDone = useCallback(() => {
			sheetRef.current?.dismiss();
		}, []);

		const handleClose = useCallback(() => {
			sheetRef.current?.dismiss();
		}, []);

		const handlePartialInputFocus = useCallback(() => {
			requestAnimationFrame(() => {
				scrollRef.current?.scrollTo?.({ y: 160, animated: true });
			});
		}, []);

		const renderBackdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					pressBehavior="close"
					opacity={0.4}
				/>
			),
			[],
		);

		const renderFormFooter = useCallback(
			(props: BottomSheetFooterProps) => (
				<BottomSheetFooter {...props} bottomInset={0}>
					<View
						onLayout={(event) => {
							setFooterHeight(event.nativeEvent.layout.height);
						}}
						style={[
							styles.footerWrap,
							{
								paddingTop: spacing.sm,
								paddingBottom: Math.max(insets.bottom, 8) + spacing.sm,
								backgroundColor: colors.background,
								borderTopColor: colors.border,
							},
						]}
					>
						<Button
							title="Record Payment"
							onPress={vm.submit}
							loading={vm.isRecording}
							disabled={!vm.canSubmit}
						/>
					</View>
				</BottomSheetFooter>
			),
			[
				colors,
				insets.bottom,
				spacing.sm,
				vm.submit,
				vm.isRecording,
				vm.canSubmit,
			],
		);

		const formStyles = useMemo(
			() =>
				StyleSheet.create({
					handleIndicator: {
						backgroundColor: colors.border,
						width: 40,
					},
					background: {
						backgroundColor: colors.surface,
						borderTopLeftRadius: 24,
						borderTopRightRadius: 24,
					},
					content: {
						paddingHorizontal: spacing.screenPadding,
						paddingTop: spacing.sm,
						paddingBottom: Math.max(
							footerHeight + spacing.sm,
							insets.bottom + spacing.md,
						),
					},
				}),
			[colors, footerHeight, insets.bottom, spacing],
		);

		const scrollRef = useRef(null);

		return (
			<BottomSheetModal
				ref={sheetRef}
				index={0}
				enableDynamicSizing={true}
				maxDynamicContentSize={viewportHeight * 0.9}
				enablePanDownToClose
				onDismiss={() => {
					reset();
					onDismiss?.();
				}}
				backdropComponent={renderBackdrop}
				keyboardBehavior="interactive"
				keyboardBlurBehavior="restore"
				android_keyboardInputMode="adjustResize"
				handleIndicatorStyle={formStyles.handleIndicator}
				backgroundStyle={formStyles.background}
				footerComponent={vm.stage === "form" ? renderFormFooter : undefined}
			>
				<BottomSheetScrollView
					ref={scrollRef}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={formStyles.content}
				>
					{vm.stage === "form" ? (
						<RecordPaymentForm
							customerName={customerName}
							onClose={handleClose}
							amount={vm.amount}
							amountError={vm.amountError}
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
							onAmountChange={vm.setAmountSanitized}
							onPartialInputFocus={handlePartialInputFocus}
							onModeChange={vm.setMode}
							onNotesChange={vm.setNotes}
						/>
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
				</BottomSheetScrollView>
			</BottomSheetModal>
		);
	},
);

RecordCustomerPaymentModal.displayName = "RecordCustomerPaymentModal";

const styles = StyleSheet.create({
	footerWrap: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderTopWidth: 1,
	},
});

export default RecordCustomerPaymentModal;
