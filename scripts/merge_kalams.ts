/**
 * Merges per-language kalam files into single files with universal IDs.
 *
 * Run: npx tsx scripts/merge_kalams.ts
 */

import fs from "fs";
import path from "path";
import type { Kalam } from "@/src/types";

const DATA = path.join(__dirname, "..", "src", "data");
const OUT = path.join(DATA, "merged");

// ── Ro ↔ En mapping (from gen_youtube_map.js) ──
// For poems where slugs differ between Ro and En.
const RO_TO_EN: Record<string, string | null> = {
  "ro-aankhen-ro-ro-ke-sujaane-waale": "en-o-you-whose-eyes-have-become-swollen-due-to-weeping",
  "ro-allah-allah-ke-nabi-se": null,
  "ro-andheri-raat-hai-gham-ki-ghata": "en-it-is-a-dark-and-anxious-night-black-clouds-of-sins-are-looming",
  "ro-arsh-e-haq-hai-masnad-e-rifat-rasoolullah-ki": "en-the-exalted-arsh-of-allah",
  "ro-arsh-ki-aql-dang-hai-charkh-me-aasmaan-hai": "en-the-wit-of-the-arsh-is-perplexed-dizzily-the-sky-is-spinning",
  "ro-bheeni-suhaani-subh": "en-in-the-pleasantly-sweet-morning-breeze-tranquil-the-heart-is-feeling",
  "ro-chamak-tujh-se-paate-hain-sab-paane-waale": "en-from-you-all-the-radiant-ones-acquire-their-illumination",
  "ro-dil-ko-un-se-khuda-juda-na-kare": "en-o-allah-from-him-never-allow-my-heart-to-be-separated",
  "ro-dushman-e-ahmad-pe-shiddat-kijiye": "en-over-the-enemies-of-nabi-ahmad-adopt-strictness",
  "ro-gunahgaaron-ko-haatif-se-naweed-e-khush-ma-aali-hai": "en-an-unseen-angel-gave-glad-tidings-to-the-sinful-of-a-blissful-ending",
  "ro-hirz-e-jaan-zikr-e-shafaat-kijiye": "en-more-valuable-than-life-itself-mention-his-intercession",
  "ro-imaan-e-qaal-e-mustafa-ee": "en-imaan-e-qaal-e-mustafa-ee",
  "ro-kaabe-ke-badrud-duja": "en-kaabe-ke-badrud-duja",
  "ro-kis-ke-jalwe-ki-jhalak-hai": "en-whos-flash-of-radiance-is-this-what-is-this-brightness-we-are-witnessing",
  "ro-kya-mahakte-hain-mahakne-waale": "en-what-a-beautiful-fragrance-the-most-fragrant-one-is-emitting",
  "ro-lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale": "en-lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale",
  "ro-momin-wo-hai-jo-un-ki-izzat-pe-mare-dil-se": "en-a-true-believer-is-sacrificed-upon-the-nabis-honour",
  "ro-mustafa-jaan-e-rahmat-pe-laakhoñ-salaam": "en-mustafa-jaan-e-rahmat-pe-laakhoñ-salaam",
  "ro-mustafa-khayr-ul-wara-ho": "en-mustafa-khayr-ul-wara-ho",
  "ro-muzhdah-baad-ay-aasiyo-shafee-shah-e-abraar-hai": "en-glad-tidings-to-you-o-sinners-of-the-most-pious-your-intercessor-is-the-king",
  "ro-na-arsh-e-aiman": "en-neither-like-the-arsh-is-the-valley-of-aiman",
  "ro-nabi-sarwar-e-har-rasool-o-wali-hai": "en-the-greatest-leader-and-king-of-every-rasool-and-wali-is-my-beloved-nabi",
  "ro-nazar-ek-chaman-se-do-chaar-hai": "en-nazar-ek-chaman-se-do-chaar-hai",
  "ro-pesh-e-haq-muzhda-shafaat-ka-sunaate-jaa-enge": "en-from-allahs-court-glad-tidings-of-intercession",
  "ro-qaafile-ne-soo-e-taiba-kamar-aaraa-ee-ki": "en-while-to-journey-towards-taiba",
  "ro-raah-pur-khaar-hai-kya-hona-hai": "en-the-path-is-so-full-of-thorns-now-what-will-happen",
  "ro-ronaak-e-bazm-e-jahaan-hai-aashiqaan-e-sokhta": "en-the-glow-of-all-the-worlds-assemblies",
  "ro-sab-se-awla-o-aala-hamaara-nabi": "en-the-greatest-and-most-exalted-is-our-nabi",
  "ro-sarwar-kahun-ke-malik-o-maula-kahun-tujhe": "en-shall-i-refer-to-you-as-the-ruler-or-as-my-master-and-king-shall-i-refer-to-you",
  "ro-shukr-e-khuda-ke-aaj-ghari-us-safar-ki-hai": "en-praise-be-to-allah-the-day-of-that-momentous-journey-has-arrived",
  "ro-soona-jangal-raat-andheri": "en-in-a-deserted-wilderness-on-a-dark-night-dark-clouds-are-hanging",
  "ro-subh-taiba-me-huwi-batta-hai-baara-noor-ka": "en-at-the-break-of-dawn-in-madina-distributed-are-alms-of-light",
  "ro-sunte-hain-ke-mahshar-me": "en-we-are-hearing-that-on-the-day-of-reckoning",
  "ro-utha-do-parda-dikha-do-chehra": "en-please-raise-your-veil-and-reveal-your-sacred-face",
  "ro-wo-sarwar-e-kishwar-e-risaalat": null,
  "ro-wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya": "en-wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya",
  "ro-ya-ilaahi-rahm-farma-mustafa-ke-waaste": "en-for-the-sake-of-mustafa-your-chosen-nabi",
  "ro-zameen-o-zamaan-tumhaare-liye": "en-zameen-o-zamaan-tumhaare-liye",
  "ro-zarre-jhar-kar-teri-pezaaron-ke": "en-zarre-jhar-kar-teri-pezaaron-ke",
  "ro-ambia-ko-bhi-ajal-aani-hai": "en-ambia-ko-bhi-ajal-aani-hai",
};

