import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import React, { memo, useMemo } from "react";
import { Text, TextProps } from "react-native";

type Variant = "hero" | "title" | "body" | "caption";

export type MoneyAmountProps = {
  value: number;
  currencySymbol?: string;
  showPlusForPositive?: boolean;
  maximumFractionDigits?: number;
  variant?: Variant;
  color?: string;
} & Omit<TextProps, "children">;

function fmtAmount(
  value: number,
  maximumFractionDigits: number,
  currencySymbol: string,
  showPlusForPositive: boolean,
) {
  return formatINR(value, {
    currencySymbol,
    maximumFractionDigits,
    minimumFractionDigits: 0,
    showPlusForPositive,
  });
}

export default memo(function MoneyAmount({
  value,
  currencySymbol = "₹",
  showPlusForPositive,
  maximumFractionDigits = 0,
  variant = "body",
  color,
  style,
  className,
  ...props
}: MoneyAmountProps) {
  const { colors, typography } = useTheme();

  const textStyle = useMemo(() => {
    const base =
      variant === "hero"
        ? typography.heroAmount
        : variant === "title"
          ? typography.cardTitle
          : variant === "caption"
            ? typography.caption
            : typography.body;
    const { color: _c, ...rest } = base as { color?: string };
    return rest;
  }, [variant, typography]);

  const hasColorOverride = color !== undefined;
  const needsDefaultColor = !hasColorOverride && !className;

  return (
    <Text
      className={className}
      {...props}
      style={[
        textStyle,
        hasColorOverride
          ? { color }
          : needsDefaultColor
            ? { color: variant === "hero" ? colors.surface : colors.textPrimary }
            : undefined,
        style,
      ].filter(Boolean)}
    >
      {fmtAmount(
        value,
        maximumFractionDigits,
        currencySymbol,
        !!showPlusForPositive,
      )}
    </Text>
  );
});
