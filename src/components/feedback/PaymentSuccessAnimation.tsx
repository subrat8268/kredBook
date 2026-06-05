import React, { memo, useEffect, useRef } from "react";
import { Animated, Easing, Modal, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { formatINR } from "@/src/utils/format";
import { useTheme } from "@/src/utils/ThemeProvider";

interface PaymentSuccessAnimationProps {
  visible: boolean;
  amount: number;
  onAnimationEnd: () => void;
}

export default memo(function PaymentSuccessAnimation({
  visible,
  amount,
  onAnimationEnd,
}: PaymentSuccessAnimationProps) {
  const { colors } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0.5)).current;
  const ring1Opacity = useRef(new Animated.Value(0.4)).current;
  const ring2Scale = useRef(new Animated.Value(0.5)).current;
  const ring2Opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      // Reset values
      fadeAnim.setValue(0);
      circleScale.setValue(0);
      checkScale.setValue(0);
      textOpacity.setValue(0);
      ring1Scale.setValue(0.5);
      ring1Opacity.setValue(0.4);
      ring2Scale.setValue(0.5);
      ring2Opacity.setValue(0.4);

      // Start animation sequence
      Animated.parallel([
        // Background fade-in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Central circle scaling
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(circleScale, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        // Checkmark scaling
        Animated.sequence([
          Animated.delay(300),
          Animated.spring(checkScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        // Subtext / amount fade-in
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Concentric pulsing rings
        Animated.parallel([
          Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(ring1Scale, {
                toValue: 2.2,
                duration: 900,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(ring1Opacity, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
              Animated.timing(ring2Scale, {
                toValue: 2.2,
                duration: 900,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(ring2Opacity, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]).start();

      // Trigger automatic fade out and callback after 2.6 seconds
      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          onAnimationEnd();
        });
      }, 2300);

      return () => clearTimeout(timeout);
    }
  }, [
    visible,
    onAnimationEnd,
    colors.brand,
    checkScale,
    circleScale,
    fadeAnim,
    ring1Opacity,
    ring1Scale,
    ring2Opacity,
    ring2Scale,
    textOpacity,
  ]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 justify-center items-center bg-white/95 dark:bg-slate-950/95"
      >
        {/* Animated concentric rings + central badge container */}
        <View className="relative justify-center items-center h-48 w-48">
          {/* Concentric Ring 1 */}
          <Animated.View
            style={{
              transform: [{ scale: ring1Scale }],
              opacity: ring1Opacity,
              borderColor: colors.brand,
            }}
            className="absolute h-24 w-24 rounded-full border border-brand/40"
          />

          {/* Concentric Ring 2 */}
          <Animated.View
            style={{
              transform: [{ scale: ring2Scale }],
              opacity: ring2Opacity,
              borderColor: colors.brand,
            }}
            className="absolute h-24 w-24 rounded-full border border-brand/40"
          />

          {/* Core Green Circle */}
          <Animated.View
            style={{
              transform: [{ scale: circleScale }],
              backgroundColor: colors.brand,
            }}
            className="h-24 w-24 rounded-full justify-center items-center shadow-xl shadow-brand/20"
          >
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Check size={48} color="#FFFFFF" strokeWidth={3.5} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Text Details Container */}
        <Animated.View
          style={{ opacity: textOpacity }}
          className="items-center mt-6 px-6"
        >
          <Text className="text-gray-900 dark:text-gray-100 text-2xl font-bold font-inter-bold mb-2 text-center">
            Payment Successful
          </Text>
          <Text className="text-[#15803D] dark:text-[#86EFAC] text-3xl font-extrabold font-inter-extraBold text-center mb-1">
            {formatINR(amount)}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-normal font-inter text-center">
            Recorded in ledger
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});
