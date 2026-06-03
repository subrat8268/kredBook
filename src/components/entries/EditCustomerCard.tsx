import { getInitials } from "@/src/components/ui/Avatar";
import { Lock } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  customerName: string;
  customerPhone?: string | null;
};

function formatPhone(phone?: string | null): string {
  if (!phone) return "No phone number";
  const cleaned = phone.replace(/^(\+91|91)/, "").trim();
  return `+91 ${cleaned}`;
}

export default function EditCustomerCard({
  customerName,
  customerPhone,
}: Props) {
  const initials = getInitials(customerName);

  return (
    <View
      className="flex-col justify-start items-start bg-white p-4 mx-4 mt-4 mb-3 rounded-xl border border-[#bdcaba]/30"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Label Row */}
      <View className="w-full flex-col justify-start items-start mb-2">
        <Text className="w-full text-[#3e4a3d] text-sm font-normal leading-5">
          Person (cannot be changed)
        </Text>
      </View>

      {/* Info & Lock Row */}
      <View className="w-full flex-row justify-between items-center">
        <View className="flex-row items-center gap-3 flex-1">
          {/* Avatar */}
          <View className="w-10 h-10 rounded-full bg-[#00873a] items-center justify-center">
            <Text
              style={{ fontFamily: "PlusJakartaSans_700Bold" }}
              className="text-[#f7fff2] text-sm font-bold text-center"
            >
              {initials}
            </Text>
          </View>

          {/* Details */}
          <View className="flex-col flex-1">
            <Text
              className="text-[#121c2a] text-base font-semibold leading-6"
              numberOfLines={1}
            >
              {customerName}
            </Text>
            <Text className="text-[#3e4a3d] text-sm font-normal leading-6">
              {formatPhone(customerPhone)}
            </Text>
          </View>
        </View>

        {/* Lock Icon */}
        <View className="flex-col justify-start items-start shrink-0">
          <Lock size={16} color="#6e7b6c" strokeWidth={1.5} />
        </View>
      </View>
    </View>
  );
}
