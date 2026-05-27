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
        borderTopColor: colors.border,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        flexDirection: "row",
        gap: spacing.sm,
        elevation: 4,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      }}
    >
      {isPaid ? (
        <View style={{ flex: 1, alignItems: "center" }}>
          <Button
            title={sendingEntry ? "Generating…" : "Send Entry"}
            variant="outline"
            onPress={onSendEntry}
            loading={sendingEntry}
            icon={
              <MessageCircle
                size={18}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            style={{ width: "80%" }} // Center the single button
          />
        </View>
      ) : (
        <>
          <View style={{ flex: 1 }}>
            <Button
              title={sendingEntry ? "Generating…" : "Send Entry"}
              variant="outline"
              onPress={onSendEntry}
              loading={sendingEntry}
              icon={
                <MessageCircle
                  size={18}
                  color={colors.primary}
                  strokeWidth={2}
                />
              }
            />
          </View>

          <View style={{ flex: 1 }}>
            <Button
              title="Record Payment"
              onPress={onRecordPayment}
              icon={
                <Wallet size={18} color={colors.surface} strokeWidth={2} />
              }
            />
          </View>
        </>
      )}
    </View>
  );
}