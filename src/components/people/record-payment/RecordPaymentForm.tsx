import { useTheme } from "@/src/utils/ThemeProvider";
import PaymentContextCard from "./PaymentContextCard";
import PaymentSheetHeader from "./PaymentSheetHeader";
import RecordPaymentAmountConsole from "./RecordPaymentAmountConsole";
import RecordPaymentIntentToggle from "./RecordPaymentIntentToggle";
import RecordPaymentModeChips from "./RecordPaymentModeChips";
import RecordPaymentNotesDisclosure from "./RecordPaymentNotesDisclosure";
import RecordPaymentNumpad from "./RecordPaymentNumpad";
import type { PaymentIntent, PaymentMode } from "./useRecordCustomerPaymentModal";
import { View } from "react-native";

type Props = {
  customerName: string;
  amount: string;
  effectiveBalance: number;
  hasBalance: boolean;
  isFullPaid: boolean;
  remainingBalance: number;
  paymentIntent: PaymentIntent;
  mode: PaymentMode;
  modes: PaymentMode[];
  notes: string;
  onSelectFull: () => void;
  onSelectPartial: () => void;
  onAppendAmountKey: (value: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | ".") => void;
  onBackspaceAmount: () => void;
  onModeChange: (mode: PaymentMode) => void;
  onNotesChange: (value: string) => void;
};

export default function RecordPaymentForm({
  customerName,
  amount,
  effectiveBalance,
  hasBalance,
  isFullPaid,
  remainingBalance,
  paymentIntent,
  mode,
  modes,
  notes,
  onSelectFull,
  onSelectPartial,
  onAppendAmountKey,
  onBackspaceAmount,
  onModeChange,
  onNotesChange,
}: Props) {
  const { spacing } = useTheme();

  return (
    <>
      <PaymentSheetHeader customerName={customerName} />
      <PaymentContextCard customerName={customerName} effectiveBalance={effectiveBalance} />

      <RecordPaymentAmountConsole
        amount={amount}
        hasBalance={hasBalance}
        isFullPaid={isFullPaid}
        remainingBalance={remainingBalance}
      />

      <RecordPaymentIntentToggle
        paymentIntent={paymentIntent}
        onSelectFull={onSelectFull}
        onSelectPartial={onSelectPartial}
      />

      <RecordPaymentNumpad onAppendKey={onAppendAmountKey} onBackspace={onBackspaceAmount} />

      <RecordPaymentModeChips mode={mode} modes={modes} onModeChange={onModeChange} />

      <RecordPaymentNotesDisclosure notes={notes} onNotesChange={onNotesChange} />

      <View style={{ height: spacing.sm }} />
    </>
  );
}
