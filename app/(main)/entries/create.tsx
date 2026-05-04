import { getCustomerPreviousBalance, recordPayment } from "@/src/api/entries";
import { fetchPersonDetail } from "@/src/api/people";
import Loader from "@/src/components/feedback/Loader";
import SyncStatus from "@/src/components/feedback/SyncStatus";
import { useToast } from "@/src/components/feedback/Toast";
import BillFooter from "@/src/components/orders/BillFooter";
import CustomerPicker from "@/src/components/picker/CustomerPicker";
import Input from "@/src/components/ui/Input";
import { useCreateOrder } from "@/src/hooks/useEntries";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { buildEntryShareMessage } from "@/src/utils/shareTemplates";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createMMKV } from "react-native-mmkv";
import { ArrowLeft, Pencil } from "lucide-react-native";
import { format } from "date-fns";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string, palette: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length] as string;
}

function computeDueDateFromPreset(preset: "today" | "7" | "15" | "30" | "custom") {
  const date = new Date();
  if (preset === "7") date.setDate(date.getDate() + 7);
  if (preset === "15") date.setDate(date.getDate() + 15);
  if (preset === "30") date.setDate(date.getDate() + 30);
  if (preset === "custom") date.setDate(date.getDate() + 30);
  return format(date, "yyyy-MM-dd");
}

