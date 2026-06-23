import { borderRadius, colors, spacing } from "@/src/constants/theme";
import { useFavorites } from "@/src/contexts/FavoritesContext";
import { useLang } from "@/src/contexts/LangContext";
import { kalams } from "@/src/data";
import { useKalamText } from "@/src/hooks/useKalamText";
import { useT } from "@/src/hooks/useT";
import { youtubeMap } from "@/src/data/youtube";

import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

export default function KalamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const _ = useT();
  const { lang } = useLang();
  const { title, verses: getVerses, poetName } = useKalamText();
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
  const shes = getVerses(kalam);
  const isRtl = lang === "ur" || lang === "hi";
  const videoIds = youtubeMap[kalam.id];
  const [videoOpen, setVideoOpen] = useState(false);
  const [activePart, setActivePart] = useState(0);
  const [playing, setPlaying] = useState(false);

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

          <View style={styles.titleRow}>
            <View style={styles.titleTextArea}>
              <Text style={[styles.title, isRtl && { writingDirection: "rtl" }]}>
                {title(kalam)}
              </Text>
              {kalam.titleRo && lang !== "ro" && lang !== "en" && (
                <Text style={styles.titleRoman}>{kalam.titleRo}</Text>
              )}
            </View>

            <Pressable onPress={() => toggleFavorite(kalam.id)} hitSlop={12}>
              <View style={[styles.titleFav, favorited && styles.titleFavFilled]}>
                <Text style={[styles.titleFavHeart, favorited && styles.titleFavHeartFilled]}>
                  {favorited ? "♥" : "♡"}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.ornamentBottom}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDiamond} />
            <View style={styles.ornamentLine} />
          </View>
        </View>

        {/* Video Button */}
        {videoIds && videoIds.length > 0 && (
          <Pressable
            onPress={() => { setActivePart(0); setPlaying(false); setVideoOpen(true); }}
            style={styles.videoButton}
          >
            <View style={styles.videoButtonIcon}>
              <Text style={styles.videoButtonPlay}>▶</Text>
            </View>
            <View style={styles.videoButtonText}>
              <Text style={styles.videoButtonLabel}>Video Explanation</Text>
              <Text style={styles.videoButtonParts}>{videoIds.length} part{videoIds.length > 1 ? "s" : ""}</Text>
            </View>
            <Text style={styles.videoButtonArrow}>›</Text>
          </Pressable>
        )}

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

      {/* Video Bottom Sheet */}
      <Modal
        visible={videoOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setVideoOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setVideoOpen(false)} />
        <View style={styles.sheetContainer}>
          {/* Handle */}
          <View style={styles.sheetHandle}>
            <View style={styles.sheetHandleBar} />
          </View>

          {/* Parts Tabs */}
          {videoIds.length > 1 && (
            <View style={styles.partTabs}>
              {videoIds.map((_, vi) => (
                <Pressable
                  key={vi}
                  onPress={() => { setActivePart(vi); setPlaying(false); }}
                  style={[styles.partTab, activePart === vi && styles.partTabActive]}
                >
                  <Text style={[styles.partTabText, activePart === vi && styles.partTabTextActive]}>
                    Part {vi + 1}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Video Player */}
          <View style={styles.sheetPlayerWrapper}>
            <YoutubePlayer
              videoId={videoIds[activePart]}
              height={210}
              play={playing}
              onChangeState={(state: string) => {
                if (state === "playing") setPlaying(true);
                else if (state === "paused" || state === "ended") setPlaying(false);
              }}
              initialPlayerParams={{
                controls: true,
                modestbranding: true,
                rel: false,
              }}
            />
          </View>

          {/* Close Button */}
          <Pressable onPress={() => setVideoOpen(false)} style={styles.sheetClose}>
            <Text style={styles.sheetCloseText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
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

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  ornamentTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  ornamentBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  titleTextArea: {
    flex: 1,
    alignItems: "center",
  },
  titleFav: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  titleFavFilled: {
    backgroundColor: "rgba(225, 29, 72, 0.2)",
    borderColor: colors.favorite,
  },
  titleFavHeart: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.5)",
  },
  titleFavHeartFilled: {
    color: colors.favorite,
  },
  versesContainer: {
    marginBottom: spacing.lg,
  },
  verseDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  verseDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.2,
  },
  verseDividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginHorizontal: spacing.sm,
    opacity: 0.4,
  },
  verseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
    position: "relative",
  },

  verseContent: {
    marginTop: 0,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 30,
    color: colors.white,
    textAlign: "center",
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  verseText2: {
    marginTop: 2,
  },
  actionButtons: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  shareButton: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  shareGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing["2xl"],
    gap: spacing.xs,
  },
  shareIcon: {
    fontSize: 18,
    color: colors.primaryDark,
  },
  shareText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(201, 168, 76, 0.12)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
  },
  videoButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(201, 168, 76, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  videoButtonPlay: {
    fontSize: 14,
    color: colors.gold,
  },
  videoButtonText: {
    flex: 1,
  },
  videoButtonLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.goldLight,
  },
  videoButtonParts: {
    fontSize: 11,
    color: "rgba(201, 168, 76, 0.6)",
    marginTop: 1,
  },
  videoButtonArrow: {
    fontSize: 18,
    color: colors.gold,
    opacity: 0.5,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primaryDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: "80%",
  },
  sheetHandle: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  partTabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  partTab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  partTabActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  partTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  partTabTextActive: {
    color: colors.primaryDark,
  },
  sheetPlayerWrapper: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  sheetClose: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sheetCloseText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray400,
  },
  bottomSpacer: {
    height: 40,
  },
});
