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

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
      }}
    >
      <View
        className="flex-row rounded-full bg-white p-2 dark:bg-search-dark"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 1,
          elevation: 1,
        }}
      >
        {(["All", "Entries", "Payments"] as TxFilter[]).map((tab) => {
          const active = txFilter === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => onChangeFilter(tab)}
              className={`flex-1 rounded-full py-2 ${active ? "bg-primary" : ""}`}
            >
              <Text
                className={`text-center text-body font-inter-semibold ${active ? "text-surface" : "text-textSecondary dark:text-textSecondary-dark"}`}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
