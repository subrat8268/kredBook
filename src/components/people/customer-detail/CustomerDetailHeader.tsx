import Avatar from "@/src/components/ui/Avatar";
import DetailHeader from "@/src/components/layer2/DetailHeader";
import { useTheme } from "@/src/utils/ThemeProvider";
import { MessageCircle, Phone } from "lucide-react-native";

type Props = {
  customerName: string;
  lastActiveLabel: string;
  onBack: () => void;
  onReminder: () => void;
  onCall: () => void;
  canSendReminder: boolean;
};

export default function CustomerDetailHeader({
  customerName,
  lastActiveLabel,
  onBack,
  onReminder,
  onCall,
  canSendReminder,
}: Props) {
  const { colors } = useTheme();

  return (
    <DetailHeader
      title={customerName}
      subtitle={lastActiveLabel}
      onBack={onBack}
      leadingSlot={<Avatar name={customerName} size="sm" />}
      actions={
        canSendReminder
          ? [
              {
                key: "reminder",
                icon: <MessageCircle size={20} color={colors.primary} strokeWidth={2} />,
                onPress: onReminder,
                accessibilityLabel: "Send reminder",
              },
              {
                key: "call",
                icon: <Phone size={20} color={colors.primary} strokeWidth={2} />,
                onPress: onCall,
                accessibilityLabel: "Call customer",
              },
            ]
          : []
      }
    />
  );
}
