import { useState, useMemo, useCallback } from "react";
import { Linking, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/src/components/feedback/Toast";
import { useTranslation } from "react-i18next";
import { useOrderDetail, orderKeys } from "@/src/hooks/useEntries";
import { usePayments } from "@/src/hooks/usePayments";
import { useAuthStore } from "@/src/store/authStore";
import { deleteOrder } from "@/src/api/entries";
import { buildEntryShareMessage } from "@/src/utils/shareTemplates";
import { generateBillPdf } from "@/src/utils/generateBillPdf";
import { formatDate } from "@/src/utils/helper";
import * as Sharing from "expo-sharing";

export default function useEntryDetail(orderId?: string) {
  const router = useRouter();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();
  const { i18n } = useTranslation();

  const shareLocale = useMemo(
    () => (i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en"),
    [i18n.language],
  );

  const { data: order, isLoading: orderLoading, isError: orderError } = useOrderDetail(orderId);
  const { payments, isLoading: paymentsLoading, isError: paymentsError } = usePayments(
    orderId ?? "",
    profile?.id,
  );

  // States
  const [sendingEntry, setSendingEntry] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemindModal, setShowRemindModal] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [lastRecordedPaymentAmount, setLastRecordedPaymentAmount] = useState<number>(0);

  // Helper values
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

  const itemsSubtotal = useMemo(
    () => order?.items?.reduce((s, i) => s + i.subtotal, 0) ?? 0,
    [order?.items],
  );

  const taxAmount = useMemo(() => {
    return order?.tax_percent
      ? Math.round(((itemsSubtotal * order.tax_percent) / 100) * 100) / 100
      : 0;
  }, [itemsSubtotal, order?.tax_percent]);

  // Derived Amounts
  const totalPaid = useMemo(
    () => payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0,
    [payments],
  );
  const grandTotal = (order?.total_amount ?? 0) + (order?.previous_balance ?? 0);
  const balanceDue = Math.max(0, grandTotal - totalPaid);
  const isOverpaid = totalPaid > grandTotal;

  // Status Derivation
  const isPastDue = useMemo(() => {
    if (!order || !("due_date" in order) || typeof order.due_date !== "string") {
      return false;
    }
    return new Date(order.due_date) < new Date(new Date().setHours(0, 0, 0, 0));
  }, [order]);

  const statusKey = useMemo<'pending' | 'partial' | 'paid' | 'overdue'>(() => {
    const hasPayments = payments && payments.length > 0;
    if (balanceDue > 0 && isPastDue) {
      return "overdue";
    }
    if (balanceDue === 0) {
      return "paid";
    }
    if (hasPayments && balanceDue > 0) {
      return "partial";
    }
    return "pending";
  }, [balanceDue, isPastDue, payments]);

  // Customer helpers
  const isDeleted = !order?.customer;
  const customerName = order?.customer?.name ?? "Unknown Person";
  const customerPhone = order?.customer?.phone ?? "";
  const displayName = isDeleted ? "[Deleted Customer]" : customerName;

  const phoneFormatted = useMemo(() => {
    if (!customerPhone) return null;
    const cleaned = customerPhone.replace(/\D/g, "");
    return cleaned ? `+91 ${cleaned}` : null;
  }, [customerPhone]);

  // Handlers
  const onCall = useCallback(() => {
    const cleaned = customerPhone.replace(/\D/g, "");
    if (cleaned) {
      Linking.openURL(`tel:${cleaned}`);
    }
  }, [customerPhone]);

  const onWhatsApp = useCallback(async () => {
    const cleaned = customerPhone.replace(/\D/g, "");
    if (cleaned) {
      try {
        const waUrl = `https://wa.me/91${cleaned}`;
        await Linking.openURL(waUrl);
      } catch {
        Alert.alert(
          "Cannot open WhatsApp",
          "Please install WhatsApp and try again.",
        );
      }
    }
  }, [customerPhone]);

  const onEdit = useCallback(() => {
    if (order) {
      router.push(`/(main)/entries/${order.id}/edit` as any);
    }
  }, [order, router]);

  const onDelete = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const onRemind = useCallback(() => {
    setShowRemindModal(true);
  }, []);

  const onRecordPayment = useCallback(
    (modalRef: any, amountSeed?: number) => {
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
      modalRef?.current?.present();
    },
    [order, router, showToast],
  );

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

  const handleConfirmDelete = useCallback(async () => {
    if (!orderId || !profile?.id || !order?.customer_id) {
      showToast({
        message: "Unable to delete entry. Missing data.",
        type: "error",
      });
      return;
    }
    try {
      setShowDeleteModal(false);
      await deleteOrder(orderId, profile.id);

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

  const handlePaymentSuccess = useCallback((amountPaid?: number) => {
    setLastRecordedPaymentAmount(amountPaid ?? 0);
    setShowSuccessAnim(true);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setShowSuccessAnim(false);

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

  const isLoading = orderLoading || paymentsLoading;
  const isError = orderError || paymentsError;
  const notFound = !orderLoading && !order;

  return {
    // Data
    order,
    customer: order?.customer,
    payments,
    paymentRows,
    sortedPayments,
    itemsSubtotal,
    taxAmount,

    // Status / Amounts
    statusKey,
    balanceDue,
    totalPaid,
    grandTotal,
    isOverpaid,

    // Customer helpers
    isDeleted,
    displayName,
    phoneFormatted,
    customerName,
    customerPhone,

    // Handlers
    onCall,
    onWhatsApp,
    onEdit,
    onDelete,
    onRemind,
    onRecordPayment,
    handleShareLedgerLink,
    sendWhatsAppReminder,
    sendSMSReminder,
    handleConfirmDelete,
    handlePaymentSuccess,
    handleAnimationEnd,

    // Modal states
    showDeleteModal,
    setShowDeleteModal,
    showRemindModal,
    setShowRemindModal,
    showSuccessAnim,
    setShowSuccessAnim,
    lastRecordedPaymentAmount,
    setLastRecordedPaymentAmount,

    // Loading / error
    isLoading,
    isError,
    notFound,
    sendingEntry,
  };
}
