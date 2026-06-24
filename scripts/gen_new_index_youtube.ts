/**
 * Regenerates src/data/index.ts and src/data/youtube.ts for merged kalam files.
 *
 * Run: npx tsx scripts/gen_new_index_youtube.ts
 */

import fs from "fs";
import path from "path";

const DATA = path.join(__dirname, "..", "src", "data");
const MERGED = path.join(DATA, "merged");
const OLD_YOUTUBE = path.join(DATA, "youtube.ts");
const OLD_INDEX = path.join(DATA, "index.ts");

// ── Old YouTube key → universal slug mapping ──
// Strips ro-/en-/ur-/hn- prefix to get the universal slug.
// For En slugs that differ from Ro slugs, we also need the Ro→En mapping
// from gen_youtube_map.js / merge_kalams.ts.
const RO_TO_EN: Record<string, string | null> = {
  "aankhen-ro-ro-ke-sujaane-waale": "o-you-whose-eyes-have-become-swollen-due-to-weeping",
  "allah-allah-ke-nabi-se": null,
  "andheri-raat-hai-gham-ki-ghata": "it-is-a-dark-and-anxious-night-black-clouds-of-sins-are-looming",
  "arsh-e-haq-hai-masnad-e-rifat-rasoolullah-ki": "the-exalted-arsh-of-allah",
  "arsh-ki-aql-dang-hai-charkh-me-aasmaan-hai": "the-wit-of-the-arsh-is-perplexed-dizzily-the-sky-is-spinning",
  "bheeni-suhaani-subh": "in-the-pleasantly-sweet-morning-breeze-tranquil-the-heart-is-feeling",
  "chamak-tujh-se-paate-hain-sab-paane-waale": "from-you-all-the-radiant-ones-acquire-their-illumination",
  "dil-ko-un-se-khuda-juda-na-kare": "o-allah-from-him-never-allow-my-heart-to-be-separated",
  "dushman-e-ahmad-pe-shiddat-kijiye": "over-the-enemies-of-nabi-ahmad-adopt-strictness",
  "gunahgaaron-ko-haatif-se-naweed-e-khush-ma-aali-hai": "an-unseen-angel-gave-glad-tidings-to-the-sinful-of-a-blissful-ending",
  "hirz-e-jaan-zikr-e-shafaat-kijiye": "more-valuable-than-life-itself-mention-his-intercession",
  "imaan-e-qaal-e-mustafa-ee": "imaan-e-qaal-e-mustafa-ee",
  "kaabe-ke-badrud-duja": "kaabe-ke-badrud-duja",
  "kis-ke-jalwe-ki-jhalak-hai": "whos-flash-of-radiance-is-this-what-is-this-brightness-we-are-witnessing",
  "kya-mahakte-hain-mahakne-waale": "what-a-beautiful-fragrance-the-most-fragrant-one-is-emitting",
  "lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale": "lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale",
  "momin-wo-hai-jo-un-ki-izzat-pe-mare-dil-se": "a-true-believer-is-sacrificed-upon-the-nabis-honour",
  "mustafa-jaan-e-rahmat-pe-laakhoñ-salaam": "mustafa-jaan-e-rahmat-pe-laakhoñ-salaam",
  "mustafa-khayr-ul-wara-ho": "mustafa-khayr-ul-wara-ho",
  "muzhdah-baad-ay-aasiyo-shafee-shah-e-abraar-hai": "glad-tidings-to-you-o-sinners-of-the-most-pious-your-intercessor-is-the-king",
  "na-arsh-e-aiman": "neither-like-the-arsh-is-the-valley-of-aiman",
  "nabi-sarwar-e-har-rasool-o-wali-hai": "the-greatest-leader-and-king-of-every-rasool-and-wali-is-my-beloved-nabi",
  "nazar-ek-chaman-se-do-chaar-hai": "nazar-ek-chaman-se-do-chaar-hai",
  "pesh-e-haq-muzhda-shafaat-ka-sunaate-jaa-enge": "from-allahs-court-glad-tidings-of-intercession",
  "qaafile-ne-soo-e-taiba-kamar-aaraa-ee-ki": "while-to-journey-towards-taiba",
  "raah-pur-khaar-hai-kya-hona-hai": "the-path-is-so-full-of-thorns-now-what-will-happen",
  "ronaak-e-bazm-e-jahaan-hai-aashiqaan-e-sokhta": "the-glow-of-all-the-worlds-assemblies",
  "sab-se-awla-o-aala-hamaara-nabi": "the-greatest-and-most-exalted-is-our-nabi",
  "sarwar-kahun-ke-malik-o-maula-kahun-tujhe": "shall-i-refer-to-you-as-the-ruler-or-as-my-master-and-king-shall-i-refer-to-you",
  "shukr-e-khuda-ke-aaj-ghari-us-safar-ki-hai": "praise-be-to-allah-the-day-of-that-momentous-journey-has-arrived",
  "soona-jangal-raat-andheri": "in-a-deserted-wilderness-on-a-dark-night-dark-clouds-are-hanging",
  "subh-taiba-me-huwi-batta-hai-baara-noor-ka": "at-the-break-of-dawn-in-madina-distributed-are-alms-of-light",
  "sunte-hain-ke-mahshar-me": "we-are-hearing-that-on-the-day-of-reckoning",
  "utha-do-parda-dikha-do-chehra": "please-raise-your-veil-and-reveal-your-sacred-face",
  "wo-sarwar-e-kishwar-e-risaalat": null,
  "wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya": "wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya",
  "ya-ilaahi-rahm-farma-mustafa-ke-waaste": "for-the-sake-of-mustafa-your-chosen-nabi",
  "zameen-o-zamaan-tumhaare-liye": "zameen-o-zamaan-tumhaare-liye",
  "zarre-jhar-kar-teri-pezaaron-ke": "zarre-jhar-kar-teri-pezaaron-ke",
  "ambia-ko-bhi-ajal-aani-hai": "ambia-ko-bhi-ajal-aani-hai",
};

