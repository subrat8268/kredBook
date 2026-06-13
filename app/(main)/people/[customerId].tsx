import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  Share,
  View,
  StyleSheet,
  Text,
  Linking,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle,
  Share2,
  Download,
  Pencil,
  Trash2,
  Phone,
  MessageCircle,
} from "lucide-react-native";
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
import DetailHeader, {
  type HeaderAction,
} from "@/src/components/layer2/DetailHeader";
import CustomerBalanceHero from "@/src/components/people/customer-detail/CustomerBalanceHero";
import CustomerActionStrip from "@/src/components/people/customer-detail/CustomerActionStrip";
import CustomerTransactionTimeline from "@/src/components/people/customer-detail/CustomerTransactionTimeline";
import { type MenuItem } from "@/src/components/layer2/OverflowMenu";
import PaymentDetailSheet from "@/src/components/people/customer-detail/PaymentDetailSheet";
import DeleteCustomerSheet from "@/src/components/people/customer-detail/DeleteCustomerSheet";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import { Skeleton, SkeletonHeroCard, SkeletonCard } from "@/src/components/ui/Skeleton";
import EmptyState from "@/src/components/ui/EmptyState";

// Utilities
import { formatINR } from "@/src/utils/format";
import { buildLedgerShareMessage } from "@/src/utils/shareTemplates";
import type {
  TxFilter,
  TxListItem,
} from "@/src/components/people/customer-detail/types";
import type { Transaction } from "@/src/components/people/customer-detail/CustomerTransactionRow";
import { spacing } from "@/src/theme";

