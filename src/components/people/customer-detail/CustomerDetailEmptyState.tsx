import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BookOpen, Search } from "lucide-react-native";
import { useTheme } from "@/src/theme/useTheme";
import Button from "@/src/components/ui/Button";

interface CustomerDetailEmptyStateProps {
  variant: "new_customer" | "filtered_empty";
  filter?: "Entries" | "Payments" | "All";
  onAddEntry: () => void;
}

export default function CustomerDetailEmptyState({
  variant,
  filter = "All",
  onAddEntry,
}: CustomerDetailEmptyStateProps) {
  const t = useTheme();
  const { colors } = t;

  const isNewCustomer = variant === "new_customer";

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.borderSubtle }]}>
        {isNewCustomer ? (
          <BookOpen size={48} color={colors.muted} strokeWidth={1.5} />
        ) : (
          <Search size={48} color={colors.muted} strokeWidth={1.5} />
        )}
      </View>

      <Text style={[styles.heading, { color: colors.ink, fontFamily: t.fontFamily.displaySemiBold }]}>
        {isNewCustomer ? "No entries yet" : `No ${filter === "Payments" ? "payments" : "entries"} yet`}
      </Text>

      <Text style={[styles.body, { color: colors.muted, fontFamily: t.fontFamily.body }]}>
        {isNewCustomer
          ? "Add the first entry to start tracking this person's balance"
          : "Nothing to show for this filter"}
      </Text>

      {isNewCustomer && (
        <View style={styles.ctaWrapper}>
          <Button
            variant="outline"
            title="+ Add First Entry"
            onPress={onAddEntry}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  ctaWrapper: {
    marginTop: 24,
    width: "100%",
    maxWidth: 200,
  },
});
