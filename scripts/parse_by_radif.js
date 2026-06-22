/**
 * Final parser: use TOC entries + radif change detection + separator detection
 * to accurately split the scraped content into individual kalams.
 */
const fs = require("fs");
const crypto = require("crypto");

const RAW_FILE = "scripts/hadaiq_clean.txt";
const TOC_FILE = "scripts/toc_complete.json";
const OUT_DIR = "src/data/kalams";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function lastWord(s) {
  s = s.trim();
  const m = s.match(/([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF0-9\u0660-\u0669]+)\s*$/);
  return m ? m[1] : s.slice(-8);
}

function isNonVerse(line) {
  if (!line || line.length < 3) return true;
  // Starts with "[number] :" pattern (Arabic text citations)
  if (/^\[\d+\]\s*[\:\u0660-\u0669]/.test(line)) return true;
  // Pure Arabic (no Urdu chars, excluding common short particles)
  if (/^[\u0600-\u06FF\u0610-\u061A\u0620-\u063F\u0641-\u064A\u0660-\u0669\s\d\.\,\;\-\:\?\!]+$/.test(line) && line.length > 10) {
    if (!/[پچڈڑژکگہھ]/.test(line)) return true;
  }
  // All dots or separators
  if (/^[\*\.\-\s]{3,}$/.test(line)) return true;
  if (/^دیگر\s*$/.test(line)) return true;
  // Mostly numbers
  const digitCount = (line.match(/\d/g) || []).length;
  if (digitCount > line.length * 0.3 && line.length > 5) return true;
  // Section headings
  if (/^وصل[\sِ]/.test(line) && line.length > 20) return true;
  if (/^ردیف\s/.test(line)) return true;
  if (/^شجرہ\s/.test(line)) return true;
  if (/^رباعی/.test(line)) return true;
  if (/^حمد\s*$/.test(line)) return true;
  if (/^صلوٰۃ\s*$/.test(line)) return true;
  return false;
}

function generateId(title) {
  const hash = crypto.createHash("md5").update(title).digest("hex");
  return "kalam-" + hash.slice(0, 8);
}

// Normalize text for comparison (remove diacritics, normalize spaces)
function normalize(s) {
  return s.replace(/[\u064B-\u065F\u0670]/g, "").replace(/\s+/g, " ").trim();
}

