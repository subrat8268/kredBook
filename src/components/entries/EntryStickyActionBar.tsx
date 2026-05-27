import { useTheme } from "@/src/utils/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import Button from "@/src/components/ui/Button";
import { MessageCircle, Wallet } from "lucide-react-native";

type Props = {
  isPaid: boolean;
  sendingEntry: boolean;
  onSendEntry: () => void;
  onRecordPayment: () => void;
};

export default function EntryStickyActionBar({
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
        borderTopColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: Math.max(Math.min(insets.bottom, 12), 4),
        flexDirection: "row",
        gap: spacing.sm,
        elevation: 4,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      }}
    >
      <View style={{ flex: 1 }}>
        <Button
          title={sendingEntry ? "Generating…" : "Send Entry"}
          variant="outline"
          onPress={onSendEntry}
          loading={sendingEntry}
          icon={
            <MessageCircle size={18} color={colors.primary} strokeWidth={2} />
          }
        />
      </View>

      {!isPaid && (
        <View style={{ flex: 1 }}>
          <Button
            title="Record Payment"
            onPress={onRecordPayment}
            icon={<Wallet size={18} color={colors.surface} strokeWidth={2} />}
          />
        </View>
      )}
    </View>
  );
}
