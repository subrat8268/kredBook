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
  const { colors, typography } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.canvas,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSubtle,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <View className="flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [pressed ? { opacity: 0.75 } : null]}
          className="mr-3"
        >
          <ArrowLeft size={22} color={colors.ink} strokeWidth={2.2} />
        </Pressable>

        <View className="ml-0 mr-3">
          <Avatar name={customerName} size="sm" />
        </View>

        <View className="flex-1">
          <Text
            style={{
              fontFamily: typography.fontFamilies.semiBold,
              fontSize: 17,
              fontWeight: "600",
              color: colors.ink,
              lineHeight: 22,
            }}
            numberOfLines={1}
          >
            {customerName}
          </Text>
          <Text
            style={{
              fontFamily: typography.fontFamilies.regular,
              fontSize: 12,
              color: colors.muted,
              lineHeight: 18,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {lastActiveLabel}
          </Text>
        </View>

        {canSendReminder ? (
          <View className="flex-row items-center gap-2 ml-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send reminder"
              onPress={onReminder}
              hitSlop={10}
              style={({ pressed }) => [
                pressed ? { opacity: 0.75 } : null,
                {
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: colors.surfaceRaised,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <MessageCircle size={20} color={colors.primary} strokeWidth={2} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Call customer"
              onPress={onCall}
              hitSlop={10}
              style={({ pressed }) => [
                pressed ? { opacity: 0.75 } : null,
                {
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: colors.surfaceRaised,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <Phone size={20} color={colors.primary} strokeWidth={2} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
