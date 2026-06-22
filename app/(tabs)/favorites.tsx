import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites } from "@/src/contexts/FavoritesContext";
import { kalams } from "@/src/data";
import { colors, spacing, borderRadius, fontSize } from "@/src/constants/theme";
import { NastaliqText } from "@/src/components/NastaliqText";
import { useT } from "@/src/hooks/useT";
import { useKalamText } from "@/src/hooks/useKalamText";
import { useLang } from "@/src/contexts/LangContext";

export default function FavoritesScreen() {
  const router = useRouter();
  const _ = useT();
  const { lang } = useLang();
  const { title, poetName } = useKalamText();
  const { favorites } = useFavorites();

  const favoriteKalams = kalams.filter((k) => favorites.has(k.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing["5xl"],
          paddingBottom: spacing.xl,
        }}
      >
        <Text style={{ fontSize: fontSize["2xl"], fontWeight: "700", color: colors.white }}>
          {_("myFavorites")}
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.gray300, marginTop: spacing.xs }}>
          {favoriteKalams.length} {_("savedKalams")}
        </Text>
      </View>

      <FlatList
        data={favoriteKalams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.md, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 80, paddingHorizontal: spacing.xl }}>
            <Text style={{ fontSize: 40, marginBottom: spacing.lg }}>♡</Text>
            <Text style={{ fontSize: 16, color: colors.gray500, textAlign: "center" }}>
              {_("noFavorites")}
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
