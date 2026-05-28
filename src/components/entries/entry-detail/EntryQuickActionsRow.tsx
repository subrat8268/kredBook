import QuickActionTile from "@/src/components/shared/QuickActionTile";
import { useTheme } from "@/src/utils/ThemeProvider";
import { MessageCircle, Pencil, Share2 } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  /** Share invoice link in-flight */
  isSharing: boolean;
  /** WhatsApp share in-flight */
  isSendingWhatsApp: boolean;
  /** Hide Edit when entry is fully paid */
  isPaid: boolean;
  onShare: () => void;
  onWhatsApp: () => void;
  onEdit: () => void;
};

export default function EntryQuickActionsRow({
  isSharing,
  isSendingWhatsApp,
  isPaid,
  onShare,
  onWhatsApp,
  onEdit,
}: Props) {
  const { colors } = useTheme();

  return (
    <View className="mx-4 mt-4 flex-row gap-2">
      {/* 1 — Share invoice */}
      <QuickActionTile
        label={isSharing ? "Sharing" : "Share"}
        icon={
          <Share2 size={20} color={colors.textSecondary} strokeWidth={2} />
        }
        onPress={onShare}
        loading={isSharing}
      />

      {/* 2 — WhatsApp (accent because it's the primary outreach action) */}
      <QuickActionTile
        label={isSendingWhatsApp ? "Sending" : "WhatsApp"}
        icon={
          <MessageCircle
            size={20}
            color={colors.primary}
            strokeWidth={2}
          />
        }
        onPress={onWhatsApp}
        loading={isSendingWhatsApp}
        accent
      />

      {/* 3 — Edit (hidden when paid — no edits on settled entries) */}
      {!isPaid && (
        <QuickActionTile
          label="Edit"
          icon={
            <Pencil size={20} color={colors.textSecondary} strokeWidth={2} />
          }
          onPress={onEdit}
        />
      )}
    </View>
  );
}
