import { useLang } from "@/src/contexts/LangContext";
import type { Kalam, Sher } from "@/src/types";

export function useKalamText() {
  const { lang } = useLang();

  function title(kalam: Kalam): string {
    switch (lang) {
      case "ur": return kalam.titleUr;
      case "hi": return kalam.titleHi ?? kalam.titleUr;
      case "ro": return kalam.titleRo;
      case "en": return kalam.titleEn ?? kalam.titleRo;
    }
  }

  function verses(kalam: Kalam): Sher[] {
    switch (lang) {
      case "ur": return kalam.versesUr ?? [];
      case "hi": return (kalam.versesHi ?? []).map((s) => s.hi);
      case "ro": return kalam.versesRo ?? [];
      case "en": return (kalam.versesEn ?? []).map((s) => s.en);
    }
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
