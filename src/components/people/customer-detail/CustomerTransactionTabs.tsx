import { useTheme } from "@/src/utils/ThemeProvider";
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
    <View className="px-2 py-2">
      <View className="flex-row gap-2">
        {tabs.map((tab) => {
          const active = txFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChangeFilter(tab.key)}
              className="flex-1 rounded-full py-2.5"
              style={{
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.surfaceRaised,
              }}
            >
              <Text
                className="text-center text-[15px] font-semibold"
                style={{
                  color: active ? "#ffffff" : colors.muted,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
