import type { PersonDetail } from "@/src/types/customer";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Pressable, Text, View } from "react-native";
import CustomerDetailEmptyState from "./CustomerDetailEmptyState";
import CustomerTransactionRow from "./CustomerTransactionRow";
import type { TxListItem } from "./types";

type Props = {
  customer: PersonDetail;
  visibleListItems: TxListItem[];
  listItems: TxListItem[];
  historyExpanded: boolean;
  initialCount: number;
  onExpandHistory: () => void;
  onAddEntry: () => void;
  onRecordPayment?: () => void;
};

export default function CustomerTransactionTimeline({
  customer,
  visibleListItems,
  listItems,
  historyExpanded,
  initialCount,
  onExpandHistory,
  onAddEntry,
  onRecordPayment,
}: Props) {
  const { colors } = useTheme();

  if (listItems.length === 0) {
    return (
      <CustomerDetailEmptyState
        customer={customer}
        onAddEntry={onAddEntry}
        onRecordPayment={onRecordPayment}
      />
    );
  }

  return (
    <View className="pb-2" style={{ backgroundColor: colors.background }}>
      {visibleListItems.map((item) => {
        if (item.kind === "header") {
          return (
            <Text
              key={item.key}
              className="text-caption font-inter-bold uppercase tracking-widest text-textSecondary dark:text-textSecondary-dark"
              style={{
                paddingHorizontal: 16,
                paddingTop: 20,
                paddingBottom: 8,
                fontSize: 11,
                letterSpacing: 1.2,
                color: colors.textSecondary,
                opacity: 0.6,
              }}
            >
              {item.label}
            </Text>
          );
        }
        return (
          <CustomerTransactionRow key={item.key} tx={item.data} />
        );
      })}

      {!historyExpanded && listItems.length > initialCount ? (
        <Pressable className="mx-4 mt-2 items-center rounded-lg bg-primaryLight/30 py-2.5 dark:bg-primary-dark/20" onPress={onExpandHistory}>
          <Text className="text-body font-inter-semibold text-primary">View Older History ({listItems.length - initialCount} more)</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
