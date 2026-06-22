/**
 * Parse hadaiq_raw.txt into structured Kalam objects.
 * v2 — better heading detection, proper IDs, footnote filtering.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const RAW_FILE = path.join(__dirname, "hadaiq_raw.txt");
const OUTPUT_FILE = path.join(__dirname, "parsed_kalams.json");

const SEPARATOR = "*…*…*…*…*…*";
const PAGE_MARKER = /^--- PAGE \d+ ---$/;

const WASL_HEADINGS = [
  "وصلِ اَوّل دَر نعت ِاکرم حضور سید عالم",
  "وصل دوم در منقبت آقائے اکرم حضور غوثِ اعظم",
  "وَصلِ سوم دَر حُسنِ مُفاخَرَت اَز سرکارِ قادریت",
  "وَصلِ چہارم دَرمُنافَحتِ اَعداء واِستعانت از آقا",
];

function isJunkLine(t) {
  if (!t || t.length < 3) return true;
  // Page markers
  if (PAGE_MARKER.test(t)) return true;
  // Footnotes
  if (/^\[/.test(t)) return true;
  if (/^\]/.test(t)) return true;
  if (/^\d+\)/.test(t)) return true;
  if (/^\d+ :/.test(t)) return true;
  // Arabic honorifics
  if (/^(رَضِیَ|عَلَیْہِ|دَامَتْ|صَلَّی|سَلَّم|عَزَّوَجَلَّ|تَعَالٰی|قُدِّسَ|عَلَیْہِ السَّلام|رَحْمَۃُ|سِرُّہٗ)/.test(t)) return true;
  // Book/page references
  if (/^\d+[؁ھ]/.test(t)) return true;
  if (/^حوالہ/.test(t)) return true;
  if (/^\d{1,3}$/.test(t)) return true;
  if (/^[\d\-\.\,\:\;\(\)\[\]\s]{1,10}$/.test(t)) return true;
  // Common chapter markers
  if (/^(باب|فصل|قسم|حصہ|دعا|ختم|تمت|انتہی)/.test(t)) return true;
  // Standalone punctuation/number lines
  if (/^[\s\.\,\:\;\-\(\)\[\]\d]*$/.test(t)) return true;
  return false;
}

function isHeadingCandidate(line) {
  const t = line.trim();
  if (isJunkLine(t)) return false;
  if (t.length < 6) return false;
  // Must contain at least one Urdu/Arabic/Persian character
  if (!/[\u0600-\u06FF]/.test(t)) return false;
  return true;
}

function cleanVerseLine(line) {
  let t = line.replace(/\(\d+\)/g, "").trim();
  t = t.replace(/^\[.*?\]/, "").trim();
  return t;
}

function generateId(titleUr, index) {
  const hash = crypto.createHash("md5").update(titleUr).digest("hex").slice(0, 8);
  return `kalam-${hash}`;
}

// ── Main Parser ─────────────────────────────────────────────────────────────

function parseRawText(text) {
  const lines = text.split(/\r?\n/);

  // Find where "وصلِ اَوّل" starts
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === WASL_HEADINGS[0]) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) {
    console.error("Could not find start of kalam content");
    return [];
  }

  // Split remaining text by separator
  const chunks = [];
  let currentChunk = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().includes(SEPARATOR)) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    } else {
      currentChunk.push(line);
    }
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);

  console.log(`Found ${chunks.length} separator-delimited chunks`);

  const kalams = [];

  // First chunk contains the 4 وصل kalams
  if (chunks.length > 0) {
    const waslKalams = splitWaslSection(chunks[0]);
    for (const sub of waslKalams) {
      if (sub.verses.length >= 2) {
        kalams.push(buildKalam(sub.heading, sub.verses, kalams.length));
      }
    }
  }

  // Remaining chunks
  for (let ci = 1; ci < chunks.length; ci++) {
    const result = parseChunk(chunks[ci]);
    if (result.heading && isHeadingCandidate(result.heading) && result.verses.length >= 2) {
      kalams.push(buildKalam(result.heading, result.verses, kalams.length));
    } else if (result.verses.length >= 4) {
      // Try harder: skip junk lines at start to find real heading
      const fixed = tryFixHeading(chunks[ci]);
      if (fixed.heading && isHeadingCandidate(fixed.heading) && fixed.verses.length >= 2) {
        kalams.push(buildKalam(fixed.heading, fixed.verses, kalams.length));
      } else {
        console.log(`  Skipping chunk ${ci} — heading: "${(result.heading || "?").slice(0, 50)}" (${result.verses.length}v)`);
      }
    }
  }

  return kalams;
}

function tryFixHeading(lines) {
  // Skip junk lines at the start to find the real first verse line
  let heading = "";
  const allVerses = [];
  let foundHeading = false;

  for (const line of lines) {
    const t = line.trim();
    if (!t || PAGE_MARKER.test(t)) continue;

    if (!foundHeading) {
      if (isHeadingCandidate(t)) {
        heading = t;
        foundHeading = true;
      }
      continue;
    }

    if (!isJunkLine(t) && /[\u0600-\u06FF]/.test(t)) {
      const cleaned = cleanVerseLine(t);
      if (cleaned) allVerses.push(cleaned);
    }
  }

  if (allVerses.length > 0 && allVerses[0] === heading) {
    allVerses.shift();
  }
  return { heading, verses: allVerses };
}

function parseChunk(lines) {
  return tryFixHeading(lines);
}

function splitWaslSection(lines) {
  const subKalams = [];
  let currentHeading = "";
  let buffer = [];

  function flush() {
    if (!currentHeading) return;
    const verses = buffer
      .map((l) => cleanVerseLine(l.trim()))
      .filter((l) => l && !isJunkLine(l) && !WASL_HEADINGS.includes(l));
    if (verses.length > 0 && verses[0] === currentHeading) verses.shift();
    if (verses.length >= 2) {
      subKalams.push({ heading: currentHeading, verses });
    }
    buffer = [];
  }

  for (const line of lines) {
    const t = line.trim();
    if (!t || PAGE_MARKER.test(t)) continue;

    const isWasl = WASL_HEADINGS.includes(t);
    if (isWasl) {
      flush();
      currentHeading = t;
      continue;
    }

    if (!currentHeading && isHeadingCandidate(t)) {
      currentHeading = t;
      continue;
    }

    if (currentHeading) {
      buffer.push(line);
    }
  }

  flush();
  return subKalams;
}

function buildKalam(heading, verses, index) {
  const id = generateId(heading, index);
  return {
    id,
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
  };
}

// ── Run ─────────────────────────────────────────────────────────────────────

try {
  const raw = fs.readFileSync(RAW_FILE, "utf-8");
  const kalams = parseRawText(raw);
  const valid = kalams.filter(Boolean);

  console.log(`\n=== Extracted ${valid.length} kalams ===`);
  const totalVerses = valid.reduce((s, k) => s + k.versesUr.length, 0);
  console.log(`Total verses: ${totalVerses}`);
  console.log(`Avg verses/kalam: ${(totalVerses / valid.length).toFixed(1)}`);

  console.log("\nAll kalams:");
  valid.forEach((k, i) => {
    const preview = k.titleUr.length > 65 ? k.titleUr.slice(0, 65) + "…" : k.titleUr;
    console.log(`  ${String(i + 1).padStart(2)}. ${k.id} | ${preview} (${k.versesUr.length}v)`);
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(valid, null, 2), "utf-8");
  console.log(`\nWritten to ${OUTPUT_FILE}`);
} catch (err) {
  console.error("Error:", err.message);
}
