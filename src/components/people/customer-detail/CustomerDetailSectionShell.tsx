import { useTheme } from "@/src/utils/ThemeProvider";
import { View, type ViewProps } from "react-native";

export default function CustomerDetailSectionShell({ style, ...props }: ViewProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          marginHorizontal: 16,
          marginTop: 12,
          overflow: "hidden",
        },
        style,
      ]}
      {...props}
    />
  );
}
