import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Share, View, StyleSheet, Text } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

// Hooks & Store
import { usePersonDetail } from "@/src/hooks/usePeople";
import { useAuthStore } from "@/src/store/authStore";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import { useToast } from "@/src/components/feedback/Toast";
import { useTheme } from "@/src/theme/useTheme";
import { supabase } from "@/src/services/supabase";

// Components
import CustomerDetailHeader from "@/src/components/people/customer-detail/CustomerDetailHeader";
import CustomerBalanceHero from "@/src/components/people/customer-detail/CustomerBalanceHero";
import CustomerActionStrip from "@/src/components/people/customer-detail/CustomerActionStrip";
import CustomerQuickActionsRow from "@/src/components/people/customer-detail/CustomerQuickActionsRow";
import CustomerTransactionTimeline from "@/src/components/people/customer-detail/CustomerTransactionTimeline";
import CustomerOverflowMenu from "@/src/components/people/customer-detail/CustomerOverflowMenu";
import PaymentDetailSheet from "@/src/components/people/customer-detail/PaymentDetailSheet";
import DeleteCustomerSheet from "@/src/components/people/customer-detail/DeleteCustomerSheet";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import Loader from "@/src/components/feedback/Loader";
import EmptyState from "@/src/components/ui/EmptyState";

// Utilities
import { formatINR } from "@/src/utils/format";
import { buildLedgerShareMessage } from "@/src/utils/shareTemplates";
import type { TxFilter, TxListItem } from "@/src/components/people/customer-detail/types";
import type { Transaction } from "@/src/components/people/customer-detail/CustomerTransactionRow";

const INITIAL_TX_COUNT = 15;

function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  // Format like: "Mon, 02 Jun 2026"
  const weekday = d.toLocaleDateString("en-IN", { weekday: "short" });
  const rest = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${weekday}, ${rest}`;
}

function buildStatementHtml(
  name: string,
  phone: string,
  balance: number,
  transactions: any[],
  businessName: string,
  themeColors: any,
): string {
  const rows = transactions
    .map((tx) => {
      const sign = tx.type === "payment" ? "+" : "";
      const color = tx.type === "payment" ? themeColors.primary : themeColors.danger;
      const label =
        tx.type === "bill"
          ? `Entry ${tx.billNumber ?? ""}`
          : `Payment (${tx.paymentMode ?? ""})`;
      return `<tr>
        <td>${new Date(tx.created_at).toLocaleDateString("en-IN")}</td>
        <td>${label}</td>
        <td style="color:${color};font-weight:700;">${sign}${formatINR(tx.amount, { maximumFractionDigits: 2 })}</td>
        <td>${formatINR(tx.runningBalance, { maximumFractionDigits: 2 })}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;padding:24px;color:${themeColors.ink};background:${themeColors.surface};}
  h1{font-size:22px;}
  table{width:100%;border-collapse:collapse;margin-top:20px;}
  th{background:${themeColors.primary};color:white;padding:10px 8px;text-align:left;}
  td{padding:10px 8px;border-bottom:1px solid ${themeColors.borderDefault};}
  .balance{font-size:18px;font-weight:700;color:${themeColors.danger};}
