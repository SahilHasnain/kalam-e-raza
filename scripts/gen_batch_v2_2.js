const fs = require("fs");
const d = require("./content.json");

function cleanPage(idx) {
  if (!d[idx] || !d[idx].text) return [];
  return d[idx].text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.match(/^\d+$/));
}

const poems = [
  {
    n: 6,
    titleRo: "Kaa'be Ke Badrud-Duja",
    titleEn: "O Full Moon Of The Kaa'ba, Eliminating Darkness, Billions Of Benedictions Upon You",
    slug: "kaabe-ke-badrud-duja",
    startPage: 351,
    endPage: 365,
  },
  {
    n: 7,
    titleRo: "Salaam e Raza – Mustafa Jaan e Rahmat Pe Laakhoñ Salaam",
    titleEn: "Upon Mustafa, The Chosen One, The Soul Of Mercy, Millions Of Salutations",
    slug: "mustafa-jaan-e-rahmat-pe-laakhoñ-salaam",
    startPage: 366,
    endPage: 396,
  },
  {
    n: 8,
    titleRo: "Mustafa Khayr ul Wara Ho",
    titleEn: "The Greatest In The Creation, O Mustafa, You Are Being",
    slug: "mustafa-khayr-ul-wara-ho",
    startPage: 397,
    endPage: 401,
  },
  {
    n: 9,
    titleRo: "Milk e Khaas e Kibriya",
    titleEn: "In The True Sense, Only To Allah, You Are Belonging",
    slug: "milk-e-khaas-e-kibriya",
    startPage: 402,
    endPage: 404,
  },
  {
    n: 10,
    titleRo: "Zameen o Zamaañ Tumhaare Liye",
    titleEn: "For You, The Space And The Time Are Existing",
    slug: "zameen-o-zamaan-tumhaare-liye",
    startPage: 405,
    endPage: 410,
  },
  {
    n: 11,
    titleRo: "Nazar Ek Chaman Se Do Chaar Hai",
    titleEn: "Before My Eyes Is A Garden, Which Is Not Just A Garden",
    slug: "nazar-ek-chaman-se-do-chaar-hai",
    startPage: 411,
    endPage: 417,
  },
];

function isEnglishLine(line) {
  // English lines contain structural words that Roman Urdu lines don't
  return /\b(the|a |an |upon|from|with|that |this |these |those |which |whose|what |when |where |how |being|having|doing)\b/i.test(line);
}

function generateFiles(poem) {
  let lines = [];
  for (let i = poem.startPage; i <= poem.endPage; i++)
    lines = lines.concat(cleanPage(i));

  // Skip title (line 0)
  const body = lines.slice(1);
  const total = body.length;

  // Determine sher grouping
  let sherSize;
  if (total % 6 === 0 && total % 4 !== 0) {
    sherSize = 6; // Only divisible by 6 (poems 10, 11)
  } else if (total % 4 === 0 && total % 6 !== 0) {
    sherSize = 4; // Only divisible by 4 (poem 7)
  } else if (total % 4 === 0 && total % 6 === 0) {
    // Ambiguous - check content of lines 4-5 (0-indexed from body)
    if (isEnglishLine(body[4]) && isEnglishLine(body[5])) {
      sherSize = 6; // Lines 5-6 are En → 6-line (poem 6)
    } else {
      sherSize = 4; // Lines 5-6 are Ro → 4-line (poems 8, 9)
    }
  } else {
    console.error(`Cannot determine sher grouping for poem ${poem.n}: total=${total}`);
    return;
  }

  const numShers = total / sherSize;
  console.log(`Poem ${poem.n}: ${total} lines, ${sherSize}/sher = ${numShers} shers`);

  // Generate versesRo array
  let versesRo = [];
  // Generate versesEn array
  let versesEn = [];

  for (let s = 0; s < numShers; s++) {
    const idx = s * sherSize;
    const ro1 = body[idx];
    const ro2 = body[idx + 1];

    let en1, en2;

    if (sherSize === 6) {
      // 6-line: Ro1, Ro2, En1a, En1b, En2a, En2b
      en1 = body[idx + 2] + " " + body[idx + 3];
      en2 = body[idx + 4] + " " + body[idx + 5];
    } else {
      // 4-line: Ro1, Ro2, En1, En2
      en1 = body[idx + 2];
      en2 = body[idx + 3];
    }

    versesRo.push({ m1: ro1, m2: ro2 });
    versesEn.push({
      ro: { m1: ro1, m2: ro2 },
      en: { m1: en1.trim(), m2: en2.trim() },
    });
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
  titleRo: "${poem.titleRo}",
  titleEn: "",
  versesUr: [],
  versesRo: [
`;

  for (const v of versesRo) {
    roContent += `    { m1: "${v.m1}", m2: "${v.m2}" },\n`;
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
  titleEn: "${poem.titleEn}",
  versesUr: [],
  versesEn: [
`;

  for (const v of versesEn) {
    enContent += `    {
      ro: { m1: "${v.ro.m1}", m2: "${v.ro.m2}" },
      en: { m1: "${v.en.m1}", m2: "${v.en.m2}" },
    },
`;
  }

  enContent += `  ],
};

export default kalam;
`;

  // Write files
  const roPath = `src/data/ro/${poem.slug}.ts`;
  const enPath = `src/data/en/${poem.slug}.ts`;

  fs.writeFileSync(roPath, roContent);
  fs.writeFileSync(enPath, enContent);

  console.log(`  Wrote ${roPath} and ${enPath}`);
}

for (const poem of poems) {
  generateFiles(poem);
}

console.log("\nDone! All batch 2 poems generated.");