// Poems where Ro slug and En slug are identical (same base)
const SAME_SLUG_BASES = new Set([
  "ambia-ko-bhi-ajal-aani-hai",
  "badal-ya-fard-jo-kaamil-hai-ya-ghaus",
  "arsh-e-haq-hai-masnad-e-rifat-rasoolullah-ki",
  "imaan-e-qaal-e-mustafa-ee",
  "jo-tera-tifl-hai-kaamil-hai-ya-ghaus",
  "kaabe-ke-badrud-duja",
  "lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale",
  "milk-e-khaas-e-kibriya",
  "mustafa-jaan-e-rahmat-pe-laakhoñ-salaam",
  "mustafa-khayr-ul-wara-ho",
  "nazar-ek-chaman-se-do-chaar-hai",
  "rubaiyaat-poetic-quatrains",
  "sar-soo-e-rauza-jhuka-phir-tujh-ko-kya",
  "talab-ka-munh-to-kis-qaabil-hai-ya-ghaus",
  "tera-zarrah-mah-e-kaamil-hai-ya-ghaus",
  "wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya",
  "zameen-o-zamaan-tumhaare-liye",
  "zarre-jhar-kar-teri-pezaaron-ke",
]);

function serArr(arr: any[], indent = 4): string {
  const sp = " ".repeat(indent);
  if (!arr || arr.length === 0) return "[]";
  return `[\n${arr.map((v) => `${sp}${JSON.stringify(v, null, 2).replace(/\n/g, "\n" + sp)}`).join(",\n")}\n${" ".repeat(indent - 2)}]`;
}

function merge(ro: Kalam | undefined, en: Kalam | undefined, slug: string): string {
  const titUr = ro?.titleUr || en?.titleUr || "";
  const titRo = ro?.titleRo || en?.titleRo || "";
  const titEn = en?.titleEn || ro?.titleEn || "";
  const titHi = ro?.titleHi || en?.titleHi || "";

  const pName = ro?.poetName || en?.poetName || "امام احمد رضا خان";
  const pNameRo = ro?.poetNameRo || en?.poetNameRo || "Imam Ahmed Raza Khan";
  const pNameEn = ro?.poetNameEn || en?.poetNameEn || "Imam Ahmed Raza Khan";

  const vRo = ro?.versesRo || [];
  const vEn = en?.versesEn || [];
  const vUr = ro?.versesUr || [];
  const vHi = en?.versesHi || [];

  return [
    'import type { Kalam } from "@/src/types";',
    "",
    "const kalam: Kalam = {",
    `  id: ${JSON.stringify(slug)},`,
    `  poetId: "alahazrat",`,
    `  poetName: ${JSON.stringify(pName)},`,
    `  poetNameRo: ${JSON.stringify(pNameRo)},`,
    `  poetNameEn: ${JSON.stringify(pNameEn)},`,
    `  titleUr: ${JSON.stringify(titUr)},`,
    `  titleRo: ${JSON.stringify(titRo)},`,
    `  titleEn: ${JSON.stringify(titEn)},`,
    `  titleHi: ${JSON.stringify(titHi)},`,
    `  versesRo: ${serArr(vRo, 4)},`,
    `  versesEn: ${serArr(vEn, 4)},`,
    `  versesUr: ${serArr(vUr, 4)},`,
    `  versesHi: ${serArr(vHi, 4)},`,
    "};",
    "",
    "export default kalam;",
    "",
  ].join("\n");
}

