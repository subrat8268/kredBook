import StatusBadge from "@/src/components/layer2/StatusBadge";
import * as Haptics from "expo-haptics";
import { formatINR } from "@/src/utils/format";
import { Receipt } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import type { DashboardActivityItem } from "../types";

type Props = {
  item: DashboardActivityItem;
  isLast: boolean;
  onOpenEntryDetail: (orderId: string) => void;
  colors: any;
};

export default function DashboardRecentActivityRow({ item, isLast, onOpenEntryDetail, colors }: Props) {
  return (
    <View>
      <Pressable
        className="flex-row items-start"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onOpenEntryDetail(item.id);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${item.name || item.title}, ${item.type === "payment" ? "payment" : "bill"}, ${formatINR(item.amount)}, status ${item.status}`}
        accessibilityHint="Opens entry details"
      >
        <View className="mr-3 mt-1 h-8 w-8 items-center justify-center rounded-full bg-surface-raised dark:bg-surface-dark">
          <Receipt size={16} color={colors.muted} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-body font-inter-semibold text-ink dark:text-ink-dark" numberOfLines={1}>
            {item.name || item.title}
          </Text>
          <Text className="mt-0.5 text-caption text-muted dark:text-muted-dark">
            {item.title} · {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-body font-inter-semibold" style={{ color: item.type === "payment" ? colors.success : colors.danger }}>
            {item.type === "payment" ? `+${formatINR(item.amount)}` : `-${formatINR(item.amount)}`}
          </Text>
          <View className="mt-1">
            <StatusBadge status={item.status} size="sm" />
          </View>
        </View>
      </Pressable>
      {!isLast ? <View className="my-3 h-px bg-border-soft dark:bg-border-soft-dark" /> : null}
    </View>
  );
}
