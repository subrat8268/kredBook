import { useTheme } from "@/src/utils/ThemeProvider";
import { Share2, Pencil, MessageCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type Props = {
  onEdit: () => void;
  onShare: () => void;
  onWhatsApp: () => void;
  isPaid: boolean;
};

// Internal component for Quick Actions with icon above label
type QuickActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function QuickActionButton({ icon, label, onPress, disabled }: QuickActionButtonProps) {
  const { spacing, typography, colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          alignItems: "center",
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.sm,
          borderRadius: spacing.cardRadius,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        pressed && { opacity: 0.75 },
      ]}
    >
      {icon}
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm / 2 }]}>{label}</Text>
    </Pressable>
  );
}

export default function EntryQuickActions({
  onEdit,
  onShare,
  onWhatsApp,
  isPaid,
}: Props) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: spacing.screenPadding,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        gap: spacing.sm,
      }}
    >
      <View style={{ flex: 1, alignItems: "center" }}>
        <QuickActionButton
          label="Share"
          icon={<Share2 size={20} color={colors.textSecondary} strokeWidth={2} />}
          onPress={onShare}
        />
      </View>

      <View style={{ flex: 1, alignItems: "center" }}>
        <QuickActionButton
          label="WhatsApp"
          icon={<MessageCircle size={20} color={colors.primary} strokeWidth={2} />}
          onPress={onWhatsApp}
        />
      </View>

      {!isPaid ? (
        <View style={{ flex: 1, alignItems: "center" }}>
          <QuickActionButton
            label="Edit"
            icon={<Pencil size={20} color={colors.textSecondary} strokeWidth={2} />}
            onPress={onEdit}
          />
        </View>
      ) : null}
    </View>
  );
}