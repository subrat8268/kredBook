import EmptyState from "@/src/components/ui/EmptyState";
import Loader from "@/src/components/feedback/Loader";
import { useToast } from "@/src/components/feedback/Toast";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import CustomerBalanceHero from "@/src/components/people/customer-detail/CustomerBalanceHero";
import CustomerDetailHeader from "@/src/components/people/customer-detail/CustomerDetailHeader";
import CustomerDetailSectionShell from "@/src/components/people/customer-detail/CustomerDetailSectionShell";
import CustomerQuickActionsRow from "@/src/components/people/customer-detail/CustomerQuickActionsRow";
import CustomerStickyCollectBar from "@/src/components/people/customer-detail/CustomerStickyCollectBar";
import CustomerTransactionTabs from "@/src/components/people/customer-detail/CustomerTransactionTabs";
import CustomerTransactionTimeline from "@/src/components/people/customer-detail/CustomerTransactionTimeline";
import type {
  TxFilter,
  TxListItem,
} from "@/src/components/people/customer-detail/types";
import { usePersonDetail } from "@/src/hooks/usePeople";
import { supabase } from "@/src/services/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { usePreferencesStore } from "@/src/store/preferencesStore";
import type { Transaction } from "@/src/types/customer";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { buildLedgerShareMessage } from "@/src/utils/shareTemplates";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Linking, ScrollView, Share, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const INITIAL_TX_COUNT = 10;

