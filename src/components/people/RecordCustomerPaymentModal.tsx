import { useRecordPayment } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import BaseBottomSheet from "@/src/components/layer2/BaseBottomSheet";
import Avatar from "@/src/components/ui/Avatar";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useTheme } from "@/src/utils/ThemeProvider";
import { buildPaymentShareMessage } from "@/src/utils/shareTemplates";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Check, Clock3, Share2 } from "lucide-react-native";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

type PaymentMode = "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";

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

const MODES: PaymentMode[] = ["Cash", "UPI", "NEFT", "Draft", "Cheque"];
type ModalStage = "form" | "confirmed" | "queued";

function sanitizeAmountInput(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [intPartRaw, ...rest] = cleaned.split(".");
  const intPart = (intPartRaw || "").replace(/^0+(?=\d)/, "0");
  if (rest.length === 0) return intPart;
  const decPart = rest.join("").slice(0, 2);
  return `${intPart}.${decPart}`;
}

function parseAmount(value: string) {
  if (!value) return null;
  if (value === ".") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return null;
  return n;
}

const RecordCustomerPaymentModal = forwardRef<BottomSheetModal, Props>(
  (
    { onSuccess, orderId, balanceDue, customerId, customerName, onDismiss, initialAmount, autoPresent = false },
    ref,
  ) => {
    const { colors, radius, spacing, typography } = useTheme();
    const { i18n } = useTranslation();
    const [amount, setAmount] = useState(String(initialAmount ?? balanceDue));
    const [mode, setMode] = useState<PaymentMode>("Cash");
    const [notes, setNotes] = useState("");
    const [stage, setStage] = useState<ModalStage>("form");
    const [lastPaidAmount, setLastPaidAmount] = useState(0);
    const [lastRemainingBalance, setLastRemainingBalance] = useState(0);
    const [isSharingReceipt, setIsSharingReceipt] = useState(false);
    const hasNotifiedSuccessRef = useRef(false);
    const profile = useAuthStore((s) => s.profile);
    const { recordPayment, isRecording } = useRecordPayment(orderId, profile?.id, customerId);

    const resetModalState = useCallback(() => {
      setAmount(String(initialAmount ?? balanceDue));
      setMode("Cash");
      setNotes("");
      setStage("form");
      setLastPaidAmount(0);
      setLastRemainingBalance(0);
      setIsSharingReceipt(false);
      hasNotifiedSuccessRef.current = false;
    }, [balanceDue, initialAmount]);

    useEffect(() => {
      if (!autoPresent) return;
      if (!ref || typeof ref === "function") return;
      const timer = setTimeout(() => {
        ref.current?.present();
      }, 0);
      return () => clearTimeout(timer);
    }, [autoPresent, ref]);

    useEffect(() => {
      resetModalState();
    }, [resetModalState]);

    const parsedAmount = parseAmount(amount);
    const effectiveBalance = balanceDue;
    const hasBalance = effectiveBalance > 0;
    const isFullPaid = hasBalance && (parsedAmount ?? 0) >= effectiveBalance;
    const payAmount = !hasBalance ? 0 : isFullPaid ? effectiveBalance : parsedAmount ?? 0;
    const canSubmit = !isRecording && stage === "form" && hasBalance && payAmount > 0;

    const amountError =
      stage !== "form"
        ? undefined
        : !hasBalance
          ? undefined
          : amount.length === 0 || amount === "."
            ? "Enter amount received"
            : parsedAmount === null
              ? "Enter a valid amount"
              : undefined;

    const quickSetAmount = (next: number) => {
      const safe = Math.max(0, Number(next) || 0);
      setAmount(safe === 0 ? "" : String(Number(safe.toFixed(2))));
    };

    const handleDone = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleShareReceipt = async () => {
      setIsSharingReceipt(true);
      try {
        const locale = i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en";
        await Share.share({
          message: buildPaymentShareMessage({
            locale,
            customerName,
            amount: lastPaidAmount,
            paymentDate: new Date(),
            remainingBalance: lastRemainingBalance,
            businessName: profile?.business_name || profile?.name || "KredBook",
          }),
        });
      } catch {
        Alert.alert("Error", "Could not open share sheet.");
      } finally {
        setIsSharingReceipt(false);
      }
    };

    const handleSubmit = async () => {
      if (!hasBalance || stage !== "form" || isRecording) {
        return;
      }

      if (payAmount <= 0) {
        return;
      }

      try {
        const result = await recordPayment({
          amount: payAmount,
          mode,
          notes: notes.trim() || undefined,
        });

        const remaining = Math.max(0, effectiveBalance - payAmount);
        setLastPaidAmount(payAmount);
        setLastRemainingBalance(remaining);

        if (!hasNotifiedSuccessRef.current) {
          onSuccess();
          hasNotifiedSuccessRef.current = true;
        }

        setStage(result.status === "confirmed" ? "confirmed" : "queued");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to record payment.";
        Alert.alert("Error", message);
      }
    };

    const renderResultState = () => {
      const isConfirmed = stage === "confirmed";
      const title = isConfirmed ? "Payment recorded" : "Saved offline";
      const subtitle = isConfirmed
        ? "Payment saved successfully."
        : "This payment will sync when you're online.";

      return (
        <View style={{ paddingTop: spacing.md }}>
          <View
            className="items-center rounded-2xl border p-4"
            style={{
              borderColor: isConfirmed ? colors.success : colors.warning,
              backgroundColor: isConfirmed ? colors.successBg : colors.warningBg,
            }}
          >
            <View
              className="mb-3 items-center justify-center rounded-full"
              style={{
                width: 44,
                height: 44,
                backgroundColor: isConfirmed ? colors.success : colors.warning,
              }}
            >
              {isConfirmed ? (
                <Check size={20} color={colors.surface} strokeWidth={3} />
              ) : (
                <Clock3 size={20} color={colors.surface} strokeWidth={2.5} />
              )}
            </View>
            <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text
              className="mt-1 text-center"
              style={[typography.caption, { color: colors.textSecondary }]}
            >
              {subtitle}
            </Text>
          </View>

          <View
            className="mt-4 rounded-2xl border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
          >
            <View className="flex-row items-center justify-between">
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Customer</Text>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
                {customerName}
              </Text>
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Amount received</Text>
              <MoneyAmount value={lastPaidAmount} style={[typography.body, { fontWeight: "700" }]} color={colors.success} />
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Remaining balance</Text>
              <MoneyAmount value={lastRemainingBalance} style={[typography.body, { fontWeight: "700" }]} color={lastRemainingBalance === 0 ? colors.success : colors.danger} />
            </View>
          </View>

          {isConfirmed ? (
            <View className="mt-5" style={{ gap: spacing.sm }}>
              <Button
                title={isSharingReceipt ? "Opening..." : "Share receipt"}
                onPress={handleShareReceipt}
                disabled={isSharingReceipt}
                icon={<Share2 size={16} color={colors.surface} strokeWidth={2.4} />}
              />
              <Button variant="secondary" title="Done" onPress={handleDone} />
            </View>
          ) : (
            <View className="mt-5">
              <Button title="Done" onPress={handleDone} />
            </View>
          )}
        </View>
      );
    };

    return (
      <BaseBottomSheet
        ref={ref}
        onClose={() => {
          resetModalState();
          onDismiss?.();
        }}
        snapPoints={["75%", "90%"]}
        withScroll
      >
        {stage === "form" ? (
          <>
            <Text style={typography.sectionTitle}>Record Payment</Text>
            <Text style={[typography.caption, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>Balance due for this entry</Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderRadius: radius.lg,
                marginBottom: spacing.lg,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ marginRight: spacing.md }}>
                <Avatar name={customerName} size="md" />
              </View>
              <View className="flex-1">
                <Text style={typography.cardTitle}>{customerName}</Text>
                <View className="flex-row items-center">
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Balance due: </Text>
                  <MoneyAmount value={effectiveBalance} color={colors.danger} style={[typography.caption, { fontWeight: "700" }]} />
                </View>
              </View>
            </View>

            <Text className="mb-3 text-[13px] font-semibold text-textPrimary">Amount Received</Text>
            <Input
              placeholder="0"
              value={amount}
              onChangeText={(value) => setAmount(sanitizeAmountInput(value))}
              keyboardType="decimal-pad"
              icon={<Text className="text-lg font-bold text-textPrimary">₹</Text>}
              error={amountError}
            />

            <View className="mb-4 mt-3 flex-row" style={{ gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => quickSetAmount(effectiveBalance)}
                activeOpacity={0.8}
                className="rounded-full border px-4 py-2"
                style={{ borderColor: colors.primary, backgroundColor: colors.primaryLight }}
              >
                <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: "600" }]}>Full</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => quickSetAmount(effectiveBalance / 2)}
                activeOpacity={0.8}
                className="rounded-full border px-4 py-2"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]}>Half</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAmount("")}
                activeOpacity={0.8}
                className="rounded-full border px-4 py-2"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: "600" }]}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View
              className="mb-5 rounded-xl border p-3"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              {!hasBalance ? (
                <Text style={[typography.caption, { color: colors.textSecondary }]}>No outstanding balance for this entry.</Text>
              ) : isFullPaid ? (
                <Text style={[typography.caption, { color: colors.success }]}>This will mark the entry fully paid.</Text>
              ) : (
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Remaining balance: {" "}
                  <MoneyAmount value={Math.max(0, effectiveBalance - (parsedAmount ?? 0))} color={colors.danger} style={typography.caption} />
                </Text>
              )}
            </View>

            <Text className="mb-3 text-[13px] font-semibold text-textPrimary">Payment Mode</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
              className="mb-5"
            >
              {MODES.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMode(m)}
                  activeOpacity={0.75}
                  className="rounded-full border px-5 py-2"
                  style={{
                    borderColor: mode === m ? colors.primary : colors.border,
                    backgroundColor: mode === m ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color: mode === m ? colors.surface : colors.textSecondary,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="mb-2 text-[13px] font-semibold text-textPrimary">Notes (optional)</Text>
            <Input placeholder="Write a note about this payment..." value={notes} onChangeText={setNotes} />

            <View className="mt-5">
              <Button
                title={isRecording ? "Recording..." : isFullPaid ? "Mark Full Paid" : "Record Payment"}
                onPress={handleSubmit}
                disabled={!canSubmit}
                loading={isRecording}
                icon={!isRecording && isFullPaid ? <Check size={16} color={colors.surface} strokeWidth={3} /> : undefined}
              />
            </View>
          </>
        ) : (
          renderResultState()
        )}
      </BaseBottomSheet>
    );
  },
);

RecordCustomerPaymentModal.displayName = "RecordCustomerPaymentModal";

export default RecordCustomerPaymentModal;
