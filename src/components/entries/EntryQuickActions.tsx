import QuickActionTile from "@/src/components/shared/QuickActionTile";
import { useTheme } from "@/src/utils/ThemeProvider";
import { MessageCircle, Pencil, Trash2 } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  onRemind: () => void;
  isPaid: boolean;
};

export default function EntryQuickActions({
  onEdit,
  onDelete,
  onRemind,
  isPaid,
}: Props) {
  const { colors } = useTheme();

  return (
    <View
      className={`mx-4 mt-3 mb-1 flex-row gap-2 ${
        isPaid ? "justify-center" : ""
      }`}
    >
      {/* 1 — Edit */}
      <QuickActionTile
        label="Edit"
        icon={<Pencil size={22} color={colors.textSecondary} strokeWidth={2} />}
        onPress={onEdit}
        style={isPaid ? { maxWidth: 120 } : {}}
      />

      {/* 2 — Delete (danger) */}
      <QuickActionTile
        label="Delete"
        icon={<Trash2 size={22} color={colors.danger} strokeWidth={2} />}
        onPress={onDelete}
        style={isPaid ? { maxWidth: 120 } : {}}
      />

      {/* 3 — Remind (only for unpaid entries) */}
      {!isPaid ? (
        <QuickActionTile
          label="Remind"
          icon={
            <MessageCircle
              size={22}
              color={colors.primary}
              strokeWidth={2}
            />
          }
          onPress={onRemind}
          accent
        />
      ) : null}
    </View>
  );
}
