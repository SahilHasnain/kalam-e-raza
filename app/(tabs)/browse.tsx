import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { colors, spacing, borderRadius, fontSize } from "@/src/constants/theme";
import { kalams } from "@/src/data";
import { SearchBar } from "@/src/components/SearchBar";
import { NastaliqText } from "@/src/components/NastaliqText";
import { useT } from "@/src/hooks/useT";
import { useKalamText } from "@/src/hooks/useKalamText";
import { useLang } from "@/src/contexts/LangContext";

export default function BrowseScreen() {
  const router = useRouter();
  const _ = useT();
  const { lang } = useLang();
  const { title, poetName } = useKalamText();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return kalams;
    const q = search.toLowerCase();
    return kalams.filter(
      (k) =>
        k.titleRo.toLowerCase().includes(q) ||
        k.titleUr.includes(q) ||
        k.versesUr.some((v) => v.includes(q)) ||
        k.versesRo?.some((v) => v.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing["5xl"],
          paddingBottom: spacing.xl,
        }}
      >
        <Text
          style={{
            fontSize: fontSize["2xl"],
            fontWeight: "700",
            color: colors.white,
          }}
        >
          {_("browseKalams")}
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={_("search")} />
      </View>

      {/* Results */}
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
              {_("noKalamsFound")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/kalam/${item.id}`)}
            style={{
              backgroundColor: colors.white,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.gray200,
            }}
          >
            <NastaliqText
              isRtl={lang === "ur" || lang === "hi"}
              style={{ fontSize: 18, color: colors.black, lineHeight: 30 }}
              numberOfLines={1}
            >
              {title(item)}
            </NastaliqText>
            <Text style={{ fontSize: 13, color: colors.gray500, marginTop: spacing.xs }} numberOfLines={1}>
              {item.titleRo}
            </Text>
            <Text style={{ fontSize: 11, color: colors.gray400, marginTop: spacing.sm }}>
              {poetName(item)}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