function formatChipDate(dateStr?: string) {
  if (!dateStr) return "Custom";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

// A3: Numpad input guard
function handleNumpadInput(current: string, key: string): string {
  if (key === "0" && current === "") return "0";
  if (key === ".") {
    if (current === "") return "0.";
    if (current.includes(".")) return current;
    return `${current}.`;
  }
  
  // Handle decimal digits - max 2 decimal places
  if (current.includes(".")) {
    const [, decimals] = current.split(".");
    if (decimals.length >= 2) return current;
  }
  
  // Strip leading zeros from whole number part
  let newValue = `${current}${key}`;
  if (!newValue.includes(".")) {
    const num = parseInt(newValue, 10);
    if (num === 0 && newValue.length > 1) {
      newValue = newValue.replace(/^0+/, "");
    }
  }
  
  return newValue || "0";
}

export default function CreateOrderScreen() {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const avatarColors = useMemo(
    () => [colors.danger, colors.warning, colors.primary, ...colors.avatarPalette],
    [colors],
  );

  const {
    customer: customerParams,
    amount: amountParam,
  } = useLocalSearchParams<{
    customer?: string;
    amount?: string;
  }>();

  const { profile, isFetchingProfile } = useAuthStore();
  const vendorId = profile?.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();
  const draftStorage = useMemo(() => createMMKV({ id: "create-entry-draft" }), []);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerMeta, setSelectedCustomerMeta] = useState<any>(() => {
    if (!customerParams) return null;
    try {
      return JSON.parse(customerParams);
    } catch {
      return null;
    }
  });
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [quickAmount, setQuickAmount] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");
  const [orderNoteExpanded, setOrderNoteExpanded] = useState(false);
  const [entryType, setEntryType] = useState<"bill" | "payment">("bill");
  const [entryMode, setEntryMode] = useState<"quick" | "bill">("quick");
  const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false);
  const [duePreset, setDuePreset] = useState<"today" | "7" | "15" | "30" | "custom">("today");
  const [customDueDate, setCustomDueDate] = useState<string | undefined>(undefined);
  const [isCustomDuePickerOpen, setIsCustomDuePickerOpen] = useState(false);
  const [savedEntry, setSavedEntry] = useState<any>(null);
  const [isPostSaveModalOpen, setIsPostSaveModalOpen] = useState(false);
  const [lineItems, setLineItems] = useState<{ id: string; name: string; quantity: number; rate: number }[]>([]);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemRateInput, setItemRateInput] = useState("");
  const [itemNameCache, setItemNameCache] = useState<string[]>([]);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const [hadInitialSeedData, setHadInitialSeedData] = useState(false);
  const [revealAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!customerParams) return;
    if (selectedCustomerMeta) return;

    showToast({
      message: "Invalid customer link. Please try again.",
      type: "error",
    });
    router.back();
  }, [customerParams, router, selectedCustomerMeta, showToast]);

  const fetchPreviousBalance = useCallback(
    async (customerId: string) => {
      if (!vendorId) return;
      try {
        setIsFetchingBalance(true);
        const balance = await getCustomerPreviousBalance(customerId, vendorId);
        setPreviousBalance(balance);
      } catch {
        setPreviousBalance(0);
      } finally {
        setIsFetchingBalance(false);
      }
    },
    [vendorId],
  );

  // A1: Restore draft FIRST, then apply deep-link params (params win over draft)
  useEffect(() => {
    const key = `draft:${vendorId ?? "anon"}`;
    const cached = draftStorage.getString(key);
    let hasSeedData = false;
    
    // Step 1: Restore draft values
    if (cached) {
      hasSeedData = true;
      try {
        const parsed = JSON.parse(cached);
        setQuickAmount(parsed.quickAmount ?? "");
        setOrderNote(parsed.orderNote ?? "");
        setOrderNoteExpanded(Boolean(parsed.orderNote));
        setEntryType(parsed.entryType ?? "bill");
        setDuePreset(parsed.duePreset ?? "today");
        setCustomDueDate(parsed.customDueDate ?? undefined);
        if (parsed.selectedCustomerMeta) {
          setSelectedCustomerMeta(parsed.selectedCustomerMeta);
          setSelectedCustomerId(parsed.selectedCustomerMeta.id ?? null);
        }
      } catch {
        // ignore corrupted draft
      }
    }

    // Step 2: Apply deep-link params (override draft if present)
    if (customerParams) {
      hasSeedData = true;
      try {
        const parsed = JSON.parse(customerParams);
        setSelectedCustomerId(parsed.id);
        setSelectedCustomerMeta(parsed);
        fetchPreviousBalance(parsed.id);
      } catch {
        showToast({
          message: "Invalid customer link. Please try again.",
          type: "error",
        });
        router.back();
        return;
      }
    }
    if (amountParam && !Number.isNaN(Number(amountParam))) {
      hasSeedData = true;
      setEntryType("payment");
      setQuickAmount(String(amountParam));
    }
    setHadInitialSeedData(hasSeedData);
    setHasHydratedDraft(true);
  }, [amountParam, customerParams, draftStorage, vendorId, fetchPreviousBalance, router, showToast]);

  useEffect(() => {
    if (!hasHydratedDraft) return;
    if (!selectedCustomerId) return;
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [hasHydratedDraft, revealAnim, selectedCustomerId]);

  const handleSelectPerson = useCallback(
    async (person: any) => {
      setSelectedCustomerId(person?.id || null);
      setSelectedCustomerMeta(person);
      if (person) {
        fetchPreviousBalance(person.id);
      }
    },
    [fetchPreviousBalance],
  );

  const createOrderMutation = useCreateOrder(vendorId!);
  const { queueLength } = useNetworkSync();
  const hasItems = lineItems.length > 0;

  const lineItemsTotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0),
    [lineItems],
  );
  const quickAmountValue = parseFloat(quickAmount) || 0;
  const computedEntryAmount = entryMode === "bill" ? lineItemsTotal : quickAmountValue;

  useEffect(() => {
    const loadItemNameCache = async () => {
      try {
        const raw = await AsyncStorage.getItem("item-name-cache");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItemNameCache(parsed.filter((x) => typeof x === "string"));
        }
      } catch {
        // ignore cache parse errors
      }
    };
    loadItemNameCache();
  }, []);

  const persistItemNameCache = useCallback(async (name: string) => {
    const normalized = name.trim();
    if (!normalized) return;
    const next = [normalized, ...itemNameCache.filter((n) => n.toLowerCase() !== normalized.toLowerCase())].slice(0, 50);
    setItemNameCache(next);
    await AsyncStorage.setItem("item-name-cache", JSON.stringify(next));
  }, [itemNameCache]);

  useEffect(() => {
    const key = `draft:${vendorId ?? "anon"}`;
    draftStorage.set(
      key,
      JSON.stringify({ quickAmount, orderNote, entryType, duePreset, customDueDate, selectedCustomerMeta }),
    );
  }, [customDueDate, draftStorage, duePreset, entryType, orderNote, quickAmount, selectedCustomerMeta, vendorId]);

  // Calculate effective total
  const entryAmount = computedEntryAmount;
  const totalWithBalance = computedEntryAmount + previousBalance;

  const handleSaveEntry = async () => {
    // Validation
    if (!selectedCustomerId) {
      return Alert.alert("Error", "Please select a person");
    }

    if (entryType === "payment") {
      const paymentAmount = parseFloat(quickAmount) || 0;
      if (!quickAmount.trim() || paymentAmount <= 0) {
        return Alert.alert("Error", "Please enter a payment amount");
      }
      if (previousBalance <= 0) {
        return Alert.alert(
          "Up to date",
          `${selectedCustomerMeta?.name ?? "This person"} has no pending entries to pay.`,
        );
      }
      if (paymentAmount > previousBalance) {
        return Alert.alert(
          "Amount too high",
          `Payment exceeds the pending balance of ${formatINR(previousBalance)}.`,
        );
      }
      return handleRecordPayment();
    }

    // Quick amount or bill items must be provided
    if (entryMode === "quick" && !quickAmount.trim()) {
      return Alert.alert("Error", "Please enter an amount");
    }
    if (entryMode === "bill" && !lineItems.length) {
      return Alert.alert("Error", "Please add at least one item");
    }

    const savedOrder = await performSave();
    if (savedOrder) {
      setSavedEntry(savedOrder);
      setIsPostSaveModalOpen(true);
    }
  };

  const performSave = async () => {
    try {
      const orderItems =
        entryMode === "bill"
          ? lineItems.map((item) => ({
              product_id: null,
              product_name: item.name,
              price: item.rate,
              quantity: item.quantity,
            }))
          : [
              {
                product_id: null,
                product_name: orderNote.trim() || "Entry Amount",
                price: parseFloat(quickAmount) || 0,
                quantity: 1,
              },
            ];

        const savedOrder = await createOrderMutation.mutateAsync({
          customerId: selectedCustomerId!,
          vendorId: vendorId!,
          items: orderItems,
          amountPaid: 0,
          loadingCharge: 0,
          taxPercent: 0,
          billNumberPrefix: profile?.bill_number_prefix || "INV",
          note: orderNote.trim() ? orderNote.trim() : null,
          dueDate:
            duePreset === "custom"
              ? customDueDate ?? computeDueDateFromPreset("30")
              : computeDueDateFromPreset(duePreset),
        });

      // Keep form values so user can choose post-save actions.
      showToast({
        message: `Entry created for ${selectedCustomerMeta?.name ?? "customer"}`,
        type: "success",
      });
      return savedOrder;
    } catch (err: any) {
      console.error("Save entry failed:", err.message);
      const errorMessage = err.message || "Failed to save entry";
      showToast({ message: errorMessage, type: "error" });
      Alert.alert("Error", errorMessage);
      return null;
    }
  };

  const handleShareOnWhatsApp = useCallback(async () => {
    if (!savedEntry) return;
    const locale = i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en";
    await Share.share({
      message: buildEntryShareMessage({
        locale,
        customerName: selectedCustomerMeta?.name || "Customer",
        amount: entryAmount,
        entryDate: savedEntry.created_at ?? new Date(),
        dueDate: (savedEntry as any).due_date ?? null,
        businessName: profile?.business_name || profile?.name || "KredBook",
      }),
    });
  }, [entryAmount, i18n.language, profile?.business_name, profile?.name, savedEntry, selectedCustomerMeta?.name]);

  const handleViewSavedEntry = useCallback(() => {
    if (!savedEntry?.id) return;
    setIsPostSaveModalOpen(false);
    router.replace({
      pathname: "/(main)/entries/[orderId]",
      params: { orderId: savedEntry.id },
    } as never);
  }, [router, savedEntry?.id]);

  const handleDoneAfterSave = useCallback(() => {
    setIsPostSaveModalOpen(false);
    router.back();
  }, [router]);

  const invoiceRef = `${profile?.bill_number_prefix || "INV"}-NEW`;
  const showOnlyCustomerCard =
    hasHydratedDraft && !hadInitialSeedData && !selectedCustomerId;

  const handleRecordPayment = async () => {
    if (!selectedCustomerId || !profile?.id) return;

    const paymentAmount = parseFloat(quickAmount) || 0;
    try {
      setIsFetchingBalance(true);
      const detail = await fetchPersonDetail(selectedCustomerId);
      if (!detail?.pendingOrderId || (detail.pendingOrderBalance ?? 0) <= 0) {
        Alert.alert(
          "Up to date",
          `${detail?.name ?? selectedCustomerMeta?.name ?? "This person"} has no pending entries to pay.`,
        );
        return;
      }
      await recordPayment(
        detail.pendingOrderId,
        profile.id,
        paymentAmount,
        "Cash",
        false,
        orderNote.trim() || undefined,
      );
      // Ensure lists refresh after recording a payment.
      queryClient.invalidateQueries({ queryKey: ["orders", profile.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", profile.id] });
      queryClient.invalidateQueries({
        queryKey: ["customerDetail", selectedCustomerId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
      setQuickAmount("");
      setOrderNote("");
      showToast({
        message: `Payment recorded for ${detail.name}`,
        type: "success",
      });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to record payment");
    } finally {
      setIsFetchingBalance(false);
    }
  };

  if (isFetchingProfile || !profile) return <Loader />;

  const addLineItem = async () => {
    const name = itemName.trim();
    const rate = parseFloat(itemRateInput) || 0;
    if (!name) {
      Alert.alert("Error", "Please enter item name");
      return;
    }
    if (rate <= 0) {
      Alert.alert("Error", "Please enter a valid rate");
      return;
    }
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      quantity: itemQty,
      rate,
    };
    setLineItems((prev) => [...prev, newItem]);
    await persistItemNameCache(name);
    setItemName("");
    setItemQty(1);
    setItemRateInput("");
    setIsAddItemModalOpen(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View className="flex-row items-center border-b border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-1"
              activeOpacity={0.75}
            >
              <ArrowLeft
                size={22}
                color={colors.textPrimary}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
            
            {/* B4: Quick Entry / Bill Mode toggle */}
            <View className="flex-row rounded-full border border-border overflow-hidden dark:border-border-dark">
              <TouchableOpacity
                onPress={() => setEntryMode("quick")}
                className="px-3 py-1.5"
                style={{
                  backgroundColor: entryMode === "quick" ? colors.primary : "transparent",
                }}
                activeOpacity={0.75}
              >
                <Text
                  className="text-[12px] font-bold"
                  style={{ color: entryMode === "quick" ? colors.surface : colors.textSecondary }}
                >
                  Quick Entry
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEntryMode("bill")}
                className="px-3 py-1.5"
                style={{
                  backgroundColor: entryMode === "bill" ? colors.primary : "transparent",
                }}
                activeOpacity={0.75}
              >
                <Text
                  className="text-[12px] font-bold"
                  style={{ color: entryMode === "bill" ? colors.surface : colors.textSecondary }}
                >
                  Bill Mode
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1" />
            <View className="mr-2">
              <SyncStatus />
            </View>
            <TouchableOpacity
              className="rounded-full border border-primary bg-primary-light px-3 py-1 dark:bg-primary-soft-dark"
              onPress={() => setEntryType((prev) => (prev === "payment" ? "bill" : "payment"))}
              activeOpacity={0.75}
            >
              <Text className="text-[13px] font-bold text-primary">
                {entryType === "payment" ? "PAYMENT" : invoiceRef}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: 130, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >

            {/* Person picker */}
            <View className="overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
              <TouchableOpacity onPress={() => setIsCustomerSheetOpen(true)} className="flex-row items-center border-b border-border px-4 py-4 dark:border-border-dark" activeOpacity={0.75}>
                <View
                  className="rounded-full items-center justify-center mr-3 w-[52px] h-[52px]"
                    style={{
                      backgroundColor: selectedCustomerMeta
                        ? getAvatarColor(selectedCustomerMeta.name, avatarColors)
                        : colors.border,
                    }}
                >
                  <Text className="font-bold text-surface text-[17px]">
                    {selectedCustomerMeta
                      ? getInitials(selectedCustomerMeta.name)
                      : "?"}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text
                    className="text-[17px] font-bold text-textPrimary dark:text-textPrimary-dark"
                    numberOfLines={1}
                  >
                    {selectedCustomerMeta
                      ? selectedCustomerMeta.name
                      : "Select Person"}
                  </Text>
                  {!selectedCustomerMeta && (
                    <Text className="mt-0.5 text-[14px] text-textSecondary dark:text-textSecondary-dark">
                      Choose from your people list below
                    </Text>
                  )}
                </View>

                <Pencil size={18} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>

              {selectedCustomerMeta &&
                previousBalance > 0 &&
                !isFetchingBalance && (
                  <View
                    className="flex-row items-center gap-2 border-t border-border px-4 py-3 dark:border-border-dark"
                    style={{ backgroundColor: colors.warningBg }}
                  >
                    <Text className="text-[13px] font-bold" style={{ color: colors.warning }}>
                      ⚠️ Previous Balance: ₹
                      {formatINR(previousBalance, { currencySymbol: "" })}
                    </Text>
                  </View>
                )}
            </View>

            {selectedCustomerMeta ? (
              <TouchableOpacity
                onPress={() => setIsCustomerSheetOpen(true)}
                className="mt-2 self-start rounded-full border border-border px-3 py-1 dark:border-border-dark"
                activeOpacity={0.75}
              >
                <Text className="text-[12px] font-semibold text-primary">Change</Text>
              </TouchableOpacity>
            ) : null}

            {!showOnlyCustomerCard ? (
              <Animated.View
                style={{
                  opacity: revealAnim,
                  transform: [
                    {
                      translateY: revealAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                }}
              >
            {entryMode === "bill" ? (
              <View className="mt-2 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <TouchableOpacity
                  onPress={() => setIsAddItemModalOpen(true)}
                  className="rounded-xl border border-primary px-4 py-3"
                  activeOpacity={0.75}
                >
                  <Text className="text-center font-bold text-primary">+ Add Item</Text>
                </TouchableOpacity>
                {lineItems.length ? (
                  <View className="mt-3" style={{ gap: 8 }}>
                    {lineItems.map((item) => (
                      <Swipeable
                        key={item.id}
                        overshootRight={false}
                        renderRightActions={() => (
                          <TouchableOpacity
                            onPress={() => setLineItems((prev) => prev.filter((x) => x.id !== item.id))}
                            activeOpacity={0.75}
                            style={{
                              backgroundColor: colors.danger,
                              justifyContent: "center",
                              alignItems: "center",
                              paddingHorizontal: 16,
                              borderRadius: 12,
                              marginLeft: 8,
                            }}
                          >
                            <Text style={{ color: colors.surface, fontWeight: "700" }}>Delete</Text>
                          </TouchableOpacity>
                        )}
                      >
                      <View className="rounded-xl border border-border px-3 py-3 dark:border-border-dark">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="font-semibold text-textPrimary dark:text-textPrimary-dark">{item.name}</Text>
                            <Text className="text-textSecondary dark:text-textSecondary-dark">{item.quantity} × {formatINR(item.rate)}</Text>
                          </View>
                          <View className="items-end">
                            <Text className="font-bold text-textPrimary dark:text-textPrimary-dark">{formatINR(item.quantity * item.rate)}</Text>
                          </View>
                        </View>
                      </View>
                      </Swipeable>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* AMOUNT HERO + NUMPAD */}
            {entryMode === "quick" ? (
            <View className="mt-2">
              <Text className="mb-2 text-[11px] font-bold tracking-widest text-textSecondary dark:text-textSecondary-dark">
                AMOUNT
              </Text>
              <View className="rounded-2xl border-2 border-primary bg-surface px-5 py-6 dark:bg-surface-dark">
                <Text className="text-center text-[52px] font-extrabold" style={{ color: colors.primary }}>
                  {formatINR(parseFloat(quickAmount || "0"), { maximumFractionDigits: 2 })}
                </Text>
                <View className="mt-4" style={{ gap: 8 }}>
                  {["1,2,3", "4,5,6", "7,8,9", ".,0,⌫"].map((row) => (
                    <View key={row} className="flex-row" style={{ gap: 8 }}>
                      {row.split(",").map((key) => (
                        <TouchableOpacity
                          key={key}
                          className="flex-1 items-center justify-center border border-border"
                          style={{ borderRadius: 14, height: 72 }}
                          activeOpacity={0.75}
                          onPress={() => {
                            if (key === "⌫") {
                              setQuickAmount((prev) => prev.slice(0, -1));
                              return;
                            }
                            setQuickAmount((prev) => handleNumpadInput(prev, key));
                          }}
                        >
                          <Text className="text-[24px] font-bold text-textPrimary dark:text-textPrimary-dark">{key}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>
            ) : null}

            <View>
              {!orderNoteExpanded && !orderNote.trim() ? (
                <TouchableOpacity onPress={() => setOrderNoteExpanded(true)} activeOpacity={0.75}>
                  <Text className="text-[13px] font-semibold text-primary">+ Add note</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View>
              {orderNoteExpanded || orderNote.trim() ? (
                <View>
                  <Text className="mb-2 text-[11px] font-bold tracking-widest text-textSecondary dark:text-textSecondary-dark">
                    ADD NOTE (OPTIONAL)
                  </Text>
                  <View className="rounded-2xl border border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
                    <Input
                      placeholder="Optional note (e.g. delivery address, PO number…)"
                      value={orderNote}
                      onChangeText={setOrderNote}
                      variant="white"
                      multiline
                      numberOfLines={3}
                      maxLength={280}
                      containerStyle={styles.noteInputContainer}
                      inputStyle={styles.noteInput}
                    />
                  </View>
                </View>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-[11px] font-bold tracking-widest text-textSecondary dark:text-textSecondary-dark">DUE DATE</Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {[
                  { key: "today", label: "Today" },
                  { key: "7", label: "+7 days" },
                  { key: "15", label: "+15 days" },
                  { key: "30", label: "+30 days" },
                  { key: "custom", label: "Custom" },
                ].map((chip) => (
                  <TouchableOpacity
                    key={chip.key}
                    onPress={() => {
                      setDuePreset(chip.key as any);
                      if (chip.key === "custom") setIsCustomDuePickerOpen(true);
                    }}
                    className="rounded-full border px-3 py-2"
                    activeOpacity={0.75}
                    style={{
                      borderColor: duePreset === chip.key ? colors.primary : colors.border,
                      backgroundColor: duePreset === chip.key ? colors.primary : colors.surface,
                    }}
                  >
                    <Text style={{ color: duePreset === chip.key ? colors.surface : colors.textSecondary, fontWeight: "600" }}>
                      {chip.key === "custom" && duePreset === "custom" ? formatChipDate(customDueDate) : chip.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SUMMARY (Always visible) */}
            {entryType === "bill" && (quickAmount || hasItems) && (
              <View className="mt-2 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[14px] text-textSecondary dark:text-textSecondary-dark">
                    Entry Amount
                  </Text>
                  <Text className="text-[16px] font-bold text-textPrimary dark:text-textPrimary-dark">
                    ₹{entryAmount.toFixed(2)}
                  </Text>
                </View>

                {previousBalance > 0 && (
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-[14px] text-textSecondary dark:text-textSecondary-dark">
                      Previous Balance
                    </Text>
                    <Text className="text-[16px] font-bold" style={{ color: colors.warning }}>
                      ₹{previousBalance.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View
                  className="h-px my-2"
                  style={{ backgroundColor: colors.border }}
                />

                <View className="flex-row justify-between items-center">
                  <Text className="text-[16px] font-bold text-textPrimary dark:text-textPrimary-dark">
                    Grand Total
                  </Text>
                  <Text
                    className="text-[24px] font-extrabold"
                    style={{ color: colors.primary }}
                  >
                    ₹{totalWithBalance.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
              </Animated.View>
            ) : null}
          </ScrollView>

          {/* Absolute Footer */}
          {!showOnlyCustomerCard ? (
          <View className="absolute bottom-0 w-full">
            <BillFooter
              isLoading={createOrderMutation.isPending}
              onPrimaryAction={entryType === "payment" ? handleRecordPayment : handleSaveEntry}
              primaryLabel={entryType === "payment" ? "Record Payment" : "Save Entry"}
              onSecondaryAction={handleShareOnWhatsApp}
              secondaryLabel={entryType === "payment" ? undefined : "Share on WhatsApp"}
              secondaryDisabled={!savedEntry?.id}
              totalAmount={
                entryType === "payment"
                  ? parseFloat(quickAmount) || 0
                  : totalWithBalance
              }
              totalLabel={
                entryType === "payment" ? "Payment Amount" : "Grand Total"
              }
              showIcon={entryType !== "payment"}
              offlineQueueCount={queueLength}
              disabled={
                entryType === "payment"
                  ? !selectedCustomerId ||
                    !quickAmount.trim() ||
                    createOrderMutation.isPending
                  : !selectedCustomerId ||
                    (!quickAmount.trim() && !hasItems) ||
                    createOrderMutation.isPending
              }
             />
           </View>
          ) : null}

          <Modal
            visible={isAddItemModalOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsAddItemModalOpen(false)}
          >
            <View className="flex-1 items-center justify-end bg-black/40 px-4 pb-6">
              <View className="w-full rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                <Text className="text-lg font-bold text-textPrimary dark:text-textPrimary-dark">Add Item</Text>
                <View className="mt-3">
                  <Input
                    placeholder="Item Name"
                    value={itemName}
                    onChangeText={setItemName}
                    variant="white"
                  />
                  {itemNameCache.length ? (
                    <View className="mt-2 flex-row flex-wrap" style={{ gap: 6 }}>
                      {itemNameCache
                        .filter((x) => x.toLowerCase().includes(itemName.toLowerCase()))
                        .slice(0, 6)
                        .map((name) => (
                          <TouchableOpacity
                            key={name}
                            onPress={() => setItemName(name)}
                            className="rounded-full border border-border px-3 py-1 dark:border-border-dark"
                            activeOpacity={0.75}
                          >
                            <Text className="text-xs text-textSecondary dark:text-textSecondary-dark">{name}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  ) : null}
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="font-semibold text-textPrimary dark:text-textPrimary-dark">Quantity</Text>
                  <View className="flex-row items-center" style={{ gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setItemQty((q) => Math.max(1, q - 1))}
                      className="h-8 w-8 items-center justify-center rounded-md border border-border dark:border-border-dark"
                      activeOpacity={0.75}
                    >
                      <Text className="font-bold text-textPrimary dark:text-textPrimary-dark">-</Text>
                    </TouchableOpacity>
                    <Text className="w-8 text-center font-bold text-textPrimary dark:text-textPrimary-dark">{itemQty}</Text>
                    <TouchableOpacity
                      onPress={() => setItemQty((q) => q + 1)}
                      className="h-8 w-8 items-center justify-center rounded-md border border-border dark:border-border-dark"
                      activeOpacity={0.75}
                    >
                      <Text className="font-bold text-textPrimary dark:text-textPrimary-dark">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mt-4">
                  <Text className="mb-2 font-semibold text-textPrimary dark:text-textPrimary-dark">Rate</Text>
                  <Text className="mb-2 text-2xl font-extrabold text-primary">{formatINR(parseFloat(itemRateInput || "0"))}</Text>
                  <View style={{ gap: 8 }}>
                    {["1,2,3", "4,5,6", "7,8,9", ".,0,⌫"].map((row) => (
                      <View key={row} className="flex-row" style={{ gap: 8 }}>
                        {row.split(",").map((key) => (
                          <TouchableOpacity
                            key={key}
                            className="flex-1 items-center justify-center border border-border"
                            style={{ borderRadius: 14, height: 72 }}
                            activeOpacity={0.75}
                            onPress={() => {
                              if (key === "⌫") {
                                setItemRateInput((prev) => prev.slice(0, -1));
                                return;
                              }
                              setItemRateInput((prev) => handleNumpadInput(prev, key));
                            }}
                          >
                            <Text className="text-[24px] font-bold text-textPrimary dark:text-textPrimary-dark">{key}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>

                <Text className="mt-3 text-right font-semibold text-textPrimary dark:text-textPrimary-dark">
                  Total: {formatINR((parseFloat(itemRateInput) || 0) * itemQty)}
                </Text>

                <TouchableOpacity
                  onPress={addLineItem}
                  className="mt-4 rounded-xl bg-primary py-3"
                  activeOpacity={0.75}
                >
                  <Text className="text-center font-bold text-white">Add to Bill</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={isPostSaveModalOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsPostSaveModalOpen(false)}
          >
            <View className="flex-1 items-center justify-center bg-black/50 px-5">
              <View className="w-full max-w-[360px] rounded-2xl border border-border bg-surface p-5 dark:border-border-dark dark:bg-surface-dark">
                <Text className="text-[18px] font-bold text-textPrimary dark:text-textPrimary-dark">
                  Entry saved
                </Text>
                <Text className="mt-2 text-[14px] text-textSecondary dark:text-textSecondary-dark">
                  Choose what you want to do next.
                </Text>

                <TouchableOpacity
                  onPress={handleShareOnWhatsApp}
                  className="mt-4 rounded-xl bg-primary py-3"
                  activeOpacity={0.75}
                >
                  <Text className="text-center text-[15px] font-bold text-white">
                    Share on WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleViewSavedEntry}
                  className="mt-3 rounded-xl border border-border py-3 dark:border-border-dark"
                  activeOpacity={0.75}
                >
                  <Text className="text-center text-[15px] font-semibold text-textPrimary dark:text-textPrimary-dark">
                    View Entry
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDoneAfterSave}
                  className="mt-3 py-2"
                  activeOpacity={0.75}
                >
                  <Text className="text-center text-[14px] font-semibold text-textSecondary dark:text-textSecondary-dark">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {isCustomerSheetOpen ? (
            <CustomerPicker
              visible
              selectedPerson={selectedCustomerMeta}
              setSelectedPerson={handleSelectPerson}
              vendorId={vendorId!}
              onClose={() => setIsCustomerSheetOpen(false)}
            />
          ) : null}

          {isCustomDuePickerOpen ? (
            <Modal
              visible={isCustomDuePickerOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setIsCustomDuePickerOpen(false)}
            >
              <View className="flex-1 items-center justify-center bg-black/40 px-5">
                <View className="w-full max-w-[340px] rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
                  <Text className="mb-3 text-[16px] font-bold text-textPrimary dark:text-textPrimary-dark">
                    Select Due Date
                  </Text>
                  <DateTimePicker
                    value={customDueDate ? new Date(`${customDueDate}T00:00:00`) : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_, selectedDate) => {
                      if (Platform.OS !== "ios") {
                        setIsCustomDuePickerOpen(false);
                      }
                      if (selectedDate) {
                        setCustomDueDate(format(selectedDate, "yyyy-MM-dd"));
                      }
                    }}
                  />
                  {Platform.OS === "ios" ? (
                    <TouchableOpacity
                      onPress={() => setIsCustomDuePickerOpen(false)}
                      className="mt-3 rounded-xl bg-primary py-3"
                      activeOpacity={0.75}
                    >
                      <Text className="text-center font-bold text-white">Done</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </Modal>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    noteInputContainer: {
      borderWidth: 0,
      backgroundColor: "transparent",
      paddingHorizontal: 0,
    },
    noteInput: {
      fontSize: 15,
      color: colors.textPrimary,
    },
  });
