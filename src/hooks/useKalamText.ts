import { useLang } from "@/src/contexts/LangContext";
import type { Kalam, Sher } from "@/src/types";

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
        case "en": return kalam.versesEn?.map((s) => s.en);
      }
    })();
    if (pref?.length) return pref;
    if (kalam.versesRo?.length) return kalam.versesRo;
    if (kalam.versesEn?.length) return kalam.versesEn.map((s) => s.en);
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

  return { title, verses, poetName };
}
