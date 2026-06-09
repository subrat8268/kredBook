import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { ArrowDownLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  balanceDue: number;
  onRecordPayment: () => void;
};

export default function CustomerStickyCollectBar({
  balanceDue,
  onRecordPayment,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handleCollectPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onRecordPayment();
  };

  return (
    <View
      className="flex-row items-center px-4 pt-3"
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border + "60",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(Math.min(insets.bottom, 12), 4),
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: colors.primary + "08",
        }}
      />

      <View className="flex-1 pr-2">
        <Text
          className="mb-0.5 text-[10px] font-semibold uppercase tracking-[1.2px] text-muted"
          style={{ color: colors.muted }}
        >
          BALANCE DUE
        </Text>
        <Text
          className="text-[20px] font-extrabold tracking-[-0.5px] text-ink"
          style={{ color: colors.ink }}
        >
          {formatINR(balanceDue, { maximumFractionDigits: 2 })}
        </Text>
      </View>

      <Pressable
        className="min-w-[168px] flex-row items-center justify-center rounded-[14px] px-6 py-3.5"
        style={{
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
          paddingHorizontal: 22,
          paddingVertical: 14,
        }}
        onPress={handleCollectPress}
        android_ripple={{ color: "#ffffff30", borderless: false }}
      >
        <ArrowDownLeft size={18} color="#fff" strokeWidth={2.5} />
        <Text
          className="ml-2 text-[15px] font-bold text-surface"
          style={{ color: "#fff", letterSpacing: 0.2 }}
        >
          Collect Payment
        </Text>
      </Pressable>
    </View>
  );
}
