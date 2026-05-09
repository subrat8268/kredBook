import { useRecordPayment } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import { buildPaymentShareMessage } from "@/src/utils/shareTemplates";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Share } from "react-native";

export type PaymentMode = "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";
export type ModalStage = "form" | "confirmed" | "queued";

const MODES: PaymentMode[] = ["Cash", "UPI", "NEFT", "Draft", "Cheque"];

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

type Params = {
  orderId: string;
  customerId: string;
  customerName: string;
  balanceDue: number;
  initialAmount?: number;
  locale: string;
  onSuccess: () => void;
};

export function useRecordCustomerPaymentModal({
  orderId,
  customerId,
  customerName,
  balanceDue,
  initialAmount,
  locale,
  onSuccess,
}: Params) {
  const profile = useAuthStore((s) => s.profile);
  const { recordPayment, isRecording } = useRecordPayment(orderId, profile?.id, customerId);

  const [amount, setAmount] = useState(String(initialAmount ?? balanceDue));
  const [mode, setMode] = useState<PaymentMode>("Cash");
  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState<ModalStage>("form");
  const [lastPaidAmount, setLastPaidAmount] = useState(0);
  const [lastRemainingBalance, setLastRemainingBalance] = useState(0);
  const [isSharingReceipt, setIsSharingReceipt] = useState(false);
  const hasNotifiedSuccessRef = useRef(false);

  const parsedAmount = parseAmount(amount);
  const effectiveBalance = balanceDue;
  const hasBalance = effectiveBalance > 0;
  const isFullPaid = hasBalance && (parsedAmount ?? 0) >= effectiveBalance;
  const payAmount = !hasBalance ? 0 : isFullPaid ? effectiveBalance : parsedAmount ?? 0;
  const remainingBalance = Math.max(0, effectiveBalance - (parsedAmount ?? 0));
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

  const reset = useCallback(() => {
    setAmount(String(initialAmount ?? balanceDue));
    setMode("Cash");
    setNotes("");
    setStage("form");
    setLastPaidAmount(0);
    setLastRemainingBalance(0);
    setIsSharingReceipt(false);
    hasNotifiedSuccessRef.current = false;
  }, [balanceDue, initialAmount]);

  const setAmountSanitized = useCallback((value: string) => {
    setAmount(sanitizeAmountInput(value));
  }, []);

  const quickSetAmount = useCallback((next: number) => {
    const safe = Math.max(0, Number(next) || 0);
    setAmount(safe === 0 ? "" : String(Number(safe.toFixed(2))));
  }, []);

  const submit = useCallback(async () => {
    if (!hasBalance || stage !== "form" || isRecording || payAmount <= 0) return;

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
  }, [effectiveBalance, hasBalance, isRecording, mode, notes, onSuccess, payAmount, recordPayment, stage]);

  const shareReceipt = useCallback(async () => {
    setIsSharingReceipt(true);
    try {
      await Share.share({
        message: buildPaymentShareMessage({
          locale: locale.toLowerCase().startsWith("hi") ? "hi" : "en",
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
  }, [customerName, lastPaidAmount, lastRemainingBalance, locale, profile?.business_name, profile?.name]);

  return useMemo(
    () => ({
      modes: MODES,
      amount,
      mode,
      notes,
      stage,
      parsedAmount,
      isFullPaid,
      payAmount,
      remainingBalance,
      hasBalance,
      effectiveBalance,
      canSubmit,
      amountError,
      isRecording,
      isSharingReceipt,
      lastPaidAmount,
      lastRemainingBalance,
      setMode,
      setNotes,
      setAmountSanitized,
      quickSetAmount,
      submit,
      shareReceipt,
      reset,
      setStage,
    }),
    [
      amount,
      mode,
      notes,
      stage,
      parsedAmount,
      isFullPaid,
      payAmount,
      remainingBalance,
      hasBalance,
      effectiveBalance,
      canSubmit,
      amountError,
      isRecording,
      isSharingReceipt,
      lastPaidAmount,
      lastRemainingBalance,
      setAmountSanitized,
      quickSetAmount,
      submit,
      shareReceipt,
      reset,
    ],
  );
}
