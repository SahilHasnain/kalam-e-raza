import { View, Text, ScrollView, Pressable, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { kalams } from "@/src/data";
import type { Sher } from "@/src/types";
import { useFavorites } from "@/src/contexts/FavoritesContext";
import { colors, spacing, borderRadius } from "@/src/constants/theme";
import { useT } from "@/src/hooks/useT";
import { useKalamText } from "@/src/hooks/useKalamText";
import { useLang } from "@/src/contexts/LangContext";

const PAGE_H_PADDING = 44;
const SHER_GAP_WITHIN = 2;
const SHER_GAP_BETWEEN = 28;

/** Group flat misra array into paired she'rs. */
function toShers(misras: string[]): Sher[] {
  const shes: Sher[] = [];
  for (let i = 0; i < misras.length; i += 2) {
    shes.push({
      misra1: misras[i],
      misra2: misras[i + 1] ?? "",
    });
  }
  return shes;
}

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
      <View
        style={{
          flex: 1,
          backgroundColor: colors.cream,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, color: colors.gray500 }}>
          {_("kalamNotFound")}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary, marginTop: 16, fontWeight: "600" }}>
            {_("goBack")}
          </Text>
        </Pressable>
      </View>
    );
  }

  const favorited = isFavorite(kalam.id);
  const misras = verses(kalam);
  const shes = toShers(misras);
  const isRtl = lang === "ur" || lang === "hi";
  const sherCount = shes.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Header bar */}
      <View
        style={{
          backgroundColor: colors.cream,
          paddingTop: 56,
          paddingBottom: spacing.sm,
          paddingHorizontal: PAGE_H_PADDING,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray200,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={{ fontSize: 18, color: colors.primary }}>←</Text>
          </Pressable>
          <Pressable onPress={() => toggleFavorite(kalam.id)} hitSlop={16}>
            <Text
              style={{
                fontSize: 22,
                color: favorited ? colors.favorite : colors.gray400,
              }}
            >
              {favorited ? "♥" : "♡"}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: PAGE_H_PADDING,
          paddingTop: spacing["2xl"],
          paddingBottom: 80,
        }}
      >
        {/* Title / heading */}
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              fontSize: 20,
              lineHeight: 34,
              color: colors.primary,
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            {kalam.titleRo || title(kalam)}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.gray400,
              textAlign: "center",
              marginTop: spacing.xs,
            }}
          >
            {poetName(kalam)} · {sherCount}{" "}
            {lang === "ur"
              ? "اشعار"
              : lang === "hi"
                ? "अश'आर"
                : "She'rs"}
          </Text>
        </View>

        {/* She'rs card */}
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.xl,
            paddingVertical: spacing["2xl"],
            paddingHorizontal: spacing.xl,
            borderWidth: 1,
            borderColor: colors.gray200,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          {shes.map((sher, si) => (
            <View
              key={si}
              style={{
                marginBottom: si < shes.length - 1 ? SHER_GAP_BETWEEN : 0,
              }}
            >
              {si > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: SHER_GAP_BETWEEN - SHER_GAP_WITHIN,
                  }}
                >
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.gold,
                      opacity: 0.3,
                      width: 40,
                    }}
                  />
                </View>
              )}

              <Text
                style={{
                  fontSize: 24,
                  lineHeight: 46,
                  color: "#2C1810",
                  textAlign: "center",
                  writingDirection: isRtl ? "rtl" : "ltr",
                  marginBottom: SHER_GAP_WITHIN,
                }}
              >
                {sher.misra1}
              </Text>
              {sher.misra2 ? (
                <Text
                  style={{
                    fontSize: 24,
                    lineHeight: 46,
                    color: "#2C1810",
                    textAlign: "center",
                    writingDirection: isRtl ? "rtl" : "ltr",
                  }}
                >
                  {sher.misra2}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* Sher counter */}
        <Text
          style={{
            fontSize: 12,
            color: colors.gray400,
            textAlign: "center",
            marginTop: spacing.lg,
          }}
        >
          {sherCount}{" "}
          {lang === "ur"
            ? "اشعار"
            : lang === "hi"
              ? "अश'आर"
              : "She'rs"}
        </Text>

        {/* Share */}
        <Pressable
          onPress={async () => {
            const sherText = shes
              .map((s) => [s.misra1, s.misra2].filter(Boolean).join("\n"))
              .join("\n\n");
            await Share.share({
              message: `${title(kalam)}\n\n${sherText}\n\n— ${poetName(kalam)}`,
            });
          }}
          style={{
            backgroundColor: colors.primary,
            borderRadius: borderRadius.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing["2xl"],
            alignItems: "center",
            alignSelf: "center",
            marginTop: spacing["2xl"],
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.white }}>
            {_("shareThisKalam")}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
