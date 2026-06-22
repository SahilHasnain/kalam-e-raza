const fs = require("fs");
const c = fs.readFileSync("src/data/kalams/kalam-22ef9ad1.ts", "utf-8");
const m = c.match(/versesUr:\s*\[([\s\S]*?)\],/);
if (m) {
  const body = m[1];
  console.log("Body length:", body.length);
  console.log("Body first 80:", body.slice(0, 80));
  console.log("Body last 80:", body.slice(-80));
  const re = /"((?:[^"\\]|\\.)*)"/g;
  const strs = [];
  let r;
  while ((r = re.exec(body)) !== null) {
    strs.push(r[1]);
  }
  console.log("Total matches:", strs.length);
  strs.forEach((s, i) => console.log(`  [${i}] lastWord=${s.trim().match(/([\w\u0600-\u06FF]+)\s*$/)?.[1] || "???"} full=${s.slice(-20)}`));
}
