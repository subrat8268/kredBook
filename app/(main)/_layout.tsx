import { Icon } from "@/src/components/ui/Icon";
import SpeedDialFAB from "@/src/components/ui/SpeedDialFAB";
import { useTheme } from "@/src/utils/ThemeProvider";
import { Tabs, useRouter } from "expo-router";
import { House, Receipt, User, Users } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({
  focused,
  color,
  icon,
}: {
  focused: boolean;
  color: string;
  icon: typeof House;
}) {
  return (
    <View className="items-center justify-center">
      <View
        className="rounded-full"
        style={{
          width: 28,
          height: 3,
          borderRadius: 99,
          marginBottom: 4,
          alignSelf: "center",
          backgroundColor: focused ? color : "transparent",
        }}
      />
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: focused ? color : "transparent",
        }}
      >
        <Icon
          name={icon}
          size={18}
          color={focused ? "#FFFFFF" : color}
          strokeWidth={2}
        />
      </View>
    </View>
  );
}

function TabLabel({ label, color }: { label: string; color: string }) {
  return (
    <Text numberOfLines={1} style={{ fontSize: 11, color, fontWeight: "600" }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0.5,
            borderTopColor: "#E5E7EB",
            height: 64 + insets.bottom,
            paddingBottom: Math.max(8, insets.bottom),
            paddingTop: 6,
            elevation: 4,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
          },
          tabBarItemStyle: {
            flex: 1,
            minWidth: 0,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
          tabBarAllowFontScaling: false,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => <TabIcon focused={focused} color={color} icon={House} />,
            tabBarLabel: ({ color }) => <TabLabel label="Home" color={color} />,
          }}
        />

        <Tabs.Screen
          name="people"
          options={{
            title: "People",
            tabBarIcon: ({ color, focused }) => <TabIcon focused={focused} color={color} icon={Users} />,
            tabBarLabel: ({ color }) => <TabLabel label="People" color={color} />,
          }}
        />

        <Tabs.Screen
          name="entries"
          options={{
            title: "Entries",
            tabBarIcon: ({ color, focused }) => <TabIcon focused={focused} color={color} icon={Receipt} />,
            tabBarLabel: ({ color }) => <TabLabel label="Entries" color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => <TabIcon focused={focused} color={color} icon={User} />,
            tabBarLabel: ({ color }) => <TabLabel label="Profile" color={color} />,
          }}
        />

        <Tabs.Screen name="export" options={{ href: null }} />
        <Tabs.Screen name="new-entry" options={{ href: null }} />
      </Tabs>

      <SpeedDialFAB
        bottom={72 + insets.bottom}
        right={spacing.fabMargin}
        onAction={(action) => {
          if (action === "new-entry") {
            router.push("/(main)/entries/create" as never);
            return;
          }
          if (action === "new-customer") {
            router.push({ pathname: "/(main)/people", params: { action: "add" } } as never);
            return;
          }
          router.setParams({ action: "record-payment" });
        }}
      />
    </View>
  );
}
