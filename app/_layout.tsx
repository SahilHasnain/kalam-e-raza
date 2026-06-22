import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FavoritesProvider } from "@/src/contexts/FavoritesContext";
import { LangProvider } from "@/src/contexts/LangContext";

export default function RootLayout() {
  return (
    <LangProvider>
      <FavoritesProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="kalam/[id]"
            options={{
              animation: "slide_from_right",
              presentation: "card",
            }}
          />
        </Stack>
      </FavoritesProvider>
    </LangProvider>
  );
}
