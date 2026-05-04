import type { LucideIcon } from "lucide-react-native";
import { colors } from "../../utils/theme";

interface IconProps {
  name: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name: IconComponent, size = 20, color = colors.textPrimary, strokeWidth = 1.8 }: IconProps) {
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}