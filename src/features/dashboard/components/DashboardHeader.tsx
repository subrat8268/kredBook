import Avatar from "@/src/components/ui/Avatar";
import { Bell } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

function getGreetingOnly() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

type Props = {
  colors: any;
  spacing: any;
  businessName: string;
  overdueTotalCount: number;
  onPressNotifications: () => void;
};

export default function DashboardHeader({ colors, spacing, businessName, overdueTotalCount, onPressNotifications }: Props) {
  const badgeText = overdueTotalCount > 99 ? "99+" : `${overdueTotalCount}`;
  const isCapsule = overdueTotalCount > 9;

  return (
    <View style={{ paddingHorizontal: spacing.xs, paddingTop: spacing.md, paddingBottom: spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: spacing.md }}>
        <Avatar name={businessName} size="sm" color={colors.brand} />
        <View style={{ marginLeft: spacing.md, flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: colors.ink }}>{businessName}</Text>
          <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>{getGreetingOnly()} 👋</Text>
        </View>
      </View>
      <Pressable
        onPress={onPressNotifications}
        accessibilityRole="button"
        accessibilityLabel={`Notifications${overdueTotalCount > 0 ? `, ${overdueTotalCount} overdue` : ""}`}
        accessibilityHint="Opens overdue entries"
        hitSlop={10}
        style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
      >
        <Bell size={22} color={colors.textMuted} strokeWidth={2} />
        {overdueTotalCount > 0 ? (
          <View
            style={{
              position: "absolute",
              right: -2,
              top: -2,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: colors.danger,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: isCapsule ? 4 : 0,
            }}
          >
            <Text style={{ color: "white", fontSize: 10, fontWeight: "800", textAlign: "center" }}>
              {badgeText}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
