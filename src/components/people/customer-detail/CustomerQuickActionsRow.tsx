import { useTheme } from "@/src/utils/ThemeProvider";
import { Download, Plus, Share2 } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View, type ReactNode } from "react-native";

type QuickActionTileProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  accent?: boolean;
};

type Props = {
  isSharingLedgerLink: boolean;
  exporting: boolean;
  canDownload: boolean;
  onAddEntry: () => void;
  onShare: () => void;
  onDownload: () => void;
};

function QuickActionTile({ label, icon, onPress, disabled = false, accent = false }: QuickActionTileProps) {
  const { colors } = useTheme();
  return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        className={`items-center rounded-xl border border-border px-3 py-2.5 dark:border-border-dark ${disabled ? "opacity-50" : ""}`}
        style={{ width: "31.5%", backgroundColor: accent ? colors.primaryLight : colors.surface }}
        hitSlop={4}
        android_ripple={{ color: colors.primaryLight || colors.primary + "20", borderless: false }}
        unstable_pressDelay={0}
    >
      <View
        className="mb-1.5 h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: accent ? colors.primaryLight : colors.search }}
      >
        {icon}
      </View>
      <Text className="text-caption font-inter-semibold text-textPrimary dark:text-textPrimary-dark">{label}</Text>
    </Pressable>
  );
}

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
    <View className="mx-4 mt-3 flex-row justify-between">
      <QuickActionTile
        label="Add Entry"
        icon={<Plus size={18} color={colors.primary} strokeWidth={2} />}
        onPress={onAddEntry}
        accent
      />

      <QuickActionTile
        label={isSharingLedgerLink ? "Sharing" : "Share"}
        icon={
          isSharingLedgerLink ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Share2 size={18} color={colors.primary} strokeWidth={2} />
          )
        }
        onPress={onShare}
        disabled={isSharingLedgerLink}
      />

      <QuickActionTile
        label={exporting ? "Exporting" : "PDF"}
        icon={<Download size={18} color={colors.primary} strokeWidth={2} />}
        onPress={onDownload}
        disabled={!canDownload || exporting}
      />
    </View>
  );
}
