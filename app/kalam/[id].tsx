import { borderRadius, colors, spacing } from "@/src/constants/theme";
import { useFavorites } from "@/src/contexts/FavoritesContext";
import { useLang } from "@/src/contexts/LangContext";
import { kalams } from "@/src/data";
import { useKalamText } from "@/src/hooks/useKalamText";
import { useT } from "@/src/hooks/useT";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

export default function KalamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const _ = useT();
  const { lang } = useLang();
  const { title, verses, poetName } = useKalamText();
  const { isFavorite, toggleFavorite } = useFavorites();

  const kalam = kalams.find((k) => k.id === id);

  if (!kalam) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>{_("kalamNotFound")}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.notFoundButton}>{_("goBack")}</Text>
        </Pressable>
      </View>
    );
  }

  const favorited = isFavorite(kalam.id);
  const shes = kalam.versesRo?.length
    ? kalam.versesRo
    : kalam.versesEn?.length
      ? kalam.versesEn.map((s) => s.en)
      : kalam.versesUr?.length
        ? kalam.versesUr
        : kalam.versesHi?.length
          ? kalam.versesHi.map((s) => s.hi)
          : [];
  const isRtl = lang === "ur" || lang === "hi";
  const sherCount = shes.length;

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#0D5C3F', '#083D29', '#1A1A2E']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Pattern Overlay */}
      <View style={styles.patternOverlay}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </View>

      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} hitSlop={20} style={styles.headerButton}>
            <View style={styles.iconCircle}>
              <Text style={styles.backIcon}>←</Text>
            </View>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle}>{poetName(kalam)}</Text>
            <Text style={styles.headerCount}>
              {sherCount} {lang === "ur" ? "اشعار" : lang === "hi" ? "अश'आर" : "She'rs"}
            </Text>
          </View>

          <Pressable onPress={() => toggleFavorite(kalam.id)} hitSlop={20} style={styles.headerButton}>
            <View style={[styles.iconCircle, favorited && styles.iconCircleFavorited]}>
              <Text style={[styles.heartIcon, favorited && styles.heartIconFavorited]}>
                {favorited ? "♥" : "♡"}
              </Text>
            </View>
          </Pressable>
        </View>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section with Ornamental Design */}
        <View style={styles.titleSection}>
          <View style={styles.ornamentTop}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDiamond} />
            <View style={styles.ornamentLine} />
          </View>

          <Text style={[styles.title, isRtl && { writingDirection: "rtl" }]}>
            {title(kalam)}
          </Text>

          {kalam.titleRo && (
            <Text style={styles.titleRoman}>{kalam.titleRo}</Text>
          )}

          <View style={styles.ornamentBottom}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDiamond} />
            <View style={styles.ornamentLine} />
          </View>
        </View>

        {/* Verses with Premium Design */}
        <View style={styles.versesContainer}>
          {shes.map((sher, si) => (
            <View key={si}>
              {si > 0 && (
                <View style={styles.verseDivider}>
                  <View style={styles.verseDividerLine} />
                  <View style={styles.verseDividerDot} />
                  <View style={styles.verseDividerLine} />
                </View>
              )}

              <View style={styles.verseCard}>
                <View style={styles.verseNumber}>
                  <Text style={styles.verseNumberText}>{si + 1}</Text>
                </View>

                <View style={styles.verseContent}>
                  <Text style={[styles.verseText, isRtl && { writingDirection: "rtl" }]}>
                    {sher.m1}
                  </Text>
                  {sher.m2 && (
                    <Text style={[styles.verseText, styles.verseText2, isRtl && { writingDirection: "rtl" }]}>
                      {sher.m2}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            onPress={async () => {
              const sherText = shes
                .map((s) => [s.m1, s.m2].filter(Boolean).join("\n"))
                .join("\n\n");
              await Share.share({
                message: `${title(kalam)}\n\n${sherText}\n\n— ${poetName(kalam)}`,
              });
            }}
            style={styles.shareButton}
          >
            <LinearGradient
              colors={['#C9A84C', '#E8D48B']}
              style={styles.shareGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.shareIcon}>⎙</Text>
              <Text style={styles.shareText}>{_("shareThisKalam")}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: colors.cream,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["2xl"],
  },
  notFoundText: {
    fontSize: 16,
    color: colors.gray500,
    marginBottom: spacing.lg,
  },
  notFoundButton: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.gold,
    top: -100,
    right: -100,
    opacity: 0.15,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.goldLight,
    bottom: 100,
    left: -50,
    opacity: 0.1,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.gold,
    top: "40%",
    right: -30,
    opacity: 0.08,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201, 168, 76, 0.2)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    padding: spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  iconCircleFavorited: {
    backgroundColor: "rgba(225, 29, 72, 0.2)",
    borderColor: colors.favorite,
  },
  backIcon: {
    fontSize: 20,
    color: colors.white,
    fontWeight: "600",
  },
  heartIcon: {
    fontSize: 22,
    color: "rgba(255, 255, 255, 0.7)",
  },
  heartIconFavorited: {
    color: colors.favorite,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.goldLight,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerCount: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing["3xl"],
  },
  titleSection: {
    alignItems: "center",
    marginBottom: spacing["4xl"],
  },
  ornamentTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  ornamentBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  ornamentLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.6,
  },
  ornamentDiamond: {
    width: 8,
    height: 8,
    backgroundColor: colors.gold,
    transform: [{ rotate: "45deg" }],
    marginHorizontal: spacing.sm,
  },
  title: {
    fontSize: 26,
    lineHeight: 44,
    color: colors.white,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
  },
  titleRoman: {
    fontSize: 15,
    color: colors.goldLight,
    textAlign: "center",
    marginTop: spacing.sm,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  versesContainer: {
    marginBottom: spacing["3xl"],
  },
  verseDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing["2xl"],
  },
  verseDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.25,
  },
  verseDividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginHorizontal: spacing.md,
    opacity: 0.5,
  },
  verseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: borderRadius.xl,
    padding: spacing["2xl"],
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
    position: "relative",
  },
  verseNumber: {
    position: "absolute",
    top: -12,
    left: spacing.lg,
    backgroundColor: colors.gold,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primaryDark,
  },
  verseNumberText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: "700",
  },
  verseContent: {
    marginTop: spacing.xs,
  },
  verseText: {
    fontSize: 22,
    lineHeight: 42,
    color: colors.white,
    textAlign: "center",
    fontWeight: "400",
    letterSpacing: 0.3,
  },
  verseText2: {
    marginTop: spacing.xs,
  },
  actionButtons: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  shareButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shareGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing["3xl"],
    gap: spacing.sm,
  },
  shareIcon: {
    fontSize: 20,
    color: colors.primaryDark,
  },
  shareText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 60,
  },
});
