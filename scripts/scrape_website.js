/**
 * Scraper for Hadaiq-e-Bakhshish
 * 
 * Simplified approach:
 * 1. Fetch all content pages (15-446), extract #book__content__main div
 * 2. Join all verses into one large text
 * 3. Split into individual kalams using "دیگر" and star patterns as separators
 * 4. First line of each kalam = title (if it looks like one)
 * 5. Pair she'rs, write individual kalam files
 */
const fs = require("fs");
const https = require("https");
const crypto = require("crypto");

const BASE_URL = "https://www.dawateislami.net/bookslibrary/ur/hadaiq-e-bakhshish";
const OUT_DIR = "src/data/kalams";
const CACHE_DIR = ".scrape_cache";
const RAW_FILE = "scripts/hadaiq_clean.txt";

for (const dir of [OUT_DIR, CACHE_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 60000, headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.on("timeout", function () { req.destroy(); reject(new Error("timeout")); });
  });
}

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

/** Extract content from #book__content__main div */
function extractBookContent(html) {
  const m = html.match(/<div[^>]*id="book__content__main"[^>]*>(.*?)<\/div>\s*<\/pre>/s);
  if (!m) return "";
  let content = m[1]
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, "")
    .trim();
  return content;
}

/** Get last word (radif candidate) */
function lastWord(s) {
  s = s.trim();
  const m = s.match(/([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\u0621-\u064A0-9\u0660-\u0669]+)\s*$/);
  return m ? m[1] : s.slice(-8);
}

/** Check if line is non-verse */
function isNonVerse(line) {
  line = line.trim();
  if (!line || line.length < 3) return true;
  if (/^[\*\.\-\s]{3,}$/.test(line)) return true;
  if (/^دیگر\s*$/.test(line)) return true;
  if (/^(Page|First|Prev|Next|Last|Home|[A-Z][a-z]+)\b/i.test(line)) return true;
  return false;
}

/** Check if a line looks like a kalam title (short, has no radif match below) */
function looksLikeTitle(line) {
  return line.length < 60 && line.length > 3;
}

function generateId(title) {
  const hash = crypto.createHash("md5").update(title).digest("hex");
  return "kalam-" + hash.slice(0, 8);
}

function pairShers(misras) {
  if (misras.length < 2) return misras.map(m => ({ misra1: m, misra2: "" }));
  
  const ends = misras.map(m => lastWord(m));
  const freq = {};
  for (const e of ends) freq[e] = (freq[e] || 0) + 1;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const radif = sorted[0] && sorted[0][1] >= Math.ceil(misras.length * 0.2) ? sorted[0][0] : null;

  const shers = [];
  for (let i = 0; i < misras.length; i += 2) {
    if (i + 1 >= misras.length) {
      shers.push({ misra1: misras[i], misra2: "" });
      break;
    }
    const first = misras[i];
    const second = misras[i + 1];
    const e0 = lastWord(first);
    const e1 = lastWord(second);

    if (radif && e0 === radif && e1 !== radif) {
      shers.push({ misra1: second, misra2: first });
    } else {
      shers.push({ misra1: first, misra2: second });
    }
  }
  return shers;
}

