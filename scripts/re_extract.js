/**
 * Re-extract kalams from hadaiq_raw.txt using improved heuristics.
 * 
 * Patterns observed:
 * - Kalam title: standalone line near page boundary, not a verse
 * - Misra: has a radif pattern at end, alternate lines
 * - Separators: "دیگر" line, "*…*…*…*…*…*" line, "واللّٰہ اَعْلَمُ" etc.
 * - Non-verse: Arabic text, hadith with numbers like (حلیۃ..., footnote markers [1], page numbers
 * - Kalam boundary: title line, separator line, or "--- PAGE N ---" after a kalam ends
 */
const fs = require("fs");

const RAW = "scripts/hadaiq_raw.txt";
const OUT = "scripts/extracted_kalams.json";

// Common radif endings (Urdu)
const RADIF_WORDS = new Set([
  "تیرا", "تیری", "تیرے", "میرا", "میری", "میرے",
  "ہے", "ہیں", "ہوں", "ہو",
  "کا", "کی", "کے", "کو",
  "سے", "میں", "پر", "پہ",
  "نہیں", "بھی", "ہی",
  "سلام", "درود", "رسول", "اللّٰہ", "مولیٰ",
  "آقا", "جان", "دل", "تجھے",
  "آیا", "گیا", "جائے", "آئے", "پائے",
  "ہم", "تم",
  "نہ", "تو",
  "حبیب", "کریم", "رحمت",
]);

// Lines that are definitely not verses (separators, markers, etc.)
const NON_VERSE_EXACT = new Set([
  "دیگر",
  "*…*…*…*…*…*",
  "واللّٰہ اَعْلَمُ بِالصَّوَاب",
  "واللّٰہ تعالیٰ اعلم",
  "ختم شُد",
  "تمت",
]);

function isNonVerseLine(line) {
  const t = line.trim();
  if (!t || NON_VERSE_EXACT.has(t)) return true;

  // Lines with Arabic-only text (no Urdu characters)
  const urduChar = t.match(/[\u0600-\u06FF]/);
  if (!urduChar) return true;

  // Lines that are footnote references like [1], [2], etc.
  if (/^\[\d+\]$/.test(t.trim())) return true;

  // Lines that are just page number markers like "۔۱۲"
  if (/^[\u0660-\u0669\.,\s]+$/.test(t.trim())) return true;

  // Lines that are Arabic formulaic phrases
  const arabicPhrases = [
    "صَلَّی اللّٰہ", "رَضِیَ اللّٰہ", "عَلَیْہِ رَحْمَۃ",
    "دَامَتْ بَرَکَاتُہُمُ", "صَلَّی اللّٰہ تَعَالٰی عَلَیْہِ وَسَلَّم",
    "رَحْمَۃُ اللّٰہ", "رَحْمَۃُ الرَّحْمٰن",
    "بِسْمِ اللہ", "اَلْحَمْدُ لِلّٰہ", "اَمَّا بَعْدُ",
    "اٰمِیْن", "عَزَّوَجَلَّ", "تَعَالٰی",
    "حَتَّی الْوَسْع", "کَثَّرَ ھُمُ",
  ];
  for (const phrase of arabicPhrases) {
    if (t.includes(phrase)) return true;
  }

  return false;
}

function isProbablyTitle(line, nextLine, radifCandidates) {
  const t = line.trim();
  if (!t) return false;
  if (t.length < 5) return false;

  // A title typically:
  // 1. Doesn't end with common radif words
  // 2. Is relatively short (< 20 words)
  // 3. Has distinctive Urdu poetry title markers
  const words = t.split(/\s+/).filter(Boolean);

  // Too short to be a verse (probably a heading)
  if (words.length <= 2) return true;

  // Check if it ends with a radif word
  const lastWord = words[words.length - 1];
  if (RADIF_WORDS.has(lastWord)) return false;

  // Check for title patterns
  const titlePatterns = [
    /^وصل/, /^دوم/, /^بقسم/, /^قطعہ/, /^رباعیات/,
    /مبارک/, /نعتیہ/, /منقبت/, /مدح/, /ثنا/,
    /^\d+[\.\-\u0660-\u0669]/,
  ];
  for (const p of titlePatterns) {
    if (p.test(t)) return true;
  }

  // If next line also looks like a verse and shares a radif, this is probably a title
  // (rough heuristic)
  return false;
}

