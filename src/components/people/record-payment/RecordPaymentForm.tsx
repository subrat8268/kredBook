import Avatar from "@/src/components/ui/Avatar";
import Input from "@/src/components/ui/Input";
import MoneyAmount from "@/src/components/ui/MoneyAmount";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Text, ScrollView, TouchableOpacity, View } from "react-native";
import type { PaymentMode } from "./useRecordCustomerPaymentModal";

type Props = {
  customerName: string;
  amount: string;
  amountError?: string;
  effectiveBalance: number;
  hasBalance: boolean;
  isFullPaid: boolean;
  remainingBalance: number;
  mode: PaymentMode;
  modes: PaymentMode[];
  notes: string;
  onAmountChange: (value: string) => void;
  onQuickAmount: (value: number) => void;
  onClearAmount: () => void;
  onModeChange: (mode: PaymentMode) => void;
  onNotesChange: (value: string) => void;
};

export default function RecordPaymentForm({
  customerName,
  amount,
  amountError,
  effectiveBalance,
  hasBalance,
  isFullPaid,
  remainingBalance,
  mode,
  modes,
  notes,
  onAmountChange,
  onQuickAmount,
  onClearAmount,
  onModeChange,
  onNotesChange,
}: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  const HeaderSection = () => (
    <View style={{ marginBottom: spacing.sectionGapSm, gap: spacing.xs }}>
      <Text style={typography.screenTitle}>Record Payment</Text>
      <Text style={[typography.subtitle, { color: colors.textSecondary }]}>Collect payment for {customerName} and update this entry balance instantly.</Text>
    </View>
  );

  const CustomerHeroSection = () => (
    <View
      style={{
        marginBottom: spacing.sectionGapMd,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.primaryLight,
        borderRadius: radius.lg,
      }}
      className="flex-row items-center"
    >
      <View style={{ marginRight: spacing.md }}>
        <Avatar name={customerName} size="md" />
      </View>
      <View className="flex-1">
        <Text style={[typography.cardTitle, { color: colors.primaryDark }]}>{customerName}</Text>
        <View className="mt-1 flex-row items-center">
          <Text style={[typography.caption, { color: colors.primaryDark }]}>Entry balance: </Text>
          <MoneyAmount value={effectiveBalance} color={colors.danger} style={[typography.caption, { fontWeight: "700" }]} />
        </View>
      </View>
    </View>
  );

  const AmountSection = () => (
    <View style={{ marginBottom: spacing.sectionGapMd }}>
      <Text style={[typography.subtitle, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Amount Received</Text>
      <View
        style={{
          backgroundColor: colors.primaryLight,
          borderRadius: radius.xl,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
      >
        <View className="mb-1 flex-row items-end">
          <Text style={[typography.h1, { color: colors.primaryDark, fontWeight: "800", marginRight: spacing.sm }]}>Rs</Text>
          <View className="flex-1">
            <Input
              placeholder="0"
              value={amount}
              onChangeText={onAmountChange}
              keyboardType="decimal-pad"
              error={amountError}
              height={64}
              inputStyle={{ fontSize: 36, lineHeight: 42, fontWeight: "800", color: colors.primaryDark }}
              containerStyle={{
                borderWidth: 0,
                backgroundColor: "transparent",
                paddingHorizontal: 0,
                minHeight: 64,
              }}
              variant="white"
            />
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row" style={{ marginBottom: spacing.sectionGapSm, gap: spacing.sm }}>
        <TouchableOpacity
          onPress={() => onQuickAmount(effectiveBalance)}
          activeOpacity={0.85}
          className="rounded-full border px-4 py-2"
          style={{ borderColor: colors.primary, backgroundColor: colors.primaryLight }}
        >
          <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: "700" }]}>Full</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onQuickAmount(effectiveBalance / 2)}
          activeOpacity={0.85}
          className="rounded-full px-4 py-2"
          style={{ backgroundColor: colors.surfaceAlt }}
        >
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: "700" }]}>Half</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClearAmount}
          activeOpacity={0.85}
          className="rounded-full px-4 py-2"
          style={{ backgroundColor: colors.surfaceAlt }}
        >
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: "700" }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View
        className="rounded-xl px-3 py-2"
        style={{ backgroundColor: colors.surfaceAlt }}
      >
        {!hasBalance ? (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>No outstanding balance for this entry.</Text>
        ) : isFullPaid ? (
          <Text style={[typography.caption, { color: colors.success, fontWeight: "700" }]}>This will mark the entry fully paid.</Text>
        ) : (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Remaining balance: <MoneyAmount value={remainingBalance} color={colors.danger} style={[typography.caption, { fontWeight: "700" }]} /></Text>
        )}
      </View>
    </View>
  );

  const PaymentModeSection = () => (
    <View style={{ marginBottom: spacing.sectionGapMd }}>
      <Text style={[typography.subtitle, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Payment Mode</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xs }}
      >
        {modes.map((item) => {
          const selected = mode === item;
          return (
            <TouchableOpacity
              key={item}
              onPress={() => onModeChange(item)}
              activeOpacity={0.8}
              className="rounded-full px-5 py-2"
              style={{
                backgroundColor: selected ? colors.primary : colors.surfaceAlt,
              }}
            >
              <Text style={{ color: selected ? colors.surface : colors.textSecondary, fontSize: 14, fontWeight: "700" }}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const NotesSection = () => (
    <View
      style={{
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.lg,
        padding: spacing.md,
      }}
    >
      <Text style={[typography.subtitle, { color: colors.textPrimary, marginBottom: spacing.sm }]}>Notes (optional)</Text>
      <Input
        placeholder="Write a note about this payment..."
        value={notes}
        onChangeText={onNotesChange}
        multiline
        numberOfLines={3}
        height={84}
        variant="white"
      />
    </View>
  );

  return (
    <>
      <HeaderSection />
      <CustomerHeroSection />
      <AmountSection />
      <PaymentModeSection />
      <NotesSection />
    </>
  );
}
