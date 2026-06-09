import { useTheme } from "@/src/theme/useTheme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { memo, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BaseBottomSheet from "../layer2/BaseBottomSheet";

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

const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ─── DatePickerSheet ─────────────────────────────────────────────────────────

export interface DatePickerSheetProps {
  title: string;
  value: Date;
  visible: boolean;
  onConfirm: (d: Date) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePickerSheet({
  title,
  value,
  visible,
  onConfirm,
  onClose,
  minDate,
  maxDate,
}: DatePickerSheetProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const modalRef = useRef<BottomSheetModal>(null);
  const isOpenRef = useRef(false);

  // Calendar navigation state
  const [navDate, setNavDate] = useState(() => new Date(value));
  // Selected date inside calendar
  const [selectedDate, setSelectedDate] = useState(() => new Date(value));

  // Sync selected and navigated dates when opening
  useEffect(() => {
    if (!visible) return;
    const initial = new Date(value);
    setSelectedDate(initial);
    setNavDate(initial);
  }, [visible, value]);

  // Open / close BottomSheetModal
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
    onConfirm(selectedDate);
    onClose();
  }, [selectedDate, onConfirm, onClose]);

  const handleDismiss = useCallback(() => {
    isOpenRef.current = false;
    onClose();
  }, [onClose]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    setNavDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setNavDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const gridCells = useMemo(() => {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();

    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const totalDays = new Date(year, month + 1, 0).getDate();

    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayVal = prevMonthTotalDays - i;
      const prevDate = new Date(year, month - 1, dayVal);
      cells.push({
        date: prevDate,
        isCurrentMonth: false,
        key: `prev-${dayVal}`,
      });
    }

    // Add current month days
    for (let d = 1; d <= totalDays; d++) {
      const currDate = new Date(year, month, d);
      cells.push({
        date: currDate,
        isCurrentMonth: true,
        key: `curr-${d}`,
      });
    }

    const totalGridSlots = 42;
    const remaining = totalGridSlots - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      cells.push({
        date: nextDate,
        isCurrentMonth: false,
        key: `next-${i}`,
      });
    }

    return cells;
  }, [navDate]);

  const navMonthName = MONTHS_FULL[navDate.getMonth()];
  const navYear = navDate.getFullYear();

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={["71%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      handleIndicatorStyle={{
        backgroundColor: t.colors.borderDefault,
        width: 40,
      }}
      backgroundStyle={{
        backgroundColor: t.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          paddingHorizontal: t.layout.screenPaddingH,
          paddingBottom: Math.max(insets.bottom, 24) + t.spacing[4],
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-3 mb-1">
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
          <Pressable onPress={onClose} hitSlop={12} className="p-1">
            <Text
              style={{ fontSize: 22, color: t.colors.muted, lineHeight: 26 }}
            >
              ✕
            </Text>
          </Pressable>
        </View>

        {/* Month Selector Control Row */}
        <View className="flex-row items-center justify-between py-2 mb-2">
          <Pressable onPress={handlePrevMonth} className="p-2" hitSlop={12}>
            <ChevronLeft size={20} color={t.colors.ink} />
          </Pressable>
          <Text
            style={[
              { color: t.colors.ink, fontFamily: t.fontFamily.displaySemiBold },
            ]}
            className="text-base font-semibold"
          >
            {navMonthName} {navYear}
          </Text>
          <Pressable onPress={handleNextMonth} className="p-2" hitSlop={12}>
            <ChevronRight size={20} color={t.colors.ink} />
          </Pressable>
        </View>

        {/* Calendar Grid Header (Weekday Names) */}
        <View className="flex-row justify-around py-1 mb-1">
          {WEEKDAYS.map((day, idx) => (
            <Text
              key={idx}
              style={[
                { color: t.colors.muted, fontFamily: t.fontFamily.bodyMedium },
              ]}
              className="w-[38px] text-center text-[12px] font-semibold"
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Days Grid */}
        <View className="flex-row flex-wrap justify-around gap-1 gap-y-2">
          {gridCells.map((cell) => {
            const isSelected =
              cell.date.getDate() === selectedDate.getDate() &&
              cell.date.getMonth() === selectedDate.getMonth() &&
              cell.date.getFullYear() === selectedDate.getFullYear();

            const isToday =
              cell.date.getDate() === new Date().getDate() &&
              cell.date.getMonth() === new Date().getMonth() &&
              cell.date.getFullYear() === new Date().getFullYear();

            // Check if day is outside bounds (minDate / maxDate validation)
            const cellTime = new Date(
              cell.date.getFullYear(),
              cell.date.getMonth(),
              cell.date.getDate(),
            ).getTime();
            const minTime = minDate
              ? new Date(
                  minDate.getFullYear(),
                  minDate.getMonth(),
                  minDate.getDate(),
                ).getTime()
              : null;
            const maxTime = maxDate
              ? new Date(
                  maxDate.getFullYear(),
                  maxDate.getMonth(),
                  maxDate.getDate(),
                ).getTime()
              : null;

            const isDisabled =
              (minTime !== null && cellTime < minTime) ||
              (maxTime !== null && cellTime > maxTime);

            return (
              <Pressable
                key={cell.key}
                disabled={isDisabled}
                style={[
                  isSelected && { backgroundColor: t.colors.primary },
                  !isSelected &&
                    isToday && {
                      borderWidth: 1.5,
                      borderColor: t.colors.primary,
                    },
                ]}
                className={`w-[38px] h-[38px] rounded-full justify-center items-center ${isDisabled ? "opacity-25" : ""}`}
                onPress={() => {
                  setSelectedDate(new Date(cell.date));
                  if (!cell.isCurrentMonth) {
                    setNavDate(new Date(cell.date));
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: isSelected
                      ? t.fontFamily.bodyBold
                      : t.fontFamily.body,
                    color: isSelected
                      ? t.colors.onPrimary
                      : cell.isCurrentMonth
                        ? t.colors.ink
                        : t.colors.faint,
                  }}
                >
                  {cell.date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Confirm Button */}
        <Pressable
          style={[
            { backgroundColor: t.colors.primary, borderRadius: t.radius.lg },
          ]}
          className="py-3.5 items-center mt-auto"
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

  return (
    <>
      <BaseBottomSheet
        visible={visible}
        onClose={onClose}
        title="Select Date Range"
        snapPoints={["35%"]}
        withScroll={false}
      >
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text
              style={[{ color: t.colors.muted, fontFamily: t.fontFamily.body }]}
              className="text-[13px] tracking-wide mb-1"
            >
              From
            </Text>
            <Pressable
              style={{
                borderColor: t.colors.borderDefault,
                borderRadius: t.radius.lg,
                backgroundColor: t.colors.surface,
              }}
              className="flex-row items-center border px-4 py-3"
              onPress={() => setShowFromPicker(true)}
            >
              <Text
                style={{
                  fontFamily: t.fontFamily.body,
                  color: value.from ? t.colors.ink : t.colors.muted,
                }}
                className="flex-1 text-[15px]"
              >
                {value.from ? formatDisplay(value.from) : "Select start date"}
              </Text>
            </Pressable>
          </View>
          <View className="flex-1">
            <Text
              style={[{ color: t.colors.muted, fontFamily: t.fontFamily.body }]}
              className="text-[13px] tracking-wide mb-1"
            >
              To
            </Text>
            <Pressable
              style={{
                borderColor: t.colors.borderDefault,
                borderRadius: t.radius.lg,
                backgroundColor: t.colors.surface,
              }}
              className="flex-row items-center border px-4 py-3"
              onPress={() => setShowToPicker(true)}
            >
              <Text
                style={{
                  fontFamily: t.fontFamily.body,
                  color: value.to ? t.colors.ink : t.colors.muted,
                }}
                className="flex-1 text-[15px]"
              >
                {value.to ? formatDisplay(value.to) : "Select end date"}
              </Text>
            </Pressable>
          </View>
        </View>

        {(value.from || value.to) && (
          <Pressable
            onPress={() => onChange({ from: undefined, to: undefined })}
            className="ml-2 py-2"
          >
            <Text
              style={{
                color: t.colors.error,
                fontFamily: t.fontFamily.bodySemiBold,
              }}
              className="text-[14px] font-semibold"
            >
              Clear dates
            </Text>
          </Pressable>
        )}
      </BaseBottomSheet>

      {/* Sibling modals — outside the BaseBottomSheet to avoid nesting */}
      <DatePickerSheet
        title="Select From Date"
        value={fromDate}
        visible={showFromPicker}
        onConfirm={(d) => {
          const fromStr = toDateStr(d);
          let newTo = value.to;
          // Validation: If selected From Date is after current To Date, update To Date to match
          if (value.to && new Date(fromStr) > new Date(value.to)) {
            newTo = fromStr;
          }
          onChange({ from: fromStr, to: newTo });
        }}
        onClose={() => setShowFromPicker(false)}
        maxDate={value.to ? parseDate(value.to) : undefined}
      />
      <DatePickerSheet
        title="Select To Date"
        value={toDate}
        visible={showToPicker}
        onConfirm={(d) => onChange({ ...value, to: toDateStr(d) })}
        onClose={() => setShowToPicker(false)}
        minDate={value.from ? parseDate(value.from) : undefined}
      />
    </>
  );
});

export default DateRangePicker;
