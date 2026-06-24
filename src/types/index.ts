export type Lang = "ur" | "hi" | "ro" | "en";

/** Mapping from kalam ID to YouTube video ID(s). */
export type YoutubeMap = Record<string, string[]>;

/** A single misra (verse line). */
export type Misra = string;

/** A sher (couplet): two misras. */
export type Sher = {
  m1: Misra;
  m2: Misra;
};

/** A sher with Urdu source and Hindi transliteration. */
export type SherHi = {
  ur: Sher;
  hi: Sher;
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
  /** Urdu: shers with explicit m1/m2. */
  versesUr?: Sher[];
  /** Roman Urdu: shers with explicit m1/m2. */
  versesRo?: Sher[];
  versesHi?: SherHi[];
  /** English: shers with En translation. */
  versesEn?: Sher[];
};
