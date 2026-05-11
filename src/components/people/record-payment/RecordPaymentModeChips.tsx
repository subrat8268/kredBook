import { useTheme } from "@/src/utils/ThemeProvider";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import type { PaymentMode } from "./useRecordCustomerPaymentModal";

type Props = {
  mode: PaymentMode;
  modes: PaymentMode[];
  onModeChange: (mode: PaymentMode) => void;
};

export default function RecordPaymentModeChips({ mode, modes, onModeChange }: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <>
      <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Payment mode</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs, paddingBottom: spacing.xs }}>
        {modes.map((item) => {
          const selected = mode === item;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => onModeChange(item)}
              activeOpacity={0.8}
              style={{
                borderRadius: radius.full,
                borderWidth: selected ? 1 : 0,
                borderColor: colors.success,
                backgroundColor: selected ? colors.successBg : colors.surfaceAlt,
                paddingHorizontal: spacing.sm,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: selected ? colors.successDark : colors.textSecondary, fontSize: 13, fontWeight: "700" }}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}
