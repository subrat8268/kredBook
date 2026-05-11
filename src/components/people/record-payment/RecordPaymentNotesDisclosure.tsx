import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/src/utils/ThemeProvider";

type Props = {
  notes: string;
  onNotesChange: (value: string) => void;
};

export default function RecordPaymentNotesDisclosure({ notes, onNotesChange }: Props) {
  const { colors, spacing, radius, typography } = useTheme();
  const [expanded, setExpanded] = useState(Boolean(notes.trim()));

  return (
    <View style={{ marginTop: spacing.sm }}>
      {!expanded && !notes.trim() ? (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setExpanded(true)}
          className="flex-row items-center"
          style={{ gap: spacing.xs }}
        >
          <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: "700" }]}>+ Add note</Text>
          <ChevronDown size={14} color={colors.primaryDark} strokeWidth={2.6} />
        </TouchableOpacity>
      ) : (
        <View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setExpanded((prev) => !prev)}
            className="flex-row items-center"
            style={{ gap: spacing.xs, marginBottom: spacing.sm }}
          >
            <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: "700" }]}>Note (optional)</Text>
            {expanded ? (
              <ChevronUp size={14} color={colors.textSecondary} strokeWidth={2.4} />
            ) : (
              <ChevronDown size={14} color={colors.textSecondary} strokeWidth={2.4} />
            )}
          </TouchableOpacity>

          {expanded ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.borderLight,
                borderRadius: radius.lg,
                backgroundColor: colors.surfaceAlt,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              }}
            >
              <BottomSheetTextInput
                value={notes}
                onChangeText={onNotesChange}
                placeholder="Write a note about this payment..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                style={{
                  color: colors.textPrimary,
                  minHeight: 72,
                  textAlignVertical: "top",
                }}
              />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
