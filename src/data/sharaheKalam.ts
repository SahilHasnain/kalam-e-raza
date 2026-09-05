/** Sharah section number (in assets/sharahe-kalaame-raza-roman-urdu.db) → app kalam id. */
export const SHARAH_KALAM_MAP: Record<number, string> = {
  1: "pesh-e-haq-muzhda-shafaat-ka-sunaate-jaa-enge",
  2: "chamak-tujh-se-paate-hain-sab-paane-waale",
  3: "kalam-7",
  4: "kalam-15",
  5: "kalam-21",
  6: "kalam-25",
  7: "kalam-36",
  8: "kalam-24",
  9: "sab-se-awla-o-aala-hamaara-nabi",
  10: "sunte-hain-ke-mahshar-me",
  11: "kalam-29",
  12: "kalam-28",
  13: "kalam-30",
  14: "arsh-e-haq-hai-masnad-e-rifat-rasoolullah-ki",
  15: "sarwar-kahun-ke-malik-o-maula-kahun-tujhe",
  16: "zarre-jhar-kar-teri-pezaaron-ke",
  17: "zameen-o-zamaan-tumhaare-liye",
  18: "kalam-3",
  19: "utha-do-parda-dikha-do-chehra",
  20: "waah-kya-jood-o-karam",
  21: "wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya",
  22: "kalam-16",
  23: "muzhdah-baad-ay-aasiyo-shafee-shah-e-abraar-hai",
  24: "dil-ko-un-se-khuda-juda-na-kare",
  25: "kalam-71",
};

const SHARAH_SECTION_BY_KALAM: Record<string, number> = Object.fromEntries(
  Object.entries(SHARAH_KALAM_MAP).map(([section, kalamId]) => [kalamId, Number(section)]),
);

/** Returns the sharah section number for a kalam id, or null if none exists. */
export function getSharahSectionId(kalamId: string): number | null {
  return SHARAH_SECTION_BY_KALAM[kalamId] ?? null;
}