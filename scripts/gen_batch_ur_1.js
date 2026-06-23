import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const raw = fs.readFileSync(path.join(__dirname, "hadaiq_raw.txt"), "utf-8");
const lines = raw.split(/\r?\n/);

function isNonVerse(l) {
  const t = l.trim();
  if (!t) return true;
  if (/^--- PAGE \d+ ---/.test(t)) return true;
  if (/^\[\d+\]/.test(t)) return true;
  if (/^\d+\]$/.test(t)) return true;
  if (/^[\[\(]\d+/.test(t) && t.length < 10) return true;
  if (t.includes("الخ")) return true;
  if (/^صَلَّی/.test(t)) return true;
  if (/^بِسْمِ/.test(t)) return true;
  if (/^اَلْحَمْدُ/.test(t)) return true;
  if (/^اَمَّا/.test(t)) return true;
  if (/^رَضِیَ/.test(t)) return true;
  if (/^سَیِّدِ/.test(t)) return true;
  if (/^فَرمُود/.test(t)) return true;
  if (/^دَر/.test(t) && t.length > 20) return true;
  if (/^مکتبہ/.test(t)) return true;
  if (/^اللّٰہ\s+عَزَّ/.test(t)) return true;
  if (/^کی بارگاہ/.test(t)) return true;
  if (/^دَامَت/.test(t)) return true;
  if (/^نے جو/.test(t)) return true;
  if (/^المَدِینۃ/.test(t)) return true;
  if (/^اٰمِیْن/.test(t)) return true;
  if (/^\d+\s*$/.test(t)) return true;
  if (/^وصلِ/.test(t)) return true;
  if (/^وَصلِ/.test(t)) return true;
  return false;
}

function extractShers(start, end) {
  const verseLines = [];
  for (let i = start; i < Math.min(end, lines.length); i++) {
    const t = lines[i].trim();
    if (isNonVerse(lines[i])) continue;
    if (!/[\u0600-\u06FF]/.test(t)) continue;
    verseLines.push(t);
  }
  const shers = [];
  for (let i = 0; i < verseLines.length - 1; i += 2) {
    shers.push({ m1: verseLines[i], m2: verseLines[i + 1] });
  }
  if (verseLines.length % 2 !== 0) {
    console.warn(`  WARNING: odd verse lines (${verseLines.length})`);
  }
  return shers;
}

const poems = [
  {
    slug: "waah-kya-jood-o-karam",
    titleUr: "وصلِ اَوّل دَر نعت ِاکرم حضور سید عالم",
    start: 209, end: 217,
  },
  {
    slug: "farsh-waale-teri-shaukat",
    titleUr: "",
    start: 219, end: 251,
  },
  {
    slug: "tu-ne-islam-diya",
    titleUr: "",
    start: 253, end: 265,
  },
  {
    slug: "waah-kya-martaba-ay-ghaus",
    titleUr: "وصل دوم در منقبت آقائے اکرم حضور غوثِ اعظم",
    versesUr: [
      { m1: "واہ کیا مرتبہ اے غوث ہے بالا تیرا", m2: "اُونچے اُونچوں کے سَروں سے قدَم اعلیٰ تیرا" },
      { m1: "سر بھلا کیا کوئی جانے کہ ہے کیسا تیرا", m2: "اولیا ملتے ہیں آنکھیں وہ ہے تلوا تیرا" },
      { m1: "کیا دَبے جس پہ حِمایت کا ہو پنجہ تیرا", m2: "شیر کو خطرے میں لاتا نہیں کُتّا تیرا" },
      { m1: "تُو حُسینی حَسَنی کیوں نہ محی الدّیں ہو", m2: "اے خِضَر مَجْمَعِ بَحْرَیْن ہے چشمہ تیرا" },
      { m1: "قسمیں دے دے کے کھلاتا ہے پلاتا ہے تجھے", m2: "پیارا اللہ تِرا چاہنے والا تیرا" },
      { m1: "مصطفیٰ کے تن ِبے سایہ کا سایہ دیکھا", m2: "جس نے دیکھا مری جاں جلوۂ زیبا تیرا" },
      { m1: "اِبنِ زَہرا کو مبارک ہو عَروسِ قدرت", m2: "قادِری پائیں تصدّق مرے دُولہا تیرا" },
      { m1: "کیوں نہ قاسِم ہو کہ تُو ابنِ ابی القاسم ہے", m2: "کیوں نہ قادِر ہو کہ مختار ہے بابا तेरा" },
      { m1: "نبوی مینھ علوی فصل بتولی گلشن", m2: "حَسنی پھول حُسینی ہے مہکنا تیرا" },
      { m1: "نبوی ظِل عَلوی برج بتولی منزل", m2: "حَسنی چاند حُسینی ہے اُجالا تیرا" },
      { m1: "نبوی خُور عَلَوی کوہ بتولی مَعْدِن", m2: "حَسنی لعل حُسینی ہے تجلّا تیرا" },
      { m1: "بحروبر شہر و قُریٰ سہل و حُزُن دشت و چمن", m2: "کون سے چَک پہ پہنچتا نہیں دعویٰ تیرا" },
      { m1: "حُسنِ نیّت ہو خطا پھر کبھی کرتا ہی نہیں", m2: "آزمایا ہے یگانہ ہے دوگانہ تیرا" },
    ],
  },
  {
    slug: "arz-e-ahwaal",
    titleUr: "",
    start: 316, end: 332,
  },
];

const outDir = path.join(__dirname, "..", "src", "data", "ur");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

poems.forEach((p) => {
  let shers;
  if (p.versesUr) {
    shers = p.versesUr;
  } else {
    shers = extractShers(p.start, p.end);
  }

  const id = "ur-" + p.slug;
  const filePath = path.join(outDir, p.slug + ".ts");

  const content = `import type { Kalam } from "@/src/types";

const kalam: Kalam = {
  id: "${id}",
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: "${p.titleUr}",
  titleRo: "",
  titleEn: "",
  versesUr: [
${shers.map((s) => `    { m1: "${s.m1}", m2: "${s.m2}" }`).join(",\n")}
  ],
};

export default kalam;
`;

  fs.writeFileSync(filePath, content);
  console.log(`Created: ${p.slug}.ts (${shers.length} shers)`);
});

console.log(`\nBatch 1 complete: ${poems.length} poems generated in ${outDir}`);
