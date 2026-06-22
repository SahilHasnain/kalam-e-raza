/**
 * Final parser: page-level aggressive splitting.
 * Every page with a heading-like first line starts a new kalam.
 */
const fs = require("fs");
const crypto = require("crypto");

const RAW_FILE = "scripts/hadaiq_raw.txt";
const OUTPUT_FILE = "scripts/parsed_final.json";

function isJunkLine(t) {
  if (!t || t.length < 3) return true;
  if (/^--- PAGE \d+ ---$/.test(t)) return true;
  if (/^\[/.test(t) || /^\]/.test(t)) return true;
  if (/^\d+\)/.test(t)) return true;
  if (/^(رَضِیَ|عَلَیْہِ|دَامَتْ|صَلَّی|سَلَّم|عَزَّوَجَلَّ|تَعَالٰی|قُدِّسَ|رَحْمَۃُ|سِرُّہٗ|اَلْحَمْدُ|lِلّٰہ|اَمَّا بَعْدُ|بِسْمِ اللّٰہ|اٰمِیْن)/.test(t)) return true;
  if (/^[\d\-\.\,\:\;\(\)\[\]\s]{1,10}$/.test(t)) return true;
  if (/^[\s\.\,\:\;\-\(\)\[\]\d]*$/.test(t)) return true;
  return false;
}

function isHeading(line) {
  const t = line.trim();
  if (isJunkLine(t)) return false;
  if (t.length < 8) return false;
  if (!/[\u0600-\u06FF]/.test(t)) return false;
  // Single word or very short = not a heading
  if (t.split(/\s+/).length <= 2 && t.length < 15) return false;
  return true;
}

function cleanVerse(line) {
  return line.replace(/\(\d+\)/g, "").replace(/^\[.*?\]/, "").trim();
}

const raw = fs.readFileSync(RAW_FILE, "utf-8");
const lines = raw.split(/\r?\n/);

// Skip front matter — find first وصل heading
let startIdx = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "وصلِ اَوّل دَر نعت ِاکرم حضور سید عالم") {
    startIdx = i;
    break;
  }
}
if (!startIdx) {
  console.error("Could not find start");
  process.exit(1);
}

// Process page by page
const kalams = [];
let heading = "";
let verses = [];

function flush() {
  if (heading && verses.length >= 3) {
    if (verses[0] === heading) verses.shift();
    if (verses.length >= 3) {
      const hash = crypto.createHash("md5").update(heading).digest("hex").slice(0, 8);
      kalams.push({
        id: `kalam-${hash}`,
        poetId: "alahazrat",
        poetName: "امام احمد رضا خان",
        poetNameRo: "Imam Ahmed Raza Khan",
        poetNameEn: "Imam Ahmed Raza Khan",
        titleUr: heading,
        titleRo: "",
        titleHi: "",
        titleEn: "",
        versesUr: verses,
        versesRo: [],
        versesHi: [],
        versesEn: [],
      });
    }
  }
  heading = "";
  verses = [];
}

let pageNum = 0;
let pageLines = [];
let firstContent = "";

for (let i = startIdx; i < lines.length; i++) {
  const t = lines[i].trim();
  const isPageMarker = /^--- PAGE \d+ ---$/.test(t);

  if (isPageMarker) {
    // Process collected page
    if (pageLines.length > 0 && !/^\d+$/.test(firstContent)) {
      if (isHeading(firstContent)) {
        // New kalam
        flush();
        heading = firstContent;
        for (let j = 1; j < pageLines.length; j++) {
          const v = cleanVerse(pageLines[j]);
          if (v && /[\u0600-\u06FF]/.test(v) && !isJunkLine(v)) {
            verses.push(v);
          }
        }
      } else {
        // Continuation
        for (const l of pageLines) {
          const v = cleanVerse(l);
          if (v && /[\u0600-\u06FF]/.test(v) && !isJunkLine(v)) {
            verses.push(v);
          }
        }
      }
    }
    pageLines = [];
    firstContent = "";
    pageNum++;
    continue;
  }

  if (t) {
    if (!firstContent && !isJunkLine(t)) {
      firstContent = t;
    }
    pageLines.push(t);
  }
}

// Flush last page
if (pageLines.length > 0 && !/^\d+$/.test(firstContent)) {
  if (isHeading(firstContent)) {
    flush();
    heading = firstContent;
    for (let j = 1; j < pageLines.length; j++) {
      const v = cleanVerse(pageLines[j]);
      if (v && /[\u0600-\u06FF]/.test(v) && !isJunkLine(v)) {
        verses.push(v);
      }
    }
  } else {
    for (const l of pageLines) {
      const v = cleanVerse(l);
      if (v && /[\u0600-\u06FF]/.test(v) && !isJunkLine(v)) {
        verses.push(v);
      }
    }
  }
}
flush();

// Filter out junk kalams
const valid = kalams.filter(k => {
  if (k.versesUr.length < 3) return false;
  if (k.titleUr.length < 8) return false;
  if (/^[\d\[\]\(\)\s]+$/.test(k.titleUr)) return false;
  if (k.titleUr.startsWith("بسم اللّٰہ") || k.titleUr.startsWith("بِسْمِ اللّٰہ")) return false;
  if (/^\d+[؁ھ]/.test(k.titleUr)) return false;
  return true;
});

console.log(`Extracted ${valid.length} kalams`);
const totalV = valid.reduce((s, k) => s + k.versesUr.length, 0);
console.log(`Total verses: ${totalV}`);
console.log(`Avg: ${(totalV / valid.length).toFixed(1)}`);

// Show kalams found
console.log("\nBy size:");
valid.forEach((k, i) => {
  const size = k.versesUr.length;
  const marker = size > 100 ? " **" : size > 50 ? " *" : "   ";
  console.log(`  ${marker} ${String(i+1).padStart(3)}. ${k.id} | ${k.titleUr.slice(0, 65)} (${size}v)`);
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(valid, null, 2));
console.log(`\nWritten to ${OUTPUT_FILE}`);
