import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { ArrowDown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, Text, View } from "react-native";

type Props = {
  balanceDue: number;
  onRecordPayment: () => void;
};

export default function CustomerStickyCollectBar({
  balanceDue,
  onRecordPayment,
}: Props) {
  const { colors, typography } = useTheme();

  const handleCollectPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onRecordPayment();
  };

  return (
    <View
      className="flex-row items-center bg-surface px-4 py-3 dark:bg-surface-dark"
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.border + "50",
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-1 pr-2">
        <Text
          className="text-caption text-textSecondary dark:text-textSecondary-dark"
          style={{ fontWeight: "600" }}
        >
          Balance due
        </Text>
        <Text
          style={[
            typography.cardTitle,
            { color: colors.textPrimary, fontWeight: "800" },
          ]}
        >
          {formatINR(balanceDue, { maximumFractionDigits: 2 })}
        </Text>
      </View>

      <Pressable
        className="flex-row items-center justify-center rounded-xl px-5 py-3"
        style={{ backgroundColor: colors.primary }}
        onPress={handleCollectPress}
        android_ripple={{ color: colors.surface + "40", borderless: false }}
      >
        <ArrowDown size={18} color={colors.surface} strokeWidth={2.4} />
        <Text className="ml-2 text-body font-inter-bold text-surface">
          Collect
        </Text>
      </Pressable>
    </View>
  );
}
