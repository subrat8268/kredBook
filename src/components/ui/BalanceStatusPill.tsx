import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { CheckCircle2, Clock3 } from "lucide-react-native";
import { Text, View } from "react-native";

type Props = {
  state: "fullyPaid" | "remaining" | "noBalance" | "queued";
  remainingAmount?: number;
};

export default function BalanceStatusPill({ state, remainingAmount = 0 }: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  const styles =
    state === "fullyPaid"
      ? { bg: colors.successBg, fg: colors.successDark, bordered: false }
      : state === "queued"
        ? { bg: colors.warningBg, fg: colors.warning, bordered: false }
        : state === "remaining"
          ? { bg: colors.surface, fg: colors.textSecondary, bordered: true }
          : { bg: colors.surface, fg: colors.textSecondary, bordered: true };

  const label =
    state === "fullyPaid"
      ? "Fully paid"
      : state === "queued"
        ? "Queued for sync"
        : state === "remaining"
          ? `Remaining ${formatINR(remainingAmount)}`
          : "No balance due";

  return (
    <View
      className="flex-row items-center"
      style={{
        borderRadius: radius.full,
        backgroundColor: styles.bg,
        borderWidth: styles.bordered ? 1 : 0,
        borderColor: colors.borderLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        gap: spacing.xs,
      }}
    >
      {state === "fullyPaid" ? <CheckCircle2 size={14} color={styles.fg} strokeWidth={2.4} /> : null}
      {state === "queued" ? <Clock3 size={13} color={styles.fg} strokeWidth={2.4} /> : null}
      <Text style={[typography.caption, { color: styles.fg, fontWeight: state === "fullyPaid" ? "700" : "600" }]}>{label}</Text>
    </View>
  );
}
