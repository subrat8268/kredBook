import { useTheme } from "@/src/theme/useTheme";
import { BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { memo, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import BaseBottomSheet from "../layer2/BaseBottomSheet";

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

const YEARS = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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

interface PickerColumnProps {
  items: number[] | string[];
  selected: number;
  onChange: (index: number) => void;
  itemH: number;
}

const PickerColumn = memo(function PickerColumn({
  items,
  selected,
  onChange,
  itemH,
}: PickerColumnProps) {
  const t = useTheme();
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selected * itemH, animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, [selected, itemH]);

  return (
    <View style={{ height: itemH * 3, overflow: "hidden", position: "relative" }}>
      {/* Selection zone indicator */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: itemH,
          left: 0,
          right: 0,
          height: itemH,
          borderTopWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: t.colors.borderDefault,
          backgroundColor: t.colors.surfaceRaised,
          opacity: 0.6,
          borderRadius: 8,
        }}
      />
      <BottomSheetScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemH}
        contentContainerStyle={{ paddingVertical: itemH }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / itemH);
          onChange(Math.max(0, Math.min(idx, items.length - 1)));
        }}
      >
        {items.map((item, i) => {
          const isSelected = i === selected;
          return (
            <Pressable
              key={typeof item === "string" ? item : item}
              style={{ height: itemH, justifyContent: "center", alignItems: "center" }}
              onPress={() => onChange(i)}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: isSelected ? t.fontFamily.bodyBold : t.fontFamily.body,
                  fontWeight: isSelected ? "700" : "400",
                  color: isSelected ? t.colors.ink : t.colors.muted,
                }}
              >
                {typeof item === "string" ? item : String(item).padStart(2, "0")}
              </Text>
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </View>
  );
});

interface DatePickerSheetProps {
  title: string;
  value: Date;
  visible: boolean;
  onConfirm: (d: Date) => void;
  onClose: () => void;
}

function DatePickerSheet({ title, value, visible, onConfirm, onClose }: DatePickerSheetProps) {
  const t = useTheme();

  const initialYearIndex = YEARS.indexOf(value.getFullYear());
  const defaultYearIndex = YEARS.indexOf(new Date().getFullYear());
  const [day, setDay] = useState(value.getDate() - 1);
  const [month, setMonth] = useState(value.getMonth());
  const [year, setYear] = useState(initialYearIndex >= 0 ? initialYearIndex : (defaultYearIndex >= 0 ? defaultYearIndex : 0));
  const itemH = 40;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    if (visible) {
      const d = value.getDate() - 1;
      const m = value.getMonth();
      const y = YEARS.indexOf(value.getFullYear());
      setDay(d >= 0 ? d : 0);
      setMonth(m >= 0 ? m : 0);
      setYear(y >= 0 ? y : (defaultYearIndex >= 0 ? defaultYearIndex : 0));
    }
  }, [visible, value, defaultYearIndex]);

  const handleConfirm = useCallback(() => {
    const y = YEARS[year] ?? new Date().getFullYear();
    const d = new Date(y, month, day + 1);
    onConfirm(d);
    onClose();
  }, [day, month, year, onConfirm, onClose]);

  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      snapPoints={["60%"]}
      withScroll={false}
    >
      <BottomSheetView
        style={{
          flex: 1,
          paddingHorizontal: t.layout.screenPaddingH,
          paddingBottom: t.spacing[5],
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: t.spacing[4],
            minHeight: itemH * 3 + 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ ...t.typeStyles.caption, color: t.colors.muted, marginBottom: 8, textAlign: "center" }}>Day</Text>
            <PickerColumn items={days} selected={day} onChange={setDay} itemH={itemH} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...t.typeStyles.caption, color: t.colors.muted, marginBottom: 8, textAlign: "center" }}>Month</Text>
            <PickerColumn items={MONTHS} selected={month} onChange={setMonth} itemH={itemH} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...t.typeStyles.caption, color: t.colors.muted, marginBottom: 8, textAlign: "center" }}>Year</Text>
            <PickerColumn items={YEARS} selected={year} onChange={setYear} itemH={itemH} />
          </View>
        </View>
        <Pressable
          style={{
            marginTop: "auto",
            backgroundColor: t.colors.primary,
            borderRadius: t.radius.lg,
            paddingVertical: 14,
            alignItems: "center",
          }}
          onPress={handleConfirm}
        >
          <Text style={{ color: t.colors.onPrimary, fontWeight: "700", fontSize: 15, fontFamily: t.fontFamily.bodySemiBold }}>Confirm</Text>
        </Pressable>
      </BottomSheetView>
    </BaseBottomSheet>
  );
}

const DateRangePicker = memo(function DateRangePicker({ visible, value, onChange, onClose }: Props) {
  const t = useTheme();
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const fromDate = parseDate(value.from);
  const toDate = parseDate(value.to);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          gap: t.spacing[3],
          marginBottom: t.spacing[4],
        },
        field: {
          flex: 1,
        },
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
    <BaseBottomSheet visible={visible} onClose={onClose} title="Select Date Range" snapPoints={["35%"]} withScroll={false}>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>From</Text>
          <Pressable style={styles.pill} onPress={() => setShowFromPicker(true)}>
            <Text style={value.from ? styles.pillText : styles.placeholder}>
              {value.from ? formatDisplay(value.from) : "Select start date"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>To</Text>
          <Pressable style={styles.pill} onPress={() => setShowToPicker(true)}>
            <Text style={value.to ? styles.pillText : styles.placeholder}>
              {value.to ? formatDisplay(value.to) : "Select end date"}
            </Text>
          </Pressable>
        </View>
      </View>

      {(value.from || value.to) && (
        <Pressable
          onPress={() => onChange({ from: undefined, to: undefined })}
          style={styles.clearBtn}
        >
          <Text style={styles.clearText}>Clear dates</Text>
        </Pressable>
      )}

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
    </BaseBottomSheet>
  );
});

export { DatePickerSheet };
export default DateRangePicker;