function main() {
  // Load TOC
  const toc = JSON.parse(fs.readFileSync(TOC_FILE, "utf-8"));
  const tocNorm = toc.map(normalize);
  console.log(`Loaded ${toc.length} TOC entries`);

  // Read raw content
  const raw = fs.readFileSync(RAW_FILE, "utf-8");
  const rawLines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  // First pass: separate verses from non-verse content
  // Track boundaries from "دیگر" and star separators
  const separatorBoundaries = new Set();
  const lines = [];
  
  for (const line of rawLines) {
    if (line === "دیگر" || /^[\*\.\-\s]{3,}$/.test(line)) {
      // This is a separator - mark a boundary AFTER the current collected lines
      // The next verse line will be a new kalam start
      // But also the current line position matters
      separatorBoundaries.add(lines.length); // Boundary at current position
      continue;
    }
    if (!isNonVerse(line)) {
      lines.push(line);
    }
  }
  
  console.log(`Total verse lines: ${lines.length}`);
  console.log(`Separator boundaries: ${separatorBoundaries.size}`);

  // Initialize boundaries: always start at line 0
  const boundaryLines = new Set([0]);
  
  // Add separator boundaries (from "دیگر" and star patterns)
  for (const sb of separatorBoundaries) {
    boundaryLines.add(sb);
  }

  // Find kalam boundaries by matching TOC entries against lines
  const matches = []; // {lineIdx, tocIdx, tocEntry}
  for (let i = 0; i < lines.length; i++) {
    const lineNorm = normalize(lines[i]);
    for (let j = 0; j < tocNorm.length; j++) {
      if (lineNorm === tocNorm[j] || 
          lineNorm.startsWith(tocNorm[j]) || 
          tocNorm[j].startsWith(lineNorm) ||
          lineNorm.includes(tocNorm[j]) ||
          tocNorm[j].includes(lineNorm)) {
        // Only match if entries with similar content don't appear nearby
        const tooClose = matches.some(m => Math.abs(m.lineIdx - i) < 3 && m.tocIdx !== j);
        if (!tooClose && lineNorm.length > 5) {
          matches.push({ lineIdx: i, tocIdx: j, tocEntry: toc[j] });
          boundaryLines.add(i);
          break;
        }
      }
    }
  }
  
  console.log(`Found ${matches.length} TOC-to-line matches`);
  
  // Also detect "other" boundaries via radif changes
  // Pair into she'rs first
  const shers = [];
  for (let i = 0; i < lines.length - 1; i += 2) {
    shers.push({
      misra1: lines[i],
      misra2: lines[i + 1],
      lineStart: i,
    });
  }
  if (lines.length % 2 !== 0) {
    shers.push({ misra1: lines[lines.length - 1], misra2: "", lineStart: lines.length - 1 });
  }
  
  // Get radif for each sher (last word of misra2)
  for (let i = 0; i < shers.length; i++) {
    shers[i].radif = lastWord(shers[i].misra2 || shers[i].misra1);
  }
  
  // Detect radif changes without TOC match
  for (let i = 1; i < shers.length; i++) {
    const prev = shers[i-1];
    const curr = shers[i];
    
    if (prev.radif !== curr.radif) {
      // Check if the line at this boundary is not already a boundary
      const lineIdx = curr.lineStart;
      
      // Only add as boundary if:
      // 1. The new radif is consistent (appears in next 2+ she'rs)
      // 2. AND this line doesn't look like a continuation
      let lookAhead = 0;
      for (let j = i; j < Math.min(i + 4, shers.length); j++) {
        if (shers[j].radif === curr.radif) lookAhead++;
        else break;
      }
      
      if (lookAhead >= 2 && !boundaryLines.has(lineIdx)) {
        boundaryLines.add(lineIdx);
      }
    }
  }
  
  console.log(`Total boundaries: ${boundaryLines.size}`);

  // Split into kalams by boundaries
  const sortedBoundaries = Array.from(boundaryLines).sort((a, b) => a - b);
  
  const kalamLines = [];
  for (let i = 0; i < sortedBoundaries.length; i++) {
    const start = sortedBoundaries[i];
    const end = i + 1 < sortedBoundaries.length ? sortedBoundaries[i + 1] : lines.length;
    const chunk = lines.slice(start, end);
    if (chunk.length >= 4) { // At least 2 she'rs
      kalamLines.push(chunk);
    }
  }
  
  console.log(`Found ${kalamLines.length} kalams`);
  
  // Print sample
  if (kalamLines.length > 0) {
    console.log(`\nSample kalams:`);
    for (let i = 0; i < Math.min(5, kalamLines.length); i++) {
      const k = kalamLines[i];
      console.log(`  [${i+1}] "${k[0].substring(0, 55)}..." (${k.length} lines)`);
    }
    console.log(`  ...`);
    for (let i = Math.max(5, kalamLines.length - 3); i < kalamLines.length; i++) {
      const k = kalamLines[i];
      console.log(`  [${i+1}] "${k[0].substring(0, 55)}..." (${k.length} lines)`);
    }
  }
  
  // Write files
  console.log(`\nWriting kalam files...`);
  let written = 0;
  let totalShersCount = 0;
  const writtenIds = [];
  
  for (const kLines of kalamLines) {
    const title = kLines[0];
    
    // Pair into she'rs
    const shers = [];
    for (let i = 0; i < kLines.length - 1; i += 2) {
      const first = kLines[i];
      const second = kLines[i + 1];
      const e0 = lastWord(first);
      const e1 = lastWord(second);
      
      // Check radif for possible reversal
      // Most common: radif appears in second misra
      const allRadifs = kLines.filter((_, idx) => idx % 2 === 1).map(l => lastWord(l));
      const freq = {};
      for (const r of allRadifs) freq[r] = (freq[r] || 0) + 1;
      const commonRadif = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
      
      if (commonRadif && e0 === commonRadif && e1 !== commonRadif) {
        shers.push({ misra1: second, misra2: first });
      } else {
        shers.push({ misra1: first, misra2: second });
      }
    }
    // Odd leftover
    if (kLines.length % 2 !== 0) {
      shers.push({ misra1: kLines[kLines.length - 1], misra2: "" });
    }
    
    const id = generateId(title);
    const flatMisras = [];
    for (const sh of shers) {
      flatMisras.push(sh.misra1);
      if (sh.misra2) flatMisras.push(sh.misra2);
    }
    
    const versesStr = flatMisras.map(v => `      ${JSON.stringify(v)}`).join(",\n");
    const safeTitle = title.replace(/[\/\\?%*:|"<>]/g, "").trim();
    
    const content = `import type { Kalam } from "@/src/types";

const kalam: Kalam = {
  id: ${JSON.stringify(id)},
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: ${JSON.stringify(safeTitle)},
  titleRo: "",
  versesUr: [
${versesStr},
  ],
};

export default kalam;
`;
    
    fs.writeFileSync(`${OUT_DIR}/${id}.ts`, content, "utf-8");
    written++;
    totalShersCount += shers.length;
  }
  
  console.log(`\nDone! Written ${written} kalam files, ${totalShersCount} total she'rs`);
  console.log(`Files written to ${OUT_DIR}/`);
}

main();
