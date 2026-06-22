const fs = require("fs");
const d = require("./content.json");

function cleanPage(idx) {
  if (!d[idx] || !d[idx].text) return [];
  return d[idx].text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.match(/^\d+$/));
}

// Deduplicate consecutive identical lines
function dedupe(lines) {
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 || lines[i] !== lines[i - 1]) result.push(lines[i]);
  }
  return result;
}

const poems = [
  {
    n: 12,
    titleRo: "Imaan e Qaal e Mustafa-ee",
    titleEn: "Imaan Is The Blessed Saying Of Mustafa, The Qur'aan Is The Holy Condition Of Mustafa",
    slug: "imaan-e-qaal-e-mustafa-ee",
    startPage: 418,
    endPage: 423,
    titleLines: 1,
    sherSize: 4,
  },
  {
    n: 13,
    titleRo: "Zar're Jhar Kar Teri Pezaaroñ Ke",
    titleEn: "From Your Sacred Footwear, The Sacred Dust Particles Which Are Falling",
    slug: "zarre-jhar-kar-teri-pezaaron-ke",
    startPage: 424,
    endPage: 425,
    titleLines: 1,
    sherSize: 4,
  },
  {
    n: 14,
    titleRo: "Sar Soo e Rauza Jhuka Phir Tujh Ko Kya",
    titleEn: "If My Head Bowed In The Raudha's Direction, Then Why Does It Bother You?",
    slug: "sar-soo-e-rauza-jhuka-phir-tujh-ko-kya",
    startPage: 426,
    endPage: 428,
    titleLines: 1,
    sherSize: 4,
  },
  {
    n: 15,
    titleRo: "Wohi Rab'b Hai Jis Ne Tujh Ko Hama-Tan Karam Banaaya",
    titleEn: "Allah Is Our Creator, Who Made You Entirely, An Embodiment Of Generosity",
    slug: "wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya",
    startPage: 429,
    endPage: 432,
    titleLines: 2, // Title split across 2 lines
    sherSize: 6, // Mustazaad: Ro1, Ro2, Ro3 refrain, En1, En2, En3 refrain
  },
  {
    n: 16,
    titleRo: "Lahad Me Ishq e Rukh e Shah Ka Daagh Le Ke Chale",
    titleEn: "In The Grave, The Spot Of The Love Of My Master's Face, I Took With Me",
    slug: "lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale",
    startPage: 433,
    endPage: 435,
    titleLines: 2, // Title split across 2 lines
    sherSize: 4,
  },
  {
    n: 17,
    titleRo: "Ambia Ko Bhi Ajal Aani Hai",
    titleEn: "The Ambia Also Have To Pass Away Ultimately, But Such That It Is Only Momentarily",
    slug: "ambia-ko-bhi-ajal-aani-hai",
    startPage: 436,
    endPage: 437,
    titleLines: 1,
    sherSize: 4,
  },
];

