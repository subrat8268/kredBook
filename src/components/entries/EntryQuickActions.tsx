import { useTheme } from "@/src/utils/ThemeProvider";
import { Share2, Pencil, MessageCircle } from "lucide-react-native";
import { Pressable, Text, View, Linking, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import * as Sharing from "expo-sharing";
import { buildEntryShareMessage } from "@/src/utils/shareTemplates";
import { useToast } from "@/src/components/feedback/Toast";
import { useAuthStore } from "@/src/store/authStore";

type Props = {
  orderId: string;
  orderTotalAmount: number;
  orderCreatedAt: string;
  orderDueDate: string | null;
  customerName: string;
  customerPhone: string;
  onEdit: () => void;
  isPaid: boolean;
};

// Internal component for Quick Actions with icon above label
type QuickActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
};

function QuickActionButton({ icon, label, onPress, disabled, color }: QuickActionButtonProps) {
  const { spacing, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { alignItems: "center", paddingVertical: spacing.xs, opacity: disabled ? 0.5 : 1 },
        pressed && { opacity: 0.75 },
      ]}
    >
      {icon}
      <Text style={[typography.caption, { color, marginTop: spacing.xs / 2 }]}>{label}</Text>
    </Pressable>
  );
}

export default function EntryQuickActions({
  orderId,
  orderTotalAmount,
  orderCreatedAt,
  orderDueDate,
  customerName,
  customerPhone,
  onEdit,
  isPaid,
}: Props) {
  const { colors, spacing } = useTheme();
  const { i18n } = useTranslation();
  const { show: showToast } = useToast();
  const { profile } = useAuthStore();

  const shareLocale = i18n.language?.toLowerCase().startsWith("hi") ? "hi" : "en";

  const handleShare = async () => {
    try {
      const shareMessage = buildEntryShareMessage({
        locale: shareLocale,
        customerName,
        amount: orderTotalAmount,
        entryDate: orderCreatedAt,
        dueDate: orderDueDate,
        businessName: profile?.business_name || profile?.name || "KredBook",
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`);
        showToast({ message: "Entry details shared via WhatsApp", type: "success" });
      } else {
        throw new Error("sharing-unavailable");
      }
    } catch (error: any) {
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const msg = encodeURIComponent(
        buildEntryShareMessage({
          locale: shareLocale,
          customerName,
          amount: orderTotalAmount,
          entryDate: orderCreatedAt,
          dueDate: orderDueDate,
          businessName: profile?.business_name || profile?.name || "KredBook",
        }),
      );
      const wa = `https://wa.me/91${cleanPhone}?text=${msg}`;
      showToast({
        message:
          error?.message === "sharing-unavailable"
            ? "Sharing unavailable, opened WhatsApp"
            : "Entry sent via WhatsApp",
        type: "success",
      });
      Linking.openURL(wa).catch(() => {
        showToast({
          message: "Cannot open WhatsApp",
          type: "error",
        });
        Alert.alert(
          "Cannot open WhatsApp",
          "Please install WhatsApp and try again.",
        );
      });
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: spacing.screenPadding,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
      }}
    >
      <View style={{ flex: 1, alignItems: "center" }}>
        <QuickActionButton
          label="Share"
          icon={<Share2 size={20} color={colors.textSecondary} strokeWidth={2} />}
          onPress={handleShare}
          color={colors.textSecondary}
        />
      </View>

      {customerPhone ? (
        <View style={{ flex: 1, alignItems: "center" }}>
          <QuickActionButton
            label="WhatsApp"
            icon={<MessageCircle size={20} color={colors.primary} strokeWidth={2} />}
            onPress={handleShare} // Reusing handleShare for WhatsApp fallback for now
            color={colors.primary}
          />
        </View>
      ) : null}

      {!isPaid ? (
        <View style={{ flex: 1, alignItems: "center" }}>
          <QuickActionButton
            label="Edit"
            icon={<Pencil size={20} color={colors.textSecondary} strokeWidth={2} />}
            onPress={onEdit}
            color={colors.textSecondary}
          />
        </View>
      ) : null}
    </View>
  );
}