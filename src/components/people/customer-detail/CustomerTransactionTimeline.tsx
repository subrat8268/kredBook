import type { PersonDetail } from "@/src/types/customer";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Pressable, Text, View } from "react-native";
import CustomerDetailEmptyState from "./CustomerDetailEmptyState";
import CustomerTransactionRow from "./CustomerTransactionRow";
import CustomerTransactionTabs from "./CustomerTransactionTabs";
import type { TxFilter, TxListItem } from "./types";

type Props = {
  customer: PersonDetail;
  visibleListItems: TxListItem[];
  listItems: TxListItem[];
  historyExpanded: boolean;
  initialCount: number;
  onExpandHistory: () => void;
  onAddEntry: () => void;
  onRecordPayment?: () => void;
  txFilter: TxFilter;
  onChangeFilter: (tab: TxFilter) => void;
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
  txFilter,
  onChangeFilter,
}: Props) {
  const { colors } = useTheme();

  const groups: {
    label: string;
    txs: Extract<TxListItem, { kind: "tx" }>[];
  }[] = [];
  let currentGroup: {
    label: string;
    txs: Extract<TxListItem, { kind: "tx" }>[];
  } | null = null;

  for (const item of visibleListItems) {
    if (item.kind === "header") {
      currentGroup = { label: item.label, txs: [] };
      groups.push(currentGroup);
      continue;
    }

    if (!currentGroup) {
      currentGroup = { label: "", txs: [] };
      groups.push(currentGroup);
    }

    currentGroup.txs.push(item);
  }

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
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 12,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: "hidden",
      }}
    >
      <CustomerTransactionTabs
        txFilter={txFilter}
        onChangeFilter={onChangeFilter}
      />

      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
        }}
      />

      <View className="pb-2" style={{ backgroundColor: colors.surface }}>
        {groups.map((group) => {
          if (!group.txs.length) return null;

          return (
            <View key={`${group.label}-${group.txs[0].key}`}>
              <View
                className="pl-4 py-3"
                style={{
                  backgroundColor: colors.canvas,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: colors.muted,
                  }}
                >
                  {group.label}
                </Text>
              </View>

              <View className="overflow-hidden rounded-[14px] border border-transparent">
                {group.txs.map((tx, index) => (
                  <View
                    key={tx.key}
                    style={{
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor:
                        index === 0 ? "transparent" : colors.borderSubtle,
                    }}
                  >
                    <CustomerTransactionRow tx={tx.data} />
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {!historyExpanded && listItems.length > initialCount ? (
          <Pressable
            className="w-full items-center py-4"
            onPress={onExpandHistory}
          >
            <Text className="text-[13px] font-semibold text-primary">
              View Older History ({listItems.length - initialCount} more)
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
