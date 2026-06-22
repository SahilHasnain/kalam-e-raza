import { useLang } from "@/src/contexts/LangContext";
import type { Kalam } from "@/src/types";

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

  function verses(kalam: Kalam): string[] {
    switch (lang) {
      case "ur": return kalam.versesUr;
      case "hi": return kalam.versesHi ?? kalam.versesUr;
      case "ro": return kalam.versesRo ?? kalam.versesUr;
      case "en": return kalam.versesEn ?? kalam.versesUr;
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
