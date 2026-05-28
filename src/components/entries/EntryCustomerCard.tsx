import { getInitials } from "@/src/components/ui/Avatar";
import { Pressable, Text, View } from "react-native";

type Props = {
  customerName: string;
  customerPhone: string;
  onCustomerTap?: () => void;
};

export default function EntryCustomerCard({
  customerName,
  customerPhone,
  onCustomerTap,
}: Props) {
  const initials = getInitials(customerName);

  return (
    <Pressable
      onPress={onCustomerTap}
      style={{
        // Card shadow
        shadowColor: "rgba(17,24,39,1)",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      }}
      className="bg-surface rounded-2xl mx-4 mb-6 px-4 py-4 border border-border active:bg-search"
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View
          className="mr-3 shrink-0"
          style={{
            shadowColor: "rgba(17,24,39,1)",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="h-10 w-10 rounded-full bg-success-bg items-center justify-center">
            <Text className="text-primary text-[15px] font-bold">
              {initials}
            </Text>
          </View>
        </View>

        {/* Name and Phone */}
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-textPrimary"
            numberOfLines={1}
          >
            {customerName}
          </Text>
          <Text className="text-[13px] font-normal text-textSecondary">
            +91 {customerPhone}
          </Text>
        </View>

        {/* Action */}
        <View>
          <Text className="text-primary text-[13px] font-semibold">
            View &rarr;
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
