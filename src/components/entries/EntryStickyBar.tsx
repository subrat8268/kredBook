import { useTheme } from "@/src/utils/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import Button from "@/src/components/ui/Button";
import { Send, Wallet } from "lucide-react-native";

type Props = {
  isPaid: boolean;
  sendingEntry: boolean;
  onSendEntry: () => void;
  onRecordPayment: () => void;
};

export default function EntryStickyBar({
  isPaid,
  sendingEntry,
  onSendEntry,
  onRecordPayment,
}: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border + "60",
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        flexDirection: "row",
        gap: spacing.sm,
        elevation: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: colors.primary + "08",
        }}
      />
      {isPaid ? (
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ width: "80%" }}>
            <Button
              title={sendingEntry ? "Generating…" : "Send Receipt"}
              variant="primary"
              onPress={onSendEntry}
              loading={sendingEntry}
              icon={<Send size={18} color={colors.surface} strokeWidth={2} />}
              fullWidth
            />
          </View>
        </View>
      ) : (
        <>
          <View style={{ flex: 1 }}>
            <Button
              title="Record Payment"
              variant="primary"
              onPress={onRecordPayment}
              icon={<Wallet size={18} color={colors.surface} strokeWidth={2} />}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Button
              title={sendingEntry ? "Generating…" : "Send Entry"}
              variant="outline"
              onPress={onSendEntry}
              loading={sendingEntry}
              icon={<Send size={18} color={colors.primary} strokeWidth={2} />}
            />
          </View>
        </>
      )}
    </View>
  );
}