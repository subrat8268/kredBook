import { getInitials } from "@/src/components/ui/Avatar";
import { MessageCircle, Phone } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/^(\+91|91)/, "").trim();
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return `+91 ${cleaned}`;
}

type Props = {
  customerName: string;
  customerPhone: string;
  onCustomerTap?: () => void;
  onCallPress?: () => void;
  onChatPress?: () => void;
  isDeleted?: boolean;
};

export default function EntryCustomerCard({
  customerName,
  customerPhone,
  onCustomerTap,
  onCallPress,
  onChatPress,
  isDeleted = false,
}: Props) {
  const displayName =
    isDeleted && !customerName ? "[Deleted Customer]" : customerName;
  const initials = getInitials(displayName);

  return (
    <Pressable
      onPress={isDeleted ? undefined : onCustomerTap}
      style={({ pressed }) => [
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        },
        pressed && !isDeleted && { backgroundColor: "#f9fafb" },
      ]}
      className="flex-row items-center justify-between bg-white rounded-lg mx-4 p-4 mb-4 border border-[#e5e7eb]"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 rounded-full bg-[#00873a33] items-center justify-center">
          <Text
            style={{ fontFamily: "PlusJakartaSans_700Bold" }}
            className="font-bold text-[#006b2c] text-base text-center leading-[22.4px]"
          >
            {initials}
          </Text>
        </View>

        <View className="flex-col items-start">
          <Text
            className={`font-semibold text-[#121c2a] text-base leading-[22.4px] ${isDeleted ? "text-[#9ca3af]" : ""}`}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text className="text-[#3e4a3d] text-xs leading-[16.8px] tracking-wide">
            {formatPhone(customerPhone)}
          </Text>
        </View>
      </View>

      {!isDeleted && (
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onCallPress}
            hitSlop={8}
            accessibilityRole="button"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="h-10 w-10 rounded-full bg-[#dcfce7] items-center justify-center"
          >
            <Phone size={16} color="#16a34a" />
          </Pressable>
          <Pressable
            onPress={onChatPress}
            hitSlop={8}
            accessibilityRole="button"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            className="h-10 w-10 rounded-full bg-[#dcfce7] items-center justify-center"
          >
            <MessageCircle size={16} color="#16a34a" />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
