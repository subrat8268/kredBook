import { getCustomerPreviousBalance, recordPayment } from "@/src/api/entries";
import { fetchPersonDetail } from "@/src/api/people";
import Loader from "@/src/components/feedback/Loader";
import SyncStatus from "@/src/components/feedback/SyncStatus";
import { useToast } from "@/src/components/feedback/Toast";
import BillFooter from "@/src/components/orders/BillFooter";
import CustomerPicker from "@/src/components/picker/CustomerPicker";
import DateRangePicker from "@/src/components/ui/DateRangePicker";
import Input from "@/src/components/ui/Input";
import { useCreateOrder } from "@/src/hooks/useEntries";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { buildEntryShareMessage } from "@/src/utils/shareTemplates";
import { BillItem, generateBillPdf } from "@/src/utils/generateBillPdf";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { createMMKV } from "react-native-mmkv";
import { ArrowLeft, Pencil } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
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
  return date.toISOString();
}

function formatChipDate(dateStr?: string) {
  if (!dateStr) return "Custom";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
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
  const [note, setNote] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");
  const [orderNoteExpanded, setOrderNoteExpanded] = useState(false);
  const [entryType, setEntryType] = useState<"bill" | "payment">("bill");
  const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false);
  const [duePreset, setDuePreset] = useState<"today" | "7" | "15" | "30" | "custom">("today");
  const [customDueDate, setCustomDueDate] = useState<string | undefined>(undefined);
  const [isCustomDuePickerOpen, setIsCustomDuePickerOpen] = useState(false);

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

  // Initialize store if we were routed here with a preselected customer
  useEffect(() => {
    if (customerParams) {
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
      setEntryType("payment");
      setQuickAmount(String(amountParam));
    }
  }, [amountParam, customerParams, fetchPreviousBalance, router, showToast]);

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
  const hasItems = false;

  useEffect(() => {
    const key = `draft:${vendorId ?? "anon"}`;
    const cached = draftStorage.getString(key);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached);
      setQuickAmount(parsed.quickAmount ?? "");
      setNote(parsed.note ?? "");
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
  }, [draftStorage, vendorId]);

  useEffect(() => {
    const key = `draft:${vendorId ?? "anon"}`;
    draftStorage.set(
      key,
      JSON.stringify({ quickAmount, note, orderNote, entryType, duePreset, customDueDate, selectedCustomerMeta }),
    );
  }, [customDueDate, draftStorage, duePreset, entryType, note, orderNote, quickAmount, selectedCustomerMeta, vendorId]);

  // Calculate effective total (amount-first flow only)
  const entryAmount = parseFloat(quickAmount) || 0;
  const totalWithBalance = entryAmount + previousBalance;

  const handleSaveAndShare = async () => {
    // Validation
    if (!selectedCustomerId) {
      return Alert.alert("Error", "Please select a person");
    }

    if (entryType === "payment") {
      if (!quickAmount.trim() || parseFloat(quickAmount) <= 0) {
        return Alert.alert("Error", "Please enter a payment amount");
      }
      return handleRecordPayment();
    }

    // Quick amount must be provided
    if (!quickAmount.trim()) {
      return Alert.alert("Error", "Please enter an amount");
    }

    await performSave();
  };

  const performSave = async () => {
    try {
      // Create a generic entry item from quick amount
      const orderItems = [
        {
          product_id: null,
          product_name: note.trim() || "Entry Amount",
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

      // Generate Native Shareable PDF
      const pdfItems: BillItem[] = [
        {
          name: note.trim() || "Entry Amount",
          quantity: 1,
          rate: parseFloat(quickAmount) || 0,
          amount: parseFloat(quickAmount) || 0,
        },
      ];

      const businessDetails = {
        name: profile?.business_name || "Your Store",
        address: profile?.business_address || "",
        phone: profile?.phone || "",
        gstin: profile?.gstin || "",
      };

      const billMeta = {
        invoiceNumber: savedOrder.bill_number,
        date: new Date(savedOrder.created_at ?? Date.now()).toLocaleDateString(
          "en-IN",
        ),
        subtotal: parseFloat(quickAmount) || 0,
        taxAmount: 0,
        loadingCharge: 0,
        bankDetails:
          profile?.bank_name && profile?.account_number && profile?.ifsc_code
            ? {
                bankName: profile.bank_name,
                accountNo: profile.account_number,
                ifsc: profile.ifsc_code,
              }
            : undefined,
      };

      const localPdfPath = await generateBillPdf(
        pdfItems,
        businessDetails,
        entryAmount,
        selectedCustomerMeta?.name || "Person",
        billMeta,
      );

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(localPdfPath, { mimeType: "application/pdf" });
      } else {
        const locale = i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en";
        await Share.share({
          message: buildEntryShareMessage({
            locale,
            customerName: selectedCustomerMeta?.name || "Customer",
            amount: entryAmount,
            entryDate: savedOrder.created_at ?? new Date(),
            dueDate: (savedOrder as any).due_date ?? null,
            businessName: profile?.business_name || profile?.name || "KredBook",
          }),
        });
      }

      // Cleanup Draft on success and go to the created detail screen.
      setQuickAmount("");
      setNote("");
      setOrderNote("");
      setOrderNoteExpanded(false);
      showToast({
        message: `Entry created for ${selectedCustomerMeta?.name ?? "customer"}`,
        type: "success",
      });
      router.replace({
        pathname: "/(main)/entries/[orderId]",
        params: { orderId: savedOrder.id },
      } as never);
    } catch (err: any) {
      console.error("Save & Share failed:", err.message);
      const errorMessage = err.message || "Failed to save and share entry";
      showToast({ message: errorMessage, type: "error" });
      Alert.alert("Error", errorMessage);
    }
  };

  const invoiceRef = `${profile?.bill_number_prefix || "INV"}-NEW`;

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
      if (paymentAmount > (detail.pendingOrderBalance ?? 0)) {
        Alert.alert(
          "Amount too high",
          `Payment exceeds the pending balance of ${formatINR(detail.pendingOrderBalance ?? 0)}.`,
        );
        return;
      }
      await recordPayment(
        detail.pendingOrderId,
        profile.id,
        paymentAmount,
        "Cash",
        false,
        note.trim() || undefined,
      );
      // Ensure lists refresh after recording a payment.
      queryClient.invalidateQueries({ queryKey: ["orders", profile.id] });
      queryClient.invalidateQueries({ queryKey: ["customers", profile.id] });
      queryClient.invalidateQueries({
        queryKey: ["customerDetail", selectedCustomerId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
      setQuickAmount("");
      setNote("");
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center border-b border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-1"
            >
              <ArrowLeft
                size={22}
                color={colors.textPrimary}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
            <Text className="flex-1 text-[18px] font-bold text-textPrimary dark:text-textPrimary-dark">
              Add Entry
            </Text>
            <View className="mr-2">
              <SyncStatus />
            </View>
            <View className="rounded-full border border-primary bg-primary-light px-3 py-1 dark:bg-primary-soft-dark">
              <Text className="text-[13px] font-bold text-primary">
                {entryType === "payment" ? "PAYMENT" : invoiceRef}
              </Text>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >

            {/* Person picker */}
            <View className="overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
              <TouchableOpacity onPress={() => setIsCustomerSheetOpen(true)} className="flex-row items-center border-b border-border px-4 py-4 dark:border-border-dark">
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
                    style={{ backgroundColor: colors.dangerBg }}
                  >
                    <Text className="text-[13px] font-bold text-danger">
                      ⚠️ Previous Balance: ₹
                      {formatINR(previousBalance, { currencySymbol: "" })}
                    </Text>
                  </View>
                )}
            </View>

            {/* AMOUNT HERO + NUMPAD */}
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
                          className="flex-1 rounded-xl border border-border py-3 items-center"
                          onPress={() => {
                            if (key === "⌫") {
                              setQuickAmount((prev) => prev.slice(0, -1));
                              return;
                            }
                            if (key === "." && quickAmount.includes(".")) return;
                            setQuickAmount((prev) => `${prev}${key}`);
                          }}
                        >
                          <Text className="text-[22px] font-bold text-textPrimary dark:text-textPrimary-dark">{key}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View>
              {!orderNoteExpanded && !orderNote.trim() ? (
                <TouchableOpacity onPress={() => setOrderNoteExpanded(true)}>
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
                    style={{
                      borderColor: duePreset === chip.key ? colors.primary : colors.border,
                      backgroundColor: duePreset === chip.key ? colors.primaryLight : colors.surface,
                    }}
                  >
                    <Text style={{ color: duePreset === chip.key ? colors.primary : colors.textSecondary, fontWeight: "600" }}>
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
                    <Text className="text-[16px] font-bold text-danger">
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
          </ScrollView>

          {/* Absolute Footer */}
          <View className="absolute bottom-0 w-full">
            <BillFooter
              isLoading={createOrderMutation.isPending}
              onSaveAndShare={handleSaveAndShare}
              shareLabel={
                entryType === "payment" ? "Record Payment" : "Save & Share"
              }
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
            <DateRangePicker
              visible
              value={{ from: customDueDate, to: customDueDate }}
              onChange={(range) => {
                const selected = range.to ?? range.from;
                if (selected) setCustomDueDate(selected);
              }}
              onClose={() => setIsCustomDuePickerOpen(false)}
            />
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
