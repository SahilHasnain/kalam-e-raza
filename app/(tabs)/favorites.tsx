import { NastaliqText } from "@/src/components/NastaliqText";
import { borderRadius, colors, spacing } from "@/src/constants/theme";
import { useFavorites } from "@/src/contexts/FavoritesContext";
import { useLang } from "@/src/contexts/LangContext";
import { kalams } from "@/src/data";
import { useKalamText } from "@/src/hooks/useKalamText";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function FavoritesScreen() {
  const router = useRouter();
  const { lang } = useLang();
  const { title } = useKalamText();
  const { favorites } = useFavorites();

  const favoriteKalams = kalams.filter((k) => favorites.has(k.id));
  const isRtl = lang === "ur" || lang === "hi";

  return (
    <View style={styles.container}>
      {/* Hero Header with Gradient */}
      <LinearGradient
        colors={['#E11D48', '#BE123C', '#9F1239']}
        style={styles.heroHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Elements */}
        <View style={styles.decorativePattern}>
          <View style={styles.patternHeart1}>
            <Text style={styles.patternHeartIcon}>♥</Text>
          </View>
          <View style={styles.patternHeart2}>
            <Text style={styles.patternHeartIcon}>♥</Text>
          </View>
        </View>

        {/* Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.iconCircle}
            >
              <Text style={styles.heartIcon}>♥</Text>
            </LinearGradient>
          </View>

          <Text style={styles.headerTitle}>My Favorites</Text>
          <Text style={styles.headerSubtitle}>
            {favoriteKalams.length} saved
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={favoriteKalams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['rgba(225, 29, 72, 0.1)', 'rgba(225, 29, 72, 0.05)']}
                style={styles.emptyIconGradient}
              >
                <Text style={styles.emptyIcon}>♡</Text>
              </LinearGradient>
            </View>

            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyMessage}>Tap the heart icon on any kalam to save it here</Text>

            <Pressable
              onPress={() => router.push("/")}
              style={styles.browseButton}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.browseGradient}
              >
                <Text style={styles.browseButtonText}>Browse Kalams</Text>
              </LinearGradient>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/kalam/${item.id}`)}
            style={styles.kalamCard}
          >
            <LinearGradient
              colors={['rgba(225, 29, 72, 0.05)', 'rgba(225, 29, 72, 0.02)']}
              style={styles.cardGradient}
            >
              {/* Favorite Badge */}
              <View style={styles.favoriteBadge}>
                <Text style={styles.favoriteBadgeIcon}>♥</Text>
              </View>

              {/* Position Number */}
              <View style={styles.positionNumber}>
                <Text style={styles.positionNumberText}>{index + 1}</Text>
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <NastaliqText
                  isRtl={isRtl}
                  style={styles.kalamTitle}
                  numberOfLines={2}
                >
                  {title(item)}
                </NastaliqText>
                <Text style={styles.kalamRoman} numberOfLines={1}>
                  {item.titleRo}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.verseCount}>
                    {item.versesUr?.length || 0} verses
                  </Text>
                </View>
              </View>

              {/* Arrow Indicator */}
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  heroHeader: {
    paddingTop: 50,
    paddingBottom: spacing["3xl"],
    position: "relative",
    overflow: "hidden",
  },
  decorativePattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  patternHeart1: {
    position: "absolute",
    top: -20,
    right: 20,
  },
  patternHeart2: {
    position: "absolute",
    bottom: 10,
    left: 30,
  },
  patternHeartIcon: {
    fontSize: 80,
    color: colors.white,
    opacity: 0.3,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  heartIcon: {
    fontSize: 40,
    color: colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: 100,
    gap: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["5xl"],
    paddingHorizontal: spacing["2xl"],
  },
  emptyIconContainer: {
    marginBottom: spacing["2xl"],
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(225, 29, 72, 0.2)",
  },
  emptyIcon: {
    fontSize: 60,
    color: colors.favorite,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing["2xl"],
  },
  browseButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  browseGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["3xl"],
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.3,
  },
  kalamCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.15)",
    shadowColor: colors.favorite,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardGradient: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    position: "relative",
  },
  favoriteBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.favorite,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.favorite,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteBadgeIcon: {
    fontSize: 16,
    color: colors.white,
  },
  positionNumber: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(225, 29, 72, 0.1)",
    borderWidth: 1.5,
    borderColor: colors.favorite,
    alignItems: "center",
    justifyContent: "center",
  },
  positionNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.favorite,
  },
  cardContent: {
    paddingRight: spacing["2xl"],
    paddingTop: spacing.md,
  },
  kalamTitle: {
    fontSize: 18,
    color: colors.black,
    lineHeight: 30,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  kalamRoman: {
    fontSize: 13,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  verseCount: {
    fontSize: 11,
    color: colors.gray400,
  },
  arrowContainer: {
    position: "absolute",
    right: spacing.lg,
    top: "50%",
    marginTop: -12,
  },
  arrow: {
    fontSize: 20,
    color: colors.favorite,
    opacity: 0.4,
  },
});
