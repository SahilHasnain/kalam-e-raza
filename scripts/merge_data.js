/**
 * Generate the final src/data/kalams.ts from parsed kalams.
 * Pairs consecutive lines into she'rs (2-line couplets).
 */
const fs = require("fs");

const parsed = JSON.parse(fs.readFileSync("scripts/parsed_final.json", "utf-8"));

function pairVerses(lines) {
  const she = [];
  for (let i = 0; i < lines.length; i += 2) {
    const first = lines[i];
    const second = lines[i + 1];
    if (second !== undefined) {
      she.push(`${first}\n${second}`);
    } else {
      she.push(first);
    }
  }
  return she;
}

const header = `import type { Kalam } from "@/src/types";

export const kalams: Kalam[] = [`;

const footer = `];
`;

function kalamToTS(k) {
  const versesUr = pairVerses(k.versesUr).map(v => `      ${JSON.stringify(v)}`).join(",\n");

  return `  {
    id: ${JSON.stringify(k.id)},
    poetId: ${JSON.stringify(k.poetId)},
    poetName: ${JSON.stringify(k.poetName)},
    poetNameRo: ${JSON.stringify(k.poetNameRo)},
    poetNameEn: ${JSON.stringify(k.poetNameEn)},
    titleUr: ${JSON.stringify(k.titleUr)},
    titleRo: ${JSON.stringify("")},
    versesUr: [
${versesUr}
    ],
  }`;
}

const entries = parsed.map(kalamToTS).join(",\n\n");

fs.writeFileSync("src/data/kalams.ts", header + "\n" + entries + "\n" + footer, "utf-8");

console.log(`Written ${parsed.length} kalams (verses paired into she'rs)`);
const totalShe = parsed.reduce((s, k) => s + Math.ceil(k.versesUr.length / 2), 0);
console.log(`Total she'rs: ${totalShe}`);
