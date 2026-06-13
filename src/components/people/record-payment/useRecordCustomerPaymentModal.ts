import { useRecordCustomerPayment } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import { buildPaymentShareMessage } from "@/src/utils/shareTemplates";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Share } from "react-native";

export type PaymentMode = "Cash" | "UPI" | "NEFT" | "Cheque";
export type PaymentIntent = "full" | "partial";
export type ModalStage = "form" | "confirmed" | "queued";

const MODES: PaymentMode[] = ["Cash", "UPI", "NEFT", "Cheque"];

function sanitizeAmountInput(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [intPartRaw, ...rest] = cleaned.split(".");
  const intPart = (intPartRaw || "").replace(/^0+(?=\d)/, "0");
  if (rest.length === 0) return intPart;
  const decPart = rest.join("").slice(0, 2);
  return `${intPart}.${decPart}`;
}

function resolveInitialIntent(outstandingBalance: number, initialAmount?: number): PaymentIntent {
  if (!initialAmount || initialAmount <= 0) return "full";
  return initialAmount >= outstandingBalance ? "full" : "partial";
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
  customerId: string;
  customerName: string;
  outstandingBalance: number;
  initialAmount?: number;
  locale: string;
  onSuccess: (amountPaid?: number) => void;
};

export function useRecordCustomerPaymentModal({
  customerId,
  customerName,
  outstandingBalance,
  initialAmount,
  locale,
  onSuccess,
}: Params) {
  const profile = useAuthStore((s) => s.profile);
  const { recordPayment, isRecording } = useRecordCustomerPayment(profile?.id, customerId);

  const [amount, setAmount] = useState(String(initialAmount ?? outstandingBalance));
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent>(
    resolveInitialIntent(outstandingBalance, initialAmount),
  );
  const [mode, setMode] = useState<PaymentMode>("Cash");
  const [notes, setNotes] = useState("");
  const [lastPartialAmount, setLastPartialAmount] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [stage, setStage] = useState<ModalStage>("form");
  const [lastPaidAmount, setLastPaidAmount] = useState(0);
  const [lastRemainingBalance, setLastRemainingBalance] = useState(0);
  const [isSharingReceipt, setIsSharingReceipt] = useState(false);
  const hasNotifiedSuccessRef = useRef(false);

  const parsedAmount = parseAmount(amount);
  const effectiveBalance = outstandingBalance;
  const hasBalance = effectiveBalance > 0;
  const isPartialOverpay =
    paymentIntent === "partial" &&
    parsedAmount !== null &&
    parsedAmount > effectiveBalance;
  const isFullPaid = hasBalance && (parsedAmount ?? 0) >= effectiveBalance;
  const payAmount =
    !hasBalance || isPartialOverpay
      ? 0
      : isFullPaid
        ? effectiveBalance
        : parsedAmount ?? 0;
  const remainingBalance = Math.max(0, effectiveBalance - (parsedAmount ?? 0));
  const canSubmit =
    !isRecording &&
    stage === "form" &&
    hasBalance &&
    payAmount > 0 &&
    !isPartialOverpay;

  const amountError =
    stage !== "form"
      ? undefined
      : !hasBalance
        ? undefined
        : paymentIntent !== "partial"
          ? undefined
          : !amountTouched && !hasAttemptedSubmit
            ? undefined
            : amount.length === 0 || amount === "."
              ? "Enter amount received"
              : parsedAmount === null
                ? "Enter a valid amount"
                : undefined;

  const reset = useCallback(() => {
    setAmount(String(initialAmount ?? outstandingBalance));
    setPaymentIntent(resolveInitialIntent(outstandingBalance, initialAmount));
    setMode("Cash");
    setNotes("");
    setLastPartialAmount(
      initialAmount && initialAmount > 0 && initialAmount < outstandingBalance
        ? String(Number(initialAmount.toFixed(2)))
        : "",
    );
    setStage("form");
    setLastPaidAmount(0);
    setLastRemainingBalance(0);
    setIsSharingReceipt(false);
    setAmountTouched(false);
    setHasAttemptedSubmit(false);
    hasNotifiedSuccessRef.current = false;
  }, [outstandingBalance, initialAmount]);

  const setAmountSanitized = useCallback((value: string) => {
    const next = sanitizeAmountInput(value);
    setAmount(next);
    setPaymentIntent("partial");
    setLastPartialAmount(next);
    setAmountTouched(true);
  }, []);

  const selectFullPayment = useCallback(() => {
    if (paymentIntent === "partial") {
      setLastPartialAmount(amount);
    }
    setPaymentIntent("full");
    setAmount(String(Number(effectiveBalance.toFixed(2))));
    setHasAttemptedSubmit(false);
  }, [amount, effectiveBalance, paymentIntent]);

  const selectPartialPayment = useCallback(() => {
    const fullAmount = String(Number(effectiveBalance.toFixed(2)));
    setPaymentIntent("partial");
    if (amount === fullAmount) {
      setAmount(lastPartialAmount || "");
    }
    setAmountTouched(Boolean(lastPartialAmount));
    setHasAttemptedSubmit(false);
  }, [amount, effectiveBalance, lastPartialAmount]);

  const submit = useCallback(async () => {
    if (!hasBalance || stage !== "form" || isRecording || payAmount <= 0) {
      setHasAttemptedSubmit(true);
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
        onSuccess(payAmount);
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
      paymentIntent,
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
      selectFullPayment,
      selectPartialPayment,
      submit,
      shareReceipt,
      reset,
      setStage,
    }),
    [
      amount,
      mode,
      notes,
      paymentIntent,
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
      selectFullPayment,
      selectPartialPayment,
      submit,
      shareReceipt,
      reset,
    ],
  );
}
