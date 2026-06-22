const fs = require("fs");
const dir = "src/data/kalams";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts") && f !== "index.ts");

let paired = 0;
let misras = 0;

for (const f of files) {
  let c = fs.readFileSync(dir + "/" + f, "utf-8");
  // Extract verses array content
  const m = c.match(/versesUr:\s*\[([\s\S]*?)\],/);
  if (!m) continue;

  // Find all string literals (between quotes)
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = re.exec(m[1])) !== null) {
    const val = match[1];
    paired++;
    const parts = val.split("\\n");
    misras += parts.length;
  }
}

console.log("Paired she'rs (current):", paired);
console.log("Individual misras:", misras);
console.log("Files:", files.length);