</style></head><body>
 <h1>${businessName} — Customer Statement</h1>
  <p><b>Customer:</b> ${name}<br/><b>Phone:</b> ${phone || "-"}</p>
  <p class="balance">Outstanding Balance: ${formatINR(balance, { maximumFractionDigits: 2 })}</p>
 <table><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Balance</th></tr></thead>
 <tbody>${rows}</tbody></table>
 </body></html>`;
}

export default function CustomerDetailScreen() {
  const t = useTheme();
  const { colors } = t;
  const { i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { customerId, focus } = useLocalSearchParams<{
    customerId: string;
    focus?: string;
  }>();

  const { show: showToast } = useToast();
  const profile = useAuthStore((s) => s.profile);
  const logReminderSent = usePreferencesStore((s) => s.logReminderSent);

  // Hook state orchestration
  const {
    customer,
    isLoading,
    isError,
    netBalance,
    oldestOverdueDays,
    nearestDueDate,
    openEntriesCount,
    balanceState,
    selectedPayment,
    setSelectedPayment,
    showSuccessBanner,
    setShowSuccessBanner,
    successBannerAmount,
    onDeleteCustomer,
    isDeleting,
    handlePaymentSuccess,
  } = usePersonDetail(customerId);

  // Bottom sheets references
  const paymentModalRef = useRef<BottomSheetModal>(null);
  const paymentDetailSheetRef = useRef<BottomSheetModal>(null);
  const deleteCustomerSheetRef = useRef<BottomSheetModal>(null);

  // Local state
  const [txFilter, setTxFilter] = useState<TxFilter>("All");
  const [exporting, setExporting] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [quickPaymentAmount, setQuickPaymentAmount] = useState<string>("");
  const [overflowVisible, setOverflowVisible] = useState(false);
  const [shareQueued, setShareQueued] = useState(false);
  const [isSharingLedgerLink, setIsSharingLedgerLink] = useState(false);

  const hasPendingPayment =
    !!customer?.pendingOrderId && (customer.pendingOrderBalance ?? 0) > 0;

  // Auto-dismiss success banner after 3 seconds
  useEffect(() => {
    if (showSuccessBanner) {
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessBanner, setShowSuccessBanner]);

  // Handle focus parameter for sharing ledger
  useEffect(() => {
    if (focus === "share") {
      setShareQueued(true);
    }
  }, [focus]);

  // Share ledger message link
  const handleShareLedger = useCallback(async () => {
    if (!customer) return;

    setIsSharingLedgerLink(true);
    try {
      const { data, error } = await supabase.rpc("upsert_access_token", {
        p_party_id: customer.id,
      });

      if (error) throw error;

      const token =
        typeof data === "string"
          ? data
          : (data as { token?: string } | null)?.token;
      if (!token) {
        throw new Error("Token generation failed");
      }

      const url = `https://kredbook.app/l/${token}`;
      const locale = i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en";
      await Share.share({
        message: buildLedgerShareMessage({
          locale,
          customerName: customer.name,
          balance: customer.outstandingBalance,
          businessName: profile?.business_name || profile?.name || "KredBook",
          publicLedgerUrl: url,
        }),
      });
      showToast({ message: "Ledger link ready to share", type: "success" });
    } catch {
      showToast({ message: "Could not create share link.", type: "error" });
    } finally {
      setIsSharingLedgerLink(false);
    }
  }, [customer, profile, i18n.language, showToast]);

  useEffect(() => {
    if (shareQueued && customer && profile) {
      handleShareLedger().finally(() => setShareQueued(false));
    }
  }, [shareQueued, customer, profile, handleShareLedger]);

  // WhatsApp reminder
  const handleWhatsAppReminder = () => {
    if (customer) {
      logReminderSent({
        customerId: customer.id,
        customerName: customer.name,
        amount: netBalance,
        channel: "whatsapp",
      });
    }
  };

  // Download Statement
  const downloadStatement = async () => {
    if (!customer) return;

    if ((customer.transactions || []).length === 0) {
      showToast({
        message: "No transactions yet — add an entry or payment first.",
        type: "error",
      });
      return;
    }

    setExporting(true);
    try {
      const html = buildStatementHtml(
        customer.name,
        customer.phone,
        customer.outstandingBalance,
        customer.transactions || [],
        profile?.business_name || "KredBook",
        colors,
      );

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: ".pdf",
      });
    } catch {
      showToast({ message: "Could not generate statement.", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  // Open record payment modal
  const openPaymentFlow = (amountSeed?: number) => {
    if (!hasPendingPayment) {
      showToast({
        message: "No outstanding balance for this customer.",
        type: "error",
      });
      return;
    }

    setQuickPaymentAmount(
      amountSeed && amountSeed > 0 ? String(amountSeed) : "",
    );
    paymentModalRef.current?.present();
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!customer) return [];
    return (customer.transactions || []).filter((tx) => {
      if (txFilter === "Entries") return tx.type === "bill";
      if (txFilter === "Payments") return tx.type === "payment";
      return true;
    });
  }, [customer, txFilter]);

  // Grouped timeline list items
  const listItems = useMemo<TxListItem[]>(() => {
    const groups: Record<string, any[]> = {};
    for (const tx of filteredTransactions) {
      const label = getDateLabel(tx.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    }

    const items: TxListItem[] = [];
    for (const [label, txs] of Object.entries(groups)) {
      items.push({ kind: "header", label, key: `h-${label}` });
      for (const tx of txs) {
        items.push({ kind: "tx", data: tx, key: `tx-${tx.id}` });
      }
    }
    return items;
  }, [filteredTransactions]);

  const visibleListItems = useMemo(
    () => (historyExpanded ? listItems : listItems.slice(0, INITIAL_TX_COUNT)),
    [historyExpanded, listItems],
  );

  const handleScroll = () => {
    if (showSuccessBanner) {
      setShowSuccessBanner(false);
    }
  };

  const handleTransactionPress = (tx: Transaction) => {
    if (tx.type === "payment") {
      setSelectedPayment(tx);
      paymentDetailSheetRef.current?.present();
    } else {
      router.push(`/(main)/entries/${tx.id}`);
    }
  };

  const handleAddEntryNavigation = () => {
    router.push({
      pathname: "/(main)/entries/create",
      params: {
        customer: JSON.stringify(customer),
        customerId: customer?.id,
      },
    } as any);
  };

  if (isLoading) return <Loader />;

  if (isError || !customer) {
    return (
      <EmptyState
        illustration="person"
        headingEn="Customer not found"
        headingHi="ग्राहक नहीं मिला"
        bodyEn="This customer could not be loaded"
        bodyHi="यह ग्राहक लोड नहीं हो पाया"
      />
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <CustomerDetailHeader
        customerName={customer.name}
        netBalance={netBalance}
        balanceState={balanceState}
        phone={customer.phone ?? undefined}
        onBack={() => router.back()}
        onCall={() => {}}
        onWhatsApp={handleWhatsAppReminder}
        onOverflow={() => setOverflowVisible(true)}
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Banner */}
          {showSuccessBanner && (
            <View style={[styles.successBanner, { backgroundColor: colors.primaryBorderFill }]}>
              <CheckCircle size={18} color={colors.primary} style={styles.successBannerIcon} />
              <Text style={[styles.successBannerText, { color: colors.primary, fontFamily: t.fontFamily.bodySemiBold }]}>
                Payment of {formatINR(successBannerAmount)} recorded
              </Text>
            </View>
          )}

          <CustomerBalanceHero
            netBalance={netBalance}
            balanceState={balanceState}
            oldestOverdueDays={oldestOverdueDays}
            nearestDueDate={nearestDueDate}
            openEntriesCount={openEntriesCount}
          />

          <CustomerActionStrip
            balanceState={balanceState}
            onCollectPress={() => openPaymentFlow()}
            onAddEntryPress={handleAddEntryNavigation}
          />

          <CustomerQuickActionsRow
            isSharingLedgerLink={isSharingLedgerLink}
            exporting={exporting}
            canDownload={(customer.transactions || []).length > 0}
            onAddEntry={handleAddEntryNavigation}
            onShare={handleShareLedger}
            onDownload={downloadStatement}
          />

          <CustomerTransactionTimeline
            customer={customer}
            balanceState={balanceState}
            visibleListItems={visibleListItems}
            listItems={listItems}
            historyExpanded={historyExpanded}
            initialCount={INITIAL_TX_COUNT}
            onExpandHistory={() => setHistoryExpanded(true)}
            onAddEntry={handleAddEntryNavigation}
            txFilter={txFilter}
            onChangeFilter={(tab) => {
              setTxFilter(tab);
              setHistoryExpanded(false);
            }}
            onPressTx={handleTransactionPress}
          />
        </ScrollView>
      </View>

      {/* Modals & Bottom Sheets */}

      {/* M1: Record Customer Payment Modal */}
      {hasPendingPayment && (
        <RecordCustomerPaymentModal
          ref={paymentModalRef}
          onSuccess={(amount) => {
            paymentModalRef.current?.dismiss();
            handlePaymentSuccess(amount);
          }}
          orderId={customer.pendingOrderId!}
          balanceDue={customer.pendingOrderBalance ?? 0}
          customerId={customer.id}
          customerName={customer.name}
          initialAmount={
            quickPaymentAmount ? Number(quickPaymentAmount) : undefined
          }
        />
      )}

      {/* M2: Overflow Dropdown Menu */}
      <CustomerOverflowMenu
        visible={overflowVisible}
        onClose={() => setOverflowVisible(false)}
        onShareLedger={handleShareLedger}
        onDownloadStatement={downloadStatement}
        onEditCustomer={() => router.push(`/(main)/people/${customer.id}/edit` as any)}
        onDeleteCustomer={() => deleteCustomerSheetRef.current?.present()}
        hasTransactions={(customer.transactions || []).length > 0}
      />

      {/* M3: Payment Details Bottom Sheet */}
      <PaymentDetailSheet
        ref={paymentDetailSheetRef}
        payment={selectedPayment}
        onDismiss={() => setSelectedPayment(null)}
      />

      {/* M4: Delete Customer Confirmation Sheet */}
      <DeleteCustomerSheet
        ref={deleteCustomerSheetRef}
        customerName={customer.name}
        entriesCount={customer.orders?.length || 0}
        paymentsCount={(customer.transactions || []).filter(t => t.type === 'payment').length}
        isDeleting={isDeleting}
        onConfirm={() => onDeleteCustomer()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  successBanner: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  successBannerIcon: {
    marginRight: 8,
  },
  successBannerText: {
    fontSize: 14,
  },
});
