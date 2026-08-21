import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, borderRadius, spacing } from "@/src/constants/theme";
import { t } from "@/src/constants/translations";
import { NastaliqText } from "./NastaliqText";
import { useFavorites } from "@/src/contexts/FavoritesContext";
import { useLang } from "@/src/contexts/LangContext";
import { useKalamText } from "@/src/hooks/useKalamText";
import type { Kalam } from "@/src/types";

type Props = {
  kalam: Kalam;
  onPress?: () => void;
};

export function KalamCard({ kalam, onPress }: Props) {
  const { title, verses, isRtl } = useKalamText();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { lang } = useLang();
  const uiLang = lang === "ro" ? "en" : lang;

  const favorited = isFavorite(kalam.id);

  return (
    <Pressable onPress={onPress}>
      <View style={styles.card}>
        <Pressable onPress={() => toggleFavorite(kalam.id)} hitSlop={12} style={styles.heart}>
          <Text style={[styles.heartIcon, favorited && styles.heartIconActive]}>
            {favorited ? "♥" : "♡"}
          </Text>
        </Pressable>

        {kalam.category && (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{t[kalam.category][uiLang]}</Text>
          </View>
        )}

        <NastaliqText
          isRtl={isRtl(kalam)}
          style={styles.title}
          numberOfLines={2}
        >
          {title(kalam)}
        </NastaliqText>

        <View style={styles.footer}>
          <Text style={styles.count}>{verses(kalam).length} verses</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
          backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heart: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  heartIcon: {
    fontSize: 18,
    color: colors.gray300,
  },
  heartIconActive: {
    color: colors.favorite,
  },
  title: {
    fontSize: 18,
            color: colors.ivory,
    lineHeight: 30,
    fontWeight: "600",
    paddingRight: spacing["3xl"],
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
  },
  count: {
    fontSize: 11,
    color: colors.gray400,
  },
  categoryPill: {
    alignSelf: "flex-start",
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  categoryText: {
    color: colors.goldLight,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
