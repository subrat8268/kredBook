import Avatar from "@/src/components/ui/Avatar";
import { formatINR } from "@/src/utils/format";
import { Pressable, Text, View } from "react-native";
import type { DashboardPerson } from "../types";

type Props = {
  person: DashboardPerson;
  onCollect: (customerId: string, customerName: string) => Promise<void>;
};

export default function DashboardFollowUpCard({ person, onCollect }: Props) {
  return (
    <View className="mr-2.5 w-56 rounded-2xl border border-border-soft bg-surface p-3.5 dark:border-border-dark dark:bg-surface-dark">
      <View className="flex-row items-center justify-between">
        <Avatar name={person.name} size="sm" />
        <View className="rounded-full bg-warning-bg px-2 py-1 dark:bg-warning-bg-dark">
          <Text className="text-[11px] font-inter-semibold text-warning-dark dark:text-warning-light">{person.daysSince}d overdue</Text>
        </View>
      </View>
      <Text className="mt-3 text-body font-inter-semibold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
        {person.name}
      </Text>
      <Text className="mt-1 text-card-title text-overdue-text">{formatINR(person.balance)}</Text>
      <Pressable
        className="mt-3 rounded-full bg-success px-4 py-2.5"
        onPress={() => onCollect(person.id, person.name)}
        accessibilityRole="button"
        accessibilityLabel={`Collect ${person.balance} from ${person.name}`}
        accessibilityHint="Opens the payment form for this customer"
      >
        <Text className="text-center text-caption font-inter-semibold text-surface">Collect</Text>
      </Pressable>
    </View>
  );
}
