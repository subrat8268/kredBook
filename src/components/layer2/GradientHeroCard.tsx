import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface GradientHeroCardProps {
  gradientColors: [string, string];
  shadow?: object;
  children: React.ReactNode;
}

export default function GradientHeroCard({
  gradientColors,
  shadow,
  children,
}: GradientHeroCardProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => {
      cancelAnimation(scale);
    };
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        {
          borderRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
          elevation: 8,
          position: "relative",
          overflow: "hidden",
          padding: 24,
        },
        shadow,
      ]}
      className="mx-4 mb-4"
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            position: "absolute",
            top: -10,
            right: -58,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: "rgba(255,255,255,0.12)",
            pointerEvents: "none",
          },
        ]}
      />
      <View className="w-full flex-col gap-2">{children}</View>
    </LinearGradient>
  );
}
