import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import {
  ArrowLeft,
  MessageCircle,
  MoreVertical,
  Phone,
} from "lucide-react-native";
import React, { memo } from "react";
import { Linking, Pressable, Text, View } from "react-native";

interface CustomerDetailHeaderProps {
  customerName: string;
  phone?: string;
  balanceState:
    | "overdue"
    | "pending"
    | "partial"
    | "settled"
    | "advance"
    | null;
  netBalance: number;
  onBack: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  onOverflow: () => void;
}

export default memo(function CustomerDetailHeader({
  customerName,
  phone,
  balanceState,
  netBalance,
  onBack,
  onCall,
  onWhatsApp,
  onOverflow,
}: CustomerDetailHeaderProps) {
  const t = useTheme();

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

  // Subtitle logic
  const getSubtitle = (): string => {
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

  const hasPhone = typeof phone === "string" && phone.trim().length > 0;
  const isMuted = balanceState === "settled" || balanceState === "advance";

  const handleCall = () => {
    if (phone) {
      const cleanedPhone = phone.replace(/\D/g, "");
      Linking.openURL(`tel:${cleanedPhone}`);
      onCall();
    }
  };

  const handleWhatsApp = () => {
    if (phone) {
      const cleanedPhone = phone.replace(/\D/g, "");
      const message = `Dear Customer, your outstanding balance is ${formatINR(netBalance)}. Please arrange payment. Thank you.`;
      const encodedMessage = encodeURIComponent(message);
      Linking.openURL(`https://wa.me/91${cleanedPhone}?text=${encodedMessage}`);
      onWhatsApp();
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        height: 56,
        paddingHorizontal: 16,
        alignItems: "center",
        backgroundColor: t.colors.surface,
      }}
    >
      {/* LEFT section: back button and avatar */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [
            {
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <ArrowLeft size={24} color={t.colors.ink} strokeWidth={2} />
        </Pressable>

        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 9999,
            backgroundColor: t.colors.primaryBorderFill,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: t.typography.fontFamilies.bold,
              fontSize: 15,
              fontWeight: "700",
              color: t.colors.primary,
            }}
          >
            {getInitials(customerName)}
          </Text>
        </View>
      </View>

      {/* CENTER section: customer name and subtitle */}
      <View style={{ flex: 1, marginHorizontal: 8, justifyContent: "center" }}>
        <Text
          style={[t.typography.cardTitle, { color: t.colors.ink }]}
          numberOfLines={1}
        >
          {customerName}
        </Text>
        <Text
          style={[t.typography.caption, { color: t.colors.muted }]}
          numberOfLines={1}
        >
          {getSubtitle()}
        </Text>
      </View>

      {/* RIGHT section: communication and overflow buttons */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {hasPhone && (
          <>
            {isMuted ? (
              <View
                style={{
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.4,
                }}
              >
                <Phone size={24} color={t.colors.faint} strokeWidth={2} />
              </View>
            ) : (
              <Pressable
                onPress={handleCall}
                style={({ pressed }) => [
                  {
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Phone size={24} color={t.colors.primary} strokeWidth={2} />
              </Pressable>
            )}

            {isMuted ? (
              <View
                style={{
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.4,
                }}
              >
                <MessageCircle
                  size={24}
                  color={t.colors.faint}
                  strokeWidth={2}
                />
              </View>
            ) : (
              <Pressable
                onPress={handleWhatsApp}
                style={({ pressed }) => [
                  {
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <MessageCircle
                  size={24}
                  color={t.colors.primary}
                  strokeWidth={2}
                />
              </Pressable>
            )}
          </>
        )}

        <Pressable
          onPress={onOverflow}
          style={({ pressed }) => [
            {
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <MoreVertical size={24} color={t.colors.ink} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
});
