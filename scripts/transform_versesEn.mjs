/**
 * Transforms versesEn in merged files from SherEn[] to Sher[].
 *
 * Run: node scripts/transform_versesEn.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MERGED = path.join(__dirname, "..", "src", "data", "merged");

let count = 0;

for (const f of fs.readdirSync(MERGED).filter((x) => x.endsWith(".ts"))) {
  const fp = path.join(MERGED, f);
  let content = fs.readFileSync(fp, "utf-8");

  if (!content.includes('"en": {')) continue;

  const lines = content.split("\n");
  const out = [];

  // State machine
  // 0 = outside versesEn
  // 1 = inside versesEn array, at SherEn level
  // 2 = skipping ro section
  // 3 = skipping "en": { header
  // 4 = capturing en m1/m2 lines
  // 5 = after en, writing entry closing
  let state = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (state === 0) {
      if (/^\s*versesEn:\s*\[$/.test(line)) {
        state = 1;
      }
      out.push(line);
      continue;
    }

    if (state === 1) {
      if (trimmed === "{") {
        // Start of SherEn entry — skip, we'll emit our own
        state = 2;
        out.push(line); // Keep the opening brace
        continue;
      }
      if (trimmed === "]," || trimmed === "]") {
        state = 0;
        out.push(line);
        continue;
      }
      out.push(line);
      continue;
    }

    if (state === 2) {
      // Inside ro section — skip until we see closing }
      if (trimmed.startsWith('"ro"')) continue;
      if (trimmed.startsWith('"m1"') || trimmed.startsWith('"m2"')) continue;
      if (trimmed === "}," || trimmed === "}") {
        state = 3;
        continue;
      }
      continue;
    }

    if (state === 3) {
      // Line is "en": { — skip it
      state = 4;
      continue;
    }

    if (state === 4) {
      // Inside en: { ... }
      if (trimmed === "}," || trimmed === "}") {
        state = 5; // end of en section
        continue;
      }
      // Output m1/m2 lines (strip 2 spaces of indent)
      const indent = line.match(/^\s*/)?.[0] || "";
      if (indent.length >= 2) {
        out.push(line.slice(2)); // Remove 2 spaces to bring to Sher level
      } else {
        out.push(line);
      }
      continue;
    }

    if (state === 5) {
      // Line is the closing } of the Sher entry
      out.push(line);
      state = 1;
      continue;
    }
  }

  const newContent = out.join("\n");
  if (newContent !== content) {
    fs.writeFileSync(fp, newContent);
    count++;
    process.stdout.write(".");
  }
}

console.log(`\nTransformed ${count} files.`);
