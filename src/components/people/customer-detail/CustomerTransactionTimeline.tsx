import type { PersonDetail } from "@/src/types/customer";
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
    <View className="pb-2">
      {visibleListItems.map((item, index) => {
        if (item.kind === "header") {
          return (
            <Text
              key={item.key}
              className="px-4 pb-1.5 pt-3.5 text-caption font-inter-bold uppercase tracking-widest text-textSecondary dark:text-textSecondary-dark"
            >
              {item.label}
            </Text>
          );
        }

        const next = visibleListItems[index + 1];
        const withBorder = !!next && next.kind === "tx";
        return (
          <View key={item.key} className="px-4">
            <CustomerTransactionRow tx={item.data} withBorder={withBorder} />
          </View>
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