function extractRadif(line) {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  return words[words.length - 1];
}

function pairShers(misras) {
  if (misras.length < 2) return [];
  
  // Detect the most common ending word (radif)
  const freq = {};
  const ends = misras.map(m => extractRadif(m));
  for (const e of ends) freq[e] = (freq[e] || 0) + 1;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const radif = sorted[0][1] >= misras.length * 0.25 ? sorted[0][0] : null;

  const shers = [];
  for (let i = 0; i < misras.length; i += 2) {
    const first = misras[i];
    const second = misras[i + 1];
    if (second === undefined) {
      shers.push({ misra1: first, misra2: "" });
      break;
    }
    const e0 = extractRadif(first);
    const e1 = extractRadif(second);

    if (radif && e0 === radif && e1 !== radif) {
      // Radif in first position — swap
      shers.push({ misra1: second, misra2: first });
    } else {
      shers.push({ misra1: first, misra2: second });
    }
  }
  return shers;
}


// Main processing
const lines = fs.readFileSync(RAW, "utf-8").split("\n");

const kalams = [];
let currentKalam = null;
let verseLines = [];
let lastLineWasSeparator = false;

function flushKalam(title) {
  if (verseLines.length === 0 && !title) return;

  // Filter out non-verse lines
  const cleanVerses = verseLines.filter(l => !isNonVerseLine(l));

  if (cleanVerses.length === 0 && !title) return;

  const shers = pairShers(cleanVerses);
  if (shers.length === 0 && !title) return;

  kalams.push({
    title: title || "(untitled)",
    verses: cleanVerses,
    shers,
  });
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Skip page markers
  if (/^--- PAGE \d+ ---$/.test(trimmed)) {
    continue;
  }

  // Skip empty lines
  if (!trimmed) continue;

  // Check for kalam separators
  if (trimmed === "دیگر" || trimmed === "*…*…*…*…*…*" || trimmed === "واللّٰہ اَعْلَمُ بِالصَّوَاب") {
    if (verseLines.length > 0) {
      flushKalam(currentKalam);
      currentKalam = null;
      verseLines = [];
    }
    lastLineWasSeparator = true;
    continue;
  }

  // Check if this line is a kalam title
  const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
  if (currentKalam === null || (isProbablyTitle(trimmed, nextLine, null) && verseLines.length > 5)) {
    flushKalam(currentKalam);
    currentKalam = trimmed;
    verseLines = [];
    lastLineWasSeparator = false;
    continue;
  }

  // Regular verse line
  if (!isNonVerseLine(trimmed)) {
    verseLines.push(trimmed);
  }
  lastLineWasSeparator = false;
}

// Flush last kalam
flushKalam(currentKalam);

// Write output
fs.writeFileSync(OUT, JSON.stringify(kalams, null, 2), "utf-8");
console.log(`Extracted ${kalams.length} kalams`);
console.log(`Total verses: ${kalams.reduce((s, k) => s + k.verses.length, 0)}`);
console.log(`Total shers: ${kalams.reduce((s, k) => s + k.shers.length, 0)}`);
console.log(`Output: ${OUT}`);

// Write summary table
console.log("\n=== KALAMS ===");
kalams.forEach((k, i) => {
  console.log(`${String(i + 1).padStart(3)}. ${k.title.slice(0, 50).padEnd(52)} ${k.verses.length}v ${k.shers.length}sh`);
});
