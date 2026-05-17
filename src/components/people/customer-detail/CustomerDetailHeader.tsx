import Avatar from "@/src/components/ui/Avatar";
import { useTheme } from "@/src/utils/ThemeProvider";
import { ArrowLeft, FileText, Phone, Share2 } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
  customerName: string;
  phone?: string;
  lastActiveLabel: string;
  onBack: () => void;
  onShare: () => void;
  onDownload: () => void;
  onCall: () => void;
  isSharingLedgerLink: boolean;
  canDownload: boolean;
  hasPhone: boolean;
};

export default function CustomerDetailHeader({
  customerName,
  phone,
  lastActiveLabel,
  onBack,
  onShare,
  onDownload,
  onCall,
  isSharingLedgerLink,
  canDownload,
  hasPhone,
}: Props) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center border-b border-border bg-surface px-4 py-3 dark:border-border-dark dark:bg-surface-dark">
      <Pressable onPress={onBack} className="mr-2 h-11 w-11 items-center justify-center rounded-full">
        <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
      </Pressable>

      <View className="mr-3">
        <Avatar name={customerName} size="sm" />
      </View>

      <View className="flex-1">
        <Text className="text-card-title font-inter-bold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
          {customerName}
        </Text>
        <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={1}>
          {phone ? `${phone} · ${lastActiveLabel}` : lastActiveLabel}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark"
          onPress={onShare}
          disabled={isSharingLedgerLink}
        >
          {isSharingLedgerLink ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Share2 size={20} color={colors.primary} strokeWidth={2} />
          )}
        </Pressable>

        <Pressable
          className={`h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark ${canDownload ? "" : "opacity-50"}`}
          onPress={onDownload}
          disabled={!canDownload}
        >
          <FileText size={20} color={colors.primary} strokeWidth={2} />
        </Pressable>

        {hasPhone ? (
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark" onPress={onCall}>
            <Phone size={20} color={colors.primary} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
