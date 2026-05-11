import { useTheme } from "@/src/utils/ThemeProvider";
import {
  Banknote,
  Landmark,
  QrCode,
  ReceiptText,
} from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import type { PaymentMode } from "./useRecordCustomerPaymentModal";

type Props = {
  mode: PaymentMode;
  modes: PaymentMode[];
  onModeChange: (mode: PaymentMode) => void;
};

type MethodCard = {
  id: string;
  label: string;
  value: PaymentMode;
};

export default function RecordPaymentModeChips({ mode, modes, onModeChange }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  const methodCards = ([
    { id: "cash", label: "Cash", value: "Cash" },
    { id: "upi", label: "UPI", value: "UPI" },
    { id: "bank", label: "Bank", value: "NEFT" },
    { id: "cheque", label: "Cheque", value: "Cheque" },
  ] as MethodCard[]).filter((card) => modes.includes(card.value));

  const modeIcon = (paymentMode: PaymentMode) => {
    switch (paymentMode) {
      case "Cash":
        return Banknote;
      case "UPI":
        return QrCode;
      case "NEFT":
        return Landmark;
      case "Cheque":
      default:
        return ReceiptText;
    }
  };

  return (
    <>
      <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Payment mode</Text>
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
        {methodCards.map((item) => {
          const selected = mode === item.value;
          const Icon = modeIcon(item.value);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onModeChange(item.value)}
              activeOpacity={0.8}
              className="items-center justify-center"
              style={{
                width: "48%",
                marginHorizontal: "1%",
                marginBottom: 8,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.borderLight,
                backgroundColor: selected ? colors.primaryLight : colors.surfaceAlt,
                minHeight: 68,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              }}
            >
              <Icon
                size={18}
                color={selected ? colors.primaryDark : colors.textSecondary}
                strokeWidth={2.2}
              />
              <Text
                style={{
                  color: selected ? colors.primaryDark : colors.textSecondary,
                  fontSize: 13,
                  fontWeight: "700",
                  marginTop: 6,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
