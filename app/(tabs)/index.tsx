import { KalamCard } from "@/src/components/KalamCard";
import { LangSwitcher } from "@/src/components/LangSwitcher";
import { NastaliqText } from "@/src/components/NastaliqText";
import { borderRadius, colors, spacing } from "@/src/constants/theme";
import { t } from "@/src/constants/translations";
import { useLang } from "@/src/contexts/LangContext";
import { useRecent } from "@/src/contexts/RecentContext";
import { kalams } from "@/src/data";
import { useKalamText } from "@/src/hooks/useKalamText";
import type { KalamCategory } from "@/src/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

const CATEGORY_LABELS: Record<KalamCategory | "all", string> = {
  all: "All",
  naat: "Naat",
  manqabat: "Manqabat",
  salaam: "Salaam",
};

export default function HomeScreen() {
  const router = useRouter();
  const { lang } = useLang();
  const uiLang = lang === "ro" ? "en" : lang;
  const { availableInLang } = useKalamText();
  const { recent } = useRecent();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<KalamCategory | "all">("all");

  const availableKalams = useMemo(
    () => kalams.filter((k) => availableInLang(k)),
    [availableInLang],
  );

  const filtered = useMemo(() => {
    const categoryKalams = selectedCategory === "all"
      ? availableKalams
      : availableKalams.filter((kalam) => kalam.category === selectedCategory);
    if (!search.trim()) return categoryKalams;
    const q = search.toLowerCase();
    return categoryKalams.filter(
      (k) =>
        k.titleUr.includes(q) ||
        k.titleRo.toLowerCase().includes(q) ||
        k.titleEn?.toLowerCase().includes(q) ||
        k.versesUr?.some((v) => v.m1.includes(q) || v.m2.includes(q)) ||
        k.versesRo?.some((v) => v.m1.toLowerCase().includes(q) || v.m2.toLowerCase().includes(q)) ||
        k.versesEn?.some((v) => v.m1.toLowerCase().includes(q) || v.m2.toLowerCase().includes(q)),
    );
  }, [search, availableKalams, selectedCategory]);

  const recentlyViewed = useMemo(
    () => recent
      .map((id) => availableKalams.find((kalam) => kalam.id === id))
      .filter((kalam): kalam is (typeof availableKalams)[number] => Boolean(kalam)),
    [recent, availableKalams],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: spacing["3xl"],
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.lg,
        }}
      >
        {/* Decorative circles */}
        <View
          style={{
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.gold,
            top: -30,
            left: -40,
            opacity: 0.06,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.gold,
            top: 20,
            right: -20,
            opacity: 0.05,
          }}
        />

        {/* Top bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden" }}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={{ width: 37, height: 37, position: "absolute", left: -0.5, top: -0.5 }}
              />
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.gold }}>
              Kalam-e-Raza
            </Text>
          </View>
          <LangSwitcher />
        </View>

        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primaryLight,
            borderRadius: borderRadius.md,
            marginTop: spacing.md,
            paddingHorizontal: spacing.md,
          }}
        >
          <Text style={{ fontSize: 14, marginRight: spacing.sm }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search kalams..."
            placeholderTextColor={colors.mist}
            style={{
              flex: 1,
              minHeight: 40,
              fontSize: 14,
              color: colors.white,
              paddingVertical: 0,
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Text style={{ fontSize: 14, color: colors.goldLight }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Availability line */}
        {availableKalams.length < kalams.length && (
          <Text style={{ fontSize: 12, color: colors.goldLight, marginTop: spacing.sm, opacity: 0.9 }}>
            {`${availableKalams.length} Kalams · ${t.langName[uiLang]}`}
          </Text>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, marginTop: spacing.md }}
        >
          {(["all", "naat", "manqabat", "salaam"] as const).map((category) => {
            const isSelected = selectedCategory === category;
            const label = CATEGORY_LABELS[category];
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={{
                  borderRadius: borderRadius.full,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.gold : colors.surfaceRaised,
                  backgroundColor: isSelected ? colors.gold : colors.surfaceRaised,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                }}
              >
                <Text style={{ color: isSelected ? colors.primaryDark : colors.ivory, fontSize: 12, fontWeight: "700" }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* All kalams list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.xl,
          gap: spacing.md,
          paddingBottom: 100,
        }}
        ListHeaderComponent={recentlyViewed.length > 0 && !search.trim() && selectedCategory === "all" ? (
          <View style={{ marginBottom: spacing.lg }}>
            <NastaliqText
              isRtl={lang === "ur"}
              style={{ color: colors.ivory, fontSize: 18, fontWeight: "700", marginBottom: spacing.md }}
            >
              Recently viewed
            </NastaliqText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
              {recentlyViewed.map((kalam) => (
                <View key={kalam.id} style={{ width: 220 }}>
                  <KalamCard compact kalam={kalam} onPress={() => router.push(`/kalam/${kalam.id}`)} />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60, paddingHorizontal: spacing.xl }}>
            <Text style={{ fontSize: 16, color: colors.gray500, textAlign: "center" }}>
              {search.trim() ? `No results for "${search.trim()}"` : "No kalams found"}
            </Text>
            {search.trim() ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8} style={{ marginTop: spacing.md }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
                  Clear search
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <KalamCard
            kalam={item}
            onPress={() => router.push(`/kalam/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
