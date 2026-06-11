import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { useTheme } from "@/src/theme/useTheme";
import { usePersonDetail, useUpdatePerson } from "@/src/hooks/usePeople";
import DetailHeader from "@/src/components/layer2/DetailHeader";
import Loader from "@/src/components/feedback/Loader";
import EmptyState from "@/src/components/ui/EmptyState";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import { formatINR } from "@/src/utils/format";

export default function EditCustomerScreen() {
  const t = useTheme();
  const { colors } = t;
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();

  // Fetch customer details
  const { customer, isLoading, isError } = usePersonDetail(customerId);
  const updateMutation = useUpdatePerson(customerId);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Populate initial values
  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setPhone(customer.phone || "");
      setAddress(customer.address || "");
    }
  }, [customer]);

  // Clean phone number (strip non-digits)
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    setPhone(cleaned);
  };

  // Check if form is dirty
  const isFormDirty = useMemo(() => {
    if (!customer) return false;
    const nameChanged = name.trim() !== (customer.name || "").trim();
    const phoneChanged = phone.trim() !== (customer.phone || "").trim();
    const addressChanged = address.trim() !== (customer.address || "").trim();
    return nameChanged || phoneChanged || addressChanged;
  }, [customer, name, phone, address]);

  // Check if phone number is modified
  const isPhoneModified = useMemo(() => {
    if (!customer) return false;
    return phone.trim() !== (customer.phone || "").trim();
  }, [customer, phone]);

  // Form validation
  const isValid = useMemo(() => {
    return name.trim().length > 1 && name.trim().length < 50;
  }, [name]);

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert("Invalid input", "Customer name must be between 2 and 50 characters.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : null,
        address: address.trim() ? address.trim() : null,
      });
      router.back();
    } catch {
      // Error is already handled by toast in useUpdatePerson
    }
  };

  if (isLoading) return <Loader />;

  if (isError || !customer) {
    return (
      <EmptyState
        illustration="person"
        headingEn="Customer not found"
        headingHi="ग्राहक नहीं मिला"
        bodyEn="This customer profile could not be loaded"
        bodyHi="यह ग्राहक प्रोफ़ाइल लोड नहीं हो पाई"
      />
    );
  }

  const hasTransactions = customer.transactions && customer.transactions.length > 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      edges={["top", "left", "right"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <DetailHeader
        title="Edit Profile"
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Fields */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderDefault }]}>
            <View style={styles.inputSpacing}>
              <Input
                label="Customer Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter customer name"
                variant={name.trim().length > 0 && !isValid ? "error" : "neutral"}
                error={name.trim().length > 0 && !isValid ? "Name must be between 2 and 50 characters" : undefined}
              />
            </View>

            <View style={styles.inputSpacing}>
              <Input
                label="Phone Number"
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            {/* Warning Banner if phone number is modified and existing entries exist */}
            {isPhoneModified && hasTransactions && (
              <View style={[styles.warningBanner, { backgroundColor: colors.warningBg }]}>
                <AlertCircle size={18} color={colors.warning} style={styles.warningIcon} />
                <Text style={[styles.warningText, { color: colors.warning, fontFamily: t.fontFamily.body }]}>
                  Warning: Changing the phone number will affect WhatsApp communication hooks.
                </Text>
              </View>
            )}

            <View style={styles.inputSpacing}>
              <Input
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter address (optional)"
              />
            </View>

            {/* Read-Only Outstanding Balance */}
            <View style={styles.inputSpacing}>
              <Input
                label="Outstanding Balance (Locked)"
                value={formatINR(customer.outstandingBalance)}
                onChangeText={() => {}}
                disabled={true}
              />
              <Text style={[styles.infoText, { color: colors.muted, fontFamily: t.fontFamily.body }]}>
                Opening and outstanding balances cannot be edited to maintain accounting integrity.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Footer Save Button */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderSubtle }]}>
          <Button
            title="Save Profile"
            onPress={handleSave}
            disabled={!isFormDirty || !isValid || updateMutation.isPending}
            loading={updateMutation.isPending}
            fullWidth={true}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  inputSpacing: {
    marginBottom: 20,
  },
  warningBanner: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  warningIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  warningText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  infoText: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
