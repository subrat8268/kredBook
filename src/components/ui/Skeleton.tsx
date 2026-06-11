import { colors, motion, radius } from "@/src/utils/theme";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, View, ViewStyle } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 16,
  radius: radiusOverride,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: motion.duration.slow,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: motion.duration.slow,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radiusOverride ?? radius.sm,
          backgroundColor: colors.surfaceAlt,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.surface,
          transform: [{ translateX: shimmerTranslate }],
        }}
      />
    </View>
  );
}

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: number;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = 60,
}: SkeletonTextProps) {
  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={`skeleton-line-${i}`}
          width={i === lines - 1 ? `${lastLineWidth}%` : "100%"}
          height={14}
        />
      ))}
    </View>
  );
}

interface SkeletonAvatarProps {
  size?: number;
}

export function SkeletonAvatar({ size = 40 }: SkeletonAvatarProps) {
  return (
    <Skeleton
      width={size}
      height={size}
      radius={size / 2}
    />
  );
}

interface SkeletonCardProps {
  showAvatar?: boolean;
}

export function SkeletonCard({ showAvatar = true }: SkeletonCardProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
      {showAvatar && (
        <View style={{ marginRight: 12 }}>
          <SkeletonAvatar size={44} />
        </View>
      )}
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="70%" height={12} />
      </View>
    </View>
  );
}

interface SkeletonHeroCardProps {
  height?: number;
}

export function SkeletonHeroCard({ height = 140 }: SkeletonHeroCardProps) {
  return (
    <View
      style={{
        height,
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceAlt,
        padding: 16,
        gap: 12,
      }}
    >
      <Skeleton width="30%" height={12} />
      <Skeleton width="50%" height={28} />
      <View style={{ flex: 1 }} />
      <Skeleton width="40%" height={14} />
    </View>
  );
}