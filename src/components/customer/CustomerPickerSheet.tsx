import CustomerAvatar from "@/src/components/common/CustomerAvatar";
import { getSheetTokens } from "../../styles/sheetTokens";
import { useTheme } from "../../utils/ThemeProvider";
import { formatINR } from "../../utils/format";
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Search, UserPlus, UserSearch, Users, X } from "lucide-react-native";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const clearAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0.4)).current;

  const tokens = useMemo(() => getSheetTokens(colors), [colors]);
  const snapPoints = useMemo(() => ["85%"], []);

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  useEffect(() => {
    Animated.timing(clearAnim, {
      toValue: searchQuery.length > 0 ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [clearAnim, searchQuery.length]);

  useEffect(() => {
    if (!isLoading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 0.8, duration: 450, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0.4, duration: 450, useNativeDriver: true }),
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
      if (aAdvance && bAdvance) return Math.abs(a.balance) - Math.abs(b.balance);
      return 0;
    });
  }, [customerList]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sortedList;
    return sortedList.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone || "").toLowerCase().includes(q),
    );
  }, [searchQuery, sortedList]);

  const recents = useMemo(() => {
    if (searchQuery.trim() || !recentIds.length) return [] as Customer[];
    const byId = new Map(customerList.map((c) => [c.id, c]));
    return recentIds.map((id) => byId.get(id)).filter(Boolean).slice(0, 5) as Customer[];
  }, [customerList, recentIds, searchQuery]);

  const onAddNew = (prefillName?: string) => {
    sheetRef.current?.close();
    setTimeout(() => {
      router.push("/(main)/people/create" as never);
    }, 200);
  };

  const renderRow = ({ item }: { item: Customer }) => {
    const selected = selectedCustomerId === item.id;
    const balanceLabel = getBalanceText(item.balance);
    const due = item.balance > 0;
    const advance = item.balance < 0;

    return (
      <TouchableOpacity
        onPress={async () => {
          await Haptics.selectionAsync();
          onSelectCustomer(item);
          onClose();
        }}
        activeOpacity={0.7}
        style={{
          height: tokens.rowHeight,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          backgroundColor: selected ? `${colors.primary}14` : "transparent",
        }}
      >
        <CustomerAvatar name={item.name} size={tokens.avatarSize} selected={selected} />

        <View style={{ flex: 1, marginLeft: 14, justifyContent: "center" }}>
          <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }}>
            {item.name}
          </Text>
          {balanceLabel ? (
            <View
              style={{
                marginTop: 3,
                alignSelf: "flex-start",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: due ? `${colors.warning}1A` : `${colors.success}1A`,
              }}
            >
              <Text style={{ fontSize: 11, color: due ? colors.warning : colors.success }}>
                {balanceLabel}
              </Text>
            </View>
          ) : (
            <View style={{ height: 18 }} />
          )}
        </View>

        {selected ? (
          <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                letterSpacing: 1,
                color: colors.primary,
                backgroundColor: `${colors.primary}15`,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
              }}
            >
              SELECTED
            </Text>
          </View>
        ) : (
          <View style={{ width: 80, alignItems: "flex-end", marginLeft: 8 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: item.balance === 0 ? "500" : "700",
                color: due ? colors.warning : advance ? colors.success : colors.textMuted,
              }}
            >
              {formatINR(Math.abs(item.balance), { maximumFractionDigits: 0 })}
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
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} pressBehavior="close" />
      )}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      handleStyle={{ paddingTop: 8 }}
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ paddingTop: tokens.headerPaddingTop, paddingHorizontal: tokens.headerPaddingHorizontal }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text
              style={{
                fontSize: tokens.headerTitleSize,
                fontWeight: tokens.headerTitleWeight,
                color: colors.textPrimary,
              }}
            >
              Select Customer
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.surfaceAlt,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 12,
              height: 48,
              borderRadius: tokens.searchBorderRadius,
              backgroundColor: tokens.searchBackground,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: searchFocused ? 1.5 : 0,
              borderColor: searchFocused ? `${colors.primary}66` : "transparent",
            }}
          >
            <Search size={18} color={colors.textMuted} />
            <TextInput
              style={{ flex: 1, marginLeft: 10, fontSize: 15, color: colors.textPrimary }}
              placeholder="Search by name or phone"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => {
                setSearchFocused(true);
                sheetRef.current?.snapToIndex(1);
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
                  style={{
                    borderRadius: 999,
                    backgroundColor: colors.border,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: colors.textMuted, fontWeight: "700" }}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </Animated.View>
          </View>
        </View>

        {!searchQuery.trim() && recents.length > 0 ? (
          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                marginLeft: 20,
                marginBottom: 8,
                fontSize: 11,
                letterSpacing: 1.2,
                color: colors.textMuted,
                fontWeight: "700",
              }}
            >
              FREQUENT
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}
            >
              {recents.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  activeOpacity={0.7}
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    onSelectCustomer(customer);
                    onClose();
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: selectedCustomerId === customer.id ? `${colors.primary}15` : colors.surface,
                    borderWidth: 1,
                    borderColor: selectedCustomerId === customer.id ? colors.primary : colors.border,
                  }}
                >
                  <CustomerAvatar name={customer.name} size={28} selected={selectedCustomerId === customer.id} />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      color: selectedCustomerId === customer.id ? colors.primary : colors.textPrimary,
                      fontWeight: "600",
                      maxWidth: 140,
                    }}
                  >
                    {customer.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 20 }} />
          </View>
        ) : null}

        <Text
          style={{
            marginTop: recents.length ? 16 : 14,
            marginBottom: 4,
            marginLeft: 20,
            fontSize: 11,
            letterSpacing: 1.5,
            color: colors.textMuted,
            fontWeight: "700",
          }}
        >
          ALL CUSTOMERS
        </Text>

        {isLoading ? (
          <View style={{ paddingTop: 10 }}>
            {[0, 1, 2].map((idx) => (
              <Animated.View
                key={String(idx)}
                style={{
                  opacity: shimmerAnim,
                  height: tokens.rowHeight,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border }} />
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ height: 12, width: "50%", backgroundColor: colors.border, borderRadius: 4 }} />
                  <View style={{ height: 10, width: "30%", backgroundColor: colors.border, borderRadius: 4, marginTop: 8 }} />
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <BottomSheetFlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderRow}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 84 + insets.bottom }}
            ListEmptyComponent={
              searchQuery.trim() ? (
                <View style={{ alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 }}>
                  <UserSearch size={40} color={colors.textMuted} />
                  <Text style={{ marginTop: 10, color: colors.textPrimary, fontWeight: "600" }}>
                    No one named &apos;{searchQuery}&apos;
                  </Text>
                  <Text style={{ marginTop: 4, color: colors.textMuted }}>Add them as a new customer?</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => onAddNew(searchQuery)}>
                    <Text style={{ marginTop: 8, color: colors.primary, fontWeight: "700" }}>Add {searchQuery}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ alignItems: "center", paddingHorizontal: 20, paddingVertical: 28 }}>
                  <Users size={48} color={colors.textMuted} />
                  <Text style={{ marginTop: 10, color: colors.textPrimary, fontWeight: "600" }}>No customers yet</Text>
                  <Text style={{ marginTop: 4, color: colors.textMuted, textAlign: "center" }}>
                    Add your first customer to start recording entries
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onAddNew()}
                    style={{ marginTop: 14, width: "100%", backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                  >
                    <Text style={{ color: colors.surface, fontWeight: "700" }}>Add Customer</Text>
                  </TouchableOpacity>
                </View>
              )
            }
            ListFooterComponent={<View style={{ height: 8 }} />}
          />
        )}

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingBottom: 16 + insets.bottom,
            paddingTop: 10,
            backgroundColor: colors.surface,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onAddNew()}
            style={{
              height: 52,
              borderRadius: 14,
              backgroundColor: colors.primaryDark,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserPlus size={18} color={colors.surface} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.surface, fontWeight: "600", fontSize: 15 }}>Add New Customer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
});

export default CustomerPickerSheet;
