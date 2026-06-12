import { useTheme } from "@/src/theme/useTheme";
import { Pressable, Text, View } from "react-native";
import type { TxFilter } from "./types";

type Props = {
  txFilter: TxFilter;
  onChangeFilter: (tab: TxFilter) => void;
};

export default function CustomerTransactionTabs({
  txFilter,
  onChangeFilter,
}: Props) {
  const { colors } = useTheme();
  const tabs: { key: TxFilter; label: string }[] = [
    { key: "All", label: "All" },
    { key: "Entries", label: "Entries" },
    { key: "Payments", label: "Payments" },
  ];

  return (
    <View
      className="self-stretch flex-row p-4 border-b"
      style={{
        borderBottomColor: colors.borderSubtle,
        gap: 8,
      }}
    >
      {tabs.map((tab) => {
        const active = txFilter === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChangeFilter(tab.key)}
            className="flex-1 py-1.5 rounded-full"
            style={{
              backgroundColor: active ? colors.primary : "transparent",
            }}
          >
            <Text
              className="text-center text-sm font-inter-semibold"
              style={{
                color: active ? "#ffffff" : colors.muted,
                lineHeight: 20,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
