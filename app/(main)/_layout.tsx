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
          width: 24,
          height: 3,
          borderRadius: 2,
          marginBottom: 2,
          backgroundColor: focused ? color : "transparent",
        }}
      />
      <Icon name={icon} size={20} color={color} strokeWidth={focused ? 2.3 : 1.9} />
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
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIndicatorStyle: { height: 0 },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: spacing.dividerHeight,
            borderTopColor: colors.border,
            height: spacing.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 6,
            elevation: 8,
            shadowColor: colors.textPrimary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
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
      </Tabs>

      <SpeedDialFAB
        bottom={spacing.tabBarHeight + insets.bottom + 12}
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
          router.push("/(main)/dashboard" as never);
        }}
      />
    </View>
  );
}
