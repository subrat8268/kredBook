import { useTheme } from "@/src/utils/ThemeProvider";
import * as Haptics from "expo-haptics";
import { Text, TouchableOpacity, View } from "react-native";
import type { NumpadKey } from "@/src/utils/numpad";

type Props = {
  onAppendKey: (key: Exclude<NumpadKey, "⌫">) => void;
  onBackspace: () => void;
};

const ROWS: readonly (readonly NumpadKey[])[] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
];

export default function RecordPaymentNumpad({ onAppendKey, onBackspace }: Props) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
      {ROWS.map((row) => (
        <View key={row.join("")} className="flex-row" style={{ gap: spacing.sm }}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              activeOpacity={0.75}
              className="flex-1 items-center justify-center"
              style={{
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                minHeight: 56,
              }}
              onPress={() => {
                if (key === "⌫") {
                  onBackspace();
                } else {
                  onAppendKey(key);
                }
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onLongPress={() => {
                if (key !== "⌫") return;
                onBackspace();
                onBackspace();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700" }}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
