import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, fontSize } from "@/src/constants/theme";
import { kalams } from "@/src/data";
import { KalamCard } from "@/src/components/KalamCard";
import { NastaliqText } from "@/src/components/NastaliqText";
import { LangSwitcher } from "@/src/components/LangSwitcher";
import { useT } from "@/src/hooks/useT";
import { useLang } from "@/src/contexts/LangContext";

export default function HomeScreen() {
  const router = useRouter();
  const _ = useT();
  const { lang } = useLang();
  const featured = kalams.slice(0, 4);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.cream }}
      contentContainerStyle={{ paddingBottom: spacing["5xl"] }}
    >
      {/* Hero */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing["5xl"],
          paddingBottom: spacing["3xl"],
        }}
      >
        <NastaliqText
          isRtl={lang === "ur"}
          style={{
            fontSize: 32,
            color: colors.gold,
            textAlign: "center",
            lineHeight: 48,
          }}
        >
          {_("appName")}
        </NastaliqText>
        <Text
          style={{
            fontSize: fontSize.base,
            color: colors.goldLight,
            textAlign: "center",
            marginTop: spacing.xs,
            fontWeight: "500",
          }}
        >
          {_("appSubtitle")}
        </Text>

        <View style={{ marginTop: spacing.lg, alignItems: "center" }}>
          <LangSwitcher />
        </View>
      </View>

      {/* Section title */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: spacing.xl,
          marginTop: spacing["2xl"],
          marginBottom: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: "700",
            color: colors.black,
          }}
        >
          {_("featured")}
        </Text>
        <Pressable onPress={() => router.push("/(tabs)/browse")}>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.primary,
              fontWeight: "600",
            }}
          >
            {_("seeAll")}
          </Text>
        </Pressable>
      </View>

      {/* Kalam list */}
      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
        {featured.map((kalam) => (
          <KalamCard
            key={kalam.id}
            kalam={kalam}
            onPress={() => router.push(`/kalam/${kalam.id}`)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
