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
  const tabs: { key: TxFilter; label: string }[] = [
    { key: "All", label: "All" },
    { key: "Entries", label: "Entries" },
    { key: "Payments", label: "Payments" },
  ];

  return (
    <View className="px-2 py-2">
      <View className="flex-row rounded-[22px] bg-surface p-1 dark:bg-surface-dark">
        {tabs.map((tab) => {
          const active = txFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChangeFilter(tab.key)}
              className={`flex-1 rounded-[18px] py-3 ${active ? "bg-primary" : ""}`}
            >
              <Text
                className={`text-center text-[16px] font-semibold ${active ? "text-surface" : "text-textSecondary dark:text-textSecondary-dark"}`}
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
