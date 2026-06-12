import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/src/theme/useTheme";
import type { PersonDetail } from "@/src/types/customer";
import CustomerDetailEmptyState from "./CustomerDetailEmptyState";
import CustomerTransactionRow, {
  type Transaction,
} from "./CustomerTransactionRow";
import CustomerTransactionTabs from "./CustomerTransactionTabs";
import type { TxFilter, TxListItem } from "./types";

interface CustomerTransactionTimelineProps {
  customer: PersonDetail;
  balanceState:
    | "overdue"
    | "pending"
    | "partial"
    | "settled"
    | "advance"
    | null;
  visibleListItems: TxListItem[];
  listItems: TxListItem[];
  historyExpanded: boolean;
  initialCount: number;
  onExpandHistory: () => void;
  onAddEntry: () => void;
  txFilter: TxFilter;
  onChangeFilter: (tab: TxFilter) => void;
  onPressTx: (tx: Transaction) => void;
}

export default function CustomerTransactionTimeline({
  customer,
  balanceState,
  visibleListItems,
  listItems,
  historyExpanded,
  initialCount,
  onExpandHistory,
  onAddEntry,
  txFilter,
  onChangeFilter,
  onPressTx,
}: CustomerTransactionTimelineProps) {
  const t = useTheme();
  const { colors } = t;

  // Group visible items by date headers
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

  // Fix #6: use orders.length to determine new customer — not transactions
  // (a customer can have orders with no payments, making transactions non-empty)
  const isNew = (customer.orders || []).length === 0;

  return (
    <View
      className="border mx-4 mb-3 rounded-2xl overflow-hidden self-stretch"
      style={{
        borderColor: colors.borderDefault,
        backgroundColor: colors.surface,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {listItems.length === 0 ? (
        <>
          {!isNew && (
            <CustomerTransactionTabs
              txFilter={txFilter}
              onChangeFilter={onChangeFilter}
            />
          )}
          <CustomerDetailEmptyState
            variant={isNew ? "new_customer" : "filtered_empty"}
            filter={txFilter}
            onAddEntry={onAddEntry}
          />
        </>
      ) : (
        <>
          <CustomerTransactionTabs
            txFilter={txFilter}
            onChangeFilter={onChangeFilter}
          />

          <View style={{ backgroundColor: colors.surface }}>
            {groups.map((group, gIndex) => {
              if (!group.txs.length) return null;

              return (
                // Fix #8: use gIndex as key to prevent collisions on empty group labels
                <View key={`group-${gIndex}`}>
                  {/* Chronological Date Group Label */}
                  <View
                    className="self-stretch px-4 py-2"
                    style={{
                      backgroundColor: colors.canvas,
                    }}
                  >
                    <Text
                      className="font-inter-bold text-[11px] tracking-wider uppercase"
                      style={{
                        color: colors.muted,
                        lineHeight: 16,
                      }}
                    >
                      {group.label}
                    </Text>
                  </View>

                  <View className="overflow-hidden">
                    {group.txs.map((tx, index) => (
                      <View
                        key={tx.key}
                        style={{
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderTopColor: colors.borderSubtle,
                        }}
                      >
                        <CustomerTransactionRow
                          tx={tx.data}
                          orders={customer.orders || []}
                          balanceState={balanceState}
                          onPress={() => onPressTx(tx.data)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {/* Pagination Trigger */}
            {!historyExpanded && listItems.length > initialCount ? (
              <Pressable
                className="w-full items-center justify-center py-4 border-t"
                style={{ borderTopColor: colors.borderSubtle }}
                onPress={onExpandHistory}
              >
                <Text
                  className="text-[13px] font-inter-semibold"
                  style={{
                    color: colors.primary,
                  }}
                >
                  View Older History ({listItems.length - initialCount} more)
                </Text>
              </Pressable>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
}
