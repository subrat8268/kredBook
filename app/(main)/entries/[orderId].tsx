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
import PaymentSuccessAnimation from "@/src/components/feedback/PaymentSuccessAnimation";
import { useEntryDetail } from "@/src/hooks/entries";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatDate } from "@/src/utils/helper";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollView } from "react-native";
import {
  Pencil,
  User,
  Printer,
  CheckCircle,
  Trash,
  Share2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatINR } from "@/src/utils/format";
import { MenuItem } from "@/src/components/layer2/OverflowMenu";

export default function OrderDetailScreen() {
  const { colors, spacing } = useTheme();
  const { orderId, justPaid } = useLocalSearchParams<{ orderId: string; justPaid?: string }>();
  const router = useRouter();
  const paymentModalRef = useRef<any>(null);
  const { show: showToast } = useToast();

  const {
    order,
    paymentRows,
    itemsSubtotal,
    taxAmount,
    statusKey,
    balanceDue,
    totalPaid,
    grandTotal,
    isDeleted,
    customerName,
    customerPhone,
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
    showDeleteModal,
    setShowDeleteModal,
    showRemindModal,
    setShowRemindModal,
    showSuccessAnim,
    setShowSuccessAnim,
    lastRecordedPaymentAmount,
    setLastRecordedPaymentAmount,
    isLoading,
    isError,
    sendingEntry,
    isOverpaid,
  } = useEntryDetail(orderId);

  useEffect(() => {
    if (justPaid === "true" && order) {
      setLastRecordedPaymentAmount(Number(order.amount_paid || 0));
      setShowSuccessAnim(true);
    }
  }, [justPaid, order, setLastRecordedPaymentAmount, setShowSuccessAnim]);

  const fmt = useCallback(
    (value: number) =>
      formatINR(value, {
        currencySymbol: "",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  );

  const menuItems: MenuItem[] = useMemo(() => {
    if (!order) return [];
    const items: MenuItem[] = [
      {
        key: "edit-entry",
        label: "Edit Entry",
        icon: <Pencil />,
        onPress: onEdit,
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

    if (statusKey !== "paid") {
      items.push({
        key: "mark-as-paid",
        label: "Mark as Paid",
        icon: <CheckCircle />,
        color: colors.successDark,
        onPress: () => onRecordPayment(paymentModalRef),
      });
    }

    items.push({
      key: "delete-entry",
      label: "Delete Entry",
      icon: <Trash />,
      color: colors.dangerStrong,
      onPress: onDelete,
    });

    return items;
  }, [
    order,
    router,
    handleShareLedgerLink,
    onDelete,
    onRecordPayment,
    onEdit,
    statusKey,
    colors.successDark,
    colors.dangerStrong,
    showToast,
  ]);

  if (isLoading) return <Loader />;
  if (isError || !order)
    return (
      <EmptyState
        title="Entry not found"
        description="This entry could not be loaded."
      />
    );

  const isPaid = statusKey === "paid";
  const isOverdue = statusKey === "overdue";

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
      >
        <EntryCustomerCard
          customerName={customerName}
          customerPhone={customerPhone}
          isDeleted={isDeleted}
          onCustomerTap={() =>
            order?.customer_id &&
            router.push(`/(main)/people/${order.customer_id}` as never)
          }
          onCallPress={onCall}
          onChatPress={onWhatsApp}
        />

        <EntryHeroCard
          amount={balanceDue}
          statusKey={statusKey}
          dueDate={order.due_date}
        />

        <EntryPaymentsSection
          paymentsLoading={isLoading}
          paymentsError={isError}
          paymentRows={paymentRows}
          grandTotal={order?.total_amount ?? 0}
          paidAmount={totalPaid}
          statusKey={statusKey}
          isOverpaid={isOverpaid}
        />

        <EntryItemsSection
          order={order}
          itemsSubtotal={itemsSubtotal}
          taxAmount={taxAmount}
          grandTotal={grandTotal}
          statusKey={statusKey === "partial" ? "Partially Paid" : statusKey === "paid" ? "Paid" : statusKey === "overdue" ? "Overdue" : "Pending"}
          fmt={fmt}
        />
      </ScrollView>

      <RecordCustomerPaymentModal
        ref={paymentModalRef}
        onSuccess={handlePaymentSuccess}
        orderId={orderId ?? ""}
        balanceDue={balanceDue}
        customerId={order.customer_id}
        customerName={customerName}
        initialAmount={undefined}
      />

      <DeleteEntryModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        billNumber={order?.bill_number ?? ""}
      />

      <RemindCustomerModal
        visible={showRemindModal}
        onClose={() => setShowRemindModal(false)}
        onSendWhatsApp={sendWhatsAppReminder}
        onSendSMS={sendSMSReminder}
        customerName={customerName}
      />

      <PaymentSuccessAnimation
        visible={showSuccessAnim}
        amount={lastRecordedPaymentAmount}
        onAnimationEnd={handleAnimationEnd}
      />

      <EntryStickyBar
        isPaid={isPaid}
        isOverdue={isOverdue}
        sendingEntry={sendingEntry}
        onSendEntry={handleShareLedgerLink}
        onRecordPayment={() => onRecordPayment(paymentModalRef)}
        onRemind={onRemind}
      />
    </SafeAreaView>
  );
}