function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLastEntryDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLastActiveLabel(lastActiveAt: string | null | undefined): string {
  if (!lastActiveAt) return "Last active: Never";

  const diffDays = Math.round(
    (Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Last active today";
  if (diffDays === 1) return "Last active yesterday";
  return `Last active ${diffDays} days ago`;
}

function buildStatementHtml(
  name: string,
  phone: string,
  balance: number,
  transactions: Transaction[],
  businessName: string,
  themeColors: ReturnType<typeof useTheme>["colors"],
): string {
  const rows = transactions
    .map((tx) => {
      const sign = tx.type === "payment" ? "+" : "";
      const color =
        tx.type === "payment" ? themeColors.success : themeColors.danger;
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
  body{font-family:Arial,sans-serif;padding:24px;color:${themeColors.textPrimary};}
  h1{font-size:22px;}
  table{width:100%;border-collapse:collapse;margin-top:20px;}
  th{background:${themeColors.primary};color:white;padding:10px 8px;text-align:left;}
  td{padding:10px 8px;border-bottom:1px solid ${themeColors.border};}
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
  const { colors, gradients, spacing, isDark } = useTheme();
  const { i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { customerId, focus } = useLocalSearchParams<{
    customerId: string;
    focus?: string;
  }>();

  const {
    data: customer,
    isLoading,
    isError,
    refetch,
  } = usePersonDetail(customerId);
  const profile = useAuthStore((s) => s.profile);

  const { show: showToast } = useToast();
  const logReminderSent = usePreferencesStore((s) => s.logReminderSent);

  const [txFilter, setTxFilter] = useState<TxFilter>("All");
  const [exporting, setExporting] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const paymentModalRef = useRef<any>(null);
  const [quickPaymentAmount, setQuickPaymentAmount] = useState<string>("");
  const [shareQueued, setShareQueued] = useState(false);
  const [isSharingLedgerLink, setIsSharingLedgerLink] = useState(false);
  const [showStickyCollectBar, setShowStickyCollectBar] = useState(false);

  const hasPendingPayment =
    !!customer?.pendingOrderId && (customer.pendingOrderBalance ?? 0) > 0;

  const heroGradientColors = useMemo(() => {
    if (!customer)
      return [gradients.customerHero.start, gradients.customerHero.end];
    if (customer.outstandingBalance > 0)
      return [gradients.customerHero.start, gradients.customerHero.end];
    return [gradients.zeroBalance.start, gradients.zeroBalance.end];
  }, [
    customer,
    gradients.customerHero.start,
    gradients.customerHero.end,
    gradients.zeroBalance.start,
    gradients.zeroBalance.end,
  ]);

  const heroMetaText = useMemo(() => {
    if (!customer?.lastActiveAt) return "Add an entry to start this ledger";
    return `Last bill: ${formatLastEntryDate(customer.lastActiveAt)}`;
  }, [customer]);

  const filteredTransactions = useMemo(() => {
    if (!customer) return [];
    return customer.transactions.filter((tx) => {
      if (txFilter === "Entries") return tx.type === "bill";
      if (txFilter === "Payments") return tx.type === "payment";
      return true;
    });
  }, [customer, txFilter]);

  const listItems = useMemo<TxListItem[]>(() => {
    const groups: Record<string, Transaction[]> = {};
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
      const locale = i18n.language?.toLowerCase().startsWith("hi")
        ? "hi"
        : "en";
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
  }, [
    customer,
    profile?.business_name,
    profile?.name,
    i18n.language,
    showToast,
  ]);

  useEffect(() => {
    if (focus === "share") {
      setShareQueued(true);
    }
  }, [focus]);

  useEffect(() => {
    if (shareQueued && customer && profile) {
      handleShareLedger().finally(() => setShareQueued(false));
    }
  }, [shareQueued, customer, profile, handleShareLedger]);

  const sendWhatsAppReminder = () => {
    if (!customer?.phone) {
      showToast({ message: "Customer phone number is missing", type: "error" });
      return;
    }

    const biz = profile?.business_name || "our store";
    const msg = `Dear ${customer.name}, your outstanding balance with ${biz} is ${formatINR(customer.outstandingBalance)}. Please arrange payment. Thank you.`;
    const url = `https://wa.me/91${customer.phone}?text=${encodeURIComponent(msg)}`;

    Linking.openURL(url)
      .then(() => {
        logReminderSent({
          customerId: customer.id,
          customerName: customer.name,
          amount: customer.outstandingBalance,
          channel: "whatsapp",
        });
        showToast({
          message: `Reminder opened for ${customer.name}`,
          type: "success",
        });
      })
      .catch(() => {
        showToast({
          message: "Could not open WhatsApp. Make sure it's installed.",
          type: "error",
          duration: 4000,
        });
      });
  };

  const callCustomer = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const downloadStatement = async () => {
    if (!customer) return;

    if (customer.transactions.length === 0) {
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
        customer.transactions,
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

  if (isLoading) return <Loader />;
  if (isError || !customer)
    return (
      <EmptyState
        illustration="person"
        headingEn="Customer not found"
        headingHi="ग्राहक नहीं मिला"
        bodyEn="This customer could not be loaded"
        bodyHi="यह ग्राहक लोड नहीं हो पाया"
      />
    );

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-background-dark"
      edges={["top", "left", "right"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <CustomerDetailHeader
        customerName={customer.name}
        phone={customer.phone || undefined}
        lastActiveLabel={getLastActiveLabel(customer.lastActiveAt)}
        onBack={() => router.back()}
        onCall={callCustomer}
        hasPhone={Boolean(customer.phone)}
      />

      <ScrollView
        className="flex-1"
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          const shouldShowSticky = hasPendingPayment && offsetY > 180;
          if (shouldShowSticky !== showStickyCollectBar) {
            setShowStickyCollectBar(shouldShowSticky);
          }
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          minHeight: Dimensions.get("window").height,
          paddingBottom:
            spacing.xl +
            (hasPendingPayment
              ? 70 + Math.max(insets.bottom, 8)
              : spacing.tabBarHeight + Math.max(insets.bottom, spacing.sm)),
        }}
        showsVerticalScrollIndicator={false}
      >
        <CustomerBalanceHero
          outstandingBalance={customer.outstandingBalance}
          isOverdue={customer.isOverdue}
          pendingOrderBalance={customer.pendingOrderBalance ?? 0}
          heroMetaText={heroMetaText}
          heroGradientColors={heroGradientColors as [string, string]}
          isDark={isDark}
        />

        <CustomerDetailSectionShell className="p-3">
          <CustomerQuickActionsRow
            isSharingLedgerLink={isSharingLedgerLink}
            exporting={exporting}
            canSendReminder={Boolean(customer.phone)}
            canDownload={customer.transactions.length > 0}
            onAddEntry={() =>
              router.push({
                pathname: "/(main)/entries/create",
                params: { customer: JSON.stringify(customer) },
              })
            }
            onSendReminder={sendWhatsAppReminder}
            onShare={handleShareLedger}
            onDownload={downloadStatement}
          />
        </CustomerDetailSectionShell>

        <CustomerDetailSectionShell>
          <CustomerTransactionTabs
            txFilter={txFilter}
            onChangeFilter={(tab) => {
              setTxFilter(tab);
              setHistoryExpanded(false);
            }}
          />

          <CustomerTransactionTimeline
            customer={customer}
            visibleListItems={visibleListItems}
            listItems={listItems}
            historyExpanded={historyExpanded}
            initialCount={INITIAL_TX_COUNT}
            onExpandHistory={() => setHistoryExpanded(true)}
            onRecordPayment={
              hasPendingPayment ? () => openPaymentFlow() : undefined
            }
            onAddEntry={() =>
              router.push({
                pathname: "/(main)/entries/create",
                params: {
                  customer: JSON.stringify(customer),
                  customerId: customer.id,
                },
              } as never)
            }
          />
        </CustomerDetailSectionShell>
      </ScrollView>

      {hasPendingPayment && showStickyCollectBar ? (
        <View
          className="border-t border-border bg-background px-4 pt-3 dark:border-border-dark dark:bg-background-dark"
          style={{ paddingBottom: Math.max(insets.bottom, 8) + spacing.sm }}
        >
          <CustomerStickyCollectBar
            balanceDue={customer.pendingOrderBalance ?? 0}
            onRecordPayment={() => openPaymentFlow()}
          />
        </View>
      ) : null}

      {hasPendingPayment ? (
        <RecordCustomerPaymentModal
          ref={paymentModalRef}
          onSuccess={() => {
            paymentModalRef.current?.dismiss();
            refetch();
            showToast({
              message: `Payment recorded for ${customer.name}`,
              type: "success",
            });
          }}
          orderId={customer.pendingOrderId!}
          balanceDue={customer.pendingOrderBalance ?? 0}
          customerId={customer.id}
          customerName={customer.name}
          initialAmount={
            quickPaymentAmount ? Number(quickPaymentAmount) : undefined
          }
        />
      ) : null}
    </SafeAreaView>
  );
}
