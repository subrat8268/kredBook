import { colors, motion, radius } from "@/src/utils/theme";
import { FilePlus, Plus, UserPlus, Wallet } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "./Icon";

type Action = "new-entry" | "new-customer" | "record-payment";

type SpeedDialFABProps = {
  onAction: (action: Action) => void;
  bottom?: number;
  right?: number;
};

const ACTIONS: { action: Action; label: string; icon: typeof FilePlus }[] = [
  { action: "new-entry", label: "New Entry", icon: FilePlus },
  { action: "new-customer", label: "New Customer", icon: UserPlus },
  { action: "record-payment", label: "Record Payment", icon: Wallet },
];

export default function SpeedDialFAB({ onAction, bottom = 24, right = 20 }: SpeedDialFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);
  const backdropAnim = useMemo(() => new Animated.Value(0), []);
  const translateYAnims = useMemo(() => ACTIONS.map(() => new Animated.Value(20)), []);
  const opacityAnims = useMemo(() => ACTIONS.map(() => new Animated.Value(0)), []);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: 0,
        ...motion.springConfig.snappy,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: motion.duration.base,
        useNativeDriver: true,
      }),
    ]).start();

    translateYAnims.forEach((translateY, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 20,
            ...motion.springConfig.default,
            useNativeDriver: true,
          }),
          Animated.spring(opacityAnims[index], {
            toValue: 0,
            ...motion.springConfig.default,
            useNativeDriver: true,
          }),
        ]).start();
      }, (translateYAnims.length - 1 - index) * 40);
    });

    setTimeout(() => setIsOpen(false), motion.duration.base + 100);
  }, [backdropAnim, opacityAnims, rotateAnim, translateYAnims]);

  const open = useCallback(() => {
    setIsOpen(true);
    Animated.spring(rotateAnim, {
      toValue: 1,
      ...motion.springConfig.snappy,
      useNativeDriver: true,
    }).start();

    Animated.timing(backdropAnim, {
      toValue: 1,
      duration: motion.duration.base,
      useNativeDriver: true,
    }).start();

    translateYAnims.forEach((translateY, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            ...motion.springConfig.default,
            useNativeDriver: true,
          }),
          Animated.spring(opacityAnims[index], {
            toValue: 1,
            ...motion.springConfig.default,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 50);
    });
  }, [backdropAnim, opacityAnims, rotateAnim, translateYAnims]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!isOpen) return false;
      close();
      return true;
    });
    return () => subscription.remove();
  }, [close, isOpen]);

  const handleFabPress = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [close, isOpen, open]);

  const handleActionPress = useCallback(
    (action: Action) => {
      close();
      // Delay action slightly so close animation starts before navigation
      setTimeout(() => onAction(action), 80);
    },
    [close, onAction],
  );

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <View style={styles.root} pointerEvents="box-none">
      {isOpen ? (
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents="box-none">
          <Pressable style={styles.backdropPressable} onPress={close} />
        </Animated.View>
      ) : null}

      <View style={[styles.container, { right, bottom }]} pointerEvents="box-none">
        {isOpen
          ? ACTIONS.map((item, index) => (
              <Animated.View
                key={item.action}
                style={{
                  transform: [{ translateY: translateYAnims[index] }],
                  opacity: opacityAnims[index],
                }}
              >
                <Pressable style={styles.childButton} onPress={() => handleActionPress(item.action)}>
                  <View style={styles.childLabel}>
                    <Text style={styles.childLabelText}>{item.label}</Text>
                  </View>
                  <View style={styles.childIconWrap}>
                    <Icon name={item.icon} size={20} color={colors.brand} />
                  </View>
                </Pressable>
              </Animated.View>
            ))
          : null}

        <Pressable onPress={handleFabPress} style={styles.fabPressable}>
          <Animated.View style={[styles.fab, { transform: [{ rotate: rotation }] }]}> 
            <Icon name={Plus} size={28} color={colors.surface} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    position: "absolute",
    alignItems: "flex-end",
    gap: 12,
    zIndex: 999,
    elevation: 999,
  },
  fabPressable: {
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.borderLight,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  childButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  childLabel: {
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childLabelText: {
    color: colors.textPrimary,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  childIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  backdropPressable: {
    flex: 1,
  },
});
