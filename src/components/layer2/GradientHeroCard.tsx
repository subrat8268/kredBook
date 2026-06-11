import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
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
  const [cardWidth, setCardWidth] = useState(0);

  const scaleA = useSharedValue(1);
  useEffect(() => {
    scaleA.value = withRepeat(
      withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1, true,
    );
    return () => cancelAnimation(scaleA);
  }, [scaleA]);
  const styleA = useAnimatedStyle(() => ({ transform: [{ scale: scaleA.value }] }));

  const scaleB = useSharedValue(1);
  const transYB = useSharedValue(0);
  useEffect(() => {
    scaleB.value = withRepeat(withTiming(1.12, { duration: 3500, easing: Easing.inOut(Easing.ease) }), -1, true);
    transYB.value = withRepeat(withTiming(-10, { duration: 3500, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => { cancelAnimation(scaleB); cancelAnimation(transYB); };
  }, [scaleB, transYB]);
  const styleB = useAnimatedStyle(() => ({
    transform: [{ scale: scaleB.value }, { translateY: transYB.value }],
  }));

  const scaleC = useSharedValue(1);
  const transXC = useSharedValue(0);
  useEffect(() => {
    scaleC.value = withRepeat(withTiming(1.15, { duration: 2800, easing: Easing.inOut(Easing.ease) }), -1, true);
    transXC.value = withRepeat(withTiming(8, { duration: 2800, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => { cancelAnimation(scaleC); cancelAnimation(transXC); };
  }, [scaleC, transXC]);
  const styleC = useAnimatedStyle(() => ({
    transform: [{ scale: scaleC.value }, { translateX: transXC.value }],
  }));

  const shimmer = useSharedValue(-200);
  useEffect(() => {
    if (cardWidth > 0) {
      shimmer.value = -200;
      shimmer.value = withRepeat(
        withTiming(cardWidth + 200, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        -1, true,
      );
    }
    return () => cancelAnimation(shimmer);
  }, [shimmer, cardWidth]);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value }, { rotate: "-20deg" }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && cardWidth === 0) setCardWidth(w);
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      onLayout={handleLayout}
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
        style={[styleA, {
          position: "absolute", top: -10, right: -58,
          width: 160, height: 160, borderRadius: 80,
          backgroundColor: "rgba(255,255,255,0.12)",
          pointerEvents: "none",
        }]}
      />

      <Animated.View
        style={[styleB, {
          position: "absolute", bottom: -20, left: -30,
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: "rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }]}
      />

      <Animated.View
        style={[styleC, {
          position: "absolute", top: 40, left: -15,
          width: 60, height: 60, borderRadius: 30,
          backgroundColor: "rgba(255,255,255,0.10)",
          pointerEvents: "none",
        }]}
      />

      <Animated.View
        style={[shimmerStyle, {
          position: "absolute", top: -200, left: 0,
          width: 80,
          height: 800,
          pointerEvents: "none",
        }]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.15)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
          pointerEvents="none"
        />
      </Animated.View>

      <View className="w-full flex-col gap-2">{children}</View>
    </LinearGradient>
  );
}
