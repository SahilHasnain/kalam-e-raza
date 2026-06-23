import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { useLang } from "@/src/contexts/LangContext";
import { colors, borderRadius, spacing } from "@/src/constants/theme";
import type { Lang } from "@/src/types";

const LANGS: { key: Lang; label: string }[] = [
  { key: "ur", label: "اردو" },
  { key: "hi", label: "हिन्दी" },
  { key: "ro", label: "Roman" },
  { key: "en", label: "English" },
];

const SHORT: Record<Lang, string> = {
  ur: "Ur",
  hi: "Hi",
  ro: "Ro",
  en: "En",
};

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: "relative" }}>
      <Pressable
        onPress={() => setOpen(!open)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: borderRadius.sm,
          borderWidth: 1,
          borderColor: colors.gold,
        }}
      >
        <Text
          style={{
            color: colors.goldLight,
            fontWeight: "700",
            fontSize: 12,
            letterSpacing: 0.3,
          }}
        >
          {SHORT[lang]}
        </Text>
        <Text style={{ color: colors.gold, fontSize: 8, marginTop: 1 }}>▼</Text>
      </Pressable>

      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 32,
              right: 0,
              backgroundColor: colors.white,
              borderRadius: borderRadius.md,
              borderWidth: 1,
              borderColor: colors.gray200,
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
              zIndex: 2,
              minWidth: 110,
            }}
          >
            {LANGS.map((l, i) => (
              <Pressable
                key={l.key}
                onPress={() => {
                  setLang(l.key);
                  setOpen(false);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor:
                      lang === l.key
                        ? colors.primary
                        : i % 2 === 0
                          ? colors.white
                          : colors.gray50,
                    borderBottomWidth: i < LANGS.length - 1 ? 1 : 0,
                    borderBottomColor: colors.gray100,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: lang === l.key ? colors.white : colors.gray800,
                      fontWeight: lang === l.key ? "600" : "400",
                    }}
                  >
                    {l.label}
                  </Text>
                  {lang === l.key && (
                    <Text style={{ fontSize: 12, color: colors.gold }}>✓</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
