import QuickActionTile from "@/src/components/shared/QuickActionTile";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Download, Plus, Share2 } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  isSharingLedgerLink: boolean;
  exporting: boolean;
  canDownload: boolean;
  onAddEntry: () => void;
  onShare: () => void;
  onDownload: () => void;
};

export default function CustomerQuickActionsRow({
  isSharingLedgerLink,
  exporting,
  canDownload,
  onAddEntry,
  onShare,
  onDownload,
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

      {/* 2 — Share ledger link */}
      <QuickActionTile
        label={isSharingLedgerLink ? "Sharing" : "Share"}
        icon={<Share2 size={20} color={colors.muted} strokeWidth={2} />}
        onPress={onShare}
        loading={isSharingLedgerLink}
      />

      {/* 3 — Download PDF statement */}
      <QuickActionTile
        label={exporting ? "Exporting" : "PDF"}
        icon={
          <Download size={20} color={colors.muted} strokeWidth={2} />
        }
        onPress={onDownload}
        loading={exporting}
        disabled={!canDownload}
      />
    </View>
  );
}
