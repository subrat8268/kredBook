import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import BillFooter from "@/src/components/orders/BillFooter";
import OrderSummary from "@/src/components/orders/OrderSummary";
import DetailHeader from "@/src/components/layer2/DetailHeader";
import EditWarningBanner from "@/src/components/entries/EditWarningBanner";
import EditCustomerCard from "@/src/components/entries/EditCustomerCard";
import EditItemizedSection from "@/src/components/entries/EditItemizedSection";
import EntrySummaryCard from "@/src/components/entries/EntrySummaryCard";
import Input from "@/src/components/ui/Input";
import { useOrderDetail, useUpdateOrder } from "@/src/hooks/useEntries";
import { useAuthStore } from "@/src/store/authStore";
import { useOrderStore, DraftOrderItem } from "@/src/store/orderStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { generateBillPdf } from "@/src/utils/generateBillPdf";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { Lock } from "lucide-react-native";
import SaveEntryBottomSheet from "@/src/components/entries/SaveEntryBottomSheet";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditOrderScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { profile, isFetchingProfile } = useAuthStore();
  const { show: showToast } = useToast();
  const vendorId = profile?.id;

  // Fetch existing order
  const { data: order, isLoading: orderLoading } = useOrderDetail(orderId);

  // Zustand Draft Entry Store
  const setCustomer = useOrderStore((state) => state.setCustomer);
  const setItems = useOrderStore((state) => state.setItems);
  const items = useOrderStore((state) => state.items);
  const loadingCharge = useOrderStore((state) => state.loadingCharge);
  const taxPercent = useOrderStore((state) => state.gstPercent);

  const removeItem = useOrderStore((state) => state.removeItem);
  const updateItemQuantity = useOrderStore((state) => state.updateItemQuantity);
  const updateItemRate = useOrderStore((state) => state.updateItemRate);
  const setLoadingCharge = useOrderStore((state) => state.setLoadingCharge);
  const setGst = useOrderStore((state) => state.setGst);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  // Quick entry mode (amount-first)
  const [quickAmount, setQuickAmount] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [orderNoteExpanded, setOrderNoteExpanded] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [saveSheetVisible, setSaveSheetVisible] = useState(false);

  const updateMutation = useUpdateOrder(vendorId || "");

  // Pre-populate form when order loads
  useEffect(() => {
    if (!order) return;

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
  }, [order, setCustomer, setItems, clearOrder, setLoadingCharge, setGst]);

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
              Alert.alert(
                "Add Item",
                "Adding new items to an existing entry is not supported in edit mode.",
              );
            }}
            defaultExpanded={items.length > 0}
          />

          {/* Card 1: Taxes & Grand Total (only for items) */}
          {items.length > 0 && (
            <View className="bg-white mx-4 mb-3 rounded-xl border border-stone-300/30 p-4 shadow-sm">
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
          disabled={submitting || finalTotal <= 0}
        />
      </KeyboardAvoidingView>

      <SaveEntryBottomSheet
        visible={saveSheetVisible}
        onClose={() => setSaveSheetVisible(false)}
        billNumber={order?.bill_number}
        onSaveOnly={() => performSave(false)}
        onSaveAndShare={() => performSave(true)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
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
