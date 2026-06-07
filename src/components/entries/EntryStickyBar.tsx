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
  disabled,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-1 flex-row items-center justify-center rounded-xl h-12 active:opacity-90 ${
        disabled ? "bg-paid-surface opacity-60" : "bg-primary"
      }`}
    >
      {loading ? (
        <ActivityIndicator color={disabled ? t.colors.paidText : t.colors.onPrimary} size="small" />
      ) : (
        <>
          <View className="mr-2">{icon}</View>
          <Text
            style={{ fontFamily: t.fontFamily.bodySemiBold }}
            className={`text-[15px] font-semibold ${
              disabled ? "text-paid-text" : "text-on-primary"
            }`}
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
      className={`flex-row items-center justify-center rounded-xl h-12 bg-surface border active:opacity-90 ${
        overdue ? "border-overdue" : "border-border-default"
      }`}
    >
      <View className="mr-2">{icon}</View>
      <Text
        style={{
          fontFamily: t.fontFamily.bodyMedium,
          color: overdue ? t.colors.overdueText : t.colors.ink,
        }}
        className="text-[15px] font-semibold"
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
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 4),
        elevation: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      }}
      className="bg-surface border-t border-border-subtle"
    >
      {isPaid ? (
        <PrimaryButton
          title={sendingEntry ? "Generating…" : "Share Receipt"}
          icon={<Send size={18} color={t.colors.onPrimary} strokeWidth={2} />}
          loading={sendingEntry}
          onPress={onSendEntry}
        />
      ) : (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 6 }}>
            <PrimaryButton
              title="Record Payment"
              icon={<Wallet size={18} color={t.colors.onPrimary} strokeWidth={2} />}
              onPress={onRecordPayment}
            />
          </View>
          <View style={{ flex: 4 }}>
            <SecondaryButton
              title="Remind"
              overdue={isOverdue}
              icon={
                <Bell
                  size={18}
                  color={isOverdue ? t.colors.overdueText : t.colors.ink}
                  strokeWidth={2}
                />
              }
              onPress={onRemind}
            />
          </View>
        </View>
      )}
    </View>
  );
}