function mergeUrHn(ur: Kalam, hn: Kalam | undefined, slug: string): string {
  return [
    'import type { Kalam } from "@/src/types";',
    "",
    "const kalam: Kalam = {",
    `  id: ${JSON.stringify(slug)},`,
    `  poetId: "alahazrat",`,
    `  poetName: ${JSON.stringify(ur.poetName)},`,
    `  poetNameRo: ${JSON.stringify(ur.poetNameRo)},`,
    `  poetNameEn: ${JSON.stringify(ur.poetNameEn)},`,
    `  titleUr: ${JSON.stringify(ur.titleUr)},`,
    `  titleRo: ${JSON.stringify(ur.titleRo)},`,
    `  titleEn: ${JSON.stringify(ur.titleEn)},`,
    `  titleHi: ${JSON.stringify(hn?.titleHi || "")},`,
    "  versesRo: [],",
    "  versesEn: [],",
    `  versesUr: ${serArr(ur.versesUr ?? [], 4)},`,
    `  versesHi: ${serArr(hn?.versesHi ?? [], 4)},`,
    "};",
    "",
    "export default kalam;",
    "",
  ].join("\n");
}

async function main() {
  // Clean output dir
  if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });

  const roDir = path.join(DATA, "ro");
  const enDir = path.join(DATA, "en");
  const urDir = path.join(DATA, "ur");
  const hnDir = path.join(DATA, "hn");

  // Build lookup: ro-slug → en-slug
  const lookup: Record<string, string | null> = {};
  for (const [roId, enId] of Object.entries(RO_TO_EN)) {
    lookup[roId.replace("ro-", "")] = enId ? enId.replace("en-", "") : null;
  }
  for (const base of SAME_SLUG_BASES) {
    if (!lookup[base]) lookup[base] = base;
  }

  let count = 0;

  // ── Volume 2: Merge Ro + En ──
  for (const f of fs.readdirSync(roDir).filter((x) => x.endsWith(".ts"))) {
    const slug = f.replace(/\.ts$/, "").replace(/^ro-/, "");
    const roMod: { default: Kalam } = await import(`@/src/data/ro/${slug}`);
    const ro = roMod.default;

    let en: Kalam | undefined;
    const enSlug = lookup[slug];
    if (enSlug) {
      try {
        const enMod: { default: Kalam } = await import(`@/src/data/en/${enSlug}`);
        en = enMod.default;
      } catch {
        // try same-base En file
        try {
          const enMod: { default: Kalam } = await import(`@/src/data/en/${slug}`);
          en = enMod.default;
        } catch {}
      }
    } else {
      // still try same-base En file
      try {
        const enMod: { default: Kalam } = await import(`@/src/data/en/${slug}`);
        en = enMod.default;
      } catch {}
    }

    const content = merge(ro, en, slug);
    fs.writeFileSync(path.join(OUT, `${slug}.ts`), content);
    count++;
    process.stdout.write(`.`);
  }

  // ── Volume 1: Merge Ur + Hn ──
  for (const f of fs.readdirSync(urDir).filter((x) => x.endsWith(".ts"))) {
    const slug = f.replace(/\.ts$/, "").replace(/^ur-/, "");
    const urMod: { default: Kalam } = await import(`@/src/data/ur/${slug}`);
    const ur = urMod.default;

    let hn: Kalam | undefined;
    try {
      const hnMod: { default: Kalam } = await import(`@/src/data/hn/${slug}`);
      hn = hnMod.default;
    } catch {}

    const content = mergeUrHn(ur, hn, slug);
    const outPath = path.join(OUT, `${slug}.ts`);
    if (!fs.existsSync(outPath)) {
      fs.writeFileSync(outPath, content);
      count++;
      process.stdout.write(`.`);
    } else {
      console.log(`\n  Skipping ${slug} (already merged from Volume 2)`);
    }
  }

  console.log(`\nMerged ${count} poems → ${OUT}`);
}

main().catch(console.error);
