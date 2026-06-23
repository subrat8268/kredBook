import Avatar from "@/src/components/ui/Avatar";
import * as Haptics from "expo-haptics";
import { formatINR } from "@/src/utils/format";
import { Pressable, Text, View } from "react-native";
import type { DashboardPerson } from "../types";

type Props = {
  person: DashboardPerson;
  onCollect: (customerId: string, customerName: string) => Promise<void>;
  onPressCard: (customerId: string) => void;
  colors: any;
};

export default function DashboardFollowUpCard({ person, onCollect, onPressCard, colors }: Props) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPressCard(person.id);
      }}
      className="rounded-2xl bg-surface p-4 dark:border dark:border-border-soft-dark dark:bg-surface-dark"
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        width: 200,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
      })}
    >
      <View className="flex-row items-center justify-between">
        <Avatar name={person.name} size="sm" />
        <View className="rounded-full bg-warning-bg px-2.5 py-1 dark:bg-warning-bg-dark">
          <Text className="text-[11px] font-inter-semibold text-warning-dark dark:text-warning-light">{person.daysSince}d overdue</Text>
        </View>
      </View>
      <Text className="mt-3 text-body font-inter-semibold text-ink dark:text-ink-dark" numberOfLines={1}>
        {person.name}
      </Text>
      <Text className="mt-1 text-card-title text-overdue-text dark:text-danger">{formatINR(person.balance)}</Text>
      <Pressable
        className="mt-4 rounded-full bg-success px-4 py-2.5"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onCollect(person.id, person.name);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Collect ${person.balance} from ${person.name}`}
        accessibilityHint="Opens the payment form for this customer"
      >
        <Text className="text-center text-caption font-inter-semibold text-surface">Collect</Text>
      </Pressable>
    </Pressable>
  );
}
