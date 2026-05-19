import SyncStatus from "@/src/components/feedback/SyncStatus";
import { Pressable, Text, View } from "react-native";
import type { TxFilter } from "./types";

type Props = {
  txFilter: TxFilter;
  onChangeFilter: (tab: TxFilter) => void;
};

export default function CustomerTransactionTabs({ txFilter, onChangeFilter }: Props) {
  return (
    <View className="px-3 pb-2 pt-3">
      <View className="flex-row rounded-full bg-search p-1 dark:bg-search-dark">
        {(["All", "Entries", "Payments"] as TxFilter[]).map((tab) => {
          const active = txFilter === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => onChangeFilter(tab)}
              className={`flex-1 rounded-full py-2 ${active ? "bg-primary" : ""}`}
            >
              <Text className={`text-center text-body font-inter-semibold ${active ? "text-surface" : "text-textSecondary dark:text-textSecondary-dark"}`}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-2 flex-row items-center justify-start">
        <SyncStatus variant="compact" />
      </View>
    </View>
  );
}
