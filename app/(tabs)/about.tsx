import { View, Text, ScrollView } from "react-native";
import { colors, spacing, borderRadius, fontSize } from "@/src/constants/theme";
import { LangSwitcher } from "@/src/components/LangSwitcher";
import { useLang } from "@/src/contexts/LangContext";
import { t } from "@/src/constants/translations";

export default function AboutScreen() {
  const { lang } = useLang();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.cream }}
      contentContainerStyle={{ paddingBottom: spacing["5xl"] }}
    >
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing["5xl"],
          paddingBottom: spacing["3xl"],
        }}
      >
        <Text style={{ fontSize: fontSize["2xl"], fontWeight: "700", color: colors.white }}>
          About
        </Text>
      </View>

      <View style={{ marginHorizontal: spacing.xl, marginTop: -spacing.xl, alignItems: "center" }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.gray200,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.gray500, marginBottom: spacing.sm }}>
            Language
          </Text>
          <LangSwitcher />
        </View>
      </View>

      <View
        style={{
          marginHorizontal: spacing.xl,
          marginTop: spacing["2xl"],
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          borderWidth: 1,
          borderColor: colors.gray200,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary, textAlign: "center" }}>
          Imam Ahmed Raza Khan
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.gray500, textAlign: "center", marginTop: spacing.xs }}>
          1856 – 1921
        </Text>

        <View
          style={{
            width: 60,
            height: 3,
            backgroundColor: colors.gold,
            alignSelf: "center",
            marginVertical: spacing.lg,
            borderRadius: 2,
          }}
        />

        <Text style={{ fontSize: fontSize.base, color: colors.gray700, lineHeight: 24 }}>
          {t.aboutBio[lang]}
        </Text>
      </View>
    </ScrollView>
  );
}
