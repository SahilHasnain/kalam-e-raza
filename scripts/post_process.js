/**
 * Post-process parsed kalams to split overly large chunks (>150 verses).
 * Uses page boundary analysis on the raw text to detect sub-kalams.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const RAW_FILE = path.join(__dirname, "hadaiq_raw.txt");
const PARSED_FILE = path.join(__dirname, "parsed_kalams.json");
const OUTPUT_FILE = path.join(__dirname, "parsed_kalams_v2.json");

const PAGE_MARKER = /^--- PAGE \d+ ---$/;

function isJunkLine(t) {
  if (!t || t.length < 3) return true;
  if (PAGE_MARKER.test(t)) return true;
  if (/^\[/.test(t)) return true;
  if (/^\]/.test(t)) return true;
  if (/^\d+\)/.test(t)) return true;
  if (/^\d+ :/.test(t)) return true;
  if (/^(رَضِیَ|عَلَیْہِ|دَامَتْ|صَلَّی|سَلَّم|عَزَّوَجَلَّ|تَعَالٰی|قُدِّسَ|عَلَیْہِ السَّلام|رَحْمَۃُ|سِرُّہٗ)/.test(t)) return true;
  if (/^\d+[؁ھ]/.test(t)) return true;
  if (/^[\d\-\.\,\:\;\(\)\[\]\s]{1,10}$/.test(t)) return true;
  if (/^[\s\.\,\:\;\-\(\)\[\]\d]*$/.test(t)) return true;
  return false;
}

function isHeadingCandidate(line) {
  const t = line.trim();
  if (isJunkLine(t)) return false;
  if (t.length < 6) return false;
  if (!/[\u0600-\u06FF]/.test(t)) return false;
  return true;
}

function cleanVerseLine(line) {
  let t = line.replace(/\(\d+\)/g, "").trim();
  t = t.replace(/^\[.*?\]/, "").trim();
  return t;
}

function generateId(titleUr) {
  const hash = crypto.createHash("md5").update(titleUr).digest("hex").slice(0, 8);
  return `kalam-${hash}`;
}

function buildKalam(heading, verses) {
  return {
    id: generateId(heading),
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

function splitLargeKalam(rawText, heading, startLine, endLine, minVerses) {
  const lines = rawText.split(/\r?\n/);
  const chunkLines = lines.slice(startLine, endLine + 1);

  // Split the chunk by page markers
  const pages = [];
  let currentPage = [];
  let currentPageNum = -1;

  for (const line of chunkLines) {
    if (PAGE_MARKER.test(line.trim())) {
      if (currentPage.length > 0) {
        pages.push({ pageNum: currentPageNum, lines: currentPage });
      }
      currentPage = [];
      currentPageNum = parseInt(line.trim().match(/\d+/)[0]);
    } else {
      currentPage.push(line);
    }
  }
  if (currentPage.length > 0) {
    pages.push({ pageNum: currentPageNum, lines: currentPage });
  }

  // For each page, check if it starts a new kalam
  // Heuristic: a page starts a new kalam if its first content line is a heading candidate
  // AND it doesn't look like a continuation of the previous page's content

  const result = [];
  let currentHeading = "";
  let currentVerses = [];
  let isFirstPage = true;

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    const contentLines = page.lines
      .map((l) => l.trim())
      .filter((l) => l && !isJunkLine(l));

    if (contentLines.length === 0) continue;

    // Find the first real verse line on this page
    const firstContent = contentLines.find((l) => isHeadingCandidate(l));

    if (!firstContent) {
      // No heading-like line - append all valid lines as verses
      for (const l of contentLines) {
        const cleaned = cleanVerseLine(l);
        if (cleaned && /[\u0600-\u06FF]/.test(cleaned)) {
          currentVerses.push(cleaned);
        }
      }
      continue;
    }

    // Determine if this page starts a new kalam
    const isNewStart = isFirstPage
      ? false
      : isPageNewKalam(page, pi, pages);

    if (isNewStart) {
      // Flush previous kalam
      if (currentHeading && currentVerses.length >= minVerses) {
        if (currentVerses[0] === currentHeading) currentVerses.shift();
        if (currentVerses.length >= minVerses) {
          result.push(buildKalam(currentHeading, currentVerses));
        }
      }
      currentHeading = firstContent;
      currentVerses = [];

      // Add remaining content as verses
      let started = false;
      for (const l of contentLines) {
        if (!started && l === firstContent) { started = true; continue; }
        const cleaned = cleanVerseLine(l);
        if (cleaned && /[\u0600-\u06FF]/.test(cleaned)) {
          // Skip single-word annotation-like lines
          if (cleaned.split(/\s+/).length < 3 && /^[\d\s\[\]\(\)]+$/.test(cleaned)) continue;
          currentVerses.push(cleaned);
        }
      }
    } else {
      // Continuation - add content as verses
      let started = isFirstPage ? false : true;
      isFirstPage = false;
      for (const l of contentLines) {
        if (!currentHeading && isHeadingCandidate(l)) {
          currentHeading = l;
          continue;
        }
        const cleaned = cleanVerseLine(l);
        if (cleaned && /[\u0600-\u06FF]/.test(cleaned)) {
          if (cleaned.split(/\s+/).length < 3 && /^[\d\s\[\]\(\)]+$/.test(cleaned)) continue;
          currentVerses.push(cleaned);
        }
      }
    }
  }

  // Flush last kalam
  if (currentHeading && currentVerses.length >= minVerses) {
    if (currentVerses[0] === currentHeading) currentVerses.shift();
    if (currentVerses.length >= minVerses) {
      result.push(buildKalam(currentHeading, currentVerses));
    }
  }

  return result;
}

function isPageNewKalam(page, pageIndex, allPages) {
  // A page is a new kalam if:
  // 1. Its first content line is a strong heading candidate (starts with و, ی, etc.)
  // 2. Previous page's last content line doesn't rhyme with this page's first line
  // 3. No obvious connection between pages

  const content = page.lines
    .map((l) => l.trim())
    .filter((l) => l && !PAGE_MARKER.test(l) && !isJunkLine(l));

  if (content.length === 0) return false;

  const firstLine = content.find((l) => isHeadingCandidate(l));
  if (!firstLine) return false;

  // Check if this page appears to start a new poem:
  // - The first line looks like a standalone heading (not mid-verse)
  // - Previous page doesn't flow into this one

  // Simple heuristic: if the previous page ended with a verse that doesn't
  // share the same last-word rhyme as the current page's first verse, it's likely new
  if (pageIndex > 0) {
    const prevPage = allPages[pageIndex - 1];
    const prevContent = prevPage.lines
      .map((l) => l.trim())
      .filter((l) => l && !PAGE_MARKER.test(l) && !isJunkLine(l));

    if (prevContent.length > 0) {
      const prevLast = prevContent[prevContent.length - 1];
      // If previous page ends with a heading-like line, this page continues it
      // If previous page ends with a verse, check if first line seems new
      if (isHeadingCandidate(prevLast)) {
        // Previous page ended with a heading - this is likely continuation
        return false;
      }
    }
  }

  // Strong indicator: first line is long enough to be a heading
  if (firstLine.length < 10) return false;

  // If the first line contains a poet signature (رضا), it's the END of a poem, not start
  if (firstLine.includes("رضا")) return false;

  // Check if this page starts with what looks like a formal title
  const startsWithTitle = /^(غزَل|نَعْت|مَنْقَبَت|قَصِیدَہ|رُباعی|سلام|واصل|دَر|باب|فصل)/.test(firstLine);
  if (startsWithTitle) return true;

  return true;
}

// ── Main ────────────────────────────────────────────────────────────────────

try {
  const raw = fs.readFileSync(RAW_FILE, "utf-8");
  const rawLines = raw.split(/\r?\n/);
  const parsed = JSON.parse(fs.readFileSync(PARSED_FILE, "utf-8"));

  const finalKalams = [];

  for (const kalam of parsed) {
    if (kalam.versesUr.length <= 150) {
      finalKalams.push(kalam);
      continue;
    }

    console.log(`\nSplitting large kalam: ${kalam.titleUr.slice(0, 60)} (${kalam.versesUr.length}v)`);

    // Find the kalam's heading in the raw text to determine its line range
    // Search for a unique prefix of the heading
    const searchStr = kalam.titleUr.slice(0, Math.min(40, kalam.titleUr.length));
    let startIdx = -1;

    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].includes(searchStr)) {
        startIdx = i;
        break;
      }
    }

    if (startIdx === -1) {
      console.log(`  Could not locate in raw text, keeping as-is`);
      finalKalams.push(kalam);
      continue;
    }

    // Find the range: from heading to next separator or end
    let endIdx = Math.min(startIdx + 500, rawLines.length - 1);
    for (let i = startIdx + 1; i < rawLines.length; i++) {
      if (rawLines[i].includes("*…*…*…*…*…*")) {
        endIdx = i - 1;
        break;
      }
      if (i - startIdx > 600) break;
    }

    const subKalams = splitLargeKalam(raw, kalam.titleUr, startIdx, endIdx, 3);
    console.log(`  → ${subKalams.length} sub-kalams extracted`);

    for (const sub of subKalams) {
      finalKalams.push(sub);
      console.log(`    ${sub.id}: ${sub.titleUr.slice(0, 60)} (${sub.versesUr.length}v)`);
    }
  }

  // Sort by ID for consistent ordering
  finalKalams.sort((a, b) => a.id.localeCompare(b.id));

  console.log(`\n=== Final: ${finalKalams.length} kalams ===`);
  const totalVerses = finalKalams.reduce((s, k) => s + k.versesUr.length, 0);
  console.log(`Total verses: ${totalVerses}`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalKalams, null, 2), "utf-8");
  console.log(`Written to ${OUTPUT_FILE}`);
} catch (err) {
  console.error("Error:", err.message);
  console.error(err.stack);
}
