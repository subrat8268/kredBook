import { useTheme } from "@/src/utils/ThemeProvider";
import { ArrowLeft } from "lucide-react-native";
import { memo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type HeaderAction = {
  key: string;
  icon: ReactNode;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  leadingSlot?: ReactNode;
  actions?: HeaderAction[];
};

export default memo(function DetailHeader({
  title,
  subtitle,
  onBack,
  leadingSlot,
  actions = [],
}: Props) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center bg-surface border-b border-border px-4 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => [pressed ? { opacity: 0.75 } : null]}
        className="w-[42px] h-[42px] rounded-full items-center justify-center mr-2"
      >
        <ArrowLeft size={22} color={colors.textPrimary} strokeWidth={2.2} />
      </Pressable>

      {leadingSlot ? <View className="ml-0 mr-3">{leadingSlot}</View> : null}

      <View className="flex-1 min-w-0 mr-2">
        <Text
          className="text-card-title text-textPrimary shrink"
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-caption text-textSecondary/80 mt-0.5 shrink"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actions.length ? (
        <View className="flex-row items-center gap-2 ml-2">
          {actions.map((action) => (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              onPress={action.onPress}
              hitSlop={10}
              disabled={action.disabled}
              style={({ pressed }) => [
                action.disabled
                  ? { opacity: 0.45 }
                  : pressed
                    ? { opacity: 0.75 }
                    : null,
              ]}
              className="w-[42px] h-[42px] rounded-full bg-icon items-center justify-center"
            >
              {action.icon}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
});