function generateFiles(poem) {
  let lines = [];
  for (let i = poem.startPage; i <= poem.endPage; i++)
    lines = lines.concat(cleanPage(i));

  // For poem 17, stop before "Volume Two Conclusion"
  if (poem.n === 17) {
    const volEnd = lines.findIndex(l => l.includes("Volume Two Conclusion"));
    if (volEnd >= 0) lines = lines.slice(0, volEnd);
  }

  // Extract title lines
  const titleLines = lines.slice(0, poem.titleLines);
  let body = lines.slice(poem.titleLines);

  // Deduplicate body only (title may match first body line)
  const beforeDedup = body.length;
  body = dedupe(body);

  const totalBody = body.length;

  // Remove note lines at end (lines starting with "Note:")
  const noteIdx = body.findIndex(l => l.startsWith("Note:"));
  if (noteIdx >= 0) body = body.slice(0, noteIdx);

  const finalBody = body.length;

  // Check divisibility
  if (finalBody % poem.sherSize !== 0) {
    console.log(`  WARNING: body=${finalBody} not divisible by ${poem.sherSize}`);
    // Trim to nearest divisible count
    const trimTo = finalBody - (finalBody % poem.sherSize);
    console.log(`  Trimming to ${trimTo} lines`);
  }

  const usableLines = finalBody - (finalBody % poem.sherSize);
  const bodyTrimmed = body.slice(0, usableLines);
  const numShers = bodyTrimmed.length / poem.sherSize;

  console.log(`Poem ${poem.n}: total=${lines.length} body=${beforeDedup}→${finalBody} ${poem.sherSize}/sher=${numShers} shers`);

  // Build combined title for Ro
  let titleRoCombined = poem.titleRo;
  if (poem.titleLines > 1) {
    titleRoCombined = titleLines.join(" ");
  }

  // Generate versesRo and versesEn
  let versesRo = [];
  let versesEn = [];

  for (let s = 0; s < numShers; s++) {
    const idx = s * poem.sherSize;

    if (poem.sherSize === 4) {
      versesRo.push({ m1: bodyTrimmed[idx], m2: bodyTrimmed[idx + 1] });
      versesEn.push({
        ro: { m1: bodyTrimmed[idx], m2: bodyTrimmed[idx + 1] },
        en: { m1: bodyTrimmed[idx + 2], m2: bodyTrimmed[idx + 3] },
      });
    } else if (poem.sherSize === 6) {
      // Mustazaad: Ro1, Ro2, Ro3(refrain), En1, En2, En3(refrain)
      // Combine Ro2+Ro3 and En2+En3 to fit Sher type (m1,m2)
      const ro1 = bodyTrimmed[idx];
      const ro2 = bodyTrimmed[idx + 1];
      const ro3 = bodyTrimmed[idx + 2];
      const en1 = bodyTrimmed[idx + 3];
      const en2 = bodyTrimmed[idx + 4];
      const en3 = bodyTrimmed[idx + 5];

      versesRo.push({ m1: ro1, m2: ro2 + " " + ro3 });
      versesEn.push({
        ro: { m1: ro1, m2: ro2 + " " + ro3 },
        en: { m1: en1, m2: en2 + " " + en3 },
      });
    }
  }

  function esc(s) {
    return s.replace(/"/g, '\\"').replace(/\n/g, "\\n");
  }

  // Generate Ro file
  let roContent = `import type { Kalam } from "@/src/types";

const kalam: Kalam = {
  id: "ro-${poem.slug}",
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: "",
  titleRo: "${esc(titleRoCombined)}",
  titleEn: "",
  versesUr: [],
  versesRo: [
`;

  for (const v of versesRo) {
    roContent += `    { m1: "${esc(v.m1)}", m2: "${esc(v.m2)}" },\n`;
  }

  roContent += `  ],
};

export default kalam;
`;

  // Generate En file
  let enContent = `import type { Kalam } from "@/src/types";

const kalam: Kalam = {
  id: "en-${poem.slug}",
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: "",
  titleRo: "",
  titleEn: "${esc(poem.titleEn)}",
  versesUr: [],
  versesEn: [
`;

  for (const v of versesEn) {
    enContent += `    {
      ro: { m1: "${esc(v.ro.m1)}", m2: "${esc(v.ro.m2)}" },
      en: { m1: "${esc(v.en.m1)}", m2: "${esc(v.en.m2)}" },
    },
`;
  }

  enContent += `  ],
};

export default kalam;
`;

  const roPath = `src/data/ro/${poem.slug}.ts`;
  const enPath = `src/data/en/${poem.slug}.ts`;

  fs.writeFileSync(roPath, roContent);
  fs.writeFileSync(enPath, enContent);

  // Count shers in output
  const roLines = fs.readFileSync(roPath, "utf8").split("\n");
  const roCount = roLines.filter(l => l.trim().startsWith('{ m1:') && l.includes('m2:')).length;
  if (roCount !== numShers) {
    console.log(`  WARNING: File sher count (${roCount}) != expected (${numShers})`);
  }
}

for (const poem of poems) {
  generateFiles(poem);
}

console.log("\nDone! All batch 3 poems generated.");
