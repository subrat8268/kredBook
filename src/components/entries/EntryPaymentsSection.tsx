import { useTheme } from "@/src/utils/ThemeProvider";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { formatDate } from "@/src/utils/helper";
import { ActivityIndicator, Text, View } from "react-native";
import EmptyState from "@/src/components/feedback/EmptyState";

type PaymentRow = {
  payment: {
    id: string;
    payment_date: string;
    payment_mode: string;
    amount: number;
  };
  remaining: number;
};

type Props = {
  paymentsLoading: boolean;
  paymentRows: PaymentRow[];
  fmt: (value: number) => string;
  PAYMENT_MODE_COLORS: Record<string, { bg: string; text: string }>;
  grandTotal: number;
  paidAmount: number;
};

export default function EntryPaymentsSection({
  paymentsLoading,
  paymentRows,
  fmt,
  PAYMENT_MODE_COLORS,
  grandTotal,
  paidAmount,
}: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: spacing.cardRadius,
        marginHorizontal: spacing.screenPadding,
        marginBottom: spacing.sm,
        padding: spacing.lg,
      }}
      className="shadow-sm shadow-textPrimary-dark" // Subtle shadow
    >
      <View style={{ marginBottom: spacing.md }}>
        <Text style={typography.sectionTitle}>Payments</Text>
        <Text style={[typography.caption, { marginTop: spacing.xs, color: colors.textSecondary }]}>
          Paid {fmt(paidAmount)} of {fmt(grandTotal)}
        </Text>
      </View>

      {paymentsLoading ? (
        <View style={{ paddingVertical: spacing.xl, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : paymentRows.length === 0 ? (
        <EmptyState
          title="No payments recorded yet"
          description="Payments will appear here once recorded."
        />
      ) : (
        <>
          {paymentRows.map(({ payment, remaining }, idx) => {
            const modeStyle =
              PAYMENT_MODE_COLORS[payment.payment_mode] ?? PAYMENT_MODE_COLORS["Cash"];
            return (
              <View
                key={payment.id}
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: idx === paymentRows.length - 1 ? 0 : spacing.sm,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text style={{ ...typography.cardTitle, color: colors.textPrimary }}>
                      {formatDate(payment.payment_date)}
                    </Text>
                    <View
                      style={{
                        backgroundColor: modeStyle.bg,
                        borderRadius: radius.full,
                        paddingHorizontal: spacing.chipPadding,
                        paddingVertical: spacing.xs,
                        alignSelf: "flex-start",
                        marginTop: spacing.xs,
                      }}
                    >
                      <Text
                        style={{
                          ...typography.caption,
                          color: modeStyle.text,
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {payment.payment_mode}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <MoneyAmount
                      value={payment.amount}
                      showPlusForPositive
                      variant="title"
                      color={colors.success}
                      style={{ fontWeight: "800" }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: spacing.xs,
                      }}
                    >
                      <Text style={{ ...typography.caption, color: colors.textSecondary }}>Due: </Text>
                      <MoneyAmount
                        value={remaining}
                        variant="caption"
                        color={remaining > 0 ? colors.danger : colors.success}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}