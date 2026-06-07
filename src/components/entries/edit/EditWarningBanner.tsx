import React from "react";
import { Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

type Props = {
  message?: string; // defaults to the standard edit warning message
};

export default function EditWarningBanner({
  message = "Editing will update the person's ledger and payment history",
}: Props) {
  return (
    <View
      className="flex-row items-center p-3 bg-[#fffbeb]"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: "#f59e0b",
      }}
    >
      <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
      <Text
        style={{
          marginLeft: 8,
          flex: 1,
          fontSize: 13,
          color: "#111827",
          lineHeight: 18,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
