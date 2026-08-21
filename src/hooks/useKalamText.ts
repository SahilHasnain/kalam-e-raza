import { useLang } from "@/src/contexts/LangContext";
import type { Kalam, Sher } from "@/src/types";

/** Detects Arabic/Urdu script characters across Arabic Unicode blocks. */
const URDU_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function containsUrduScript(text: string): boolean {
  return URDU_SCRIPT.test(text);
}

export function useKalamText() {
  const { lang } = useLang();

  function title(kalam: Kalam): string {
    switch (lang) {
      case "ur": return kalam.titleUr || kalam.titleRo || kalam.titleEn || "";
      case "hi": return kalam.titleHi || kalam.titleUr || kalam.titleRo || kalam.titleEn || "";
      case "ro": return kalam.titleRo || kalam.titleUr || kalam.titleEn || "";
      case "en": return kalam.titleEn || kalam.titleRo || kalam.titleUr || "";
    }
  }

  function verses(kalam: Kalam): Sher[] {
    const pref = (() => {
      switch (lang) {
        case "ur": return kalam.versesUr;
        case "hi": return kalam.versesHi?.map((s) => s.hi);
        case "ro": return kalam.versesRo;
        case "en": return kalam.versesEn;
      }
    })();
    if (pref?.length) return pref;
    if (kalam.versesRo?.length) return kalam.versesRo;
    if (kalam.versesEn?.length) return kalam.versesEn;
    if (kalam.versesUr?.length) return kalam.versesUr;
    return kalam.versesHi?.map((s) => s.hi) ?? [];
  }

  function poetName(kalam: Kalam): string {
    switch (lang) {
      case "ur": return kalam.poetName;
      case "hi": return kalam.poetName;
      case "ro": return kalam.poetNameRo;
      case "en": return kalam.poetNameEn;
    }
  }

  /**
   * True when the content that will actually render for this kalam is
   * Urdu script, regardless of the selected language. Urdu-only naats fall
   * back to Urdu text even in roman/english mode and must stay RTL.
   */
  function isRtl(kalam: Kalam): boolean {
    const firstLine = verses(kalam)[0]?.m1 ?? "";
    return containsUrduScript(title(kalam)) || containsUrduScript(firstLine);
  }

  /**
   * False when the selected language has no authored text for this kalam,
   * meaning it would render as raw Urdu script. Used to hide Urdu-only
   * naats from lists while browsing in roman/english mode.
   */
  function availableInLang(kalam: Kalam): boolean {
    if (lang === "ur" || lang === "hi") return true;
    return !isRtl(kalam);
  }

  return { title, verses, poetName, isRtl, availableInLang };
}