async function main() {
  // Step 1: Fetch content pages in batches
  const START_PAGE = 15;
  const END_PAGE = 446;
  const BATCH_SIZE = 5;

  let allContentParts = [];
  
  console.log(`Fetching pages ${START_PAGE}-${END_PAGE}...`);
  
  for (let batchStart = START_PAGE; batchStart <= END_PAGE; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, END_PAGE);
    const promises = [];
    
    for (let p = batchStart; p <= batchEnd; p++) {
      const cacheFile = `${CACHE_DIR}/page-${p}.txt`;
      
      if (fs.existsSync(cacheFile)) {
        promises.push(Promise.resolve({ page: p, content: fs.readFileSync(cacheFile, "utf-8") }));
      } else {
        promises.push(
          fetchWithRetry(`${BASE_URL}/page-${p}`)
            .then(html => {
              const content = extractBookContent(html);
              fs.writeFileSync(cacheFile, content, "utf-8");
              return { page: p, content };
            })
            .catch(err => {
              console.log(`  Page ${p}: error - ${err.message}`);
              return { page: p, content: "" };
            })
        );
      }
    }
    
    const results = await Promise.all(promises);
    for (const r of results) {
      if (r.content) {
        allContentParts.push(r.content);
      }
    }
    
    const batchLines = results.filter(r => r.content).reduce((s, r) => s + r.content.split("\n").length, 0);
    const emptyCount = results.filter(r => !r.content).length;
    if (batchLines > 0 || emptyCount === BATCH_SIZE) {
      console.log(`  Pages ${batchStart}-${batchEnd}: ${batchLines} lines, ${emptyCount} empty`);
    }
    
    if (batchEnd < END_PAGE) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Write raw content
  const rawText = allContentParts.join("\n");
  fs.writeFileSync(RAW_FILE, rawText, "utf-8");
  console.log(`\nRaw content written to ${RAW_FILE} (${rawText.length} bytes, ${rawText.split("\n").length} lines)`);

  // Step 2: Parse into individual kalams
  console.log("\nParsing into kalams...");
  
  // Split into verses and filter non-verse content
  const allLines = rawText.split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 2);
  
  console.log(`Total lines: ${allLines.length}`);
  
  // Detect separators
  const kalams = [];
  let currentVerses = [];
  let currentTitle = null;
  
  for (const line of allLines) {
    // Check if this is a separator
    if (line === "دیگر" || /^[\*\.\-\s]{3,}$/.test(line)) {
      // Save current kalam if we have one
      if (currentVerses.length > 1) {
        kalams.push({
          title: currentTitle || currentVerses[0],
          verses: [...currentVerses],
        });
      }
      currentVerses = [];
      currentTitle = null;
      continue;
    }
    
    // Check if this looks like a title (first verse of a new kalam)
    // A title is typically shorter, followed by verses with same radif
    if (!currentTitle && looksLikeTitle(line)) {
      currentTitle = line;
      continue;
    }
    
    currentVerses.push(line);
  }
  
  // Flush last kalam
  if (currentVerses.length > 1) {
    kalams.push({
      title: currentTitle || currentVerses[0],
      verses: [...currentVerses],
    });
  }

  console.log(`Found ${kalams.length} kalams`);

  // Step 3: Pair she'rs and write files
  console.log("\nWriting kalam files...");
  
  let written = 0;
  let totalShers = 0;
  let skipped = 0;
  
  for (const k of kalams) {
    const title = k.title.replace(/[\/\\?%*:|"<>]/g, "").trim();
    if (!title || k.verses.length < 2) {
      skipped++;
      continue;
    }
    
    const shers = pairShers(k.verses);
    
    // Build flat misras array
    const flatMisras = [];
    for (const sh of shers) {
      flatMisras.push(sh.misra1);
      if (sh.misra2) flatMisras.push(sh.misra2);
    }
    
    const id = generateId(title);
    const versesStr = flatMisras.map(v => `      ${JSON.stringify(v)}`).join(",\n");
    
    const content = `import type { Kalam } from "@/src/types";

const kalam: Kalam = {
  id: ${JSON.stringify(id)},
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: ${JSON.stringify(title)},
  titleRo: "",
  versesUr: [
${versesStr},
  ],
};

export default kalam;
`;
    
    fs.writeFileSync(`${OUT_DIR}/${id}.ts`, content, "utf-8");
    written++;
    totalShers += shers.length;
    
    if (written <= 10) {
      console.log(`  [${written}] ${title.substring(0, 50)}... (${shers.length} she'rs)`);
    }
  }

  console.log(`\nDone! Written ${written} kalam files, skipped ${skipped}`);
  console.log(`Total she'rs: ${totalShers}`);
}

main().catch(console.error);
