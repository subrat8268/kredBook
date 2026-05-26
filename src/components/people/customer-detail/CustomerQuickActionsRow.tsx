import { useTheme } from "@/src/utils/ThemeProvider";
import { Download, Plus, Share2 } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ReactNode,
  type ViewStyle,
} from "react-native";

type QuickActionTileProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
};

type Props = {
  isSharingLedgerLink: boolean;
  exporting: boolean;
  canDownload: boolean;
  onAddEntry: () => void;
  onShare: () => void;
  onDownload: () => void;
};

function QuickActionTile({
  label,
  icon,
  onPress,
  disabled = false,
  accent = false,
  style,
}: QuickActionTileProps) {
  const { colors } = useTheme();
  const iconBg = accent ? colors.primary + "18" : colors.textSecondary + "12";
  const labelColor = accent ? colors.textPrimary : colors.textSecondary;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`flex-1 items-center rounded-xl border px-2 py-4 mb-2 ${disabled ? "opacity-50" : ""}`}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border + "40",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 1,
          elevation: 1,
        },
        style,
      ]}
      hitSlop={4}
      android_ripple={{
        color: colors.primaryLight || colors.primary + "20",
        borderless: false,
      }}
      unstable_pressDelay={0}
    >
      <View
        className="items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: iconBg,
        }}
      >
        {icon}
      </View>
      <Text
        className="mt-2 text-caption"
        style={{ color: labelColor, fontSize: 12, fontWeight: "500" }}
      >
        {label}
      </Text>
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
    <View className="mx-4 mt-4 flex-row gap-2">
      <QuickActionTile
        label="Add Entry"
        icon={<Plus size={20} color={colors.primary} strokeWidth={2} />}
        onPress={onAddEntry}
        accent
      />

      <QuickActionTile
        label={isSharingLedgerLink ? "Sharing" : "Share"}
        icon={
          isSharingLedgerLink ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Share2 size={20} color={colors.textSecondary} strokeWidth={2} />
          )
        }
        onPress={onShare}
        disabled={isSharingLedgerLink}
      />

      <QuickActionTile
        label={exporting ? "Exporting" : "PDF"}
        icon={
          <Download size={20} color={colors.textSecondary} strokeWidth={2} />
        }
        onPress={onDownload}
        disabled={!canDownload || exporting}
      />
    </View>
  );
}
