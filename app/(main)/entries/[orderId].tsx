import EmptyState from "@/src/components/feedback/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import DetailHeader from "@/src/components/layer2/DetailHeader";
import EntryHeroCard from "@/src/components/entries/EntryHeroCard";
import EntryCustomerCard from "@/src/components/entries/EntryCustomerCard";
import EntryItemsSection from "@/src/components/entries/EntryItemsSection";
import EntryPaymentsSection from "@/src/components/entries/EntryPaymentsSection";
import EntryStickyBar from "@/src/components/entries/EntryStickyBar";
import DeleteEntryModal from "@/src/components/entries/DeleteEntryModal";
import RemindCustomerModal from "@/src/components/entries/RemindCustomerModal";
import { usePayments } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/ThemeProvider";
import { generateBillPdf } from "@/src/utils/generateBillPdf";
import { formatDate } from "@/src/utils/helper";
import { buildEntryShareMessage } from "@/src/utils/shareTemplates";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Linking, ScrollView, Platform, View, Text } from "react-native";
import {
  Pencil,
  User,
  Printer,
  CheckCircle,
  Trash,
  Share2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { orderKeys, useOrderDetail } from "@/src/hooks/useEntries";
import { formatINR } from "@/src/utils/format";
import { deleteOrder } from "@/src/api/entries";
import { MenuItem } from "@/src/components/layer2/OverflowMenu";

export default function OrderDetailScreen() {
  const { colors, spacing } = useTheme();
  const { i18n } = useTranslation();
  const shareLocale = useMemo(
    () => (i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en"),
    [i18n.language],
  );

  const { orderId, justPaid } = useLocalSearchParams<{ orderId: string; justPaid?: string }>();
  const router = useRouter();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useOrderDetail(orderId);
  const { payments, isLoading: paymentsLoading, isError: paymentsError } = usePayments(
    orderId ?? "",
    profile?.id,
  );

  const paymentModalRef = useRef<any>(null);
  const [sendingEntry, setSendingEntry] = useState(false);
  const [quickPaymentAmount, setQuickPaymentAmount] = useState<string>("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [remindModalVisible, setRemindModalVisible] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const bannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { show: showToast } = useToast();

  useEffect(() => {
    if (justPaid === "true") {
      setShowSuccessBanner(true);
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current);
      }
      bannerTimeoutRef.current = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 4000);
    }
    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, [justPaid]);

  const fmt = useCallback(
    (value: number) =>
      formatINR(value, {
        currencySymbol: "",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  );

  // ── Derived values ───────────────────────────────────────────────
  const customerName = order?.customer?.name ?? "Unknown Person";
  const customerPhone = order?.customer?.phone ?? "";

  const dueDateValue =
    order && "due_date" in order && typeof order.due_date === "string"
      ? order.due_date
      : null;
  const isOverdue =
    !!order &&
    order.status !== "Paid" &&
    !!dueDateValue &&
    new Date(dueDateValue) < new Date(new Date().setHours(0, 0, 0, 0));
  const statusKey = isOverdue ? "Overdue" : (order?.status ?? "Pending");

  const itemsSubtotal = useMemo(
    () => order?.items?.reduce((s, i) => s + i.subtotal, 0) ?? 0,
    [order?.items],
  );
  const taxAmount = order?.tax_percent
    ? Math.round(((itemsSubtotal * order.tax_percent) / 100) * 100) / 100
    : 0;
  const grandTotal =
    (order?.total_amount ?? 0) + (order?.previous_balance ?? 0);

  const sortedPayments = useMemo(
    () =>
      [...(payments ?? [])].sort(
        (a, b) =>
          new Date(a.payment_date).getTime() -
          new Date(b.payment_date).getTime(),
      ),
    [payments],
  );

  const paymentRows = useMemo(() => {
    let running = order?.total_amount ?? 0;
    return sortedPayments.map((p) => {
      running -= p.amount;
      return { payment: p, remaining: Math.max(0, running) };
    });
  }, [sortedPayments, order?.total_amount]);

  // ── Send Entry ──────────────────────────────────────────────────
  const handleShareLedgerLink = useCallback(async () => {
    if (!order) return;
    setSendingEntry(true);
    try {
      const pdfUri = await generateBillPdf(
        order.items.map((i) => ({
          name: i.product_name,
          quantity: i.quantity,
          rate: i.price,
          price: i.price,
          amount: i.subtotal,
          variantName: i.variant_name,
        })),
        {
          name: profile?.business_name ?? profile?.name ?? "",
          address: profile?.business_address || undefined,
          phone: profile?.phone ?? "",
          gstin: profile?.gstin ?? "",
        },
        order.total_amount,
        customerName,
        {
          invoiceNumber: order.bill_number,
          date: formatDate(order.created_at),
          subtotal: itemsSubtotal,
          taxAmount,
          loadingCharge: order.loading_charge ?? 0,
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

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: "application/pdf",
          dialogTitle: `Entry ${order.bill_number}`,
          UTI: "com.adobe.pdf",
        });
        showToast({
          message: `Entry ${order.bill_number} shared`,
          type: "success",
        });
      } else {
        throw new Error("sharing-unavailable");
      }
    } catch (_error: any) {
      showToast({
        message: `Error sharing PDF: ${_error?.message || "Unknown error"}`,
        type: "error",
      });
    } finally {
      setSendingEntry(false);
    }
  }, [order, customerName, profile, showToast, itemsSubtotal, taxAmount]);

  // ── Remind Option Triggers ──────────────────────────────────────
  const handleRemind = useCallback(() => {
    setRemindModalVisible(true);
  }, []);

  const sendWhatsAppReminder = useCallback(async () => {
    if (!order) return;
    try {
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const msg = encodeURIComponent(
        buildEntryShareMessage({
          locale: shareLocale,
          customerName,
          amount: order.total_amount,
          entryDate: order.created_at,
          dueDate: (order as any).due_date ?? null,
          businessName: profile?.business_name || profile?.name || "KredBook",
        }),
      );
      const wa = `https://wa.me/91${cleanPhone}?text=${msg}`;
      await Linking.openURL(wa);
    } catch {
      Alert.alert(
        "Cannot open WhatsApp",
        "Please install WhatsApp and try again.",
      );
    }
  }, [order, customerName, customerPhone, profile, shareLocale]);

  const sendSMSReminder = useCallback(async () => {
    if (!order) return;
    try {
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const messageText = buildEntryShareMessage({
        locale: shareLocale,
        customerName,
        amount: order.total_amount,
        entryDate: order.created_at,
        dueDate: (order as any).due_date ?? null,
        businessName: profile?.business_name || profile?.name || "KredBook",
      });
      const msg = encodeURIComponent(messageText);
      const smsUrl = Platform.OS === "ios"
        ? `sms:+91${cleanPhone}&body=${msg}`
        : `sms:+91${cleanPhone}?body=${msg}`;
      await Linking.openURL(smsUrl);
    } catch {
      Alert.alert(
        "Cannot open SMS",
        "Unable to launch native SMS application.",
      );
    }
  }, [order, customerName, customerPhone, profile, shareLocale]);

  const handleCallCustomer = useCallback(() => {
    if (customerPhone) {
      Linking.openURL(`tel:${customerPhone.replace(/\D/g, "")}`);
    }
  }, [customerPhone]);

  const handleChatCustomer = useCallback(async () => {
    if (customerPhone) {
      try {
        const cleanPhone = customerPhone.replace(/\D/g, "");
        const waUrl = `https://wa.me/91${cleanPhone}`;
        await Linking.openURL(waUrl);
      } catch {
        Alert.alert(
          "Cannot open WhatsApp",
          "Please install WhatsApp and try again.",
        );
      }
    }
  }, [customerPhone]);

  // ── Delete entry ────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    setDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!orderId || !profile?.id || !order?.customer_id) {
      showToast({
        message: "Unable to delete entry. Missing data.",
        type: "error",
      });
      return;
    }
    try {
      setDeleteModalVisible(false);
      // Call the delete API
      await deleteOrder(orderId, profile.id);

      // Invalidate queries and navigate back on success
      queryClient.invalidateQueries({
        queryKey: orderKeys.all(profile.id),
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard", profile.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["customerDetail", order.customer_id],
      });
      showToast({
        message: `Entry #${order.bill_number} deleted`,
        type: "success",
      });
      router.back();
    } catch (error: any) {
      showToast({
        message: `Error deleting entry: ${error.message}`,
        type: "error",
      });
    }
  }, [order, orderId, profile?.id, showToast, queryClient, router]);

  // ── Payment success ─────────────────────────────────────────────
  const handlePaymentSuccess = useCallback(() => {
    paymentModalRef.current?.dismiss();
    if (profile?.id) {
      queryClient.invalidateQueries({ queryKey: orderKeys.all(profile.id) });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId ?? ""),
      });
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      if (order?.customer_id) {
        queryClient.invalidateQueries({
          queryKey: ["customerDetail", order.customer_id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard", profile.id] });
    }
    
    // Trigger the success banner
    setShowSuccessBanner(true);
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    bannerTimeoutRef.current = setTimeout(() => {
      setShowSuccessBanner(false);
    }, 4000);

    showToast({
      message: `Payment recorded for ${customerName}`,
      type: "success",
    });
  }, [
    orderId,
    order?.customer_id,
    profile?.id,
    queryClient,
    customerName,
    showToast,
  ]);

  const openPaymentFlow = useCallback(
    (amountSeed?: number) => {
      if (!order || order.balance_due <= 0) {
        showToast({
          message: "No outstanding balance for this person.",
          type: "error",
        });
        return;
      }
      if (amountSeed && amountSeed > 0) {
        router.push({
          pathname: "/(main)/entries/create",
          params: {
            customer: JSON.stringify(order.customer),
            amount: String(amountSeed),
          },
        });
        return;
      }
      setQuickPaymentAmount("");
      paymentModalRef.current?.present();
    },
    [order, router, showToast],
  );

  const menuItems: MenuItem[] = useMemo(() => {
    if (!order) return [];
    const items: MenuItem[] = [
      {
        key: "edit-entry",
        label: "Edit Entry",
        icon: <Pencil />,
        onPress: () => router.push(`/(main)/entries/${order.id}/edit` as never),
      },
      {
        key: "share-invoice",
        label: "Share Invoice",
        icon: <Share2 />,
        onPress: handleShareLedgerLink,
      },
      {
        key: "view-customer",
        label: "View Customer",
        icon: <User />,
        onPress: () =>
          router.push(`/(main)/people/${order.customer_id}` as never),
      },
      {
        key: "print",
        label: "Print",
        icon: <Printer />,
        onPress: () => {
          showToast({
            message: "Print functionality coming soon!",
            type: "info",
          });
        },
      },
    ];

    if (order.status !== "Paid") {
      items.push({
        key: "mark-as-paid",
        label: "Mark as Paid",
        icon: <CheckCircle />,
        color: colors.successDark,
        onPress: () => openPaymentFlow(),
      });
    }

    items.push({
      key: "delete-entry",
      label: "Delete Entry",
      icon: <Trash />,
      color: colors.dangerStrong,
      onPress: handleDelete,
    });

    return items;
  }, [
    order,
    router,
    handleShareLedgerLink,
    handleDelete,
    openPaymentFlow,
    colors.successDark,
    colors.dangerStrong,
    showToast,
  ]);

  // ── Loading / Error gates ─────────────────────────────────────────
  if (isLoading) return <Loader />;
  if (isError || !order)
    return (
      <EmptyState
        title="Entry not found"
        description="This entry could not be loaded."
      />
    );

  const isPaid = order.status === "Paid";

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-background dark:bg-background-dark"
    >
      <Stack.Screen options={{ headerShown: false }} />

      <DetailHeader
        title={`Entry #${order.bill_number}`}
        subtitle={formatDate(order.created_at)}
        onBack={() => router.back()}
        overflow={true}
        menuItems={menuItems}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 100 }}
        onScrollBeginDrag={() => {
          setShowSuccessBanner(false);
          if (bannerTimeoutRef.current) {
            clearTimeout(bannerTimeoutRef.current);
          }
        }}
      >
        {showSuccessBanner && (
          <View className="bg-green-100 dark:bg-green-950/30 rounded-xl p-4 mx-4 mb-4 flex-row items-center gap-3 border border-green-200 dark:border-green-900/40">
            <CheckCircle size={20} color={colors.brand || "#16a34a"} />
            <Text className="text-green-800 dark:text-green-200 text-sm font-semibold font-inter-semibold">
              Payment recorded successfully
            </Text>
          </View>
        )}

        <EntryCustomerCard
          customerName={customerName}
          customerPhone={customerPhone}
          isDeleted={!order?.customer}
          onCustomerTap={() =>
            order?.customer_id &&
            router.push(`/(main)/people/${order.customer_id}` as never)
          }
          onCallPress={handleCallCustomer}
          onChatPress={handleChatCustomer}
        />

        <EntryHeroCard
          amount={order.balance_due}
          status={
            statusKey === "Partially Paid"
              ? "Partial"
              : (statusKey as "Pending" | "Partial" | "Paid" | "Overdue")
          }
          dueDate={dueDateValue}
        />

        <EntryPaymentsSection
          paymentsLoading={paymentsLoading}
          paymentsError={paymentsError}
          paymentRows={paymentRows}
          grandTotal={order?.total_amount ?? 0}
          paidAmount={order?.amount_paid ?? 0}
        />

        <EntryItemsSection
          order={order}
          itemsSubtotal={itemsSubtotal}
          taxAmount={taxAmount}
          grandTotal={grandTotal}
          statusKey={statusKey}
          fmt={fmt}
        />
      </ScrollView>

      <RecordCustomerPaymentModal
        ref={paymentModalRef}
        onSuccess={handlePaymentSuccess}
        orderId={orderId ?? ""}
        balanceDue={order.balance_due}
        customerId={order.customer_id}
        customerName={customerName}
        initialAmount={
          quickPaymentAmount ? Number(quickPaymentAmount) : undefined
        }
      />

      <DeleteEntryModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        billNumber={order?.bill_number ?? ""}
      />

      <RemindCustomerModal
        visible={remindModalVisible}
        onClose={() => setRemindModalVisible(false)}
        onSendWhatsApp={sendWhatsAppReminder}
        onSendSMS={sendSMSReminder}
        customerName={customerName}
      />

      <EntryStickyBar
        isPaid={isPaid}
        isOverdue={isOverdue}
        sendingEntry={sendingEntry}
        onSendEntry={handleShareLedgerLink}
        onRecordPayment={openPaymentFlow}
        onRemind={handleRemind}
      />
    </SafeAreaView>
  );
}
