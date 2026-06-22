const fs = require("fs");
const path = require("path");

const SRC = "src/data/kalams.ts";
const OUT = "src/data/kalams";

// Read entire file, strip the import + export header
let text = fs.readFileSync(SRC, "utf-8");
text = text.replace(/^import type \{ Kalam \} from.*?\n/, "");
text = text.replace(/^export const kalams: Kalam\[\] = /, "");

// Parse objects by tracking brace depth
function parseObjects(str) {
  const objects = [];
  let i = 0;
  while (i < str.length) {
    // Find opening brace
    const start = str.indexOf("{", i);
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let j = start;
    for (; j < str.length; j++) {
      const ch = str[j];
      if (ch === '"' && (j === 0 || str[j - 1] !== "\\")) {
        inString = !inString;
      }
      if (!inString) {
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            objects.push(str.slice(start, j + 1));
            i = j + 1;
            break;
          }
        }
      }
    }
    if (depth !== 0) {
      console.error("Parse error: unmatched braces");
      break;
    }
  }
  return objects;
}

const objectStrs = parseObjects(text);
console.log(`Found ${objectStrs.length} kalam objects`);

// Create output dir
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Write individual files
for (const objStr of objectStrs) {
  // Extract id field using regex
  const idMatch = objStr.match(/id:\s*"(kalam-[a-f0-9]+)"/);
  if (!idMatch) {
    console.error("Could not extract id from:", objStr.slice(0, 80));
    continue;
  }
  const id = idMatch[1];

  const fileContent = `import type { Kalam } from "@/src/types";

const kalam: Kalam = ${objStr};

export default kalam;
`;

  fs.writeFileSync(path.join(OUT, `${id}.ts`), fileContent, "utf-8");
}

// Generate index.ts barrel
const kalams = objectStrs.map((s) => {
  const m = s.match(/id:\s*"(kalam-[a-f0-9]+)"/);
  return m ? m[1] : null;
}).filter(Boolean);

const imports = kalams
  .map((id) => `import k_${id.replace(/-/g, "_")} from "./${id}";`)
  .join("\n");
const entries = kalams
  .map((id) => `  k_${id.replace(/-/g, "_")}`)
  .join(",\n");

const indexContent = `import type { Kalam } from "@/src/types";

${imports}

export const kalams: Kalam[] = [
${entries},
];
`;

fs.writeFileSync(path.join(OUT, "index.ts"), indexContent, "utf-8");

// Create src/data/index.ts barrel
fs.writeFileSync(
  "src/data/index.ts",
  `export { kalams } from "./kalams";\n`,
  "utf-8"
);

// Remove old kalams.ts
fs.unlinkSync(SRC);
console.log(`Removed ${SRC}`);

// Update app imports from "@/src/data/kalams" → "@/src/data"
const appFiles = [
  "app/(tabs)/index.tsx",
  "app/(tabs)/browse.tsx",
  "app/(tabs)/favorites.tsx",
  "app/(tabs)/about.tsx",
  "app/kalam/[id].tsx",
];

let updated = 0;
for (const f of appFiles) {
  const fp = path.join(__dirname, "..", f);
  if (fs.existsSync(fp)) {
    let fc = fs.readFileSync(fp, "utf-8");
    if (fc.includes('from "@/src/data/kalams"')) {
      fc = fc.replaceAll('from "@/src/data/kalams"', 'from "@/src/data"');
      fs.writeFileSync(fp, fc, "utf-8");
      updated++;
      console.log(`Updated ${f}`);
    }
  }
}

console.log(`Done. ${kalams.length} files written, ${updated} imports updated.`);
