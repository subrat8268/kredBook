import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Check, Plus, User } from "lucide-react-native";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string, palette: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length] as string;
}

function getBalanceMeta(balance: number) {
  if (balance > 0) return { text: `${formatINR(balance)} due`, kind: "due" as const };
  if (balance < 0) return { text: `${formatINR(Math.abs(balance))} advance`, kind: "advance" as const };
  return { text: `${formatINR(0)}`, kind: "clear" as const };
}

const CustomerPickerSheet = memo(function CustomerPickerSheet({
  visible,
  onClose,
  customerList,
  selectedCustomerId,
  recentIds,
  onSelectCustomer,
}: Props) {
  const { colors } = useTheme();
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const avatarPalette = useMemo(() => [colors.primary, colors.warning, colors.danger, ...colors.avatarPalette], [colors]);

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const sortedList = useMemo(() => {
    return [...customerList].sort((a, b) => {
      const aDue = a.balance > 0;
      const bDue = b.balance > 0;
      const aAdvance = a.balance < 0;
      const bAdvance = b.balance < 0;

      if (aDue && bDue) return b.balance - a.balance;
      if (aDue !== bDue) return aDue ? -1 : 1;
      if (a.balance === 0 && b.balance === 0) return a.name.localeCompare(b.name);
      if (a.balance === 0 && bAdvance) return -1;
      if (aAdvance && b.balance === 0) return 1;
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

  const recentCustomers = useMemo(() => {
    if (searchQuery.trim() || !recentIds.length) return [] as Customer[];
    const byId = new Map(customerList.map((c) => [c.id, c]));
    const list = recentIds.map((id) => byId.get(id)).filter(Boolean) as Customer[];
    return list.slice(0, 5);
  }, [customerList, recentIds, searchQuery]);

  const renderRow = ({ item }: { item: Customer }) => {
    const selected = selectedCustomerId === item.id;
    const meta = getBalanceMeta(item.balance);
    return (
      <TouchableOpacity
        onPress={async () => {
          await Haptics.selectionAsync();
          onSelectCustomer(item);
          onClose();
        }}
        activeOpacity={0.75}
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          backgroundColor: selected ? `${colors.primary}14` : "transparent",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: getAvatarColor(item.name, avatarPalette),
            marginRight: 10,
          }}
        >
          <Text style={{ color: colors.surface, fontWeight: "700", fontSize: 12 }}>{getInitials(item.name)}</Text>
          {selected ? (
            <View style={{ position: "absolute", right: -2, bottom: -2, backgroundColor: colors.primary, borderRadius: 999 }}>
              <Check size={12} color={colors.surface} />
            </View>
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "600", color: colors.textPrimary }}>{item.name}</Text>
          <Text
            style={{
              fontSize: 11,
              color: meta.kind === "due" ? colors.warning : meta.kind === "advance" ? colors.primary : colors.textSecondary,
            }}
          >
            {meta.text}
          </Text>
        </View>

        <Text
          style={{
            fontWeight: "700",
            color: item.balance > 0 ? colors.warning : colors.primary,
          }}
        >
          {formatINR(Math.abs(item.balance))}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
      backgroundStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.4} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
      )}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary }}>Select Customer</Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push({ pathname: "/main/people/add", params: { prefillName: searchQuery } } as never)}
            >
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Add New</Text>
            </TouchableOpacity>
          </View>

          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center" }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or phone"
              placeholderTextColor={colors.textSecondary}
              style={{ flex: 1, color: colors.textPrimary }}
              onFocus={() => sheetRef.current?.snapToIndex(1)}
            />
            {searchQuery ? (
              <TouchableOpacity activeOpacity={0.75} onPress={() => setSearchQuery("")}> 
                <Text style={{ color: colors.textSecondary, fontWeight: "700" }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {!searchQuery.trim() && recentCustomers.length ? (
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <Text style={{ fontSize: 11, letterSpacing: 1.2, color: colors.textSecondary, fontWeight: "700", marginBottom: 8 }}>RECENT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {recentCustomers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  activeOpacity={0.75}
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    onSelectCustomer(customer);
                    onClose();
                  }}
                  style={{ width: 62, alignItems: "center" }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: getAvatarColor(customer.name, avatarPalette),
                    }}
                  >
                    <Text style={{ color: colors.surface, fontWeight: "700", fontSize: 11 }}>{getInitials(customer.name)}</Text>
                  </View>
                  <Text numberOfLines={1} style={{ marginTop: 4, fontSize: 11, color: colors.textPrimary }}>
                    {customer.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ marginTop: 10, height: 1, backgroundColor: colors.border }} />
          </View>
        ) : null}

        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            filtered.length === 0 && searchQuery.trim() ? (
              <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
                <Text style={{ color: colors.textSecondary }}>No customer named &apos;{searchQuery}&apos;</Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => router.push({ pathname: "/main/people/add", params: { prefillName: searchQuery } } as never)}
                >
                  <Text style={{ marginTop: 8, color: colors.primary, fontWeight: "700" }}>Add &apos;{searchQuery}&apos; as new customer?</Text>
                </TouchableOpacity>
              </View>
            ) : customerList.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 28, paddingHorizontal: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
                  <User size={26} color={colors.textSecondary} />
                </View>
                <Text style={{ marginTop: 10, color: colors.textSecondary, textAlign: "center" }}>Add your first customer to get started</Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => router.push({ pathname: "/main/people/add" } as never)}
                  style={{ marginTop: 12, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 }}
                >
                  <Text style={{ color: colors.surface, fontWeight: "700" }}>Add Customer</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ListFooterComponent={
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push({ pathname: "/main/people/add", params: { prefillName: searchQuery } } as never)}
              style={{ height: 56, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.border }}
            >
              <View style={{ width: 28, height: 28, borderRadius: 999, borderWidth: 1, borderColor: colors.textSecondary, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                <Plus size={14} color={colors.textSecondary} />
              </View>
              <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>+ Add New Person</Text>
            </TouchableOpacity>
          }
        />
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
});

export default CustomerPickerSheet;
