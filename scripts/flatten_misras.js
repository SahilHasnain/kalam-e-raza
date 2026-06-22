/**
 * Flatten versesUr in each kalam file:
 *   "misra1\nmisra2" → "misra1", "misra2"
 * Run once to migrate from paired-sher storage to flat-misra storage.
 */
const fs = require("fs");
const path = require("path");

const DIR = "src/data/kalams";
const files = fs.readdirSync(DIR).filter(f => f.endsWith(".ts") && f !== "index.ts");

let totalShe = 0;
let totalMisras = 0;
let updated = 0;

for (const f of files) {
  const fp = path.join(DIR, f);
  let content = fs.readFileSync(fp, "utf-8");

  // Find versesUr array
  const match = content.match(/(versesUr:\s*\[)([\s\S]*?)(\],?)/);
  if (!match) continue;

  const prefix = match[1];
  const body = match[2];
  const suffix = match[3];

  // Extract all string literals from the array body
  // Match "..." strings, handling escaped quotes inside
  const strings = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    strings.push(m[1]);
  }

  if (strings.length === 0) continue;

  totalShe += strings.length;

  // Flatten: split each string on \n to produce individual misras
  const flat = [];
  for (const s of strings) {
    const parts = s.split("\\n");
    for (const p of parts) {
      flat.push(p);
    }
  }
  totalMisras += flat.length;

  if (flat.length === strings.length) {
    // No \n found — already flat, skip
    continue;
  }

  // Rebuild the array body
  const newBody = flat.map(s => `      ${JSON.stringify(s)}`).join(",\n") + ",";

  content = content.replace(match[0], prefix + "\n" + newBody + "\n    " + suffix.replace(/,$/, ""));
  fs.writeFileSync(fp, content, "utf-8");
  updated++;
}

console.log(`Files updated: ${updated}/${files.length}`);
console.log(`Before (paired she'rs): ${totalShe}`);
console.log(`After  (flat misras):   ${totalMisras}`);
console.log(`Expansion factor:       ${(totalMisras / totalShe).toFixed(2)}x`);
