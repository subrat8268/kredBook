import { useTheme } from "@/src/utils/ThemeProvider";
import {
  BottomSheetBackdrop,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible?: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: string[];
  children: React.ReactNode;
  footer?: (props: BottomSheetFooterProps) => React.ReactNode;
  withScroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  enableDynamicSizing?: boolean;
  maxDynamicContentSize?: number;
  enablePanDownToClose?: boolean;
  backgroundStyle?: StyleProp<ViewStyle>;
  handleIndicatorStyle?: StyleProp<ViewStyle>;
};

const BaseBottomSheet = forwardRef<BottomSheetModal, Props>(
  function BaseBottomSheet(
    {
      visible,
      onClose,
      title,
      snapPoints,
      children,
      footer,
      withScroll = true,
      contentContainerStyle,
      enableDynamicSizing = true,
      maxDynamicContentSize,
      enablePanDownToClose = true,
      backgroundStyle,
      handleIndicatorStyle,
    },
    ref,
  ) {
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const modalRef = useRef<BottomSheetModal>(null);
    const resolvedSnapPoints = useMemo(() => {
      if (snapPoints) return snapPoints;
      if (enableDynamicSizing) return undefined;
      return ["90%"];
    }, [enableDynamicSizing, snapPoints]);
    const styles = useMemo(
      () =>
        StyleSheet.create({
          indicator: {
            backgroundColor: colors.border,
            width: 40,
          },
          background: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
          content: {
            paddingHorizontal: spacing.screenPadding,
            paddingBottom: spacing.xl + insets.bottom,
          },
          header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: spacing.sm,
            marginBottom: spacing.sm,
          },
          title: {
            fontSize: 20,
            fontWeight: "600",
            color: colors.textPrimary,
          },
          closeButton: {
            padding: spacing.xs,
          },
        }),
      [colors, insets.bottom, spacing],
    );

    useImperativeHandle(ref, () => modalRef.current as BottomSheetModal, []);

    useEffect(() => {
      if (visible === undefined) return;
      if (visible) {
        modalRef.current?.present();
      } else {
        modalRef.current?.dismiss();
      }
    }, [visible]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      [],
    );

    const content = (
      <>
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.textPrimary} strokeWidth={2} />
            </Pressable>
          </View>
        ) : null}
        {children}
      </>
    );

    return (
      <BottomSheetModal
        ref={modalRef}
        index={0}
        snapPoints={resolvedSnapPoints}
        enableDynamicSizing={enableDynamicSizing}
        maxDynamicContentSize={maxDynamicContentSize}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
        onChange={(index) => {
          if (index === -1) onClose();
        }}
        footerComponent={footer}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={[styles.indicator, handleIndicatorStyle]}
        backgroundStyle={[styles.background, backgroundStyle]}
      >
        {withScroll ? (
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              contentContainerStyle as object,
            ]}
          >
            {content}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView
            style={[
              styles.content,
              { flex: 1 },
              contentContainerStyle as object,
            ]}
          >
            {content}
          </BottomSheetView>
        )}
      </BottomSheetModal>
    );
  },
);

export default memo(BaseBottomSheet);
