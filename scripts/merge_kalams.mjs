/**
 * Merges per-language kalam files (ro/, en/, ur/, hn/) into single files
 * keyed by a universal slug (Ro slug without prefix).
 *
 * Run: node scripts/merge_kalams.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "..", "src", "data");

// ── Ro ↔ En mapping (from gen_youtube_map.js) ──
// Maps ro-{slug} → en-{slug} for poems where slugs differ.
// Poems with matching base slugs are auto-paired.
const RO_TO_EN = {
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

// Poems where Ro and En slugs match exactly (auto-paired)
const SAME_SLUG = [
  "ambia-ko-bhi-ajal-aani-hai",
  "imaan-e-qaal-e-mustafa-ee",
  "kaabe-ke-badrud-duja",
  "lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale",
  "milk-e-khaas-e-kibriya",
  "mustafa-jaan-e-rahmat-pe-laakhoñ-salaam",
  "mustafa-khayr-ul-wara-ho",
  "nazar-ek-chaman-se-do-chaar-hai",
  "sar-soo-e-rauza-jhuka-phir-tujh-ko-kya",
  "wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya",
  "zameen-o-zamaan-tumhaare-liye",
  "zarre-jhar-kar-teri-pezaaron-ke",
  "badal-ya-fard-jo-kaamil-hai-ya-ghaus",
  "jo-tera-tifl-hai-kaamil-hai-ya-ghaus",
  "talab-ka-munh-to-kis-qaabil-hai-ya-ghaus",
  "tera-zarrah-mah-e-kaamil-hai-ya-ghaus",
  "rubaiyaat-poetic-quatrains",
  "arsh-e-haq-hai-masnad-e-rifat-rasoolullah-ki",
  "milk-e-khaas-e-kibriya",
];

// ── Helper: read a .ts kalam file ──
function parseKalamFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  const extract = (key) => {
    const re = new RegExp(`${key}:\\s*(\"[^\"]*\"|\\[[\\s\\S]*?\\]|null|true|false|\\d+)`);
    const m = code.match(re);
    if (!m) return undefined;
    let val = m[1].trim();
    if (val === "null" || val === "undefined") return null;
    // Try to parse as JSON (string or array)
    if (val.startsWith('"')) return JSON.parse(val);
    if (val.startsWith("[")) return JSON.parse(val);
    return val;
  };

  const extractStr = (key) => {
    const re = new RegExp(`${key}:\\s*\"([^\"]*)\"`);
    const m = code.match(re);
    return m ? m[1] : "";
  };

  const extractArr = (key) => {
    // Extract array content between [ and ]
    const re = new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`, "m");
    const m = code.match(re);
    if (!m) return [];
    const raw = m[1].trim();
    if (!raw) return [];
    // Simple parsing: split by { ... } groups
    const items = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (raw[i] === "}") {
        depth--;
        if (depth === 0 && start >= 0) {
          items.push(raw.slice(start, i + 1));
          start = -1;
        }
      }
    }
    return items;
  };

  return {
    id: extractStr("id"),
    poetId: extractStr("poetId"),
    poetName: extractStr("poetName"),
    poetNameRo: extractStr("poetNameRo"),
    poetNameEn: extractStr("poetNameEn"),
    titleUr: extractStr("titleUr"),
    titleRo: extractStr("titleRo"),
    titleEn: extractStr("titleEn"),
    titleHi: extractStr("titleHi"),
    rawVersesRo: extractArr("versesRo"),
    rawVersesEn: extractArr("versesEn"),
    rawVersesUr: extractArr("versesUr"),
    rawVersesHi: extractArr("versesHi"),
  };
}

function buildRoToEnLookup() {
  const lookup = {};
  for (const [roId, enId] of Object.entries(RO_TO_EN)) {
    const slug = roId.replace("ro-", "");
    lookup[slug] = enId ? enId.replace("en-", "") : null;
  }
  // Auto-pair same-slug poems
  for (const slug of SAME_SLUG) {
    if (!lookup[slug]) lookup[slug] = slug;
  }
  return lookup;
}

function generateMergedFile(roFile, enFile, slug) {
  const ro = roFile ? parseKalamFile(roFile) : null;
  const en = enFile ? parseKalamFile(enFile) : null;

  const lines = [];
  lines.push('import type { Kalam } from "@/src/types";');
  lines.push("");

  // ── Verses ──
  const roVerses = ro?.rawVersesRo || [];
  const enVerses = en?.rawVersesEn || [];
  const urVerses = ro?.rawVersesUr || [];
  const hiVerses = ro?.rawVersesHi || [];

  // Build arrays of verse objects inline
  const allVersesRo = roVerses.length > 0 ? roVerses : en?.rawVersesRo || [];
  const allVersesEn = enVerses;
  const allVersesUr = urVerses;
  const allVersesHi = hiVerses;

  const titleUr = en?.titleUr || ro?.titleUr || "";
  const titleRo = ro?.titleRo || en?.titleRo || "";
  const titleEn = en?.titleEn || ro?.titleEn || "";
  const titleHi = en?.titleHi || ro?.titleHi || "";

  const poetName = ro?.poetName || en?.poetName || "امام احمد رضا خان";
  const poetNameRo = ro?.poetNameRo || en?.poetNameRo || "Imam Ahmed Raza Khan";
  const poetNameEn = ro?.poetNameEn || en?.poetNameEn || "Imam Ahmed Raza Khan";

  lines.push("const kalam: Kalam = {");
  lines.push(`  id: "${slug}",`);
  lines.push(`  poetId: "alahazrat",`);
  lines.push(`  poetName: "${poetName}",`);
  lines.push(`  poetNameRo: "${poetNameRo}",`);
  lines.push(`  poetNameEn: "${poetNameEn}",`);
  lines.push(`  titleUr: ${JSON.stringify(titleUr)},`);
  lines.push(`  titleRo: ${JSON.stringify(titleRo)},`);
  lines.push(`  titleEn: ${JSON.stringify(titleEn)},`);
  lines.push(`  titleHi: ${JSON.stringify(titleHi)},`);

  // versesRo
  lines.push(`  versesRo: ${allVersesRo.length > 0 ? `[\n${allVersesRo.map((v) => `    ${v}`).join(",\n")}\n  ]` : "[]"},`);
  // versesEn
  lines.push(`  versesEn: ${allVersesEn.length > 0 ? `[\n${allVersesEn.map((v) => `    ${v}`).join(",\n")}\n  ]` : "[]"},`);
  // versesUr
  lines.push(`  versesUr: ${allVersesUr.length > 0 ? `[\n${allVersesUr.map((v) => `    ${v}`).join(",\n")}\n  ]` : "[]"},`);
  // versesHi
  lines.push(`  versesHi: ${allVersesHi.length > 0 ? `[\n${allVersesHi.map((v) => `    ${v}`).join(",\n")}\n  ]` : "[]"},`);

  lines.push("};");
  lines.push("");
  lines.push("export default kalam;");
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const roDir = path.join(DATA, "ro");
  const enDir = path.join(DATA, "en");
  const urDir = path.join(DATA, "ur");
  const hnDir = path.join(DATA, "hn");
  const mergedDir = path.join(DATA, "merged");

  // Clean and create merged directory
  if (fs.existsSync(mergedDir)) {
    fs.rmSync(mergedDir, { recursive: true });
  }
  fs.mkdirSync(mergedDir, { recursive: true });

  const roToEn = buildRoToEnLookup();

  // ── Volume 2: Merge Ro + En ──
  const roFiles = fs.readdirSync(roDir).filter((f) => f.endsWith(".ts"));
  let merged = 0;

  for (const roFile of roFiles) {
    const slug = roFile.replace(/\.ts$/, "").replace(/^ro-/, "");
    const enSlug = roToEn[slug];
    const roPath = path.join(roDir, roFile);
    let enPath = null;

    if (enSlug) {
      const enFile = `en-${enSlug}.ts`;
      const ep = path.join(enDir, enFile);
      if (fs.existsSync(ep)) enPath = ep;
    }

    // Also check if same-base En file exists
    const sameBaseEnFile = `en-${slug}.ts`;
    const sameBaseEnPath = path.join(enDir, sameBaseEnFile);
    if (!enPath && fs.existsSync(sameBaseEnPath)) enPath = sameBaseEnPath;

    const content = generateMergedFile(roPath, enPath, slug);
    const outPath = path.join(mergedDir, `${slug}.ts`);
    fs.writeFileSync(outPath, content);
    merged++;
    console.log(`  ${slug} ${enPath ? "✓ (Ro+En)" : "✓ (Ro only)"}`);
  }

  // ── Volume 1: Merge Ur + Hn ──
  const urFiles = fs.readdirSync(urDir).filter((f) => f.endsWith(".ts"));
  for (const urFile of urFiles) {
    const slug = urFile.replace(/\.ts$/, "").replace(/^ur-/, "");
    const urPath = path.join(urDir, urFile);
    const hnFile = `hn-${slug}.ts`;
    const hnPath = path.join(hnDir, hnFile);

    const ur = parseKalamFile(urPath);
    let hn = null;
    if (fs.existsSync(hnPath)) hn = parseKalamFile(hnPath);

    const lines = [];
    lines.push('import type { Kalam } from "@/src/types";');
    lines.push("");
    lines.push("const kalam: Kalam = {");
    lines.push(`  id: "${slug}",`);
    lines.push(`  poetId: "alahazrat",`);
    lines.push(`  poetName: "${ur.poetName}",`);
    lines.push(`  poetNameRo: "${ur.poetNameRo}",`);
    lines.push(`  poetNameEn: "${ur.poetNameEn}",`);
    lines.push(`  titleUr: ${JSON.stringify(ur.titleUr)},`);
    lines.push(`  titleRo: ${JSON.stringify(ur.titleRo)},`);
    lines.push(`  titleEn: ${JSON.stringify(ur.titleEn)},`);
    lines.push(`  titleHi: ${JSON.stringify(hn?.titleHi || "")},`);

    const urVerses = ur.rawVersesUr || [];
    const hnVerses = hn?.rawVersesHi || [];

    lines.push(`  versesRo: [],`);
    lines.push(`  versesEn: [],`);
    lines.push(`  versesUr: ${urVerses.length > 0 ? `[\n${urVerses.map((v) => `    ${v}`).join(",\n")}\n  ]` : "[]"},`);
    lines.push(`  versesHi: ${hnVerses.length > 0 ? `[\n${hnVerses.map((v) => `    ${v}`).join(",\n")}\n  ]` : "[]"},`);

    lines.push("};");
    lines.push("");
    lines.push("export default kalam;");
    lines.push("");

    const outPath = path.join(mergedDir, `${slug}.ts`);
    fs.writeFileSync(outPath, lines.join("\n"));
    merged++;
    console.log(`  ${slug} ✓ (Ur+Hn)`);
  }

  console.log(`\nMerged ${merged} poems into ${mergedDir}`);
}

main().catch(console.error);
