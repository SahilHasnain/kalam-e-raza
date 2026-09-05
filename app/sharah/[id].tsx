import { NastaliqText } from "@/src/components/NastaliqText";
import { borderRadius, colors, spacing } from "@/src/constants/theme";
import { t } from "@/src/constants/translations";
import { useLang } from "@/src/contexts/LangContext";
import { getBlocksBySectionNo, getSectionInfo } from "@/src/db/database";
import type { BlockRow, SectionInfo } from "@/src/db/types";
import { useSQLiteContext } from "expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type GlossaryItem = { term: string; meaning: string };

type Verse = { kind: "verse"; lines: string[] };
type Glossary = { kind: "glossary"; items: GlossaryItem[] };
type Explanation = { kind: "explanation"; body: string };

type RenderedBlock = Verse | Glossary | Explanation;

export default function SharahReaderScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sectionNo = Number(id);
  const { lang } = useLang();
  const uiLang = lang === "ro" ? "en" : lang;

  const [info, setInfo] = useState<SectionInfo | null>(null);
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getSectionInfo(db, sectionNo), getBlocksBySectionNo(db, sectionNo)])
      .then(([infoRows, blockRows]) => {
        if (!active) return;
        setInfo(infoRows);
        setBlocks(blockRows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [db, sectionNo]);

  const rendered = useMemo(() => buildRenderedBlocks(blocks), [blocks]);

  if (!loading && !info) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Sharah not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.notFoundButton}>{t.goBack[uiLang]}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark, colors.black]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative pattern */}
      <View style={styles.patternOverlay}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>{t.sharahHeader[uiLang]}</Text>
          <View style={styles.sectionChip}>
            <Text style={styles.sectionChipText}>{t.naat[uiLang]} {sectionNo}</Text>
          </View>
        </View>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <View style={styles.ornamentTop}>
              <View style={styles.ornamentLine} />
              <View style={styles.ornamentDiamond} />
              <View style={styles.ornamentLine} />
            </View>
            <NastaliqText style={styles.title} numberOfLines={6}>
              {info?.title ?? ""}
            </NastaliqText>
            <View style={styles.ornamentBottom}>
              <View style={styles.ornamentLine} />
              <View style={styles.ornamentDiamond} />
              <View style={styles.ornamentLine} />
            </View>
          </View>

          <View style={styles.blocks}>
            {rendered.map((group, gi) => (
              <GroupRenderer key={gi} group={group} />
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

function GroupRenderer({ group }: { group: RenderedBlock }) {
  const { lang } = useLang();
  const uiLang = lang === "ro" ? "en" : lang;

  if (group.kind === "verse") {
    return (
      <View style={styles.verseCard}>
        {group.lines.map((line, li) => (
          <NastaliqText
            key={li}
            style={[styles.verseLine, li > 0 && styles.verseLineNext]}
          >
            {line}
          </NastaliqText>
        ))}
      </View>
    );
  }

  if (group.kind === "glossary") {
    return (
      <View style={styles.glossaryCard}>
        <View style={styles.glossaryHeader}>
          <View style={styles.glossaryDot} />
          <Text style={styles.glossaryTitle}>{t.mushkilAlfaz[uiLang]}</Text>
          <View style={styles.glossaryDot} />
        </View>
        {group.items.length > 0 && (
          <View style={styles.glossaryItems}>
            {group.items.map((item, li) => (
              <View key={li} style={styles.glossaryRow}>
                <Text style={styles.glossaryTerm}>{item.term}</Text>
                <Text style={styles.glossaryEqual}> = </Text>
                <Text style={styles.glossaryMeaning}>{item.meaning}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.explanationCard}>
      <View style={styles.explanationHeader}>
        <Text style={styles.explanationLabel}>{t.mafhoom[uiLang]}</Text>
      </View>
      <Text style={styles.explanationText}>{group.body}</Text>
    </View>
  );
}

function buildRenderedBlocks(blocks: BlockRow[]): RenderedBlock[] {
  const groups: RenderedBlock[] = [];
  for (const block of blocks) {
    if (block.blockType === "heading") continue;

    if (block.blockType === "poem") {
      const last = groups[groups.length - 1];
      if (last && last.kind === "verse") {
        last.lines.push(block.text);
      } else {
        groups.push({ kind: "verse", lines: [block.text] });
      }
      continue;
    }

    if (block.blockType === "glossary") continue;

    if (block.blockType === "glossary_item") {
      groups.push({ kind: "glossary", items: parseGlossary(block.text) });
      continue;
    }

    groups.push({ kind: "explanation", body: extractExplanation(block.text) });
  }
  return groups;
}

function parseGlossary(text: string): GlossaryItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const cleaned = line.replace(/^\d+\s*[\)\.]?\s*/, "");
      const eqIndex = cleaned.indexOf("=");
      if (eqIndex === -1) return { term: cleaned, meaning: "" };
      return {
        term: cleaned.slice(0, eqIndex).trim(),
        meaning: cleaned.slice(eqIndex + 1).trim(),
      };
    });
}

function extractExplanation(text: string): string {
  const lines = text.split("\n");
  const first = lines[0]?.trim() ?? "";
  if (/^mafhoom\s*[:\-]*\s*$/i.test(first)) {
    return lines.slice(1).join("\n").trim();
  }
  return text.trim();
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  backText: {
    fontSize: 22,
    color: colors.ivory,
    lineHeight: 24,
    marginTop: -2,
  },
  topBarCenter: {
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.gold,
    letterSpacing: 0.5,
  },
  sectionChip: {
    marginTop: 3,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(201, 168, 76, 0.15)",
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  sectionChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.goldLight,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  titleSection: {
    alignItems: "center",
    marginVertical: spacing.md,
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
    fontSize: 22,
    lineHeight: 38,
    color: colors.white,
    textAlign: "center",
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
  },
  blocks: {
    gap: spacing.md,
  },
  verseCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
  },
  verseLine: {
    fontSize: 17,
    lineHeight: 28,
    color: colors.white,
    textAlign: "center",
    fontWeight: "400",
  },
  verseLineNext: {
    marginTop: 2,
  },
  glossaryCard: {
    backgroundColor: "rgba(201, 168, 76, 0.08)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
  },
  glossaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  glossaryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.gold,
    marginHorizontal: spacing.sm,
    opacity: 0.6,
  },
  glossaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.goldLight,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  glossaryItems: {
    gap: spacing.xs,
  },
  glossaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  glossaryTerm: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: "700",
  },
  glossaryEqual: {
    color: colors.gray500,
    fontSize: 13,
  },
  glossaryMeaning: {
    flex: 1,
    color: colors.ivory,
    fontSize: 13,
    lineHeight: 20,
  },
  explanationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  explanationHeader: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201, 168, 76, 0.4)",
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  explanationText: {
    color: colors.ivory,
    fontSize: 15,
    lineHeight: 26,
  },
  bottomSpacer: {
    height: 40,
  },
});