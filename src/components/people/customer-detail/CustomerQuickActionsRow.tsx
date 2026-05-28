import QuickActionTile from "@/src/components/shared/QuickActionTile";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Bell, Download, Plus, Share2 } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  /** Ledger share in-flight */
  isSharingLedgerLink: boolean;
  /** PDF export in-flight */
  exporting: boolean;
  /** PDF tile enabled only when there are transactions */
  canDownload: boolean;
  /** WhatsApp reminder in-flight */
  isSendingReminder?: boolean;
  onAddEntry: () => void;
  onShare: () => void;
  onDownload: () => void;
  /** Send WhatsApp payment reminder */
  onReminder: () => void;
};

export default function CustomerQuickActionsRow({
  isSharingLedgerLink,
  exporting,
  canDownload,
  isSendingReminder = false,
  onAddEntry,
  onShare,
  onDownload,
  onReminder,
}: Props) {
  const { colors } = useTheme();

  return (
    <View className="mx-4 mt-4 flex-row gap-2">
      {/* 1 — Add Entry (primary / accent) */}
      <QuickActionTile
        label="Add Entry"
        icon={<Plus size={20} color={colors.primary} strokeWidth={2} />}
        onPress={onAddEntry}
        accent
      />

      {/* 2 — Reminder (WhatsApp) */}
      <QuickActionTile
        label={isSendingReminder ? "Sending" : "Reminder"}
        icon={<Bell size={20} color={colors.textSecondary} strokeWidth={2} />}
        onPress={onReminder}
        loading={isSendingReminder}
      />

      {/* 3 — Share ledger link */}
      <QuickActionTile
        label={isSharingLedgerLink ? "Sharing" : "Share"}
        icon={
          <Share2 size={20} color={colors.textSecondary} strokeWidth={2} />
        }
        onPress={onShare}
        loading={isSharingLedgerLink}
      />

      {/* 4 — Download PDF statement */}
      <QuickActionTile
        label={exporting ? "Exporting" : "PDF"}
        icon={
          <Download size={20} color={colors.textSecondary} strokeWidth={2} />
        }
        onPress={onDownload}
        loading={exporting}
        disabled={!canDownload}
      />
    </View>
  );
}
