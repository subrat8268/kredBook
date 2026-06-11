import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useTheme } from "@/src/theme/useTheme";
import type { PersonDetail } from "@/src/types/customer";
import CustomerDetailEmptyState from "./CustomerDetailEmptyState";
import CustomerTransactionRow, { type Transaction } from "./CustomerTransactionRow";
import CustomerTransactionTabs from "./CustomerTransactionTabs";
import type { TxFilter, TxListItem } from "./types";

interface CustomerTransactionTimelineProps {
  customer: PersonDetail;
  balanceState: "overdue" | "pending" | "partial" | "settled" | "advance" | null;
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

  const isNew = !customer.transactions || (customer.transactions || []).length === 0;

  if (listItems.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderDefault,
          },
        ]}
      >
        {!isNew && (
          <>
            <CustomerTransactionTabs
              txFilter={txFilter}
              onChangeFilter={onChangeFilter}
            />
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          </>
        )}
        <CustomerDetailEmptyState
          variant={isNew ? "new_customer" : "filtered_empty"}
          filter={txFilter}
          onAddEntry={onAddEntry}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      <CustomerTransactionTabs
        txFilter={txFilter}
        onChangeFilter={onChangeFilter}
      />

      <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

      <View style={{ backgroundColor: colors.surface }}>
        {groups.map((group, gIndex) => {
          if (!group.txs.length) return null;

          return (
            <View key={`${group.label}-${group.txs[0].key}`}>
              {/* Chronological Date Group Label */}
              <View
                style={[
                  styles.sectionHeader,
                  {
                    backgroundColor: colors.canvas,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionHeaderText,
                    {
                      color: colors.muted,
                      fontFamily: t.fontFamily.bodySemiBold,
                    },
                  ]}
                >
                  {group.label}
                </Text>
              </View>

              <View style={styles.rowsContainer}>
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
            style={[styles.expandButton, { borderTopWidth: 1, borderTopColor: colors.borderSubtle }]}
            onPress={onExpandHistory}
          >
            <Text
              style={[
                styles.expandButtonText,
                { color: colors.primary, fontFamily: t.fontFamily.displaySemiBold },
              ]}
            >
              View Older History ({listItems.length - initialCount} more)
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    alignSelf: "stretch",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  rowsContainer: {
    overflow: "hidden",
  },
  expandButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  expandButtonText: {
    fontSize: 13,
  },
});
