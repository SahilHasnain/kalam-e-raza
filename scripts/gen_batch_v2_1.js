const fs = require('fs');
const path = require('path');
const d = require('./content.json');
const base = path.resolve(__dirname, '..');

function cleanPage(idx) {
  if (!d[idx] || !d[idx].text) return [];
  return d[idx].text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.match(/^\d+$/));
}

const poems = [
  {
    id: 1,
    start: 324, end: 333,
    titleRo: "Subh Taiba Me Huwi Bat'ta Hai Baara Noor Ka",
    titleEn: "At The Break Of Dawn In Madina, Distributed Are Alms Of Light",
    roSlug: "subh-taiba-me-huwi-batta-hai-baara-noor-ka",
    enSlug: "at-the-break-of-dawn-in-madina-distributed-are-alms-of-light",
    skipTitle: 1,
    skipTail: 2,  // translator note
  },
  {
    id: 2,
    start: 334, end: 337,
    titleRo: "Tera Zar'rah Mah e Kaamil Hai Ya Ghaus",
    titleEn: "O Ghaus! Your Single Dust Particle Is Like The Perfect Full Moon's Illumination",
    roSlug: "tera-zarrah-mah-e-kaamil-hai-ya-ghaus",
    enSlug: "o-ghaus-your-single-dust-particle-is-like-the-perfect-full-moons-illumination",
    skipTitle: 1,
    skipTail: 0,
  },
  {
    id: 3,
    start: 338, end: 341,
    titleRo: "Jo Tera Tifl Hai Kaamil Hai Ya Ghaus",
    titleEn: "O Ghaus! Even A Child In Your Saintly Court Attained A Saintly Position",
    roSlug: "jo-tera-tifl-hai-kaamil-hai-ya-ghaus",
    enSlug: "o-ghaus-even-a-child-in-your-saintly-court-attained-a-saintly-position",
    skipTitle: 1,
    skipTail: 0,
  },
  {
    id: 4,
    start: 342, end: 345,
    titleRo: "Badal Ya Fard Jo Kaamil Hai Ya Ghaus",
    titleEn: "O Ghaus! The One Who Is A True Abdaal & Mystic In The Saintly Station",
    roSlug: "badal-ya-fard-jo-kaamil-hai-ya-ghaus",
    enSlug: "o-ghaus-the-one-who-is-a-true-abdaal-and-mystic-in-the-saintly-station",
    skipTitle: 1,
    skipTail: 0,
  },
  {
    id: 5,
    start: 346, end: 346,
    titleRo: "Talab Ka Munh To Kis Qaabil Hai Ya Ghaus",
    titleEn: "O Ghaus! To Seek Your Blessings With This Mouth I Have No Ability",
    roSlug: "talab-ka-munh-to-kis-qaabil-hai-ya-ghaus",
    enSlug: "o-ghaus-to-seek-your-blessings-with-this-mouth-i-have-no-ability",
    skipTitle: 1,
    skipTail: 0,
  },
];

for (const poem of poems) {
  let allLines = [];
  for (let i = poem.start; i <= poem.end; i++) allLines = allLines.concat(cleanPage(i));
  
  // Remove title and tail notes
  const body = allLines.slice(poem.skipTitle, poem.skipTail ? -poem.skipTail : undefined);
  
  if (body.length % 4 !== 0) {
    console.log(`ERROR poem ${poem.id}: ${body.length} lines not divisible by 4`);
    continue;
  }
  
  const numShers = body.length / 4;
  const shersRo = [];
  const shersEn = [];
  
  for (let i = 0; i < body.length; i += 4) {
    shersRo.push({ m1: body[i], m2: body[i+1] });
    shersEn.push({
      ro: { m1: body[i], m2: body[i+1] },
      en: { m1: body[i+2], m2: body[i+3] }
    });
  }
  
  // Generate Ro file
  const roContent = `import type { Kalam } from "@/src/types";

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

  // Generate En file
  const enContent = `import type { Kalam } from "@/src/types";

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

  const roPath = path.join(base, 'src/data/ro', poem.roSlug + '.ts');
  const enPath = path.join(base, 'src/data/en', poem.enSlug + '.ts');
  
  fs.writeFileSync(roPath, roContent);
  fs.writeFileSync(enPath, enContent);
  
  console.log(`Poem ${poem.id}: ${numShers} shers written ✓`);
}

console.log('\nBatch 1 complete!');
