import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dirs = ["ro", "en", "ur", "hn"];
const importLines = [];
const entries = [];

for (const dir of dirs) {
  const dirPath = path.join(__dirname, "..", "src", "data", dir);
  if (!fs.existsSync(dirPath)) continue;
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".ts"));
  for (const file of files) {
    const slug = file.replace(/\.ts$/, "");
    const varname = `${dir}_${slug.replace(/[^a-zA-Z0-9_]/g, "_")}`;
    importLines.push(`import ${varname} from "@/src/data/${dir}/${slug}";`);
    entries.push(`  ${varname},`);
  }
}

const content = `import type { Kalam } from "@/src/types";

${importLines.join("\n")}

export const kalams: Kalam[] = [
${entries.join("\n")}
];
`;

const outPath = path.join(__dirname, "..", "src", "data", "index.ts");
fs.writeFileSync(outPath, content);
console.log(`Generated index.ts with ${entries.length} imports`);
