import CustomerAvatar from "@/src/components/common/CustomerAvatar";
import { getSheetTokens } from "../../styles/sheetTokens";
import { useTheme } from "../../utils/ThemeProvider";
import { formatINR } from "../../utils/format";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Search, UserPlus, UserSearch, Users, X } from "lucide-react-native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Customer = {
  id: string;
  name: string;
  phone?: string;
  balance: number;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  customerList: Customer[];
  selectedCustomerId?: string | null;
  recentIds: string[];
  onSelectCustomer: (customer: Customer) => void;
  isLoading?: boolean;
  title?: string;
  showAddCustomer?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
}

function getBalanceText(balance: number) {
  if (balance > 0) return `${formatINR(balance)} due`;
  if (balance < 0) return `${formatINR(Math.abs(balance))} advance`;
  return "";
}

const CustomerPickerSheet = memo(function CustomerPickerSheet({
  visible,
  onClose,
  customerList,
  selectedCustomerId,
  recentIds,
  onSelectCustomer,
  isLoading = false,
  title = "Select Customer",
  showAddCustomer = true,
  searchQuery: searchQueryProp,
  onSearchQueryChange,
  onEndReached,
  isFetchingNextPage = false,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);
  const listRef = useRef<any>(null);
  const [searchQueryState, setSearchQueryState] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const clearAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0.4)).current;

  const isSearchControlled =
    typeof searchQueryProp === "string" && !!onSearchQueryChange;
  const searchQuery = isSearchControlled ? searchQueryProp : searchQueryState;
  const setSearchQuery = useCallback(
    (value: string) => {
      if (isSearchControlled) {
        onSearchQueryChange?.(value);
        return;
      }
      setSearchQueryState(value);
    },
    [isSearchControlled, onSearchQueryChange],
  );

  const tokens = useMemo(() => getSheetTokens(colors), [colors]);
  const snapPoints = useMemo(() => ["85%"], []);
  const footerInset = Math.max(insets.bottom, 8);
  const footerHeight = showAddCustomer ? 52 + 12 + 12 + footerInset : 0;

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
      return;
    }

    setSearchQuery("");
    setSearchFocused(false);
    sheetRef.current?.dismiss();
  }, [setSearchQuery, visible]);

  useEffect(() => {
    Animated.timing(clearAnim, {
      toValue: searchQuery.length > 0 ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [clearAnim, searchQuery]);

  useEffect(() => {
    if (!isLoading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.8,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.4,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isLoading, shimmerAnim]);

  const sortedList = useMemo(() => {
    const base = [...customerList];
    return base.sort((a, b) => {
      const aDue = a.balance > 0;
      const bDue = b.balance > 0;
      if (aDue && bDue) return b.balance - a.balance;
      if (aDue !== bDue) return aDue ? -1 : 1;

      const aClear = a.balance === 0;
      const bClear = b.balance === 0;
      if (aClear && bClear) return a.name.localeCompare(b.name);
      if (aClear !== bClear) return aClear ? -1 : 1;

      const aAdvance = a.balance < 0;
      const bAdvance = b.balance < 0;
      if (aAdvance && bAdvance)
        return Math.abs(a.balance) - Math.abs(b.balance);
      return 0;
    });
  }, [customerList]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedList;
    return sortedList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q),
    );
  }, [searchQuery, sortedList]);

  const recents = useMemo(() => {
    if (searchQuery.trim() || !recentIds.length) return [] as Customer[];
    const byId = new Map(customerList.map((c) => [c.id, c]));
    return recentIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .slice(0, 5) as Customer[];
  }, [customerList, recentIds, searchQuery]);

  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleAddNew = useCallback(
    (prefillName?: string) => {
      if (!showAddCustomer) return;
      sheetRef.current?.close();
      setTimeout(() => {
        const name = prefillName?.trim();
        if (name) {
          router.push(
            `/(main)/people/create?name=${encodeURIComponent(name)}` as never,
          );
          return;
        }
        router.push("/(main)/people/create" as never);
      }, 200);
    },
    [router, showAddCustomer],
  );

  const handleSelectCustomer = useCallback(
    async (customer: Customer) => {
      await Haptics.selectionAsync();
      onSelectCustomer(customer);
      sheetRef.current?.close();
    },
    [onSelectCustomer],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View
          style={[
            styles.footerWrap,
            {
              paddingBottom: footerInset + 12,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          {showAddCustomer ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleAddNew()}
              style={[
                styles.footerButton,
                { backgroundColor: colors.primaryDark },
              ]}
            >
              <UserPlus
                size={18}
                color={colors.surface}
                style={styles.footerIcon}
              />
              <Text style={[styles.footerText, { color: colors.surface }]}>
                Add New Customer
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </BottomSheetFooter>
    ),
    [
      colors.background,
      colors.border,
      colors.primaryDark,
      colors.surface,
      footerInset,
      handleAddNew,
      showAddCustomer,
    ],
  );

  const renderRow = useCallback(
    ({ item }: { item: Customer }) => {
      const selected = selectedCustomerId === item.id;
      const balanceLabel = getBalanceText(item.balance);
      const due = item.balance > 0;
      const advance = item.balance < 0;

      return (
        <TouchableOpacity
          onPress={() => void handleSelectCustomer(item)}
          activeOpacity={0.7}
          style={[
            styles.row,
            {
              height: tokens.rowHeight,
              backgroundColor: selected ? `${colors.primary}14` : "transparent",
            },
          ]}
        >
          <CustomerAvatar
            name={item.name}
            size={tokens.avatarSize}
            selected={selected}
          />

          <View style={styles.rowMainContent}>
            <Text
              numberOfLines={1}
              style={[styles.rowTitle, { color: colors.textPrimary }]}
            >
              {item.name}
            </Text>
            {balanceLabel ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: due
                      ? `${colors.warning}1A`
                      : `${colors.success}1A`,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: due ? colors.warning : colors.success,
                  }}
                >
                  {balanceLabel}
                </Text>
              </View>
            ) : (
              <View style={styles.badgeSpacer} />
            )}
          </View>

          {selected ? (
            <View style={styles.selectedWrap}>
              <Text
                style={[
                  styles.selectedText,
                  {
                    color: colors.primary,
                    backgroundColor: `${colors.primary}15`,
                  },
                ]}
              >
                SELECTED
              </Text>
            </View>
          ) : (
            <View style={styles.amountWrap}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: item.balance === 0 ? "500" : "700",
                  color: due
                    ? colors.warning
                    : advance
                      ? colors.success
                      : colors.textMuted,
                }}
              >
                {formatINR(Math.abs(item.balance), {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
          )}

          <View
            style={{
              position: "absolute",
              left: tokens.separatorInset,
              right: 0,
              bottom: 0,
              height: StyleSheet.hairlineWidth,
              backgroundColor: colors.border,
            }}
          />
        </TouchableOpacity>
      );
    },
    [
      colors.border,
      colors.primary,
      colors.success,
      colors.textMuted,
      colors.textPrimary,
      colors.warning,
      handleSelectCustomer,
      selectedCustomerId,
      tokens.avatarSize,
      tokens.rowHeight,
      tokens.separatorInset,
    ],
  );

  const listHeader = useMemo(
    () => (
      <>
        {!searchQuery.trim() && recents.length > 0 ? (
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              FREQUENT
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentsContainer}
            >
              {recents.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  activeOpacity={0.7}
                  onPress={() => void handleSelectCustomer(customer)}
                  style={[
                    styles.recentChip,
                    {
                      backgroundColor:
                        selectedCustomerId === customer.id
                          ? `${colors.primary}15`
                          : colors.surface,
                      borderColor:
                        selectedCustomerId === customer.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <CustomerAvatar
                    name={customer.name}
                    size={28}
                    selected={selectedCustomerId === customer.id}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      color:
                        selectedCustomerId === customer.id
                          ? colors.primary
                          : colors.textPrimary,
                      fontWeight: "600",
                      maxWidth: 140,
                    }}
                  >
                    {customer.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View
              style={[
                styles.recentsSeparator,
                { backgroundColor: colors.border },
              ]}
            />
          </View>
        ) : null}

        <Text
          style={[
            styles.sectionLabelAll,
            { color: colors.textMuted, marginTop: recents.length ? 16 : 14 },
          ]}
        >
          ALL CUSTOMERS
        </Text>
      </>
    ),
    [
      colors.border,
      colors.primary,
      colors.surface,
      colors.textMuted,
      colors.textPrimary,
      handleSelectCustomer,
      recents,
      searchQuery,
      selectedCustomerId,
    ],
  );

  const listEmpty = useMemo(
    () =>
      searchQuery.trim() ? (
        <View style={styles.emptyWrap}>
          <UserSearch size={40} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No one named &apos;{searchQuery}&apos;
          </Text>
          {showAddCustomer ? (
            <>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Add them as a new customer?
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAddNew(searchQuery)}
              >
                <Text style={[styles.emptyAction, { color: colors.primary }]}>
                  Add {searchQuery}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      ) : (
        <View style={styles.emptyWrapNoData}>
          <Users size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No customers yet
          </Text>
          {showAddCustomer ? (
            <>
              <Text
                style={[
                  styles.emptySubtitleCenter,
                  { color: colors.textMuted },
                ]}
              >
                Add your first customer to start recording entries
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAddNew()}
                style={[
                  styles.emptyPrimaryButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[styles.emptyPrimaryText, { color: colors.surface }]}
                >
                  Add Customer
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      ),
    [
      colors.primary,
      colors.surface,
      colors.textMuted,
      colors.textPrimary,
      handleAddNew,
      searchQuery,
      showAddCustomer,
    ],
  );

  if (!visible) return null;

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.4}
          pressBehavior="close"
        />
      )}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleStyle={styles.handleStyle}
      footerComponent={showAddCustomer ? renderFooter : undefined}
      handleIndicatorStyle={{
        backgroundColor: tokens.handleColor,
        width: tokens.handleWidth,
        height: tokens.handleHeight,
        borderRadius: 2,
      }}
      backgroundStyle={{
        backgroundColor: tokens.background,
        borderTopLeftRadius: tokens.borderTopRadius,
        borderTopRightRadius: tokens.borderTopRadius,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      }}
    >
      <View style={styles.container}>
        <View
          style={{
            paddingTop: tokens.headerPaddingTop,
            paddingHorizontal: tokens.headerPaddingHorizontal,
          }}
        >
          <View style={styles.headerRow}>
            <Text
              style={{
                fontSize: tokens.headerTitleSize,
                fontWeight: tokens.headerTitleWeight,
                color: colors.textPrimary,
              }}
            >
              {title}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClosePress}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
            >
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchWrap,
              {
                borderRadius: tokens.searchBorderRadius,
                backgroundColor: tokens.searchBackground,
                borderWidth: searchFocused ? 1.5 : 0,
                borderColor: searchFocused
                  ? `${colors.primary}66`
                  : "transparent",
              },
            ]}
          >
            <Search size={18} color={colors.textMuted} />
            <BottomSheetTextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search by name or phone"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => {
                setSearchFocused(true);
                sheetRef.current?.snapToIndex(0);
              }}
              onBlur={() => setSearchFocused(false)}
            />

            <Animated.View
              style={{
                opacity: clearAnim,
                transform: [{ scale: clearAnim }],
              }}
            >
              {searchQuery.length > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSearchQuery("")}
                  style={[
                    styles.clearSearchButton,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <Text style={{ color: colors.textMuted, fontWeight: "700" }}>
                    x
                  </Text>
                </TouchableOpacity>
              ) : null}
            </Animated.View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.skeletonWrap}>
            {[0, 1, 2].map((idx) => (
              <Animated.View
                key={String(idx)}
                style={[
                  styles.skeletonRow,
                  { opacity: shimmerAnim, height: tokens.rowHeight },
                ]}
              >
                <View
                  style={[
                    styles.skeletonAvatar,
                    { backgroundColor: colors.border },
                  ]}
                />
                <View style={styles.skeletonGap} />
                <View style={styles.skeletonBody}>
                  <View
                    style={[
                      styles.skeletonLineOne,
                      { backgroundColor: colors.border },
                    ]}
                  />
                  <View
                    style={[
                      styles.skeletonLineTwo,
                      { backgroundColor: colors.border },
                    ]}
                  />
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <BottomSheetFlatList
            ref={listRef}
            style={styles.list}
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderRow}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            onEndReached={onEndReached}
            onEndReachedThreshold={0.3}
            contentContainerStyle={{
              paddingBottom: showAddCustomer
                ? footerHeight + 16
                : Math.max(insets.bottom, 16),
            }}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={listEmpty}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.loaderWrap}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    Loading more...
                  </Text>
                </View>
              ) : (
                <View style={styles.listFooterSpacer} />
              )
            }
          />
        )}
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  handleStyle: { paddingTop: 8 },
  list: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    marginTop: 12,
    height: 48,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  clearSearchButton: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  rowMainContent: { flex: 1, marginLeft: 14, justifyContent: "center" },
  rowTitle: { fontSize: 15, fontWeight: "600" },
  badge: {
    marginTop: 3,
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSpacer: { height: 18 },
  selectedWrap: { alignItems: "flex-end", marginLeft: 8 },
  selectedText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  amountWrap: { width: 80, alignItems: "flex-end", marginLeft: 8 },
  sectionLabel: {
    marginLeft: 20,
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  sectionLabelAll: {
    marginBottom: 4,
    marginLeft: 20,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  recentsContainer: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  recentsSeparator: { height: 1, marginHorizontal: 20 },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyWrapNoData: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  emptyTitle: { marginTop: 10, fontWeight: "600" },
  emptySubtitle: { marginTop: 4 },
  emptySubtitleCenter: { marginTop: 4, textAlign: "center" },
  emptyAction: { marginTop: 8, fontWeight: "700" },
  emptyPrimaryButton: {
    marginTop: 14,
    width: "100%",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyPrimaryText: { fontWeight: "700" },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  skeletonWrap: { paddingTop: 10 },
  skeletonRow: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonAvatar: { width: 44, height: 44, borderRadius: 22 },
  skeletonGap: { width: 16 },
  skeletonBody: { flex: 1 },
  skeletonLineOne: { height: 12, width: "50%", borderRadius: 4 },
  skeletonLineTwo: { height: 10, width: "30%", borderRadius: 4, marginTop: 8 },
  footerWrap: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  footerButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerIcon: { marginRight: 8 },
  footerText: { fontWeight: "600", fontSize: 15 },
  listFooterSpacer: { height: 8 },
});

export default CustomerPickerSheet;