// Old prefix → universal slug mapping
function keyToUniversal(oldKey: string): string | null {
  if (oldKey.startsWith("ro-")) return oldKey.slice(3);
  if (oldKey.startsWith("en-")) {
    const enSlug = oldKey.slice(3);
    // Find the Ro slug that maps to this En slug
    for (const [roSlug, enSlug2] of Object.entries(RO_TO_EN)) {
      if (enSlug2 === enSlug) return roSlug;
    }
    // Not found in mapping; maybe it IS a Ro slug (same base)
    // Check if there's a file in merged/ with this slug
    return enSlug; // Use directly
  }
  if (oldKey.startsWith("ur-")) return oldKey.slice(3);
  if (oldKey.startsWith("hn-")) return oldKey.slice(3);
  return null;
}

// ── Build list of merged slugs from actual files ──
const mergedSlugs = fs
  .readdirSync(MERGED)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => f.replace(/\.ts$/, ""));

// ── Parse old youtube.ts to extract entries ──
const oldYoutubeContent = fs.readFileSync(OLD_YOUTUBE, "utf-8");
const ytEntries: Record<string, string[]> = {};
const ytLineRe = /^\s+"([^"]+)":\s*\[([^\]]*)\]/gm;
let match: RegExpExecArray | null;
while ((match = ytLineRe.exec(oldYoutubeContent)) !== null) {
  const key = match[1];
  const vals = match[2]
    .split(",")
    .map((s) => s.trim().replace(/"/g, ""))
    .filter(Boolean);
  ytEntries[key] = vals;
}

// ── Build new youtube map ──
const newYt: Record<string, Set<string>> = {};
for (const [oldKey, videoIds] of Object.entries(ytEntries)) {
  const univ = keyToUniversal(oldKey);
  if (!univ || !mergedSlugs.includes(univ)) {
    console.log(`  Skipping ${oldKey} → ${univ} (not in merged)`);
    continue;
  }
  if (!newYt[univ]) newYt[univ] = new Set();
  for (const vid of videoIds) newYt[univ].add(vid);
}

// ── Write new youtube.ts ──
function sortVids(a: string, b: string) {
  // Sort by length then alphabetically for deterministic output
  return a.length - b.length || a.localeCompare(b);
}

const sortedYtKeys = Object.keys(newYt).sort();
const ytLines = sortedYtKeys
  .map((key) => {
    const vids = [...newYt[key]].sort(sortVids);
    const arr = vids.map((v) => `"${v}"`).join(",");
    return `  "${key}": [${arr}]`;
  })
  .join(",\n");

const newYtContent = [
  'import type { YoutubeMap } from "@/src/types";',
  "",
  "export const youtubeMap: YoutubeMap = {",
  ytLines,
  "};",
  "",
].join("\n");

fs.writeFileSync(OLD_YOUTUBE, newYtContent);
console.log(`Wrote ${sortedYtKeys.length} universal entries to ${OLD_YOUTUBE}`);

// ── Write new index.ts ──
const imports = mergedSlugs.map((slug) => {
  const varName = slug.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^(\d)/, "_$1");
  return `import ${varName} from "@/src/data/merged/${slug}";`;
});

const kalamArray = mergedSlugs.map((slug) => {
  const varName = slug.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^(\d)/, "_$1");
  return `  ${varName}`;
});

const newIndexContent = [
  'import type { Kalam } from "@/src/types";',
  "",
  imports.join("\n"),
  "",
  "export const kalams: Kalam[] = [",
  kalamArray.join(",\n"),
  "];",
  "",
  "",
].join("\n");

fs.writeFileSync(OLD_INDEX, newIndexContent);
console.log(`Wrote ${mergedSlugs.length} imports to ${OLD_INDEX}`);
