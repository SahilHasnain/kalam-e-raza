export type Lang = "ur" | "hi" | "ro" | "en";

/** A single misra (verse line). */
export type Misra = string;

/** A sher (couplet): two misras. */
export type Sher = {
  m1: Misra;
  m2: Misra;
};

/** A sher with both Roman Urdu source and English translation. */
export type SherEn = {
  ro: Sher;
  en: Sher;
};

export type Kalam = {
  id: string;
  poetId: string;
  poetName: string;
  poetNameRo: string;
  poetNameEn: string;
  titleUr: string;
  titleRo: string;
  titleHi?: string;
  titleEn?: string;
  /** Urdu: flat misras (paired at render time). */
  versesUr: string[];
  /** Roman Urdu: shers with explicit m1/m2. */
  versesRo?: Sher[];
  versesHi?: string[];
  /** English: shers with Ro source + En translation. */
  versesEn?: SherEn[];
};
