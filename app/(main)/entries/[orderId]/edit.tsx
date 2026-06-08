import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import BillFooter from "@/src/components/orders/BillFooter";
import OrderSummary from "@/src/components/orders/OrderSummary";
import DetailHeader from "@/src/components/layer2/DetailHeader";
import {
  EditWarningBanner,
  EditCustomerCard,
  EditItemizedSection,
  EntrySummaryCard,
  SaveEntryBottomSheet,
} from "@/src/components/entries";
import Input from "@/src/components/ui/Input";
import { useOrderDetail, useUpdateOrder } from "@/src/hooks/useEntries";
import { useAuthStore } from "@/src/store/authStore";
import { useOrderStore, DraftOrderItem } from "@/src/store/orderStore";
import { useTheme } from "@/src/theme/useTheme";
import { generateBillPdf } from "@/src/utils/generateBillPdf";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { DatePickerSheet } from "@/src/components/ui/DateRangePicker";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleNumpadInput, NumpadKey } from "@/src/utils/numpad";
import * as Haptics from "expo-haptics";
import { formatINR } from "@/src/utils/format";

function computeDueDateFromPreset(
  preset: "today" | "7" | "15" | "30" | "custom",
  baseDateStr?: string,
) {
  const date = baseDateStr
    ? new Date(createdAtCompat(baseDateStr))
    : new Date();
  if (preset === "7") date.setDate(date.getDate() + 7);
  if (preset === "15") date.setDate(date.getDate() + 15);
  if (preset === "30") date.setDate(date.getDate() + 30);
  if (preset === "custom") date.setDate(date.getDate() + 30);
  return format(date, "yyyy-MM-dd");
}

function createdAtCompat(dateStr: string) {
  return dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
}

