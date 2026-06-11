import { colors, motion, radius } from "@/src/utils/theme";
import React, { memo, useRef } from "react";
import { ActivityIndicator, Animated, Pressable, Text, View } from "react-native";

type Props = {
  variant?: keyof typeof variantStyles;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onPress: () => void;
  title?: string;
  children?: React.ReactNode;
  style?: any;
  className?: string;
};

const sizeTokens = {
  sm: { height: 32, fontSize: 13, paddingHorizontal: 12 },
  md: { height: 44, fontSize: 15, paddingHorizontal: 16 },
  lg: { height: 52, fontSize: 16, paddingHorizontal: 20 },
};

const variantStyles: Record<
  "primary" | "outline" | "secondary" | "ghost" | "danger",
  {
    bg: string;
    text: string;
    pressedBg: string;
    border: string;
    shadow: boolean;
  }
> = {
  primary: {
    bg: colors.primary,
    text: "#FFFFFF",
    pressedBg: colors.primaryDark,
    border: "transparent",
    shadow: true,
  },
  outline: {
    bg: colors.surface,
    text: colors.primary,
    pressedBg: colors.primary,
    border: colors.primary,
    shadow: false,
  },
  secondary: {
    bg: colors.surface,
    text: colors.textPrimary,
    pressedBg: colors.surfaceAlt,
    border: colors.border,
    shadow: false,
  },
  ghost: {
    bg: "transparent",
    text: colors.primary,
    pressedBg: "rgba(22, 163, 74, 0.1)",
    border: "transparent",
    shadow: false,
  },
  danger: {
    bg: colors.danger,
    text: "#FFFFFF",
    pressedBg: "#B91C1C",
    border: "transparent",
    shadow: true,
  },
};

export default memo(function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onPress,
  title,
  children,
  style: styleProp,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const content = title ?? children ?? "";
  const style = variantStyles[variant] ?? variantStyles.primary;
  const sizeToken = sizeTokens[size];

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      ...motion.springConfig.snappy,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], width: fullWidth ? "100%" : undefined }, styleProp]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          {
            height: sizeToken.height,
            paddingHorizontal: sizeToken.paddingHorizontal,
            borderRadius: radius.lg,
            backgroundColor: disabled ? colors.border : style.bg,
            borderWidth: style.bg ? 1 : 0,
            borderColor: style.border ?? style.pressedBg,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          },
          style.shadow &&
            !disabled && {
              shadowColor: style.bg,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.16,
              shadowRadius: 10,
              elevation: 4,
            },
          disabled && { opacity: 0.45 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={style.text} size="small" />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {(leftIcon || icon) && (
              <View style={{ marginRight: 8 }}>{leftIcon || icon}</View>
            )}
            {typeof content === "string" ? (
              <Text
                style={{
                  fontSize: sizeToken.fontSize,
                  fontWeight: "600",
                  color: disabled ? colors.textMuted : style.text,
                }}
              >
                {content}
              </Text>
            ) : (
              content
            )}
            {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});
