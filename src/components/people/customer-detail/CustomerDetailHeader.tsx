import Avatar from "@/src/components/ui/Avatar";
import { useTheme } from "@/src/utils/ThemeProvider";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  customerName: string;
  lastActiveLabel: string;
  onBack: () => void;
  onReminder: () => void;
  onCall: () => void;
  canSendReminder: boolean;
};

export default function CustomerDetailHeader({
  customerName,
  lastActiveLabel,
  onBack,
  onReminder,
  onCall,
  canSendReminder,
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
          {lastActiveLabel}
        </Text>
      </View>

      {canSendReminder ? (
        <View className="flex-row items-center">
          <Pressable
            className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark"
            onPress={onReminder}
          >
            <MessageCircle size={20} color={colors.primary} strokeWidth={2} />
          </Pressable>

          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-search dark:bg-search-dark"
            onPress={onCall}
          >
            <Phone size={20} color={colors.primary} strokeWidth={2} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
