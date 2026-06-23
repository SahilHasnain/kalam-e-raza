import { Tabs } from "expo-router";
import { colors } from "@/src/constants/theme";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? colors.primary : colors.gray400 }}>
      {icon}
    </Text>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

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
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
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
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ focused }) => <TabIcon icon="♥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ focused }) => <TabIcon icon="ⓘ" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
