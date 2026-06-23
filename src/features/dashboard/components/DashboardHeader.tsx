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
  const badgeText = overdueTotalCount > 9 ? "9+" : `${overdueTotalCount}`;
  const isCapsule = overdueTotalCount > 9;

  return (
    <View
      style={{
        paddingHorizontal: 0,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSubtle,
      }}
    >
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
        style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
      >
        <Bell size={22} color={colors.textMuted} strokeWidth={2} />
        {overdueTotalCount > 0 ? (
          <View
            style={{
              position: "absolute",
              right: 4,
              top: 4,
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
