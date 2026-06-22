import { Tabs } from "expo-router";
import { colors } from "@/src/constants/theme";
import { useT } from "@/src/hooks/useT";
import { View, Text } from "react-native";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? colors.primary : colors.gray400 }}>
      {icon}
    </Text>
  );
}

export default function TabLayout() {
  const _ = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: _("home"),
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: _("browse"),
          tabBarIcon: ({ focused }) => <TabIcon icon="☰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: _("favorites"),
          tabBarIcon: ({ focused }) => <TabIcon icon="♥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: _("about"),
          tabBarIcon: ({ focused }) => <TabIcon icon="ⓘ" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
