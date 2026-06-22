/**
 * Fix each kalam's misra ordering so that within each pair,
 * the non-radif misra (free) comes FIRST and the radif misra SECOND.
 *
 * Strategy: for each kalam, detect the radif (most frequent ending word),
 * then swap each pair where the radif is in position 0 instead of position 1.
 */
const fs = require("fs");
const path = require("path");

const DIR = "src/data/kalams";
const files = fs.readdirSync(DIR).filter(f => f.endsWith(".ts") && f !== "index.ts");

function lastWord(s) {
  s = s.trim();
  const m = s.match(/([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\u0621-\u064A0-9\u0660-\u0669]+)\s*$/);
  return m ? m[1] : s.slice(-8);
}

function extractStrings(content) {
  const m = content.match(/versesUr:\s*\[([\s\S]*?)\]\s*,?\s*\};/);
  if (!m) return null;
  const re = /"((?:[^"\\]|\\.)*)"/g;
  const strs = [];
  let r;
  while ((r = re.exec(m[1])) !== null) strs.push(r[1]);
  return { arrayStr: m[0], prefix: content.slice(0, m.index), suffix: content.slice(m.index + m[0].length), strs };
}

// Stats
let swapped = 0;
let unchanged = 0;
let fixedPairs = 0;
let skipped = 0;

for (const f of files) {
  const fp = path.join(DIR, f);
  let content = fs.readFileSync(fp, "utf-8");
  const parsed = extractStrings(content);
  if (!parsed || parsed.strs.length < 2) {
    skipped++;
    continue;
  }

  const { strs } = parsed;
  const ends = strs.map(lastWord);

  // Detect radif
  const freq = {};
  for (const e of ends) freq[e] = (freq[e] || 0) + 1;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const radif = sorted[0][0];
  const radifCount = sorted[0][1];
  const ratio = radifCount / strs.length;

  // If radif appears in <20% of misras, it's probably not a real radif — skip
  if (ratio < 0.2) {
    unchanged++;
    continue;
  }

  // For each pair, check if radif is in wrong position
  const newStrs = [...strs];
  let localSwaps = 0;
  const pairCount = Math.floor(strs.length / 2);

  for (let i = 0; i < pairCount; i++) {
    const idx0 = i * 2;      // first of pair
    const idx1 = i * 2 + 1;  // second of pair
    const e0 = ends[idx0];
    const e1 = ends[idx1];

    if (e0 === radif && e1 !== radif) {
      // SWAP: radif is in first position, should be second
      [newStrs[idx0], newStrs[idx1]] = [strs[idx1], strs[idx0]];
      localSwaps++;
    }
    // In all other cases: leave as-is
    // (both have radif = could be matla, neither = non-verse, correct = e1===radif)
  }

  if (localSwaps === 0) {
    unchanged++;
    continue;
  }

  // Rebuild the array content
  const newBody = newStrs.map(s => `      ${JSON.stringify(s)}`).join(",\n") + ",";
  const newArrayStr = content.match(/versesUr:\s*\[[\s\S]*?\]\s*,?\s*\};/)[0]
    .replace(/versesUr:\s*\[[\s\S]*?\]\s*,?\s*\};/,
      "versesUr: [\n" + newBody + "\n    ]\n  };");

  // Simpler approach: rebuild the array section
  const lines = content.split("\n");
  let inArray = false;
  let arrayDepth = 0;
  const outLines = [];
  let rebuilt = false;

  for (const line of lines) {
    if (!rebuilt && line.includes("versesUr:")) {
      outLines.push("    versesUr: [");
      for (let i = 0; i < newStrs.length; i++) {
        outLines.push(`      ${JSON.stringify(newStrs[i])},`);
      }
      outLines.push("    ]");
      rebuilt = true;
    } else if (!rebuilt && line.includes("];")) {
      // No versesUr found — shouldn't happen
      outLines.push(line);
    } else {
      outLines.push(line);
    }
  }

  // Only write the array section — need to be more precise
  // Let's use a different approach: regex replace
  const oldArrMatch = content.match(/(versesUr:\s*\[)([\s\S]*?)(\]\s*,?\s*\}\s*;)/);
  if (oldArrMatch) {
    const newArrContent = newStrs.map(s => `      ${JSON.stringify(s)}`).join(",\n");
    const newContent = content.replace(
      /(versesUr:\s*\[)([\s\S]*?)(\]\s*,?\s*\}\s*;)/,
      `$1\n${newArrContent},\n    $3`
    );
    fs.writeFileSync(fp, newContent, "utf-8");
    fixedPairs += localSwaps;
    swapped++;
  } else {
    unchanged++;
  }
}

console.log(`Files swapped:  ${swapped}`);
console.log(`Unchanged:      ${unchanged}`);
console.log(`Skipped (<2):   ${skipped}`);
console.log(`Total:          ${swapped + unchanged + skipped}`);
console.log(`Pairs fixed:     ${fixedPairs}`);
