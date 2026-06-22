const fs = require("fs");
const c = fs.readFileSync("src/data/kalams/kalam-22ef9ad1.ts", "utf-8");
const m = c.match(/versesUr:\s*\[([\s\S]*?)\]\s*,?\s*\};/);
if (m) {
  const re = /"((?:[^"\\]|\\.)*)"/g;
  const strs = [];
  let r;
  while ((r = re.exec(m[1])) !== null) strs.push(r[1]);
  strs.forEach((s, i) => {
    const last = s.trim().slice(-6);
    const label = i % 2 === 0 ? "→" : " ";
    console.log(label, String(i).padStart(2), "..." + last, "|", s.slice(0, 45));
  });
}
