import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Bell, Send, Wallet } from "lucide-react-native";
import { useTheme } from "@/src/theme/useTheme";

type Props = {
  isPaid: boolean;
  isOverdue: boolean;
  sendingEntry: boolean;
  onSendEntry: () => void;
  onRecordPayment: () => void;
  onRemind: () => void;
};

function PrimaryButton({
  title,
  icon,
  loading,
  onPress,
  isFlex = true,
}: {
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  onPress: () => void;
  isFlex?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={{
        flex: isFlex ? 1 : undefined,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9999,
        backgroundColor: t.colors.primary,
        // Match reference shadow [0px_4px_12px_0px_rgba(22,163,74,0.30)]
        shadowColor: t.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {loading ? (
        <ActivityIndicator color={t.colors.onPrimary} size="small" />
      ) : (
        <>
          <View style={{ marginRight: 8 }}>{icon}</View>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: t.colors.onPrimary,
              fontFamily: t.fontFamily.bodySemiBold,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function SecondaryButton({
  title,
  icon,
  overdue,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  overdue?: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 128,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: overdue ? t.colors.overdueBorder : t.colors.borderDefault,
        backgroundColor: t.colors.surface,
        // Match reference shadow [0px_1px_2px_0px_rgba(0,0,0,0.05)]
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View style={{ marginRight: 8 }}>{icon}</View>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: overdue ? t.colors.overdue : t.colors.body,
          fontFamily: t.fontFamily.bodySemiBold,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export default function EntryStickyBar({
  isPaid,
  isOverdue,
  sendingEntry,
  onSendEntry,
  onRecordPayment,
  onRemind,
}: Props) {
  const insets = useSafeAreaInsets();
  const t = useTheme();

  // Sticky bar container shadow
  const shadowProps = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: t.colors.surface,
        borderTopWidth: 1,
        borderTopColor: t.colors.borderSubtle,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(Math.min(insets.bottom, 12), 4),
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        ...shadowProps,
      }}
    >
      {isPaid ? (
        <PrimaryButton
          title={sendingEntry ? "Generating…" : "Share Receipt"}
          icon={<Send size={18} color={t.colors.onPrimary} strokeWidth={2} />}
          loading={sendingEntry}
          onPress={onSendEntry}
          isFlex={true}
        />
      ) : (
        <>
          <SecondaryButton
            title="Remind"
            overdue={isOverdue}
            icon={
              <Bell
                size={18}
                color={isOverdue ? t.colors.overdue : t.colors.body}
                strokeWidth={2}
              />
            }
            onPress={onRemind}
          />
          <PrimaryButton
            title="Record Payment"
            icon={<Wallet size={18} color={t.colors.onPrimary} strokeWidth={2} />}
            onPress={onRecordPayment}
            isFlex={true}
          />
        </>
      )}
    </View>
  );
}
