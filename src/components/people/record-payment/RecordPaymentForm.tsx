import RecordPaymentAmountConsole from "./RecordPaymentAmountConsole";
import PaymentOutcomeHint from "./PaymentOutcomeHint";
import { formatINR } from "@/src/utils/format";
import { useTheme } from "@/src/utils/ThemeProvider";
import RecordPaymentModeChips from "./RecordPaymentModeChips";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import Avatar from "@/src/components/ui/Avatar";
import { ChevronDown, ChevronUp, X } from "lucide-react-native";
import type {
  PaymentIntent,
  PaymentMode,
} from "./useRecordCustomerPaymentModal";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  customerName: string;
  onClose: () => void;
  amount: string;
  effectiveBalance: number;
  hasBalance: boolean;
  isFullPaid: boolean;
  remainingBalance: number;
  parsedAmount: number | null;
  paymentIntent: PaymentIntent;
  mode: PaymentMode;
  modes: PaymentMode[];
  notes: string;
  amountError?: string;
  onSelectFull: () => void;
  onSelectPartial: () => void;
  onAmountChange: (value: string) => void;
  onPartialInputFocus?: () => void;
  onModeChange: (mode: PaymentMode) => void;
  onNotesChange: (value: string) => void;
  onNotesFocus?: () => void;
};

export default function RecordPaymentForm({
  customerName,
  onClose,
  amount,
  effectiveBalance,
  hasBalance,
  isFullPaid,
  remainingBalance,
  parsedAmount,
  paymentIntent,
  mode,
  modes,
  notes,
  amountError,
  onSelectFull,
  onSelectPartial,
  onAmountChange,
  onPartialInputFocus,
  onModeChange,
  onNotesChange,
  onNotesFocus,
}: Props) {
  const { spacing, colors, radius, typography } = useTheme();
  const [notesExpanded, setNotesExpanded] = useState(false);

  useEffect(() => {
    if (!notes.trim()) setNotesExpanded(false);
  }, [notes]);

  return (
    <>
      <View className="flex-row justify-between mb-4">
        <View className="flex-row items-center">
          <Avatar name={customerName} size="sm" />
          <View style={{ marginLeft: spacing.sm }}>
            <Text
              style={[
                typography.body,
                { color: colors.textPrimary, fontWeight: "700" },
              ]}
            >
              {customerName}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Balance due: {formatINR(effectiveBalance)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.full,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceAlt,
          }}
        >
          <X size={16} color={colors.textSecondary} strokeWidth={2.4} />
        </Pressable>
      </View>

      <RecordPaymentAmountConsole
        amount={amount}
        paymentIntent={paymentIntent}
        onSelectFull={onSelectFull}
        onSelectPartial={onSelectPartial}
        onAmountChange={onAmountChange}
        onPartialInputFocus={onPartialInputFocus}
        amountError={amountError}
      />

      <PaymentOutcomeHint
        paymentIntent={paymentIntent}
        hasBalance={hasBalance}
        effectiveBalance={effectiveBalance}
        isFullPaid={isFullPaid}
        parsedAmount={parsedAmount}
        remainingBalance={remainingBalance}
      />

      <RecordPaymentModeChips
        mode={mode}
        modes={modes}
        onModeChange={onModeChange}
      />
      <Pressable
        onPress={() => setNotesExpanded((prev) => !prev)}
        className="flex-row items-center"
        style={{ gap: spacing.xs, marginBottom: spacing.sm }}
      >
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, fontWeight: "700" },
          ]}
        >
          {notesExpanded ? "Note (optional)" : "+ Add note"}
        </Text>
        {notesExpanded ? (
          <ChevronUp size={14} color={colors.textSecondary} strokeWidth={2.4} />
        ) : (
          <ChevronDown
            size={14}
            color={colors.textSecondary}
            strokeWidth={2.4}
          />
        )}
      </Pressable>

      {notesExpanded ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.borderLight,
            borderRadius: radius.lg,
            backgroundColor: colors.surfaceAlt,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
          }}
        >
          <BottomSheetTextInput
            value={notes}
            onChangeText={onNotesChange}
            onFocus={onNotesFocus}
            placeholder="Write a note about this payment..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            style={{
              color: colors.textPrimary,
              minHeight: 50,
              textAlignVertical: "top",
              paddingTop: spacing.xs,
              paddingBottom: spacing.xs,
              fontFamily: typography.fontFamilies.regular,
            }}
          />
        </View>
      ) : null}
    </>
  );
}
