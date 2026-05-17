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
      className="flex-row items-center rounded-md border border-border bg-surface px-3 py-3 dark:border-border-dark dark:bg-surface-dark"
      style={{
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
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
        className="flex-row items-center justify-center rounded-xl bg-danger px-5 py-3"
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
