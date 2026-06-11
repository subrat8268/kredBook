import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@/src/theme/useTheme";

interface DeleteCustomerSheetProps {
  customerName: string;
  entriesCount: number;
  paymentsCount: number;
  isDeleting: boolean;
  onConfirm: () => void;
  onDismiss?: () => void;
}

const DeleteCustomerSheet = forwardRef<BottomSheetModal, DeleteCustomerSheetProps>(
  ({ customerName, entriesCount, paymentsCount, isDeleting, onConfirm, onDismiss }, ref) => {
    const t = useTheme();
    const { colors } = t;
    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal, []);

    const snapPoints = useMemo(() => ["40%"], []);

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.4}
      />
    );

    const handleCancel = () => {
      sheetRef.current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={onDismiss}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.borderDefault, width: 40 }}
        backgroundStyle={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: t.radius["3xl"],
          borderTopRightRadius: t.radius["3xl"],
        }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <Text style={[styles.title, { color: colors.ink, fontFamily: t.fontFamily.display }]}>
            Delete Customer?
          </Text>

          {/* Body */}
          <Text style={[styles.body, { color: colors.body, fontFamily: t.fontFamily.body }]}>
            All transaction history ({entriesCount} entries, {paymentsCount} payments) for{" "}
            <Text style={{ fontFamily: t.fontFamily.bodyBold, color: colors.ink }}>
              {customerName}
            </Text>{" "}
            will be permanently deleted. This action cannot be undone.
          </Text>

          {/* CTAs */}
          <View style={styles.footer}>
            <Pressable
              onPress={onConfirm}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.deleteButton,
                { backgroundColor: colors.overdue },
                (pressed || isDeleting) && { opacity: 0.8 },
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={[styles.deleteText, { fontFamily: t.fontFamily.displaySemiBold }]}>
                  Delete Permanently
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleCancel}
              disabled={isDeleting}
              style={({ pressed }) => [
                styles.cancelButton,
                { backgroundColor: colors.surfaceRaised },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.ink, fontFamily: t.fontFamily.displaySemiBold }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

DeleteCustomerSheet.displayName = "DeleteCustomerSheet";

export default DeleteCustomerSheet;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  footer: {
    gap: 12,
  },
  deleteButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#ffffff",
    fontSize: 15,
  },
  cancelButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
  },
});
