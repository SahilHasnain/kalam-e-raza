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
  if (!m) {
    // try alternate: maybe no }; ending
    const m2 = c.match(/versesUr:\s*\[([\s\S]*?)\]\s*,?\s*\}\s*;/);
    if (!m2) {
      console.log("FAILED to match:", filePath);
      return null;
    }
    const re = /"((?:[^"\\]|\\.)*)"/g;
    const strs = [];
    let r;
    while ((r = re.exec(m2[1])) !== null) strs.push(r[1]);
    return strs;
  }
  const re = /"((?:[^"\\]|\\.)*)"/g;
  const strs = [];
  let r;
  while ((r = re.exec(m[1])) !== null) strs.push(r[1]);
  return strs;
}

let totalOk = 0;
let totalSuspect = 0;
const suspects = [];

for (const f of files) {
  const fp = path.join(DIR, f);
  const misras = extractStrings(fp);
  if (!misras || misras.length < 2) {
    continue;
  }

  const ends = misras.map(lastWord);

  const freq = {};
  for (const e of ends) {
    freq[e] = (freq[e] || 0) + 1;
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const topWord = sorted[0][0];
  const topCount = sorted[0][1];
  const ratio = topCount / misras.length;

  let wrongPairs = 0;
  const patternNotes = [];

  for (let i = 0; i < misras.length; i += 2) {
    const hasRadif1 = i < ends.length && ends[i] === topWord;
    const hasRadif2 = i + 1 < ends.length && ends[i + 1] === topWord;
    const bothExist = i + 1 < misras.length;

    if (bothExist) {
      if (i === 0 && hasRadif1 && hasRadif2) {
        patternNotes.push("M");
      } else if (!hasRadif1 && hasRadif2) {
        patternNotes.push(".");
      } else if (hasRadif1 && !hasRadif2) {
        patternNotes.push("R1");  // radif in first only — suspect
        wrongPairs++;
      } else if (!hasRadif1 && !hasRadif2) {
        patternNotes.push("NN"); // neither has radif — suspect
        wrongPairs++;
      } else {
        patternNotes.push("BR"); // both radif (non-matla) — suspect
        wrongPairs++;
      }
    } else {
      patternNotes.push("×");  // odd leftover
    }
  }

  if (wrongPairs > 0) {
    suspects.push({
      file: f,
      misras: misras.length,
      radif: topWord,
      radifCount: topCount,
      ratio: ratio.toFixed(2),
      wrong: wrongPairs,
      pattern: patternNotes.join(""),
    });
    totalSuspect++;
  } else {
    totalOk++;
  }
}

console.log(`Clean:  ${totalOk}`);
console.log(`Suspect: ${totalSuspect}`);
console.log(`Total:   ${totalOk + totalSuspect}`);
console.log("");

suspects.sort((a, b) => b.wrong - a.wrong || b.misras - a.misras);
console.log("FILE                         |MSRS|RADIF  |RATIO|WRNG|PATTERN");
console.log("-".repeat(85));
for (const s of suspects.slice(0, 50)) {
  const f = s.file.padEnd(27);
  const m = String(s.misras).padStart(4);
  const r = (s.radif.length > 6 ? s.radif.slice(0, 6) + "…" : s.radif).padEnd(7);
  const ra = s.ratio.padStart(5);
  const w = String(s.wrong).padStart(4);
  const p = s.pattern.slice(0, 30).padEnd(30);
  console.log(`${f}|${m} |${r}|${ra}|${w}|${p}`);
}
if (suspects.length > 50) {
  console.log(`... and ${suspects.length - 50} more`);
}
