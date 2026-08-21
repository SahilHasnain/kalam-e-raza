import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FavoritesProvider } from "@/src/contexts/FavoritesContext";
import { LangProvider } from "@/src/contexts/LangContext";
import { RecentProvider } from "@/src/contexts/RecentContext";
import { useFonts as useNastaliqFonts, NotoNastaliqUrdu_400Regular } from "@expo-google-fonts/noto-nastaliq-urdu";
import { useFonts as useDevanagariFonts, NotoSansDevanagari_400Regular } from "@expo-google-fonts/noto-sans-devanagari";

export default function RootLayout() {
  const [nastaliqLoaded] = useNastaliqFonts({ NotoNastaliqUrdu_400Regular });
  const [devanagariLoaded] = useDevanagariFonts({ NotoSansDevanagari_400Regular });

  if (!nastaliqLoaded || !devanagariLoaded) return null;

  return (
    <LangProvider>
      <FavoritesProvider>
        <RecentProvider>
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
        </RecentProvider>
      </FavoritesProvider>
    </LangProvider>
  );
}
