const fs = require('fs');
const path = require('path');
const d = require('./content.json');
const base = path.resolve(__dirname, '..');

function cleanPage(idx) {
  if (!d[idx] || !d[idx].text) return [];
  return d[idx].text.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.match(/^\d+$/));
}

function extractLines(startIdx, endIdx) {
  let lines = [];
  for (let i = startIdx; i <= endIdx; i++) lines = lines.concat(cleanPage(i));
  return lines;
}

// ============================================================
// POEM 79: Bheeni Suhaani Subh
// Structure: 2 title lines, then 4-line sher groups (Ro,Ro,En,En)
// Extra: "Puzzling" orphan at line 229 to remove
// ============================================================
function processPoem79() {
  const poem = {
    name: 'bheeni-suhaani-subh',
    start: 290, end: 300,
    titleRo: "Bheeni Suhaani Subh",
    titleEn: "In The Pleasantly Sweet Morning Breeze, Tranquil The Heart Is Feeling",
    roSlug: "bheeni-suhaani-subh",
    enSlug: "in-the-pleasantly-sweet-morning-breeze-tranquil-the-heart-is-feeling"
  };
  
  let allLines = extractLines(poem.start, poem.end);
  console.log(`Poem 79: ${allLines.length} raw lines`);
  
  // Remove "Puzzling" orphan (line 229)
  const puzzIdx = allLines.indexOf('Puzzling');
  if (puzzIdx >= 0) {
    allLines.splice(puzzIdx, 1);
    console.log(`  Removed orphan "Puzzling" at line ${puzzIdx}`);
  }
  
  // Skip 2 title lines
  let lines = allLines.slice(2);
  console.log(`  ${lines.length} lines for shers`);
  
  if (lines.length % 4 !== 0) {
    console.log(`  ERROR: ${lines.length} not divisible by 4`);
    return;
  }
  
  const numShers = lines.length / 4;
  const shersRo = [];
  const shersEn = [];
  for (let i = 0; i < lines.length; i += 4) {
    shersRo.push({ m1: lines[i], m2: lines[i+1] });
    shersEn.push({
      ro: { m1: lines[i], m2: lines[i+1] },
      en: { m1: lines[i+2], m2: lines[i+3] }
    });
  }
  
  writeFiles(poem, shersRo, shersEn);
  console.log(`  Written: ${numShers} shers ✓`);
}

// ============================================================
// POEM 80: Wo Sarwar e Kishwar e Risaalat (Qasida e Me'rajiya)
// Structure: 1 title line, then 6-line sher groups:
//   Ro_m1, Ro_m2, En_m1a, En_m1b, En_m2a, En_m2b
// English lines span 2 lines each; merge them.
// ============================================================
function processPoem80() {
  const poem = {
    name: 'wo-sarwar-e-kishwar-e-risaalat',
    start: 301, end: 317,
    titleRo: "Wo Sarwar e Kishwar e Risaalat",
    titleEn: "Me'raj - The Ascension. When Upon The Exalted Arsh Of Almighty Allah, The Emperor Of The Realm Of Prophethood Manifested",
    roSlug: "wo-sarwar-e-kishwar-e-risaalat",
    enSlug: "me-raj-the-ascension-when-upon-the-exalted-arsh-of-almighty-allah"
  };
  
  let allLines = extractLines(poem.start, poem.end);
  console.log(`Poem 80: ${allLines.length} raw lines`);
  
  // Verify first line is title
  console.log(`  Title: "${allLines[0].substring(0,60)}"`);
  console.log(`  Line 1: "${allLines[1].substring(0,60)}"`);
  
  // Skip 1 title line
  let lines = allLines.slice(1);
  console.log(`  ${lines.length} lines for shers`);
  
  // Should be divisible by 6 (Ro_m1, Ro_m2, En_m1a, En_m1b, En_m2a, En_m2b)
  if (lines.length % 6 !== 0) {
    console.log(`  ERROR: ${lines.length} not divisible by 6`);
    // Show last few lines
    for (let i = Math.max(0, lines.length-8); i < lines.length; i++) {
      console.log(`  [${i}] ${lines[i].substring(0,80)}`);
    }
    return;
  }
  
  const numShers = lines.length / 6;
  const shersRo = [];
  const shersEn = [];
  for (let i = 0; i < lines.length; i += 6) {
    const ro_m1 = lines[i];
    const ro_m2 = lines[i+1];
    const en_m1 = (lines[i+2] + ' ' + lines[i+3]).replace(/\s+/g, ' ').trim();
    // Remove trailing comma/space from en_m1
    const en_m2 = (lines[i+4] + ' ' + lines[i+5]).replace(/\s+/g, ' ').trim();
    
    shersRo.push({ m1: ro_m1, m2: ro_m2 });
    shersEn.push({
      ro: { m1: ro_m1, m2: ro_m2 },
      en: { m1: en_m1, m2: en_m2 }
    });
  }
  
  writeFiles(poem, shersRo, shersEn);
  console.log(`  Written: ${numShers} shers ✓`);
  console.log(`  First: "${shersEn[0].en.m1.substring(0,60)}"`);
  console.log(`  First: "${shersEn[0].en.m2.substring(0,60)}"`);
}

