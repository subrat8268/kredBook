import { getInitials } from "@/src/components/ui/Avatar";
import { Lock } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/src/theme/useTheme";

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
  const t = useTheme();
  const initials = getInitials(customerName);

  return (
    <View
      style={{
        backgroundColor: t.colors.surface,
        borderColor: t.colors.borderDefault,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      className="flex-col justify-start items-start p-4 mx-4 mt-4 mb-3 rounded-xl"
    >
      {/* Label Row */}
      <View className="w-full flex-col justify-start items-start mb-2">
        <Text style={{ color: t.colors.muted }} className="w-full text-sm font-normal leading-5">
          Person (cannot be changed)
        </Text>
      </View>

      {/* Info & Lock Row */}
      <View className="w-full flex-row justify-between items-center">
        <View className="flex-row items-center gap-3 flex-1">
          {/* Avatar */}
          <View
            style={{ backgroundColor: t.colors.primaryBorderFill }}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Text
              style={{
                fontFamily: t.fontFamily.display,
                color: t.colors.primaryActive,
              }}
              className="text-sm font-bold text-center"
            >
              {initials}
            </Text>
          </View>

          {/* Details */}
          <View className="flex-col flex-1">
            <Text
              style={{ color: t.colors.ink }}
              className="text-base font-semibold leading-6"
              numberOfLines={1}
            >
              {customerName}
            </Text>
            <Text style={{ color: t.colors.muted }} className="text-sm font-normal leading-6">
              {formatPhone(customerPhone)}
            </Text>
          </View>
        </View>

        {/* Lock Icon */}
        <View className="flex-col justify-start items-start shrink-0">
          <Lock size={16} color={t.colors.faint} strokeWidth={1.5} />
        </View>
      </View>
    </View>
  );
}
