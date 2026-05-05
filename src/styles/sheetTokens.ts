import type { useTheme } from "@/src/utils/ThemeProvider";

type ThemeColors = ReturnType<typeof useTheme>["colors"];

export function getSheetTokens(colors: ThemeColors) {
  return {
    background: colors.surface,
    handleColor: colors.border,
    handleWidth: 40,
    handleHeight: 4,
    borderTopRadius: 24,
    headerPaddingTop: 20,
    headerPaddingHorizontal: 20,
    headerTitleSize: 17,
    headerTitleWeight: "700" as const,
    searchBackground: colors.surfaceAlt,
    searchBorderRadius: 14,
    rowHeight: 64,
    avatarSize: 44,
    separatorInset: 72,
  };
}

export const customerAvatarGradientPairs = [
  ["#f59e0b", "#d97706"],
  ["#10b981", "#059669"],
  ["#3b82f6", "#2563eb"],
  ["#8b5cf6", "#7c3aed"],
  ["#ef4444", "#dc2626"],
  ["#06b6d4", "#0891b2"],
] as const;