function formatChipDate(dateStr?: string) {
  if (!dateStr) return "Custom";
  const d = new Date(createdAtCompat(dateStr));
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function determinePreset(
  dueDateStr: string,
  createdAtStr: string,
): "today" | "7" | "15" | "30" | "custom" {
  try {
    const created = new Date(createdAtCompat(createdAtStr));
    const due = new Date(createdAtCompat(dueDateStr));
    const diffTime = due.getTime() - created.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "today";
    if (diffDays === 7) return "7";
    if (diffDays === 15) return "15";
    if (diffDays === 30) return "30";
    return "custom";
  } catch {
    return "custom";
  }
}

export default function EditOrderScreen() {
  const t = useTheme();
  const colors = useMemo(() => ({
    ...t.colors,
    background: t.colors.canvas,
    textPrimary: t.colors.ink,
    textSecondary: t.colors.muted,
    textBody: t.colors.body,
    border: t.colors.borderDefault,
  }), [t.colors]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { profile, isFetchingProfile } = useAuthStore();
  const { show: showToast } = useToast();
  const vendorId = profile?.id;

  // Network sync for offline queue length
  const { queueLength } = useNetworkSync();

  // Fetch existing order
  const { data: order, isLoading: orderLoading } = useOrderDetail(orderId);

  // Zustand Draft Entry Store
  const setCustomer = useOrderStore((state) => state.setCustomer);
  const setItems = useOrderStore((state) => state.setItems);
  const items = useOrderStore((state) => state.items);
  const loadingCharge = useOrderStore((state) => state.loadingCharge);
  const taxPercent = useOrderStore((state) => state.gstPercent);

  const addItem = useOrderStore((state) => state.addItem);
  const removeItem = useOrderStore((state) => state.removeItem);
  const updateItemQuantity = useOrderStore((state) => state.updateItemQuantity);
  const updateItemRate = useOrderStore((state) => state.updateItemRate);
  const setLoadingCharge = useOrderStore((state) => state.setLoadingCharge);
  const setGst = useOrderStore((state) => state.setGst);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  const [initialized, setInitialized] = useState(false);

  // Quick entry mode (amount-first)
  const [quickAmount, setQuickAmount] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [orderNoteExpanded, setOrderNoteExpanded] = useState(false);

  // Due date states
  const [duePreset, setDuePreset] = useState<
    "today" | "7" | "15" | "30" | "custom"
  >("today");
  const [customDueDate, setCustomDueDate] = useState<string | undefined>(
    undefined,
  );
  const [isCustomDateActive, setIsCustomDateActive] = useState(false);
  const [isCustomDuePickerOpen, setIsCustomDuePickerOpen] = useState(false);

  // Add Item Modal states
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQtyInput, setItemQtyInput] = useState("1");
  const [itemRateInput, setItemRateInput] = useState("");
  const [itemNameCache, setItemNameCache] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [saveSheetVisible, setSaveSheetVisible] = useState(false);

  const updateMutation = useUpdateOrder(vendorId || "");

  // Load item autocomplete cache
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

  const persistItemNameCache = useCallback(
    async (name: string) => {
      const normalized = name.trim();
      if (!normalized) return;
      const next = [
        normalized,
        ...itemNameCache.filter(
          (n) => n.toLowerCase() !== normalized.toLowerCase(),
        ),
      ].slice(0, 50);
      setItemNameCache(next);
      await AsyncStorage.setItem("item-name-cache", JSON.stringify(next));
    },
    [itemNameCache],
  );

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
    const parsedQty = parseFloat(itemQtyInput) || 1;

    addItem({
      product_id: null,
      product_name: name,
      variant_id: null,
      variant_name: null,
      price: rate,
      quantity: parsedQty,
    });

    await persistItemNameCache(name);
    setItemName("");
    setItemQtyInput("1");
    setItemRateInput("");
    Keyboard.dismiss();
    setIsAddItemModalOpen(false);
  };

  // Pre-populate form when order loads
  useEffect(() => {
    if (!order || initialized) return;

    if (order.customer) {
      setCustomer(order.customer.id);
    }

    if (order.items && order.items.length > 0) {
      const mapped = order.items.map((item: DraftOrderItem) => ({
        id: `order-${item.id}`,
        product_id: item.product_id ?? null,
        product_name: item.product_name,
        variant_id: item.variant_id ?? null,
        variant_name: item.variant_name ?? null,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));
      setItems(mapped);
      setQuickAmount("");
    } else {
      clearOrder();
      setQuickAmount(order.total_amount.toString());
    }

    setLoadingCharge(Number(order.loading_charge || 0));
    setGst(Number(order.tax_percent || 0));

    if (order.note && order.note.trim()) {
      setOrderNote(order.note);
      setOrderNoteExpanded(true);
    } else {
      setOrderNote("");
      setOrderNoteExpanded(false);
    }

    if (order.due_date) {
      setCustomDueDate(order.due_date);
      setIsCustomDateActive(true);
      const preset = determinePreset(order.due_date, order.created_at);
      setDuePreset(preset);
    } else {
      setDuePreset("today");
      setCustomDueDate(computeDueDateFromPreset("today", order.created_at));
      setIsCustomDateActive(false);
    }

    setInitialized(true);
  }, [
    order,
    initialized,
    setCustomer,
    setItems,
    clearOrder,
    setLoadingCharge,
    setGst,
  ]);

  // Calculate totals
  const itemsTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const taxAmount = useMemo(
    () => (itemsTotal * taxPercent) / 100,
    [itemsTotal, taxPercent],
  );
  const finalTotal = useMemo(
    () =>
      items.length > 0
        ? itemsTotal + taxAmount + loadingCharge
        : Number(quickAmount || 0),
    [items, itemsTotal, taxAmount, loadingCharge, quickAmount],
  );

  const isFormDirty = useMemo(() => {
    if (!order) return false;

    const noteChanged = orderNote.trim() !== (order.note || "").trim();
    const dueDateChanged = customDueDate !== (order.due_date || undefined);

    if (order.items && order.items.length > 0) {
      const itemsChanged =
        items.length !== order.items.length ||
        !items.every((item, idx) => {
          const dbItem = order.items[idx];
          if (!dbItem) return false;
          return (
            item.product_name === dbItem.product_name &&
            item.price === Number(dbItem.price) &&
            item.quantity === Number(dbItem.quantity)
          );
        });

      const loadingChanged =
        loadingCharge !== Number(order.loading_charge || 0);
      const taxChanged = taxPercent !== Number(order.tax_percent || 0);

      return (
        itemsChanged ||
        loadingChanged ||
        taxChanged ||
        noteChanged ||
        dueDateChanged
      );
    } else {
      const amountChanged =
        Number(quickAmount || 0) !== Number(order.total_amount || 0);
      const itemsAdded = items.length > 0;

      return amountChanged || itemsAdded || noteChanged || dueDateChanged;
    }
  }, [
    order,
    items,
    loadingCharge,
    taxPercent,
    quickAmount,
    orderNote,
    customDueDate,
  ]);

  const buildItemsPayload = () =>
    items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      variant_id: item.variant_id ?? null,
      variant_name: item.variant_name ?? null,
      price: item.price,
      quantity: item.quantity,
    }));

  const shareUpdatedBill = async (updatedOrder: any) => {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) throw new Error("sharing-unavailable");

    const pdfItems = (updatedOrder.items ?? []).map((item: any) => ({
      name: item.product_name,
      quantity: item.quantity,
      rate: item.price,
      amount: item.subtotal,
    }));

    const subtotal = (updatedOrder.items ?? []).reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0,
    );
    const taxAmount = updatedOrder.tax_percent
      ? Math.round(((subtotal * updatedOrder.tax_percent) / 100) * 100) / 100
      : 0;

    const pdfUri = await generateBillPdf(
      pdfItems,
      {
        name: profile?.business_name ?? profile?.name ?? "",
        address: profile?.business_address || undefined,
        phone: profile?.phone ?? "",
        gstin: profile?.gstin ?? "",
      },
      updatedOrder.total_amount,
      updatedOrder.customer?.name ?? "Person",
      {
        invoiceNumber: updatedOrder.bill_number,
        date: new Date(updatedOrder.created_at).toLocaleDateString("en-IN"),
        subtotal,
        taxAmount,
        loadingCharge: updatedOrder.loading_charge ?? 0,
        bankDetails:
          profile?.bank_name && profile?.account_number && profile?.ifsc_code
            ? {
                bankName: profile.bank_name,
                accountNo: profile.account_number,
                ifsc: profile.ifsc_code,
              }
            : undefined,
      },
    );

    await Sharing.shareAsync(pdfUri, {
      mimeType: "application/pdf",
      dialogTitle: `Entry ${updatedOrder.bill_number}`,
      UTI: "com.adobe.pdf",
    });
  };

  const performSave = async (shouldShare: boolean) => {
    const currentOrder = order;
    if (!currentOrder) return;
    setSubmitting(true);
    try {
      const updatedOrder = await updateMutation.mutateAsync({
        orderId: currentOrder.id,
        items: buildItemsPayload(),
        loadingCharge,
        taxPercent,
        quickAmount: Number(quickAmount || 0),
        customerId: currentOrder.customer?.id ?? null,
        note: orderNote.trim() ? orderNote.trim() : null,
        dueDate: customDueDate || null,
      });

      if (shouldShare) {
        try {
          await shareUpdatedBill(updatedOrder);
        } catch (shareError) {
          console.error("Share failed:", shareError);
          showToast({
            message: "Updated entry saved. Sharing failed.",
            type: "error",
          });
        }
      }

      showToast({ message: "Entry updated", type: "success" });
      router.back();
    } catch (error: any) {
      console.error("Error updating order:", error);
      Alert.alert("Error", error.message || "Failed to update entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!vendorId || !order) return;

    // Validation
    if (items.length === 0 && !quickAmount) {
      Alert.alert("Error", "Please enter an amount or add items");
      return;
    }

    if (finalTotal <= 0) {
      Alert.alert("Error", "Total amount must be greater than zero");
      return;
    }

    if (order.amount_paid > finalTotal) {
      Alert.alert(
        "Amount too low",
        "Total cannot be less than the amount already paid for this entry.",
      );
      return;
    }

    setSaveSheetVisible(true);
  };

  if (isFetchingProfile || orderLoading || !order) {
    return <Loader />;
  }

  const customerName = order.customer?.name || "Unknown Person";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <DetailHeader
        title={`Edit Entry ${order.bill_number}`}
        subtitle={
          (order.edit_count ?? 0) > 0
            ? `Edited ${order.edit_count} ${order.edit_count === 1 ? "time" : "times"}`
            : undefined
        }
        onBack={() => router.back()}
      />

      <EditWarningBanner />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <EditCustomerCard
            customerName={customerName}
            customerPhone={order.customer?.phone}
          />

          {/* Quick Amount Entry */}
          {items.length === 0 && (
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 16,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Total Amount
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  ₹
                </Text>
                <Input
                  placeholder="0"
                  value={quickAmount}
                  onChangeText={setQuickAmount}
                  keyboardType="numeric"
                  autoFocus
                  variant="white"
                  containerStyle={styles.quickAmountInputContainer}
                  inputStyle={styles.quickAmountInput}
                />
              </View>
            </View>
          )}

          {/* Entry Note (optional) */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              marginBottom: 8,
            }}
          >
            {!orderNoteExpanded && !orderNote.trim() ? (
              <TouchableOpacity onPress={() => setOrderNoteExpanded(true)}>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.primary,
                    fontWeight: "600",
                  }}
                >
                  + Add note
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Add note (optional)
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  <TextInput
                    value={orderNote}
                    onChangeText={setOrderNote}
                    placeholder="Optional note (e.g. delivery address, PO number…)"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    maxLength={280}
                    style={{
                      color: colors.textPrimary,
                      fontSize: 14,
                      minHeight: 72,
                      textAlignVertical: "top",
                    }}
                  />
                </View>
              </>
            )}
          </View>

          <EditItemizedSection
            items={items}
            onUpdateQuantity={updateItemQuantity}
            onUpdateRate={updateItemRate}
            onRemove={removeItem}
            onAddItem={() => {
              setIsAddItemModalOpen(true);
            }}
            defaultExpanded={items.length > 0}
          />

          {/* Card 1: Taxes & Grand Total (only for items) */}
          {items.length > 0 && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              className="mx-4 mb-3 rounded-xl p-4 shadow-sm"
            >
              <OrderSummary
                itemsTotal={itemsTotal}
                loadingCharge={loadingCharge}
                taxPercent={taxPercent}
                taxAmount={taxAmount}
                previousBalance={Number(order.previous_balance || 0)}
                grandTotal={finalTotal}
                onLoadingChargeChange={setLoadingCharge}
                onTaxChange={setGst}
              />
            </View>
          )}

          {/* Due Date Preset Selector */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="mx-4 mb-3 rounded-xl p-4 shadow-sm"
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 8,
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              Due Date
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
            >
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
                    if (chip.key === "custom") {
                      setIsCustomDuePickerOpen(true);
                      return;
                    }
                    setDuePreset(chip.key as any);
                    setCustomDueDate(
                      computeDueDateFromPreset(
                        chip.key as any,
                        order.created_at,
                      ),
                    );
                    setIsCustomDateActive(false);
                  }}
                  className="rounded-full border px-3 py-2"
                  activeOpacity={0.75}
                  style={{
                    borderColor:
                      chip.key === "custom"
                        ? isCustomDateActive
                          ? colors.primary
                          : colors.border
                        : duePreset === chip.key
                          ? colors.primary
                          : colors.border,
                    backgroundColor:
                      chip.key === "custom"
                        ? isCustomDateActive
                          ? colors.primary
                          : colors.surface
                        : duePreset === chip.key
                          ? colors.primary
                          : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color:
                        chip.key === "custom"
                          ? isCustomDateActive
                            ? colors.surface
                            : colors.textSecondary
                          : duePreset === chip.key
                            ? colors.surface
                            : colors.textSecondary,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {chip.key === "custom" &&
                    isCustomDateActive &&
                    customDueDate
                      ? formatChipDate(customDueDate)
                      : chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Card 2: Total Outstanding Summary */}
          <EntrySummaryCard
            previousBalance={Number(order.previous_balance || 0)}
            newTotal={finalTotal}
            className="mx-4 mb-3"
          />
        </ScrollView>

        {/* Footer */}
        <BillFooter
          isLoading={submitting}
          onSaveAndShare={handleSubmit}
          shareLabel="Save"
          totalAmount={finalTotal}
          totalLabel="Grand Total"
          offlineQueueCount={queueLength}
          disabled={submitting || finalTotal <= 0 || !isFormDirty}
        />
      </KeyboardAvoidingView>

      <SaveEntryBottomSheet
        visible={saveSheetVisible}
        onClose={() => setSaveSheetVisible(false)}
        billNumber={order?.bill_number}
        onSaveOnly={() => performSave(false)}
        onSaveAndShare={() => performSave(true)}
      />

      {/* Add Item Modal */}
      <Modal
        visible={isAddItemModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddItemModalOpen(false)}
      >
        <View style={{ backgroundColor: t.colors.surfaceOverlay }} className="flex-1 items-center justify-end px-4 pb-6">
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="w-full rounded-2xl p-4"
          >
            <Text
              style={{ color: colors.textPrimary }}
              className="text-lg font-bold mb-3"
            >
              Add Item
            </Text>
            <View className="mt-1">
              <Input
                placeholder="Item Name"
                value={itemName}
                onChangeText={setItemName}
                variant="white"
              />
              {itemNameCache.length ? (
                <View className="mt-2 flex-row flex-wrap" style={{ gap: 6 }}>
                  {itemNameCache
                    .filter((x) =>
                      x.toLowerCase().includes(itemName.toLowerCase()),
                    )
                    .slice(0, 6)
                    .map((name) => (
                      <TouchableOpacity
                        key={name}
                        onPress={() => setItemName(name)}
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.surfaceRaised,
                          borderWidth: 1,
                        }}
                        className="rounded-full px-3 py-1"
                        activeOpacity={0.75}
                      >
                        <Text style={{ color: colors.textBody }} className="text-xs">{name}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ) : null}
            </View>

            <View className="mt-4">
              <Text style={{ color: colors.textPrimary }} className="font-semibold mb-2">Quantity</Text>
              <View style={{ borderColor: colors.border, backgroundColor: colors.surfaceRaised, borderWidth: 1 }} className="rounded-xl px-4 py-3">
                <TextInput
                  style={{ color: colors.textPrimary }}
                  className="text-[20px] font-bold text-center"
                  value={itemQtyInput}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9.]/g, "");
                    const parts = cleaned.split(".");
                    if (parts.length > 2) return;
                    setItemQtyInput(cleaned);
                  }}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View className="mt-4">
              <Text style={{ color: colors.textPrimary }} className="mb-2 font-semibold">Rate</Text>
              <Text style={{ color: colors.primary }} className="mb-2 text-2xl font-extrabold">
                {formatINR(parseFloat(itemRateInput || "0"))}
              </Text>
              <View style={{ gap: 8 }}>
                {["1,2,3", "4,5,6", "7,8,9", ".,0,⌫"].map((row) => (
                  <View key={row} className="flex-row" style={{ gap: 8 }}>
                    {row.split(",").map((key) => (
                      <TouchableOpacity
                        key={key}
                        style={{
                          borderRadius: 14,
                          height: 60,
                          backgroundColor: colors.surfaceRaised,
                          borderColor: colors.border,
                          borderWidth: 1,
                        }}
                        className="flex-1 items-center justify-center"
                        activeOpacity={0.75}
                        onPress={() => {
                          if (key === "⌫") {
                            setItemRateInput((prev) =>
                              handleNumpadInput(prev, "⌫"),
                            );
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                            return;
                          }
                          setItemRateInput((prev) =>
                            handleNumpadInput(prev, key as NumpadKey),
                          );
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                        }}
                        onLongPress={() => {
                          if (key === "⌫") {
                            setItemRateInput("");
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Medium,
                            );
                          }
                        }}
                        delayLongPress={500}
                      >
                        <Text style={{ color: colors.textPrimary }} className="text-[20px] font-bold">
                          {key}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <Text style={{ color: colors.textPrimary }} className="mt-3 text-right font-semibold">
              Total:{" "}
              {formatINR(
                (parseFloat(itemRateInput) || 0) *
                  (parseFloat(itemQtyInput) || 1),
              )}
            </Text>

            <TouchableOpacity
              onPress={addLineItem}
              style={{ backgroundColor: colors.primaryActive }}
              className="mt-4 rounded-xl py-3.5"
              activeOpacity={0.75}
            >
              <Text className="text-center font-bold text-white text-base">
                Add to Bill
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsAddItemModalOpen(false);
                setItemName("");
                setItemQtyInput("1");
                setItemRateInput("");
              }}
              className="mt-2 py-2"
              activeOpacity={0.75}
            >
              <Text style={{ color: colors.textSecondary }} className="text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Due Date Picker Sheet */}
      {isCustomDuePickerOpen && (
        <DatePickerSheet
          title="Select Due Date"
          value={
            customDueDate
              ? new Date(createdAtCompat(customDueDate))
              : new Date()
          }
          visible={isCustomDuePickerOpen}
          onConfirm={(date) => {
            setCustomDueDate(format(date, "yyyy-MM-dd"));
            setDuePreset("custom");
            setIsCustomDateActive(true);
            setIsCustomDuePickerOpen(false);
          }}
          onClose={() => setIsCustomDuePickerOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    quickAmountInputContainer: {
      borderWidth: 0,
      backgroundColor: "transparent",
      paddingHorizontal: 0,
      marginLeft: 8,
    },
    quickAmountInput: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.textPrimary,
    },
  });
