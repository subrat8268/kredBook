import { getInitials } from "@/src/components/ui/Avatar";
import { MessageCircle, Phone } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/src/theme/useTheme";

type Props = {
  customerName: string;
  customerPhone: string | null;
  onCustomerTap?: () => void;
  onCallPress?: () => void;
  onChatPress?: () => void;
  isDeleted?: boolean;
};

export default function EntryCustomerCard({
  customerName,
  customerPhone,
  onCustomerTap,
  onCallPress,
  onChatPress,
  isDeleted = false,
}: Props) {
  const t = useTheme();
  const displayName = isDeleted ? "[Deleted Customer]" : customerName;
  const initials = getInitials(displayName);

  return (
    <Pressable
      onPress={isDeleted ? undefined : onCustomerTap}
      style={({ pressed }) => [
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        },
        pressed && !isDeleted && { backgroundColor: t.colors.borderSubtle },
      ]}
      className="self-stretch flex-row justify-between items-center p-4 mx-4 mb-4 border border-border-default rounded-xl"
    >
      <View className="flex-row justify-start items-center gap-3">
        <View
          className="w-11 h-11 rounded-full flex justify-center items-center bg-primary-fill"
        >
          <Text
            className="text-center justify-center text-base font-bold"
            style={{
              fontFamily: t.fontFamily.display, // Plus Jakarta Sans Bold — fontFamily not supported as CSS var in RN
              color: t.colors.primaryActive,
              lineHeight: 24,
            }}
          >
            {initials}
          </Text>
        </View>

        <View className="flex-col justify-start items-start">
          <View className="self-stretch flex-col justify-start items-start">
            <Text
              style={
                isDeleted
                  ? [t.typeStyles.caption, { color: t.colors.faint }]
                  : {
                      fontFamily: t.fontFamily.bodySemiBold,
                      fontSize: 16,
                      fontWeight: "600",
                      color: t.colors.ink,
                      lineHeight: 24,
                    }
              }
              numberOfLines={1}
              className="justify-center text-base font-semibold"
            >
              {displayName}
            </Text>
          </View>
          {customerPhone ? (
            <View className="self-stretch pb-[0.80px] flex-col justify-start items-start">
              <Text
                className="justify-center text-xs font-normal tracking-wide"
                style={{
                  fontFamily: t.fontFamily.body,
                  color: t.colors.muted,
                  lineHeight: 16,
                }}
              >
                {customerPhone}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {!isDeleted && (
        <View className="pr-2 flex-row items-center gap-2">
          <Pressable
            onPress={onCallPress}
            hitSlop={8}
            accessibilityRole="button"
            className="w-10 h-10 rounded-full flex justify-center items-center bg-primary-fill"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Phone size={16} color={t.colors.primaryActive} />
          </Pressable>
          <Pressable
            onPress={onChatPress}
            hitSlop={8}
            accessibilityRole="button"
            className="w-10 h-10 rounded-full flex justify-center items-center bg-primary-fill"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MessageCircle size={16} color={t.colors.primaryActive} />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
