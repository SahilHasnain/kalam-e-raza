import { Pressable, Text, View, ScrollView } from "react-native";
import { useLang } from "@/src/contexts/LangContext";
import { colors, spacing, borderRadius } from "@/src/constants/theme";
import type { Lang } from "@/src/types";

const LANGS: { key: Lang; label: string }[] = [
  { key: "ur", label: "اردو" },
  { key: "hi", label: "हिन्दी" },
  { key: "ro", label: "Roman" },
  { key: "en", label: "English" },
];

export function LangSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm }}
    >
      {LANGS.map((l) => (
        <Pressable
          key={l.key}
          onPress={() => setLang(l.key)}
        >
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: borderRadius.full,
              backgroundColor: lang === l.key ? colors.primary : colors.cream,
              borderWidth: 1,
              borderColor: lang === l.key ? colors.primary : colors.gold,
            }}
          >
            <Text
              style={{
                color: lang === l.key ? colors.white : colors.primary,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              {l.label}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