// ============================================================
// POEM 81: Ruba'iyaat - Poetic Quatrains
// Structure: 1 title line, then 8 numbered quatrains
// Each quatrain: "Nth Poetic Quatrain", 4 Ro lines, 4 En lines
// ============================================================
function processPoem81() {
  const poem = {
    name: 'rubaiyaat-poetic-quatrains',
    start: 318, end: 320,
    titleRo: "Ruba'iyaat - Poetic Quatrains",
    titleEn: "Poetic Quatrains - Ruba'iyaat",
    roSlug: "rubaiyaat-poetic-quatrains",
    enSlug: "poetic-quatrains-rubaiyaat"
  };
  
  let allLines = extractLines(poem.start, poem.end);
  console.log(`Poem 81: ${allLines.length} raw lines`);
  
  // Each quatrain: title, 4 Ro lines, 4 En lines
  // Quatrain 2 has a translator note after En lines (lines 19-25) - skip it
  // Split each 4-line quatrain into 2 shers (2+2 lines)
  const quatrains = [
    { ro: [2,3,4,5], en: [6,7,8,9] },
    { ro: [11,12,13,14], en: [15,16,17,18] },   // skip translator note
    { ro: [27,28,29,30], en: [31,32,33,34] },
    { ro: [36,37,38,39], en: [40,41,42,43] },
    { ro: [45,46,47,48], en: [49,50,51,52] },
    { ro: [54,55,56,57], en: [58,59,60,61] },
    { ro: [63,64,65,66], en: [67,68,69,70] },
    { ro: [72,73,74,75], en: [76,77,78,79] },
  ];
  
  const shersRo = [];
  const shersEn = [];
  
  for (const q of quatrains) {
    // Sher 1: lines 0+1
    shersRo.push({ m1: allLines[q.ro[0]], m2: allLines[q.ro[1]] });
    shersEn.push({
      ro: { m1: allLines[q.ro[0]], m2: allLines[q.ro[1]] },
      en: { m1: allLines[q.en[0]], m2: allLines[q.en[1]] }
    });
    
    // Sher 2: lines 2+3
    shersRo.push({ m1: allLines[q.ro[2]], m2: allLines[q.ro[3]] });
    shersEn.push({
      ro: { m1: allLines[q.ro[2]], m2: allLines[q.ro[3]] },
      en: { m1: allLines[q.en[2]], m2: allLines[q.en[3]] }
    });
  }
  
  writeFiles(poem, shersRo, shersEn);
  console.log(`  Written: ${shersRo.length} shers (${quatrains.length} quatrains) ✓`);
}

// ============================================================
// Write files
// ============================================================
function writeFiles(poem, shersRo, shersEn) {
  let roContent = `import type { Kalam } from "@/src/types";

const kalam: Kalam = {
  id: "ro-${poem.roSlug}",
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: "",
  titleRo: ${JSON.stringify(poem.titleRo)},
  titleEn: "",
  versesUr: [],
  versesRo: [
${shersRo.map(s => `    { m1: ${JSON.stringify(s.m1)}, m2: ${JSON.stringify(s.m2)} }`).join(',\n')}
  ],
};

export default kalam;
`;

  let enContent = `import type { Kalam } from "@/src/types";

const kalam: Kalam = {
  id: "en-${poem.roSlug}",
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: "",
  titleRo: "",
  titleEn: ${JSON.stringify(poem.titleEn)},
  versesUr: [],
  versesEn: [
${shersEn.map(s => `    {
      ro: { m1: ${JSON.stringify(s.ro.m1)}, m2: ${JSON.stringify(s.ro.m2)} },
      en: { m1: ${JSON.stringify(s.en.m1)}, m2: ${JSON.stringify(s.en.m2)} },
    }`).join(',\n')}
  ],
};

export default kalam;
`;

  fs.writeFileSync(path.join(base, 'src/data/ro', poem.roSlug + '.ts'), roContent);
  fs.writeFileSync(path.join(base, 'src/data/en', poem.enSlug + '.ts'), enContent);
}

// Run
console.log('=== Batch 8 Parser ===\n');
processPoem79();
console.log();
processPoem80();
console.log();
processPoem81();
console.log('\nDone!');
