import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, CheckCircle, Wifi, WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsOnline } from "@/src/hooks/useIsOnline";
import { useNetworkSync } from "@/src/hooks/useNetworkSync";
import { useLanguageStore } from "@/src/store/languageStore";
import { useTheme } from "@/src/utils/ThemeProvider";

const BANNER_HEIGHT = 40;
const HIDDEN_OFFSET = -48;
const ANIMATION_DURATION = 280;
const CONFIRM_DISMISS_MS = 2500;

type BannerMode = "offline" | "online" | "synced" | "error";

export default function OfflineBanner() {
  const isOnlineFlag = useIsOnline();
  const { triggerSync, syncStatus, hasSyncError, syncProgress } = useNetworkSync();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const language = useLanguageStore((s) => s.language);

  const [mode, setMode] = useState<BannerMode | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;
  const prevConnectedRef = useRef<boolean | null>(null);
  const prevSyncStatusRef = useRef<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const animateTo = useCallback(
    (toValue: number, onEnd?: () => void) => {
      Animated.timing(translateY, {
        toValue,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onEnd) onEnd();
      });
    },
    [translateY],
  );

  const showBanner = useCallback(
    (nextMode: BannerMode) => {
      clearHideTimer();
      setMode(nextMode);
      setVisible(true);
      animateTo(0);
    },
    [animateTo, clearHideTimer],
  );

  const hideBanner = useCallback(() => {
    clearHideTimer();
    animateTo(HIDDEN_OFFSET, () => {
      setVisible(false);
      setMode(null);
    });
  }, [animateTo, clearHideTimer]);

  // Track connectivity transitions (offline ↔ online)
  useEffect(() => {
    if (prevConnectedRef.current === null) {
      prevConnectedRef.current = isOnlineFlag;
      if (!isOnlineFlag) {
        showBanner("offline");
      }
      return;
    }

    const wasConnected = prevConnectedRef.current;
    prevConnectedRef.current = isOnlineFlag;

    if (!isOnlineFlag) {
      showBanner("offline");
      return;
    }

    if (!wasConnected && isOnlineFlag) {
      triggerSync().catch(() => {});
      showBanner("online");
    }
  }, [isOnlineFlag, showBanner, triggerSync]);

  // Track sync completion transitions (syncing → synced/offline)
  useEffect(() => {
    if (prevSyncStatusRef.current === "syncing" && syncStatus === "synced") {
      clearHideTimer();
      if (hasSyncError) {
        showBanner("error");
      } else {
        showBanner("synced");
        hideTimerRef.current = setTimeout(() => {
          hideBanner();
        }, CONFIRM_DISMISS_MS);
      }
    } else if (prevSyncStatusRef.current === "syncing" && syncStatus === "offline") {
      clearHideTimer();
      if (hasSyncError) {
        showBanner("error");
        hideTimerRef.current = setTimeout(() => {
          hideBanner();
        }, CONFIRM_DISMISS_MS);
      } else {
        hideBanner();
      }
    }
    prevSyncStatusRef.current = syncStatus;
  }, [syncStatus, hasSyncError, showBanner, hideBanner, clearHideTimer]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  if (!visible || !mode) return null;

  const modeConfig = {
    offline: {
      Icon: WifiOff,
      color: colors.warning,
      message: language === "hi"
        ? "आप ऑफलाइन हैं — कनेक्ट होने पर सिंक होगा"
        : "You're offline — changes will sync when reconnected",
    },
    online: {
      Icon: Wifi,
      color: colors.success,
      message: syncProgress.total > 3
        ? (language === "hi"
            ? `सिंक हो रहा है… (${syncProgress.current}/${syncProgress.total})`
            : `Syncing… (${syncProgress.current}/${syncProgress.total})`)
        : (language === "hi"
            ? "वापस ऑनलाइन — सिंक हो रहा है…"
            : "Back online — syncing…"),
    },
    synced: {
      Icon: CheckCircle,
      color: colors.success,
      message: language === "hi"
        ? "सभी बदलाव सेव हो गए"
        : "All changes saved",
    },
    error: {
      Icon: AlertTriangle,
      color: colors.danger,
      message: language === "hi"
        ? "कुछ बदलाव सेव नहीं हो सके"
        : "Some changes couldn't be saved",
    },
  }[mode];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: insets.top,
          backgroundColor: modeConfig.color,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <modeConfig.Icon size={16} color={colors.surface} strokeWidth={2} />
        <Text style={[styles.text, { color: colors.surface }]} numberOfLines={1}>
          {modeConfig.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 20,
    height: BANNER_HEIGHT,
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
    marginLeft: 8,
  },
});
