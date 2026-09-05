import { LangSwitcher } from "@/src/components/LangSwitcher";
import { NastaliqText } from "@/src/components/NastaliqText";
import { borderRadius, colors, spacing } from "@/src/constants/theme";
import { t } from "@/src/constants/translations";
import { useLang } from "@/src/contexts/LangContext";
import { getToc, searchSharah } from "@/src/db/database";
import type { BlockType, SearchResult, TocEntry } from "@/src/db/types";
import { useSQLiteContext } from "expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const BLOCK_LABEL: Record<BlockType, string> = {
  heading: "Heading",
  poem: "Verse",
  glossary: "Alfaz",
  glossary_item: "Words",
  explanation: "Meaning",
};

export default function SharahScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { lang } = useLang();
  const uiLang = lang === "ro" ? "en" : lang;

  const [toc, setToc] = useState<TocEntry[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    getToc(db)
      .then((rows) => {
        if (active) setToc(rows);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [db]);

  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const rows = await searchSharah(db, q);
      setResults(rows);
      setSearching(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, db]);

  const sectionTitles = useMemo(() => {
    const map = new Map<number, string>();
    toc.forEach((entry) => map.set(entry.sectionNo, entry.title));
    return map;
  }, [toc]);

  const isSearching = search.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
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
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.logo}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{t.sharahHeader[uiLang]}</Text>
              <Text style={styles.headerSubtitle}>{t.sharahSubtitle[uiLang]}</Text>
            </View>
          </View>
          <LangSwitcher />
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t.searchSharah[uiLang]}
            placeholderTextColor={colors.mist}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Text style={styles.searchClear}>✕</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      {isSearching ? (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.sectionNo}-${item.blockId}`}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            searching ? (
              <View style={styles.searchingWrap}>
                <ActivityIndicator color={colors.gold} />
              </View>
            ) : (
              <Text style={styles.resultsCount}>
                {results.length} {t.explanations[uiLang]}
              </Text>
            )
          }
          ListEmptyComponent={
            !searching ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  {t.noSharahFound[uiLang]}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/sharah/${item.sectionNo}`)}
              style={styles.searchCard}
            >
              <View style={styles.searchCardHeader}>
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>{BLOCK_LABEL[item.blockType]}</Text>
                </View>
                <Text style={styles.sectionTag}>Naat {item.sectionNo}</Text>
              </View>
              <Text style={styles.searchCardTitle} numberOfLines={2}>
                {sectionTitles.get(item.sectionNo)}
              </Text>
              <View style={styles.snippetWrap}>
                <Text style={styles.snippetText}>
                  {renderSnippet(item.snippet)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      ) : loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={toc}
          keyExtractor={(item) => String(item.sectionNo)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/sharah/${item.sectionNo}`)}
              style={styles.tocCard}
            >
              <View style={styles.tocBadge}>
                <Text style={styles.tocBadgeText}>{item.sectionNo}</Text>
              </View>
              <View style={styles.tocBody}>
                <NastaliqText style={styles.tocTitle} numberOfLines={3}>
                  {item.title}
                </NastaliqText>
                <View style={styles.tocFooter}>
                  <Text style={styles.tocMeta}>
                    {item.blockCount} {t.versesAndNotes[uiLang]}
                  </Text>
                  <Text style={styles.tocArrow}>›</Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function renderSnippet(snippet: string) {
  const tokens = snippet.split(/(\[[^\]]*\])/g);
  return tokens.map((token, i) =>
    token.startsWith("[") && token.endsWith("]") ? (
      <Text key={i} style={styles.snippetHighlight}>
        {token.slice(1, -1)}
      </Text>
    ) : (
      <Text key={i}>{token}</Text>
    ),
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    paddingTop: spacing["3xl"],
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: "hidden",
  },
  logo: {
    width: 37,
    height: 37,
    position: "absolute",
    left: -0.5,
    top: -0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.gold,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.goldLight,
    opacity: 0.85,
    marginTop: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    fontSize: 14,
    color: colors.white,
    paddingVertical: 0,
  },
  searchClear: {
    fontSize: 14,
    color: colors.goldLight,
  },
  listContent: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: 100,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tocCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  tocBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.35)",
  },
  tocBadgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.goldLight,
  },
  tocBody: {
    flex: 1,
    marginLeft: spacing.md,
  },
  tocTitle: {
    fontSize: 14,
    lineHeight: 24,
    color: colors.ivory,
    fontWeight: "500",
  },
  tocFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  tocMeta: {
    fontSize: 11,
    color: colors.gray400,
  },
  tocArrow: {
    fontSize: 18,
    color: colors.gold,
    opacity: 0.5,
  },
  searchingWrap: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
  },
  resultsCount: {
    color: colors.gray500,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray500,
    textAlign: "center",
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  searchCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  typePill: {
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  typePillText: {
    color: colors.goldLight,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTag: {
    color: colors.gray400,
    fontSize: 11,
    fontWeight: "600",
  },
  searchCardTitle: {
    color: colors.ivory,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  snippetWrap: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  snippetText: {
    color: colors.ivory,
    fontSize: 13,
    lineHeight: 20,
  },
  snippetHighlight: {
    color: colors.goldLight,
    fontWeight: "700",
  },
});