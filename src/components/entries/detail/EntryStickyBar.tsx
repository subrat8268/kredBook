import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Bell, Send, Wallet } from "lucide-react-native";

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
}: {
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="flex-1 flex-row items-center justify-center rounded-full bg-[#16a34a]"
      style={{ height: 52 }}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <>
          <View className="mr-2">{icon}</View>
          <Text className="text-[15px] font-semibold text-white">{title}</Text>
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
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-center rounded-full"
      style={{
        height: 52,
        borderWidth: 1,
        borderColor: overdue ? "#dc2626" : "#e5e7eb",
      }}
    >
      <View className="mr-2">{icon}</View>
      <Text
        className="text-[15px] font-semibold"
        style={{ color: overdue ? "#dc2626" : "#374151" }}
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

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(Math.min(insets.bottom, 12), 4),
        elevation: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      }}
    >
      {isPaid ? (
        <PrimaryButton
          title={sendingEntry ? "Generating…" : "Share Receipt"}
          icon={<Send size={18} color="#ffffff" strokeWidth={2} />}
          loading={sendingEntry}
          onPress={onSendEntry}
        />
      ) : (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 6 }}>
            <PrimaryButton
              title="Record Payment"
              icon={<Wallet size={18} color="#ffffff" strokeWidth={2} />}
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
                  color={isOverdue ? "#dc2626" : "#374151"}
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
