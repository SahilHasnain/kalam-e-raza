import { KalamCard } from "@/src/components/KalamCard";
import { LangSwitcher } from "@/src/components/LangSwitcher";
import { borderRadius, colors, spacing } from "@/src/constants/theme";
import { useLang } from "@/src/contexts/LangContext";
import { kalams } from "@/src/data";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { lang } = useLang();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return kalams;
    const q = search.toLowerCase();
    return kalams.filter(
      (k) =>
        k.titleRo.toLowerCase().includes(q) ||
        k.titleUr.includes(q) ||
        k.versesUr?.some((v) => v.m1.includes(q) || v.m2.includes(q)) ||
        k.versesRo?.some((v) => v.m1.toLowerCase().includes(q) || v.m2.toLowerCase().includes(q)),
    );
  }, [search]);

  const isRtl = lang === "ur" || lang === "hi";

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={["#0D5C3F", "#1A7A55", "#0D5C3F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: spacing["5xl"],
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
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: colors.gold,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: colors.primaryDark, fontWeight: "800" }}>
                ک
              </Text>
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
            marginTop: spacing.lg,
            paddingHorizontal: spacing.md,
          }}
        >
          <Text style={{ fontSize: 14, marginRight: spacing.sm }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search kalams..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={{
              flex: 1,
              fontSize: 14,
              color: colors.white,
              paddingVertical: spacing.sm,
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
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 16, color: colors.gray500 }}>
              No kalams found
            </Text>
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