const INITIAL_TX_COUNT = 15;

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
      const color =
        tx.type === "payment" ? themeColors.primary : themeColors.danger;
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
    refetch,
  } = usePersonDetail(customerId);

  // Refs
  const paymentModalRef = useRef<BottomSheetModal>(null);
  const paymentDetailSheetRef = useRef<BottomSheetModal>(null);
  const deleteCustomerSheetRef = useRef<BottomSheetModal>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Local state
  const [txFilter, setTxFilter] = useState<TxFilter>("All");
  const [visibleCount, setVisibleCount] = useState(INITIAL_TX_COUNT);
  const [quickPaymentAmount, setQuickPaymentAmount] = useState<string>("");
  const [shareQueued, setShareQueued] = useState(false);

  const handleExpandHistory = useCallback(() => {
    setVisibleCount((c) => c + 20);
  }, []);

  // WhatsApp reminder
  const handleWhatsAppReminder = useCallback(() => {
    if (customer) {
      logReminderSent({
        customerId: customer.id,
        customerName: customer.name,
        amount: netBalance,
        channel: "whatsapp",
      });
    }
  }, [customer, logReminderSent, netBalance]);

  // Share ledger message link
  const handleShareLedger = useCallback(async () => {
    if (!customer) return;
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
    }
  }, [customer, profile, i18n.language, showToast]);

  useEffect(() => {
    if (shareQueued && customer && profile) {
      handleShareLedger().finally(() => setShareQueued(false));
    }
  }, [shareQueued, customer, profile, handleShareLedger]);

  // Download Statement
  const downloadStatement = useCallback(async () => {
    if (!customer) return;

    if ((customer.transactions || []).length === 0) {
      showToast({
        message: "No transactions yet — add an entry or payment first.",
        type: "error",
      });
      return;
    }
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
    }
  }, [customer, showToast, profile, colors]);

  const menuItems = useMemo<MenuItem[]>(() => {
    if (!customer) return [];
    return [
      {
        key: "share-ledger",
        label: "Share Ledger",
        icon: <Share2 />,
        onPress: handleShareLedger,
      },
      {
        key: "pdf-statement",
        label: "PDF Statement",
        icon: <Download />,
        onPress: downloadStatement,
        disabled: (customer.transactions || []).length === 0,
      },
      {
        key: "edit-customer",
        label: "Edit Customer",
        icon: <Pencil />,
        onPress: () => router.push(`/(main)/people/${customer.id}/edit` as any),
      },
      {
        key: "delete-customer",
        label: "Delete Customer",
        icon: <Trash2 />,
        onPress: () => deleteCustomerSheetRef.current?.present(),
        isDestructive: true,
      },
    ];
  }, [customer, handleShareLedger, downloadStatement, router]);

  const getInitials = (name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return "";
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      const firstWord = parts[0];
      const lastWord = parts[parts.length - 1];
      return (firstWord.charAt(0) + lastWord.charAt(0)).toUpperCase();
    }
    return trimmed.charAt(0).toUpperCase();
  };

  const getSubtitle = () => {
    if (balanceState === null) {
      return "No entries yet";
    }
    if (balanceState === "settled") {
      return "All settled";
    }
    if (balanceState === "advance") {
      return `${formatINR(Math.abs(netBalance))} advance`;
    }
    return `${formatINR(netBalance)} due`;
  };

  const headerActions = useMemo<HeaderAction[]>(() => {
    if (!customer) return [];
    const actions: HeaderAction[] = [];
    const isMuted = balanceState === "settled" || balanceState === "advance";

    if (customer.phone && customer.phone.trim().length > 0) {
      const cleanedPhone = customer.phone.replace(/\D/g, "");
      // Fix #4: only prefix +91 for standard 10-digit Indian numbers
      const waPrefix = cleanedPhone.length === 10 ? "91" : "";

      actions.push({
        key: "call",
        icon: (
          <Phone
            size={22}
            color={isMuted ? colors.faint : colors.primary}
            strokeWidth={2.2}
          />
        ),
        onPress: () => {
          if (!isMuted) {
            Linking.openURL(`tel:${cleanedPhone}`);
          }
        },
        disabled: isMuted,
        noBackground: true,
      });

      actions.push({
        key: "whatsapp",
        icon: (
          <MessageCircle
            size={22}
            color={isMuted ? colors.faint : colors.primary}
            strokeWidth={2.2}
          />
        ),
        onPress: () => {
          if (!isMuted) {
            const message = `Dear Customer, your outstanding balance is ${formatINR(netBalance)}. Please arrange payment. Thank you.`;
            const encodedMessage = encodeURIComponent(message);
            Linking.openURL(
              `https://wa.me/${waPrefix}${cleanedPhone}?text=${encodedMessage}`,
            );
            handleWhatsAppReminder();
          }
        },
        disabled: isMuted,
        noBackground: true,
      });
    }

    return actions;
  }, [customer, balanceState, netBalance, colors, handleWhatsAppReminder]);

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

  // Open record payment modal
  const openPaymentFlow = (amountSeed?: number) => {
    if (!customer?.outstandingBalance || customer.outstandingBalance <= 0) return;
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
    () => listItems.slice(0, visibleCount),
    [visibleCount, listItems],
  );

  const handleTransactionPress = useCallback((tx: Transaction) => {
    if (tx.type === "payment") {
      setSelectedPayment(tx);
      paymentDetailSheetRef.current?.present();
    } else {
      router.push(`/(main)/entries/${tx.id}`);
    }
  }, [router, setSelectedPayment]);

  const handleAddEntryNavigation = () => {
    router.push({
      pathname: "/(main)/entries/create",
      params: {
        customer: JSON.stringify(customer),
        customerId: customer?.id,
      },
    } as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: colors.canvas }}>
        <View className="flex-row items-center px-4 pt-2 pb-3">
          <Skeleton width={32} height={32} borderRadius={16} />
          <View className="ml-3 flex-row items-center flex-1">
            <Skeleton width={40} height={40} borderRadius={20} />
            <View className="ml-3" style={{ gap: 4 }}>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={11} />
            </View>
          </View>
        </View>
        <ScrollView className="flex-1 px-4">
          <SkeletonHeroCard />
          <View className="mt-4 flex-row" style={{ gap: 12 }}>
            <Skeleton height={48} style={{ flex: 1 }} borderRadius={24} />
            <Skeleton height={48} style={{ flex: 1 }} borderRadius={24} />
          </View>
          <View className="mt-6" style={{ gap: 12 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !customer) {
    return (
      <EmptyState
        illustration="person"
        headingEn="Customer not found"
        headingHi="ग्राहक नहीं मिला"
        bodyEn="This customer could not be loaded"
        bodyHi="यह ग्राहक लोड नहीं हो पाया"
        ctaLabel="Retry"
        onCta={refetch}
      />
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <DetailHeader
        title={customer.name}
        subtitle={getSubtitle()}
        onBack={() => router.back()}
        leadingSlot={
          <View
            style={{ backgroundColor: colors.primaryBorderFill }}
            className="w-11 h-11 rounded-full items-center justify-center"
          >
            <Text
              style={{
                fontFamily: t.fontFamily.bodyBold,
                fontSize: 15,
                fontWeight: "700",
                color: colors.primary,
              }}
            >
              {getInitials(customer.name)}
            </Text>
          </View>
        }
        actions={headerActions}
        overflow={true}
        menuItems={menuItems}
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ paddingTop: spacing[3], paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {customer.reconciliationWarning && (
            <View
              style={[
                styles.reconciliationBanner,
                { backgroundColor: colors.overdueSurface, borderColor: colors.overdueText },
              ]}
            >
              <AlertTriangle
                size={16}
                color={colors.overdueText}
                style={styles.bannerIcon}
              />
              <Text
                style={[
                  styles.bannerText,
                  {
                    color: colors.overdueText,
                    fontFamily: t.fontFamily.bodySemiBold,
                  },
                ]}
              >
                Balance mismatch detected. Please refresh or contact support.
              </Text>
            </View>
          )}

          {showSuccessBanner && (
            <View
              style={[
                styles.successBanner,
                { backgroundColor: colors.primaryBorderFill },
              ]}
            >
              <CheckCircle
                size={18}
                color={colors.primary}
                style={styles.successBannerIcon}
              />
              <Text
                style={[
                  styles.successBannerText,
                  {
                    color: colors.primary,
                    fontFamily: t.fontFamily.bodySemiBold,
                  },
                ]}
              >
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
            onCollectPress={() => openPaymentFlow()}
            onAddEntryPress={handleAddEntryNavigation}
            collectDisabled={!customer.outstandingBalance || customer.outstandingBalance <= 0}
          />

          <CustomerTransactionTimeline
            customer={customer}
            balanceState={balanceState}
            visibleListItems={visibleListItems}
            listItems={listItems}
            visibleCount={visibleCount}
            initialCount={INITIAL_TX_COUNT}
            onExpandHistory={handleExpandHistory}
            onAddEntry={handleAddEntryNavigation}
            txFilter={txFilter}
            onChangeFilter={(tab) => {
              setTxFilter(tab);
              setVisibleCount(INITIAL_TX_COUNT);
              scrollViewRef.current?.scrollTo({ y: 0 });
            }}
            onPressTx={handleTransactionPress}
          />
        </ScrollView>
      </View>

      {/* Modals & Bottom Sheets */}

      {/* M1: Record Customer Payment Modal (only when customer has balance) */}
      {customer.outstandingBalance > 0 && (
        <RecordCustomerPaymentModal
          ref={paymentModalRef}
          onSuccess={(amount) => {
            paymentModalRef.current?.dismiss();
            handlePaymentSuccess(amount);
          }}
          outstandingBalance={customer.outstandingBalance}
          customerId={customer.id}
          customerName={customer.name}
          initialAmount={
            quickPaymentAmount ? Number(quickPaymentAmount) : undefined
          }
        />
      )}

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
        paymentsCount={
          (customer.transactions || []).filter((tx) => tx.type === "payment")
            .length
        }
        isDeleting={isDeleting}
        onConfirm={() => onDeleteCustomer()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  reconciliationBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    fontSize: 13,
    flex: 1,
  },
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
