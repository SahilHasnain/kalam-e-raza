/**
 * Post-process: fix section heading titles, rebuild index.
 * 
 * Issues fixed:
 * 1. Section heading titles (وصل, ردیف, تمہید, خلاصہ, etc.) → use first verse as title
 * 2. Rebuild kalams.ts index
 */
const fs = require("fs");
const crypto = require("crypto");

const KALAMS_DIR = "src/data/kalams";
const INDEX_FILE = "src/data/kalams.ts";

// Section heading patterns that should not be kalam titles
const SECTION_HEADINGS = [
  /^وَصل/i,
  /^ردیف/i,
  /^تمہید/i,
  /^خلاصہ/i,
  /^رباعی/i,
  /^حمد\s*$/,
  /^صلوٰۃ\s*$/,
  /^شجرہ/i,
  /^وظیفہ/i,
  /^اَلْمُبَاہَات/i,
  /^فِی /i,
  /^اَلْمَطْلَع/i,
  /^اَ لْاِسْتِعَانَۃ/i,
  /^اِنْتِسَاب/i,
  /^تَمْہِیْد/i,
  /^بَہ اُمید/i,
  /^تَرزبانی/i,
  /^نَفیر/i,
  /^عَفْو/i,
  /^فَغان/i,
  /^مَطْلع/i,
  /^تَسلِیَہ/i,
  /^سلسلۂ سخن/i,
  /^مِسْک/i,
  /^اَ لْاِلْتِفَات/i,
  /^گُریز/i,
  /^زیب/i,
  /^فَصْل/i,
  /^کاش/i,
  /^بَکار/i,
  /^اے شافعِ تردامناں/i,
  /^شَجَرَۃ/i,
  /^نالہ/i,
  /^ستر برس/i,
  /^مثنوی/i,
  /^قطعہ/i,
  /^اکسیر/i,
  /^اوّل/i,
  /^قصیدۃ/i,
  /^پہاڑوں/i,
  /^غزل/i,
  /^نظم/i,
  /^اَلَا/i,
  /^صبح/i,
  /^دیواریں/i,
  /^اُمَّتان/i,
  /^کعبہ/i,
  /^زِ عَکْسَت/i,
  /^تَرنُّم/i,
  /^سخاوت/i,
  /^مصطفٰے جان/i,
  /^فرمان/i,
];

function generateId(title) {
  const hash = crypto.createHash("md5").update(title).digest("hex");
  return "kalam-" + hash.slice(0, 8);
}

function isSectionHeading(title) {
  return SECTION_HEADINGS.some(pat => pat.test(title));
}

function main() {
  const files = fs.readdirSync(KALAMS_DIR).filter(f => f.startsWith("kalam-") && f.endsWith(".ts"));
  console.log(`Found ${files.length} kalam files`);
  
  let fixed = 0;
  let regenerated = [];
  
  for (const file of files) {
    const filePath = `${KALAMS_DIR}/${file}`;
    let content = fs.readFileSync(filePath, "utf-8");
    
    // Extract title
    const titleMatch = content.match(/titleUr: "(.+?)"/);
    if (!titleMatch) continue;
    
    const title = titleMatch[1];
    
    // Extract verses array
    const versesMatch = content.match(/versesUr: \[([\s\S]*?)\];/);
    if (!versesMatch) continue;
    
    const versesStr = versesMatch[1];
    const verses = versesStr.split(",\n").map(v => v.trim().replace(/^"(.*)"$/, "$1")).filter(v => v && !v.startsWith("}"));
    
    // Check if title is a section heading
    if (isSectionHeading(title) && verses.length > 1) {
      // Use first verse as new title
      const newTitle = verses[0];
      
      // Check if the new title still has the section heading
      if (isSectionHeading(newTitle)) continue;
      
      // Remove first verse from verses array (it was the section heading)
      const newVerses = verses.slice(1);
      
      // Regenerate ID with new title
      const newId = generateId(newTitle);
      const newFile = `${newId}.ts`;
      
      // Build verses string
      const versesStr = newVerses.map(v => `      ${JSON.stringify(v)}`).join(",\n");
      
      const newContent = `import type { Kalam } from "@/src/types";

const kalam: Kalam = {
  id: ${JSON.stringify(newId)},
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: ${JSON.stringify(newTitle)},
  titleRo: "",
  versesUr: [
${versesStr},
  ],
};

export default kalam;
`;
      
      fs.writeFileSync(`${KALAMS_DIR}/${newFile}`, newContent, "utf-8");
      
      // Delete old file (if different name)
      if (newFile !== file) {
        fs.unlinkSync(filePath);
        console.log(`  Fixed: ${title.substring(0, 40)} → ${newTitle.substring(0, 40)} (${file} → ${newFile})`);
      } else {
        fs.writeFileSync(filePath, newContent, "utf-8");
        console.log(`  Updated: ${title.substring(0, 40)} → ${newTitle.substring(0, 40)}`);
      }
      
      fixed++;
    } else if (!isSectionHeading(title)) {
      regenerated.push(file.replace(".ts", ""));
    }
  }
  
  // Now rebuild index
  const finalFiles = fs.readdirSync(KALAMS_DIR).filter(f => f.startsWith("kalam-") && f.endsWith(".ts"));
  finalFiles.sort();
  
  console.log(`\nRebuilding index with ${finalFiles.length} files...`);
  
  const imports = finalFiles.map(f => {
    const id = f.replace(".ts", "");
    return `import kalam${id.replace("kalam-", "")} from "./kalams/${f}";`;
  });
  
  const items = finalFiles.map(f => {
    const id = f.replace(".ts", "");
    return `  kalam${id.replace("kalam-", "")},`;
  });
  
  // Also fix src/data/index.ts if needed
  
  const indexContent = `// Auto-generated. Do not edit.
import type { Kalam } from "@/src/types";
${imports.join("\n")}

const kalams: Kalam[] = [
${items.join("\n")}
];

export default kalams;
`;
  
  fs.writeFileSync(INDEX_FILE, indexContent, "utf-8");
  
  console.log(`\nDone! Fixed ${fixed} files, rebuilt index with ${finalFiles.length} entries.`);
}

main();
