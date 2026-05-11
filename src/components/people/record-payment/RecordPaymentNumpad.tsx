import { useTheme } from "@/src/utils/ThemeProvider";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import type { NumpadKey } from "@/src/utils/numpad";
import { Delete } from "lucide-react-native";

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
    <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
      {ROWS.map((row) => (
        <View key={row.join("")} className="flex-row" style={{ gap: spacing.xs }}>
          {row.map((key) => (
            <Pressable
              key={key}
              className="flex-1 items-center justify-center"
              style={({ pressed }) => ({
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: pressed ? colors.border : colors.borderLight,
                backgroundColor: pressed ? colors.borderLight : colors.surfaceAlt,
                minHeight: 46,
              })}
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
              {key === "⌫" ? (
                <Delete size={19} color={colors.textPrimary} strokeWidth={2.2} />
              ) : (
                <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700", fontVariant: ["tabular-nums"] }}>{key}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
