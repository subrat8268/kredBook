import { useTheme } from "@/src/utils/ThemeProvider";
import { Download, Plus, Share2 } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

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

  const actions = [
    {
      key: "add",
      label: "Add Entry",
      icon: <Plus size={20} color={colors.primary} strokeWidth={2} />,
      onPress: onAddEntry,
      loading: false,
      disabled: false,
    },
    {
      key: "share",
      label: isSharingLedgerLink ? "Sharing" : "Share",
      icon: <Share2 size={20} color={colors.muted} strokeWidth={2} />,
      onPress: onShare,
      loading: isSharingLedgerLink,
      disabled: false,
    },
    {
      key: "download",
      label: exporting ? "Exporting" : "PDF",
      icon: <Download size={20} color={colors.muted} strokeWidth={2} />,
      onPress: onDownload,
      loading: exporting,
      disabled: !canDownload,
    },
  ];

  return (
    <View
      className="mx-4 mb-3 flex-row gap-2"
    >
      {actions.map((act) => {
        const disabled = act.disabled || act.loading;
        return (
          <Pressable
            key={act.key}
            disabled={disabled}
            onPress={act.onPress}
            className="flex-1 items-center px-2 py-3"
            style={{
              backgroundColor: colors.surfaceRaised,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              opacity: disabled ? 0.5 : 1,
              shadowColor: colors.ink,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
            android_ripple={{
              color: colors.primary + "20",
              borderless: false,
            }}
          >
            <View
              className="items-center justify-center"
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.surface,
              }}
            >
              {act.loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                act.icon
              )}
            </View>
            <Text
              className="mt-2 text-center"
              numberOfLines={1}
              style={{
                color: colors.body,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {act.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
