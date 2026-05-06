import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { Share2 } from "lucide-react-native";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface BillFooterProps {
  isLoading?: boolean;
  onSaveAndShare?: () => void;
  shareLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  secondaryDisabled?: boolean;
  totalAmount?: number;
  totalLabel?: string;
  showIcon?: boolean;
  offlineQueueCount?: number;
  disabled?: boolean;
}

export default function BillFooter({
  isLoading = false,
  onSaveAndShare,
  shareLabel = "Save & Share",
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel = "Save Entry",
  secondaryLabel,
  secondaryDisabled = false,
  totalAmount,
  totalLabel,
  showIcon = true,
  offlineQueueCount = 0,
  disabled = false,
}: BillFooterProps) {
  const { colors } = useTheme();
  const useSplitActions = Boolean(secondaryLabel);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {offlineQueueCount > 0 ? (
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 10 }}>
          Offline queue: {offlineQueueCount}
        </Text>
      ) : null}

      {totalAmount !== undefined && totalLabel && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {totalLabel}
          </Text>
          <Text
            style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}
          >
            {formatINR(totalAmount)}
          </Text>
        </View>
      )}

      {useSplitActions ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onPrimaryAction}
            disabled={disabled || isLoading}
            style={{
              flex: 0.65,
              backgroundColor: disabled ? colors.border : colors.primary,
              minHeight: 52,
              paddingVertical: 10,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.75}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text
                style={{
                  color: colors.surface,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {primaryLabel}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSecondaryAction}
            disabled={secondaryDisabled || isLoading}
            style={{
              flex: 0.33,
              borderWidth: 1,
              borderColor: secondaryDisabled ? colors.border : colors.primary,
              backgroundColor: colors.surface,
              minHeight: 52,
              paddingVertical: 8,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              opacity: secondaryDisabled ? 0.5 : 1,
            }}
            activeOpacity={0.75}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Share2
                size={16}
                color={secondaryDisabled ? colors.textSecondary : colors.primary}
              />
            <Text
              numberOfLines={1}
              style={{
                color: secondaryDisabled ? colors.textSecondary : colors.primary,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              {secondaryLabel}
            </Text>
            </View>
            {secondaryDisabled ? (
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Save first to share
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onSaveAndShare}
          disabled={disabled || isLoading}
          style={{
            backgroundColor: disabled ? colors.border : colors.primary,
            paddingVertical: 14,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.75}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              {showIcon ? (
                <Share2 size={18} color={colors.surface} style={{ marginRight: 8 }} />
              ) : null}
              <Text
                style={{
                  color: colors.surface,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {shareLabel}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
