import React, { useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "@/src/theme/useTheme";
import type { PersonDetail } from "@/src/types/customer";
import CustomerDetailEmptyState from "./CustomerDetailEmptyState";
import CustomerTransactionRow, {
  type Transaction,
} from "./CustomerTransactionRow";
import CustomerTransactionTabs from "./CustomerTransactionTabs";
import type { TxFilter, TxListItem } from "./types";

const EMPTY_ARRAY: any[] = [];
const ITEM_ESTIMATED_SIZE = 72;
const TAB_HEIGHT = 44;
const FOOTER_HEIGHT = 56;
const MAX_LIST_HEIGHT = 800;

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
  visibleCount: number;
  initialCount: number;
  onExpandHistory: () => void;
  onAddEntry: () => void;
  txFilter: TxFilter;
  onChangeFilter: (tab: TxFilter) => void;
  onPressTx: (tx: Transaction) => void;
}

const CustomerTransactionTimeline = React.memo(function CustomerTransactionTimeline({
  customer,
  balanceState,
  visibleListItems,
  listItems,
  visibleCount,
  initialCount,
  onExpandHistory,
  onAddEntry,
  txFilter,
  onChangeFilter,
  onPressTx,
}: CustomerTransactionTimelineProps) {
  const t = useTheme();
  const { colors } = t;

  const isNew = (customer.orders ?? EMPTY_ARRAY).length === 0;
  const hasItems = listItems.length > 0;
  const showTabs = hasItems || !isNew;

  const renderItem = useCallback(({ item }: { item: TxListItem }) => {
    if (item.kind === "header") {
      return (
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
            {item.label}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.borderSubtle,
        }}
      >
        <CustomerTransactionRow
          tx={item.data}
          orders={customer.orders ?? EMPTY_ARRAY}
          balanceState={balanceState}
          onPress={() => onPressTx(item.data)}
        />
      </View>
    );
  }, [customer.orders, colors, balanceState, onPressTx]);

  const listHeaderComponent = useMemo(() => {
    if (!showTabs) return null;
    return (
      <CustomerTransactionTabs
        txFilter={txFilter}
        onChangeFilter={onChangeFilter}
      />
    );
  }, [showTabs, txFilter, onChangeFilter]);

  const listEmptyComponent = useMemo(() => (
    <CustomerDetailEmptyState
      variant={isNew ? "new_customer" : "filtered_empty"}
      filter={txFilter}
      onAddEntry={onAddEntry}
    />
  ), [isNew, txFilter, onAddEntry]);

  const listFooterComponent = useMemo(() => {
    if (hasItems && visibleCount < listItems.length) {
      const remaining = listItems.length - visibleCount;
      return (
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
            View Older History ({remaining} more)
          </Text>
        </Pressable>
      );
    }
    return null;
  }, [hasItems, visibleCount, listItems.length, colors.borderSubtle, colors.primary, onExpandHistory]);

  const flashListHeight = useMemo(() => {
    const itemsHeight = visibleListItems.length * ITEM_ESTIMATED_SIZE;
    const tabsHeight = showTabs ? TAB_HEIGHT : 0;
    const footerHeight = listFooterComponent ? FOOTER_HEIGHT : 0;
    return Math.min(itemsHeight + tabsHeight + footerHeight, MAX_LIST_HEIGHT);
  }, [visibleListItems.length, showTabs, listFooterComponent]);

  if (!hasItems) {
    return (
      <View
        className="border mx-4 mb-3 rounded-2xl overflow-hidden"
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
        {showTabs && (
          <CustomerTransactionTabs
            txFilter={txFilter}
            onChangeFilter={onChangeFilter}
          />
        )}
        {listEmptyComponent}
      </View>
    );
  }

  return (
    <View
      className="border mx-4 mb-3 rounded-2xl overflow-hidden"
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
      <FlashList
        ListHeaderComponent={listHeaderComponent}
        data={visibleListItems}
        renderItem={renderItem}
        keyExtractor={(item: TxListItem) => item.key}
        estimatedItemSize={ITEM_ESTIMATED_SIZE}
        getItemType={(item: TxListItem) => item.kind}
        ListFooterComponent={listFooterComponent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 0 }}
        style={{ height: flashListHeight }}
      />
    </View>
  );
});

export default CustomerTransactionTimeline;
