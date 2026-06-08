/**
 * DateRangePicker & DatePickerSheet
 *
 * Architecture notes:
 * - DatePickerSheet uses a direct BottomSheetModal ref (NOT BaseBottomSheet)
 *   to avoid nested-modal conflicts that caused 5–10 s delay.
 * - Columns use plain React Native ScrollView (NOT BottomSheetScrollView)
 *   because the outer container is BottomSheetView, not a scroll container.
 *   This eliminates the gesture-recognizer conflict that froze scrolling.
 * - Only 3× repetition per column (≤93 items max) for instant rendering.
 * - Fixed snapPoints=["50%"] so the sheet never opens full-screen.
 * - DateRangePicker keeps BaseBottomSheet (it has no inner scrollers).
 */

import { useTheme } from "@/src/theme/useTheme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BaseBottomSheet from "../layer2/BaseBottomSheet";

// ─── Constants ───────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR - 5 + i);
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// 3× repetition gives enough runway without rendering thousands of items
const REPEAT = 3;
const ITEM_H = 44;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(str?: string): Date {
  if (!str) return new Date();
  return new Date(str + "T00:00:00");
}

function toDateStr(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function formatDisplay(str?: string): string {
  if (!str) return "—";
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── PickerColumn ─────────────────────────────────────────────────────────────

interface PickerColumnProps {
  items: (number | string)[];
  selected: number; // index into items[]
  onSelect: (index: number) => void;
  label: string;
}

const PickerColumn = memo(function PickerColumn({
  items,
  selected,
  onSelect,
  label,
}: PickerColumnProps) {
  const t = useTheme();
  const scrollRef = useRef<any>(null);

  // Build repeated array: [items, items, items]
  // Start offset = 1 * items.length so there is runway in both directions
  const repeated = useMemo<(number | string)[]>(() => {
    const out: (number | string)[] = [];
    for (let r = 0; r < REPEAT; r++) out.push(...items);
    return out;
  }, [items]);

  const startOffset = items.length; // index of the first "middle" copy

  // Scroll to current selection (in the middle copy) without animation
  const scrollToIdx = useCallback(
    (idx: number, animated: boolean) => {
      const targetY = (startOffset + idx) * ITEM_H;
      scrollRef.current?.scrollTo({ y: targetY, animated });
    },
    [startOffset],
  );

  // On mount and whenever selection changes, snap to position
  useEffect(() => {
    const t = setTimeout(() => scrollToIdx(selected, false), 80);
    return () => clearTimeout(t);
  }, [selected, scrollToIdx]);

  const handleMomentumEnd = useCallback(
    (e: any) => {
      const rawIdx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
      // Map absolute index back to item index (wrapping)
      const itemIdx = ((rawIdx % items.length) + items.length) % items.length;
      onSelect(itemIdx);
      // Silently re-center to the middle copy so there is always runway
      const centeredY = (startOffset + itemIdx) * ITEM_H;
      scrollRef.current?.scrollTo({ y: centeredY, animated: false });
    },
    [items.length, startOffset, onSelect],
  );

  return (
    <View style={styles.columnWrap}>
      <Text style={[styles.colLabel, { color: t.colors.muted, fontFamily: t.fontFamily.body }]}>
        {label}
      </Text>

      {/* Selection highlight band */}
      <View style={styles.columnInner}>
        <View
          pointerEvents="none"
          style={[
            styles.highlightBand,
            {
              borderColor: t.colors.borderDefault,
              backgroundColor: t.colors.surfaceRaised,
            },
          ]}
        />

        <BottomSheetScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_H}
          contentContainerStyle={{ paddingVertical: ITEM_H }}
          onMomentumScrollEnd={handleMomentumEnd}
        >
          {repeated.map((item, i) => {
            const itemIdx = i % items.length;
            const isSelected = itemIdx === selected;
            return (
              <Pressable
                key={i}
                style={styles.colItem}
                onPress={() => {
                  onSelect(itemIdx);
                  scrollToIdx(itemIdx, true);
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: isSelected ? t.fontFamily.bodyBold : t.fontFamily.body,
                    fontWeight: isSelected ? "700" : "400",
                    color: isSelected ? t.colors.ink : t.colors.muted,
                  }}
                >
                  {typeof item === "number" ? String(item).padStart(2, "0") : item}
                </Text>
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      </View>
    </View>
  );
});

// ─── DatePickerSheet ─────────────────────────────────────────────────────────

export interface DatePickerSheetProps {
  title: string;
  value: Date;
  visible: boolean;
  onConfirm: (d: Date) => void;
  onClose: () => void;
}

export function DatePickerSheet({
  title,
  value,
  visible,
  onConfirm,
  onClose,
}: DatePickerSheetProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const modalRef = useRef<BottomSheetModal>(null);
  const isOpenRef = useRef(false);

  // ── Local state for the three wheels ──
  const [day, setDay] = useState(() => value.getDate() - 1);
  const [month, setMonth] = useState(() => value.getMonth());
  const [year, setYear] = useState(() => {
    const idx = YEARS.indexOf(value.getFullYear());
    return idx >= 0 ? idx : YEARS.indexOf(CURRENT_YEAR) >= 0 ? YEARS.indexOf(CURRENT_YEAR) : 5;
  });

  // Sync wheels when sheet opens or value changes
  useEffect(() => {
    if (!visible) return;
    setDay(value.getDate() - 1);
    setMonth(value.getMonth());
    const idx = YEARS.indexOf(value.getFullYear());
    setYear(idx >= 0 ? idx : YEARS.indexOf(CURRENT_YEAR) >= 0 ? YEARS.indexOf(CURRENT_YEAR) : 5);
  }, [visible, value]);

  // Open / close the native BottomSheetModal
  useEffect(() => {
    if (visible) {
      if (!isOpenRef.current) {
        isOpenRef.current = true;
        modalRef.current?.present();
      }
    } else {
      if (isOpenRef.current) {
        isOpenRef.current = false;
        modalRef.current?.dismiss();
      }
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

  const handleConfirm = useCallback(() => {
    const y = YEARS[year] ?? CURRENT_YEAR;
    const d = new Date(y, month, day + 1);
    onConfirm(d);
    onClose();
  }, [day, month, year, onConfirm, onClose]);

  const handleDismiss = useCallback(() => {
    isOpenRef.current = false;
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={["50%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      handleIndicatorStyle={{ backgroundColor: t.colors.borderDefault, width: 40 }}
      backgroundStyle={{ backgroundColor: t.colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          paddingHorizontal: t.layout.screenPaddingH,
          paddingBottom: insets.bottom + t.spacing[3],
        }}
      >
        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: t.colors.ink,
              fontFamily: t.fontFamily.display,
            }}
          >
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Text style={{ fontSize: 22, color: t.colors.muted, lineHeight: 26 }}>✕</Text>
          </Pressable>
        </View>

        {/* Wheel columns */}
        <View style={styles.wheelsRow}>
          <PickerColumn items={DAYS} selected={day} onSelect={setDay} label="Day" />
          <PickerColumn items={MONTHS} selected={month} onSelect={setMonth} label="Month" />
          <PickerColumn items={YEARS} selected={year} onSelect={setYear} label="Year" />
        </View>

        {/* Confirm button */}
        <Pressable
          style={[
            styles.confirmBtn,
            { backgroundColor: t.colors.primary, borderRadius: t.radius.lg },
          ]}
          onPress={handleConfirm}
        >
          <Text
            style={{
              color: t.colors.onPrimary,
              fontWeight: "700",
              fontSize: 16,
              fontFamily: t.fontFamily.bodySemiBold,
            }}
          >
            Confirm
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─── DateRangePicker ─────────────────────────────────────────────────────────

interface DateRange {
  from?: string;
  to?: string;
}

interface Props {
  visible: boolean;
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

const DateRangePicker = memo(function DateRangePicker({
  visible,
  value,
  onChange,
  onClose,
}: Props) {
  const t = useTheme();
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fromDate = useMemo(() => parseDate(value.from), [value.from]);
  const toDate = useMemo(() => parseDate(value.to), [value.to]);

  const s = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          gap: t.spacing[3],
          marginBottom: t.spacing[4],
        },
        field: { flex: 1 },
        label: {
          ...t.typeStyles.caption,
          color: t.colors.muted,
          marginBottom: t.spacing[1],
        },
        pill: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: t.colors.borderDefault,
          borderRadius: t.radius.lg,
          paddingHorizontal: t.spacing[4],
          paddingVertical: 12,
          backgroundColor: t.colors.surface,
        },
        pillText: {
          flex: 1,
          ...t.typeStyles.body,
          color: t.colors.ink,
        },
        placeholder: {
          ...t.typeStyles.body,
          color: t.colors.muted,
        },
        clearBtn: {
          marginLeft: t.spacing[2],
          paddingVertical: 8,
        },
        clearText: {
          color: t.colors.error,
          fontSize: 14,
          fontWeight: "600",
          fontFamily: t.fontFamily.bodySemiBold,
        },
      }),
    [t],
  );

  return (
    <>
      <BaseBottomSheet
        visible={visible}
        onClose={onClose}
        title="Select Date Range"
        snapPoints={["35%"]}
        withScroll={false}
      >
        <View style={s.row}>
          <View style={s.field}>
            <Text style={s.label}>From</Text>
            <Pressable style={s.pill} onPress={() => setShowFromPicker(true)}>
              <Text style={value.from ? s.pillText : s.placeholder}>
                {value.from ? formatDisplay(value.from) : "Select start date"}
              </Text>
            </Pressable>
          </View>
          <View style={s.field}>
            <Text style={s.label}>To</Text>
            <Pressable style={s.pill} onPress={() => setShowToPicker(true)}>
              <Text style={value.to ? s.pillText : s.placeholder}>
                {value.to ? formatDisplay(value.to) : "Select end date"}
              </Text>
            </Pressable>
          </View>
        </View>

        {(value.from || value.to) && (
          <Pressable
            onPress={() => onChange({ from: undefined, to: undefined })}
            style={s.clearBtn}
          >
            <Text style={s.clearText}>Clear dates</Text>
          </Pressable>
        )}
      </BaseBottomSheet>

      {/* Sibling modals — outside the BaseBottomSheet to avoid nesting */}
      <DatePickerSheet
        title="Select From Date"
        value={fromDate}
        visible={showFromPicker}
        onConfirm={(d) => onChange({ ...value, from: toDateStr(d) })}
        onClose={() => setShowFromPicker(false)}
      />
      <DatePickerSheet
        title="Select To Date"
        value={toDate}
        visible={showToPicker}
        onConfirm={(d) => onChange({ ...value, to: toDateStr(d) })}
        onClose={() => setShowToPicker(false)}
      />
    </>
  );
});

// ─── Shared styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  columnWrap: {
    flex: 1,
    alignItems: "center",
  },
  colLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  columnInner: {
    height: ITEM_H * 3,
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  highlightBand: {
    position: "absolute",
    top: ITEM_H,
    left: 4,
    right: 4,
    height: ITEM_H,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRadius: 10,
    opacity: 0.55,
    zIndex: 1,
  },
  colItem: {
    height: ITEM_H,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 4,
  },
  closeBtn: {
    padding: 4,
  },
  wheelsRow: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
    alignItems: "center",
  },
  confirmBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
});

export default DateRangePicker;
