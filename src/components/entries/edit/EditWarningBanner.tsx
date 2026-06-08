import React from "react";
import { Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { useTheme } from "@/src/theme/useTheme";

type Props = {
  message?: string; // defaults to the standard edit warning message
};

export default function EditWarningBanner({
  message = "Editing will update the person's ledger and payment history",
}: Props) {
  const t = useTheme();

  return (
    <View
      style={{
        backgroundColor: t.colors.pendingSurface,
        borderLeftWidth: 4,
        borderLeftColor: t.colors.pending,
      }}
      className="flex-row items-center p-3"
    >
      <AlertCircle size={20} color={t.colors.pending} style={{ flexShrink: 0 }} />
      <Text
        style={{
          marginLeft: 8,
          flex: 1,
          fontSize: 13,
          color: t.colors.ink,
          lineHeight: 18,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
