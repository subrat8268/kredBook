import { Bell } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

function getGreetingOnly() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function getBusinessInitials(name: string | undefined) {
  const source = (name ?? "").trim();
  if (!source) return "KB";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

type Props = {
  colors: any;
  businessName: string;
  overdueTotalCount: number;
  onPressNotifications: () => void;
};

export default function DashboardHeader({ colors, businessName, overdueTotalCount, onPressNotifications }: Props) {
  return (
    <View style={{ paddingHorizontal: 4, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.surface, fontSize: 14, fontWeight: "700" }}>{getBusinessInitials(businessName)}</Text>
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "700", color: colors.textPrimary }}>{businessName}</Text>
          <Text numberOfLines={1} style={{ fontSize: 12, color: colors.textMuted }}>{getGreetingOnly()} 👋</Text>
        </View>
      </View>
      <Pressable onPress={onPressNotifications} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
        <Bell size={22} color={colors.textMuted} strokeWidth={2} />
        {overdueTotalCount > 0 ? <View style={{ position: "absolute", right: 6, top: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} /> : null}
      </Pressable>
    </View>
  );
}
