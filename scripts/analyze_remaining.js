const fs = require("fs");
const path = require("path");

const DIR = "src/data/kalams";
const files = fs.readdirSync(DIR).filter(f => f.endsWith(".ts") && f !== "index.ts");

function lastWord(s) {
  s = s.trim();
  const m = s.match(/([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\u0621-\u064A0-9\u0660-\u0669]+)\s*$/);
  return m ? m[1] : s.slice(-8);
}

function extractStrings(filePath) {
  const c = fs.readFileSync(filePath, "utf-8");
  const m = c.match(/versesUr:\s*\[([\s\S]*?)\]\s*,?\s*\};/);
  if (!m) return null;
  const re = /"((?:[^"\\]|\\.)*)"/g;
  const strs = [];
  let r;
  while ((r = re.exec(m[1])) !== null) strs.push(r[1]);
  return strs;
}

let clean = 0;
let messy = 0;
const category = { r1: 0, nn: 0, mixed: 0, lowRadif: 0, allBr: 0 };
const details = [];

for (const f of files) {
  const fp = path.join(DIR, f);
  const misras = extractStrings(fp);
  if (!misras || misras.length < 2) continue;

  const ends = misras.map(lastWord);
  const freq = {};
  for (const e of ends) freq[e] = (freq[e] || 0) + 1;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const radif = sorted[0][0];
  const ratio = sorted[0][1] / misras.length;

  let hasR1 = false, hasNN = false, hasBR = false, hasDot = false;
  let r1Count = 0, nnCount = 0, brCount = 0;

  for (let i = 0; i < Math.floor(misras.length / 2); i++) {
    const e0 = ends[i * 2];
    const e1 = ends[i * 2 + 1];
    if (e0 === radif && e1 !== radif) { hasR1 = true; r1Count++; }
    else if (e0 !== radif && e1 !== radif) { hasNN = true; nnCount++; }
    else if (e0 === radif && e1 === radif) { hasBR = true; brCount++; }
    else if (e0 !== radif && e1 === radif) { hasDot = true; }
  }

  if (ratio < 0.2) {
    messy++;
    category.lowRadif++;
    details.push({ file: f, misras: misras.length, radif, ratio: ratio.toFixed(2), issue: "lowRadif", r1Count, nnCount, brCount });
    continue;
  }

  if (!hasR1 && !hasNN) {
    clean++;
    if (hasBR && !hasDot) category.allBr++;
    continue;
  }

  messy++;
  if (hasR1 && !hasNN && !hasBR) category.r1++;
  else if (!hasR1 && hasNN && !hasBR) category.nn++;
  else category.mixed++;

  const issue = hasR1 ? "R1" : hasNN ? "NN" : "mixed";
  details.push({ file: f, misras: misras.length, radif, ratio: ratio.toFixed(2), issue, r1Count, nnCount, brCount });
}

console.log(`Clean: ${clean}  |  Messy: ${messy}  |  Total: ${clean + messy}`);
console.log("");
console.log("Breakdown of messy files:");
console.log(`  R1 (radif in wrong position):              ${category.r1}`);
console.log(`  NN (neither has radif in pair):            ${category.nn}`);
console.log(`  Mixed (R1+NN+BR combos):                   ${category.mixed}`);
console.log(`  Low radif ratio (<20%):                    ${category.lowRadif}`);
console.log(`  All-BR (husn-e-matla — likely clean):      ${category.allBr}`);
console.log("");

details.sort((a, b) => b.misras - a.misras || b.r1Count - a.r1Count);
console.log(`${"FILE".padEnd(27)}|MSRS|RADIF   |RATIO|ISSUE    |R1|NN|BR`);
console.log("-".repeat(85));
for (const d of details.slice(0, 50)) {
  const f = d.file.padEnd(27);
  const m = String(d.misras).padStart(4);
  const r = (d.radif.length > 6 ? d.radif.slice(0, 6) + "…" : d.radif).padEnd(7);
  const ra = d.ratio.padStart(5);
  const issue = d.issue.padEnd(8);
  const r1 = String(d.r1Count).padStart(2);
  const nn = String(d.nnCount).padStart(2);
  const br = String(d.brCount).padStart(2);
  console.log(`${f}|${m} |${r}|${ra}|${issue}|${r1}|${nn}|${br}`);
}
if (details.length > 50) {
  console.log(`... and ${details.length - 50} more`);
}
