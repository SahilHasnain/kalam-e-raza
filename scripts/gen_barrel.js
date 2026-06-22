/**
 * Generate src/data/kalams.ts (single barrel file) from src/data/kalams/*.ts
 */
const fs = require("fs");
const path = require("path");

const DIR = "src/data/kalams";
const OUT = "src/data/kalams.ts";

const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith(".ts") && f !== "index.ts")
  .sort();

const imports = files.map(f => {
  const name = f.replace(/\.ts$/, "").replace(/-/g, "_");
  return `import k_${name} from "./kalams/${f.replace(/\.ts$/, "")}";`;
}).join("\n");

const entries = files.map(f => {
  const name = f.replace(/\.ts$/, "").replace(/-/g, "_");
  return `  k_${name}`;
}).join(",\n");

const content = `import type { Kalam } from "@/src/types";

${imports}

export const kalams: Kalam[] = [
${entries},
];
`;

fs.writeFileSync(OUT, content, "utf-8");
console.log(`Written ${OUT} with ${files.length} imports`);
