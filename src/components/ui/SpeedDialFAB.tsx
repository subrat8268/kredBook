import { Icon } from "./Icon";
import { colors, motion, radius } from "@/src/utils/theme";
import React, { useCallback, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { FilePlus, Plus, UserPlus, Wallet, X } from "lucide-react-native";

type Action = "new-entry" | "new-customer" | "record-payment";

interface SpeedDialFABProps {
  onAction: (action: Action) => void;
}

interface ActionItem {
  action: Action;
  label: string;
  icon: typeof FilePlus;
}

const ACTIONS: ActionItem[] = [
  { action: "new-entry", label: "New Entry", icon: FilePlus },
  { action: "new-customer", label: "New Customer", icon: UserPlus },
  { action: "record-payment", label: "Record Payment", icon: Wallet },
];

export default function SpeedDialFAB({ onAction }: SpeedDialFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const backdropAnim = useState(new Animated.Value(0))[0];
  const childAnims = useState(() =>
    ACTIONS.map(() => new Animated.Value({ x: 0, y: 20, opacity: 0 }))
  )[0];

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

    childAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(anim, {
            toValue: { x: 0, y: 0, opacity: 1 },
            ...motion.springConfig.default,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 50);
    });
  }, [rotateAnim, backdropAnim, childAnims]);

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

    childAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(anim, {
            toValue: { x: 0, y: 20, opacity: 0 },
            ...motion.springConfig.default,
            useNativeDriver: true,
          }),
        ]).start();
      }, (childAnims.length - 1 - index) * 40);
    });

    setTimeout(() => setIsOpen(false), motion.duration.base + 100);
  }, [rotateAnim, backdropAnim, childAnims]);

  const handlePress = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const handleAction = useCallback(
    (action: Action) => {
      onAction(action);
      close();
    },
    [onAction, close]
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
    <>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.fab,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <Pressable onPress={handlePress} style={styles.fabPressable}>
            <Icon name={isOpen ? X : Plus} size={28} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        {isOpen &&
          ACTIONS.map((item, index) => {
            const anim = childAnims[index];
            const translateY = anim.y;
            const opacity = anim.opacity;

            return (
              <Animated.View
                key={item.action}
                style={[
                  styles.childContainer,
                  {
                    transform: [{ translateY }],
                    opacity,
                  },
                ]}
              >
                <Pressable
                  style={styles.childButton}
                  onPress={() => handleAction(item.action)}
                >
                  <View style={styles.childLabel}>
                    <Text style={styles.childLabelText}>{item.label}</Text>
                  </View>
                  <View style={styles.childIcon}>
                    <Icon name={item.icon} size={22} color={colors.primary} />
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
      </View>

      <Modal visible={isOpen} transparent animationType="none">
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity },
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={close} />
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    right: 20,
    alignItems: "center",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  childContainer: {
    position: "relative",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  childButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  childLabel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  childIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  backdropPressable: {
    flex: 1,
  },
});