/**
 * Generates src/data/youtube.ts by matching Naghmat e Raza playlist
 * video titles to existing kalam slugs using regex patterns.
 *
 * Run: node scripts/gen_youtube_map.js
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyA1rxvVTECDW4cSleuY6rZwVfKLHMuRw9Q";
const PLAYLIST_ID = "PLayKa92BaHdB3opLbcECvQzz9w_nCXKk4";

/**
 * Pattern-based matching: each entry maps a regex pattern (applied to the
 * cleaned lowercased title) to a Ro slug.  Patterns are tried in order.
 */
const PATTERNS = [
  // Ep#125/124/123 — Ya Elahi Reham Farma
  [/ya[\s-]*elahi[\s-]*reham[\s-]*farma/i, "ya-ilaahi-rahm-farma-mustafa-ke-waaste"],

  // Ep#122 — Qaflay Nay Suay Taiba
  [/qafl[ai]y?[\s-]*n[ae]y?[\s-]*s[uo][ae]?y?[\s-]*ta[ei]ba/i, "qaafile-ne-soo-e-taiba-kamar-aaraa-ee-ki"],

  // Ep#121 — Waha Kiya Martaba Ae Ghaus
  [/\bwaha?\s+kiya?\s+martaba\s+ae?\s+gh[ou]us\b/i, null, "waah-kya-martaba-ay-ghaus"],

  // Ep#116/115 — Nazar Ik Chaman Say Do Chaar Hai
  [/nazar\s+(ik|ek)\s+chaman\s+[sz][ae]y?\s+do\s+chaar/i, "nazar-ek-chaman-se-do-chaar-hai"],

  // Ep#114 — Sir Ta Baqadam Hai Tanay Sultan Zaman Phool
  [/sir\s*ta\s*baqadam/i, null, null], // not in data

  // Ep#113 — Ankhain Ro Ro Kay Sujanay Walay
  [/a{1,2}n?kh[aei]{1,2}n?\s+ro[\s-]*ro\s+k[ae]y?\s+suja?[ai]?n[ae]y?/i, "aankhen-ro-ro-ke-sujaane-waale"],

  // Ep#112/111 — Kiskay Jalway Ki Jhalak Hai / Kis Ke Jalwe Ki Jhalak
  [/kis[sk]a?[ey]?\s+j[a]?lw[ae]y?\s+ki\s+jhalak\b/i, "kis-ke-jalwe-ki-jhalak-hai"],

  // Ep#110 — Na Asmaan Ko Youn Sirkasheeda Hona Tha  (this is "Na Arsh-e-Aiman")
  [/na\s+asmaan\s+ko\s+youn/i, "na-arsh-e-aiman"],

  // Ep#109 — Mujda e Rehmat e Haq Hum Ko Sunanay Walay (this is "Pesh-e-Haq Mujda...")
  [/mujda[\s-]*e?[\s-]*rehmat[\s-]*e?[\s-]*haq/i, "pesh-e-haq-muzhda-shafaat-ka-sunaate-jaa-enge"],

  // Ep#108 — Na Arsh e Aemun Na
  [/na\s+arsh\s+e?\s+a[ei]mun/i, "na-arsh-e-aiman"],

  // Ep#107 — Allah Allah Kay Nabi Say (also matches inside "Naghmat e Raza Ep#107...")
  [/allah\s+allah\s+k[ae]y?\s+nabi/i, "allah-allah-ke-nabi-se"],

  // Ep#106 — Syed e Konain Sultan e Jahan (this is "Nabi Sarwar e Har Rasool...")
  [/syed[\s-]*e?[\s-]*konain/i, "nabi-sarwar-e-har-rasool-o-wali-hai"],

  // Ep#105 — Banda Qadir Ka (not in data)
  [/banda\s+qadir/i, null, null],

  // Ep#104 — Nabi Server Her Rasool o Wali Hai
  [/nabi\s+(server|sarwar)\s+(her|har)\s+rasool/i, "nabi-sarwar-e-har-rasool-o-wali-hai"],

  // Ep#103 — Rashkay Qamar (not in data)
  [/rashk[ae]y?\s+qamar/i, null, null],

  // Ep#102 — Tu Hai Wo Ghous Kay Her Ghous Hai Sheda Tera (not in data)
  [/tu\s+hai\s+wo\s+ghous/i, null, null],

  // Ep#101 — Andheri Raat Hai Gham Ki Ghata
  [/andheri?\s+raat\s+(hai|h)\s+gham/i, "andheri-raat-hai-gham-ki-ghata"],

  // Ep#100 — Ronaq e Bazm e Jahan Hain Ashiqan e Sokta
  [/ronaq[\s-]*e?[\s-]*bazm[\s-]*e?[\s-]*jahan/i, "ronaak-e-bazm-e-jahaan-hai-aashiqaan-e-sokhta"],

  // Ep#99 — Zahay ezzat o Etilae Muhammad (not in data)
  [/zah[ae]y[\s-]*[ei]zzat/i, null, null],

  // Ep#98 — Dushman e Ahmed Pay Shiddat Kijieay
  [/dushman[\s-]*e?[\s-]*ahmed?\s+pa[ey]?\s+shiddat/i, "dushman-e-ahmad-pe-shiddat-kijiye"],

  // Ep#97 — Zarray Jhar Kar Teri Paizaron Kay
  [/zarr[ae]y?\s+jhar\s+kar/i, "zarre-jhar-kar-teri-pezaaron-ke"],

  // Ep#96/95/94 — Shukray Khuda Kay Aaj Ghari Us Safar Ki Hai
  [/shukr[ae]y?\s+khuda\s+k[ae]y?\s+aaj\s+ghari/i, "shukr-e-khuda-ke-aaj-ghari-us-safar-ki-hai"],

  // Ep#93 — Lahad May Ishq e Rukh e Shah Ka Daagh Lay Kay Chalay
  [/lahad\s+(may|mei?n?)\s+ishq/i, "lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale"],

  // Ep#92 — Hai Lab e Esa Say Jaan bakhshi (not in data)
  [/lab[\s-]*e?[\s-]*esa/i, null, null],

  // Ep#91/90 — Emaan Hai Qaal e Mustafai
  [/ema?[ae]?n?\s+hai\s+qa[ea]l/i, "imaan-e-qaal-e-mustafa-ee"],

  // Ep#89 — Pochtay Kiya Ho Arsh Per Youn Gai (not in data — different poem)
  [/ars[h]?\s+per\s+youn\s+gai/i, null, null],

  // Ep#88 — Naar e Dozhaq Ko Chaman Karday (not in data)
  [/na[ea]r[\s-]*e?[\s-]*dozhaq/i, null, null],

  // Ep#87/86 — Hajion Ao Shahenshaha Ka Roza Dekho (not in data)
  [/h[ae]j[iy]o[n]?\s+ao\s+shahenshaha/i, null, null],

  // Ep#85/84 — Arsh e Haq Hai Masnad e Rifat
  [/arsh[\s-]*e?[\s-]*haq\s+hai\s+masnad/i, "arsh-e-haq-hai-masnad-e-rifat-rasoolullah-ki"],

  // Ep#83 — Hirz e Jaan Zikr e Shafaat Kijieay
  [/hirz[\s-]*e?[\s-]*jaan\s+zikr/i, "hirz-e-jaan-zikr-e-shafaat-kijiye"],

  // Ep#82 — Momin Wo Hai Jo Unki ezzat Pay Maray Dil Say
  [/momin\s+wo\s+hai\s+jo/i, "momin-wo-hai-jo-un-ki-izzat-pe-mare-dil-se"],

  // Ep#81/80 — Jo Bano Per Hai Bahar e Chaman Aarai Dost (not in data)
  [/jo\s+bano?\s+per\s+bahar/i, null, null],

  // Ep#79 — Yaad e Watan Situm Kiya Dasht e Harm (not in data)
  [/yaad[\s-]*e?[\s-]*watan/i, null, null],

  // Ep#78/77/76 — Kabay Kay Badrutuja Tum Pay Karoron Durood
  [/kab[ae]y?\s+k[ae]y?\s+badr[uo]tuja/i, "kaabe-ke-badrud-duja"],

  // Ep#75 — Arsh Ki Dhun Hai Churkh Main Asmaan Hai
  [/arsh\s+ki\s+(dhun|aql)\s+(hai|h)\s+ch[uo]rkh/i, "arsh-ki-aql-dang-hai-charkh-me-aasmaan-hai"],

  // Ep#74 — Zama Hajj Ka Hai (not in data)
  [/zama\s+hajj/i, null, null],

  // Ep#73 — Ghunahgaron Ko Hatif Say Naveed e Khush Maali Hai
  [/ghunahgar[o]n?\s+ko\s+hatif/i, "gunahgaaron-ko-haatif-se-naweed-e-khush-ma-aali-hai"],

  // Ep#72 — Ahle Seraat Ruh e Ameen Ko Khaber Karain (not in data)
  [/ahle?\s+seraat/i, null, null],

  // Ep#71 — Dil Ko Unsay Khuda Juda Na Karay
  [/dil\s+ko\s+uns[ae]y?\s+khuda\s+juda/i, "dil-ko-un-se-khuda-juda-na-kare"],

  // Ep#70 — Ambiya Ko Bi Ajul Aani Hai
  [/ambiya\s+ko\s+bi?\s+ajul/i, "ambia-ko-bhi-ajal-aani-hai"],

  // Ep#69 — Muhammad Mazhar e Kamil (not in data)
  [/muhammad\s+mazhar/i, null, null],

  // Ep#68 — Paish Haq Mujda Shafaat Ka Sunatay Jain Gain
  [/paish\s+haq\s+mujda/i, "pesh-e-haq-muzhda-shafaat-ka-sunaate-jaa-enge"],

  // Ep#67 — Shor e Mehnu Sun Kar Tuj Tak Main Dawaan Aya (not in data)
  [/shor[\s-]*e?[\s-]*mehnu/i, null, null],

  // Ep#66 — Kiya Mehaktay Hain Mehaknay walay
  [/kiya?\s+mehakt[ae]y?\s+h[ae]i?n\s+mehakn[ae]y/i, "kya-mahakte-hain-mahakne-waale"],

  // Ep#65 — Tuba May Jo Sab Say Onchi (not in data)
  [/tuba\s+(may|mein)\s+jo\s+sab/i, null, null],

  // Ep#64-58 — Mustafa Jana e Rehmat Pay Lakhon Salam (7 parts)
  [/mustafa\s+jana[\s-]*e?[\s-]*rehmat/i, "mustafa-jaan-e-rahmat-pe-laakhoñ-salaam"],

  // Ep#57 — Sachi Baat Sikhatay Ye Hain (not in data)
  [/sachi?\s+baat\s+sikhat[ae]y/i, null, null],

  // Ep#56 — Kharab Hall Kiya Dil Ko Purmalal Kiya (not in data)
  [/kharab\s+hall\s+kiya/i, null, null],

  // Ep#55/54 — Lutf Unka Aam Ho Hi Jai Ga (not in data)
  [/lutf\s+unka\s+aam/i, null, null],

  // Ep#53/52 — Wo Kamal e Husn Huzur Hai (not in data)
  [/kamal[\s-]*e?[\s-]*husn\s+huz[uo]r/i, null, null],

  // Ep#51/50 — Sab Say Oula o Aala Hamara Nabi
  [/sab\s+[sz]ay?\s+[ou]ula?\s+[oa]\s+a[ea]la/i, "sab-se-awla-o-aala-hamaara-nabi"],

  // Ep#49/48 — Banda Milnay Ko Kareeb e Hazrat e Qadr Gaya (not in data)
  [/banda\s+miln[ae]y?\s+ko\s+kareeb/i, null, null],

  // Ep#47/46 — Gham Ho Gai Beshumar Aaqa (not in data)
  [/gham\s+ho\s+gai\s+beshumar/i, null, null],

  // Ep#45 — Wohi Rab Hai Jisnay Tujko Hum Tan Karam Banaya
  [/wohi?\s+ra[bb]?\s+hai\s+jisn[ae]y/i, "wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya"],

  // Ep#44 — Suntain Hain Kay Mehshar May Sirf Unki Rasai Hai
  [/sunt[ae]i?n?\s+h[ae]i?n?\s+k[ae]y?\s+mehshar/i, "sunte-hain-ke-mahshar-me"],

  // Ep#43/42 — Ya Elahi Her Jaga Teri Ata Ka Sath Ho (not in data)
  [/her\s+jaga[\s-]*teri[\s-]*ata/i, null, null],

  // Ep#41 — Ae Shafae Ummam Shahay Zi Ja Ha Lay Khaber (not in data)
  [/shafae?\s+ummam/i, null, null],

  // Ep#40 — Chamak Tuj Say Patay Hain Sab Panay Walay
  [/chamak\s+t[ujh]*\s+[sz][ae]y?\s+pat[ae]y?/i, "chamak-tujh-se-paate-hain-sab-paane-waale"],

  // Ep#39 — Rukh Din Hai Ya Mehr e Sama (not in data)
  [/rukh\s+din\s+hai/i, null, null],

  // Ep#38/37 — Waha Kiya Joodo Karam Hai Shahay Batha Tera
  [/waha?\s+kiya?\s+joodo[\s-]*karam\s+hai\s+shah[ae]y/i, null, "waah-kya-jood-o-karam"],

  // Ep#36 — Pul Say Utaro Raha Ghuzar Ko Khaber Na Ho (could be raah-pur-khaar)
  [/pul\s+[sz]ay?\s+utaro/i, null, null],

  // Ep#35 — Kiya Theek Ho Rukhay Nabvi Per Misal e Gul (not in data)
  [/theek\s+ho\s+rukh[ae]y/i, null, null],

  // Ep#34 — Zaeron Pass Adab Rakho Hawus Janay Do (not in data)
  [/zaeron\s+pass/i, null, null],

  // Ep#33 — Phir Kay Gali Gali Taba Thokarain (not in data)
  [/phir\s+ke?\s+gali\s+gali/i, null, null],

  // Ep#32/31 — Raha Pur Khar Hai Kiya Hona Hai
  [/ra(h)?a\s+pur\s+khar\s+hai/i, "raah-pur-khaar-hai-kya-hona-hai"],

  // Ep#30/29 — Chaman e Taiba May Jo Sunmbul Jo Sawaray Gesoo (not in data)
  [/chaman[\s-]*e?[\s-]*taiba\s+may/i, null, null],

  // Ep#28 — Arize Shams o Qamar Hai (not in data)
  [/ariz[ae]?\s+shams/i, null, null],

  // Ep#27 — Tumharay Zarray Kay Per To (not in data)
  [/tumhar[ae]y?\s+zarr[ae]y/i, null, null],

  // Ep#26/25 — Phir Utha Walwala e Mugeelan e Arab (not in data)
  [/walwala[\s-]*e?[\s-]*mugeelan/i, null, null],

  // Ep#24/23 — Server Kahoon Kay Maliko Moula
  [/(server|sarwar)\s+kah[ou]{1,2}n?\s+k[ae]y?\s+malik[o]?/i, "sarwar-kahun-ke-malik-o-maula-kahun-tujhe"],

  // Ep#22 — Qaseeda e Mairaaj / Wo Server e Kishwar e Risalat
  [/qaseeda[\s-]*e?[\s-]*mairaaj|kishwar[\s-]*e?[\s-]*risaalat/i, "wo-sarwar-e-kishwar-e-risaalat"],

  // Ep#21/20 — Unki Mahak Nay Dil Kay (not in data)
  [/unki\s+mahak/i, null, null],

  // Ep#19 — Naimatain Banta Jis Simt (not in data)
  [/naimat[ae]i?n?\s+banta/i, null, null],

  // Ep#18 — Guzray Jis Raha Say Wo (not in data)
  [/guzr[ae]y?\s+jis\s+raha/i, null, null],

  // Ep#17 — Pul Say Utaro Rah Guzar Ko Khabar Na Ho (same as Ep#36, not in data)
  [/pul\s+[sz]ay?\s+utaro\s+rah/i, null, null],

  // Ep#16 — Hum Khak Hain Aur Khak Hi Mawa Hai Hamara (not in data)
  [/hum\s+khak\s+hain/i, null, null],

  // Ep#15 — Mustafa Khairulwara Ho
  [/mustafa\s+kh[ae]i?ru?lwara/i, "mustafa-khayr-ul-wara-ho"],

  // Ep#14 — Lamyati Nazeeruka (not in data)
  [/lamyati?\s+nazeeruka/i, null, null],

  // Ep#13/12/11 — Subha Taiba May Hui Butta Hai Bara Noor Ka
  [/subh[ae]?\s+ta[ei]ba\s+may\s+hui/i, "subh-taiba-me-huwi-batta-hai-baara-noor-ka"],

  // Ep#10 — Uthado Perda Dikhado Chera
  [/uth[ao]+\s*do\s+perda\s*dikh[ao]/i, "utha-do-parda-dikha-do-chehra"],

  // Ep#9 — Wo Suay Lala Zaar Phirtay Hain (not in data)
  [/suay\s+lala\s+zaar/i, null, null],

  // Ep#8/7/6 — Bheeni Suhani Subho May Thandak Jigar Ki Hai
  [/bheeni?\s+suhani?\s+subh[o]?/i, "bheeni-suhaani-subh"],

  // Ep#5/4 — Zameen o Zaman Tumharay Lieay
  [/zameen\s+o\s+zaman\s+tumhar[ae]y/i, "zameen-o-zamaan-tumhaare-liye"],

  // Ep#3 — Mujda Baad Ae Asion
  [/mujda\s+ba[ea]d\s+ae?\s+asion/i, "muzhdah-baad-ay-aasiyo-shafee-shah-e-abraar-hai"],

  // Ep#2 — Soona Jangle Raat Andheri
  [/soona\s+j[ae]ngl[ae]\s+raat/i, "soona-jangal-raat-andheri"],

  // Ep#1 — Kiyahi Zouq Afza Shafa'at Hai Tumhari Wah Wah (not in data)
  [/zouq\s+afza/i, null, null],

  // Part 01-15 — generic, not a specific poem
  [/part\s+\d+/i, null, null],
];

/**
 * For each pattern entry:
 *   [0] regex
 *   [1] ro-slug or null (if poem not in data or needs special handling)
 *   [2] optional: for Urdu-only poems, the ur-slug to use instead
 */
const PATTERN_ENTRIES = PATTERNS.map((p) => ({
  regex: p[0],
  roSlug: p[1], // null if we don't have this poem
  urSlug: p[2], // set for Urdu-only poems
}));

async function fetchVideos() {
  let all = [];
  let pageToken = "";
  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", PLAYLIST_ID);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", API_KEY);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    const data = await res.json();
    all = all.concat(data.items || []);
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return all.map((i) => ({
    id: i.snippet.resourceId.videoId,
    title: i.snippet.title,
  }));
}

function matchEntry(title) {
  // Remove "Haji Abdul Habib Attari" suffix
  const clean = title.replace(/Haji\s+Abdul\s+Habib\s+Attari/i, "").trim();
  for (const entry of PATTERN_ENTRIES) {
    if (entry.regex.test(clean)) return entry;
  }
  return null;
}

async function main() {
  const videos = await fetchVideos();
  console.log(`Fetched ${videos.length} videos`);

  // Group by (roSlug, urSlug)
  const roMap = {}; // roSlug -> video IDs
  const urMap = {}; // urSlug -> video IDs
  const unmatched = [];

  for (const v of videos) {
    const entry = matchEntry(v.title);
    if (!entry) {
      unmatched.push(v.title);
      continue;
    }
    if (entry.roSlug) {
      if (!roMap[entry.roSlug]) roMap[entry.roSlug] = [];
      roMap[entry.roSlug].push(v.id);
    }
    if (entry.urSlug) {
      if (!urMap[entry.urSlug]) urMap[entry.urSlug] = [];
      urMap[entry.urSlug].push(v.id);
    }
  }

  // Build the final mapping
  const map = {};

  // Ro + corresponding En kalams
  const roToEn = {
    "ro-aankhen-ro-ro-ke-sujaane-waale": "en-o-you-whose-eyes-have-become-swollen-due-to-weeping",
    "ro-allah-allah-ke-nabi-se": "",
    "ro-andheri-raat-hai-gham-ki-ghata": "en-it-is-a-dark-and-anxious-night-black-clouds-of-sins-are-looming",
    "ro-arsh-e-haq-hai-masnad-e-rifat-rasoolullah-ki": "en-the-exalted-arsh-of-allah",
    "ro-arsh-ki-aql-dang-hai-charkh-me-aasmaan-hai": "en-the-wit-of-the-arsh-is-perplexed-dizzily-the-sky-is-spinning",
    "ro-bheeni-suhaani-subh": "en-in-the-pleasantly-sweet-morning-breeze-tranquil-the-heart-is-feeling",
    "ro-chamak-tujh-se-paate-hain-sab-paane-waale": "en-from-you-all-the-radiant-ones-acquire-their-illumination",
    "ro-dil-ko-un-se-khuda-juda-na-kare": "en-o-allah-from-him-never-allow-my-heart-to-be-separated",
    "ro-dushman-e-ahmad-pe-shiddat-kijiye": "en-over-the-enemies-of-nabi-ahmad-adopt-strictness",
    "ro-gunahgaaron-ko-haatif-se-naweed-e-khush-ma-aali-hai": "en-an-unseen-angel-gave-glad-tidings-to-the-sinful-of-a-blissful-ending",
    "ro-hirz-e-jaan-zikr-e-shafaat-kijiye": "en-more-valuable-than-life-itself-mention-his-intercession",
    "ro-imaan-e-qaal-e-mustafa-ee": "en-imaan-e-qaal-e-mustafa-ee",
    "ro-kaabe-ke-badrud-duja": "en-kaabe-ke-badrud-duja",
    "ro-kis-ke-jalwe-ki-jhalak-hai": "en-whos-flash-of-radiance-is-this-what-is-this-brightness-we-are-witnessing",
    "ro-kya-mahakte-hain-mahakne-waale": "en-what-a-beautiful-fragrance-the-most-fragrant-one-is-emitting",
    "ro-lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale": "en-lahad-me-ishq-e-rukh-e-shah-ka-daagh-le-ke-chale",
    "ro-momin-wo-hai-jo-un-ki-izzat-pe-mare-dil-se": "en-a-true-believer-is-sacrificed-upon-the-nabis-honour",
    "ro-mustafa-jaan-e-rahmat-pe-laakhoñ-salaam": "en-mustafa-jaan-e-rahmat-pe-laakhoñ-salaam",
    "ro-mustafa-khayr-ul-wara-ho": "en-mustafa-khayr-ul-wara-ho",
    "ro-muzhdah-baad-ay-aasiyo-shafee-shah-e-abraar-hai": "en-glad-tidings-to-you-o-sinners-of-the-most-pious-your-intercessor-is-the-king",
    "ro-na-arsh-e-aiman": "en-neither-like-the-arsh-is-the-valley-of-aiman",
    "ro-nabi-sarwar-e-har-rasool-o-wali-hai": "en-the-greatest-leader-and-king-of-every-rasool-and-wali-is-my-beloved-nabi",
    "ro-nazar-ek-chaman-se-do-chaar-hai": "en-nazar-ek-chaman-se-do-chaar-hai",
    "ro-pesh-e-haq-muzhda-shafaat-ka-sunaate-jaa-enge": "en-from-allahs-court-glad-tidings-of-intercession",
    "ro-qaafile-ne-soo-e-taiba-kamar-aaraa-ee-ki": "en-while-to-journey-towards-taiba",
    "ro-raah-pur-khaar-hai-kya-hona-hai": "en-the-path-is-so-full-of-thorns-now-what-will-happen",
    "ro-ronaak-e-bazm-e-jahaan-hai-aashiqaan-e-sokhta": "en-the-glow-of-all-the-worlds-assemblies",
    "ro-sab-se-awla-o-aala-hamaara-nabi": "en-the-greatest-and-most-exalted-is-our-nabi",
    "ro-sarwar-kahun-ke-malik-o-maula-kahun-tujhe": "en-shall-i-refer-to-you-as-the-ruler-or-as-my-master-and-king-shall-i-refer-to-you",
    "ro-shukr-e-khuda-ke-aaj-ghari-us-safar-ki-hai": "en-praise-be-to-allah-the-day-of-that-momentous-journey-has-arrived",
    "ro-soona-jangal-raat-andheri": "en-in-a-deserted-wilderness-on-a-dark-night-dark-clouds-are-hanging",
    "ro-subh-taiba-me-huwi-batta-hai-baara-noor-ka": "en-at-the-break-of-dawn-in-madina-distributed-are-alms-of-light",
    "ro-sunte-hain-ke-mahshar-me": "en-we-are-hearing-that-on-the-day-of-reckoning",
    "ro-utha-do-parda-dikha-do-chehra": "en-please-raise-your-veil-and-reveal-your-sacred-face",
    "ro-wo-sarwar-e-kishwar-e-risaalat": "",
    "ro-wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya": "en-wohi-rabb-hai-jis-ne-tujh-ko-hama-tan-karam-banaaya",
    "ro-ya-ilaahi-rahm-farma-mustafa-ke-waaste": "en-for-the-sake-of-mustafa-your-chosen-nabi",
    "ro-zameen-o-zamaan-tumhaare-liye": "en-zameen-o-zamaan-tumhaare-liye",
    "ro-zarre-jhar-kar-teri-pezaaron-ke": "en-zarre-jhar-kar-teri-pezaaron-ke",
    "ro-ambia-ko-bhi-ajal-aani-hai": "en-ambia-ko-bhi-ajal-aani-hai",
  };

  // Add Ro entries
  for (const [slug, vids] of Object.entries(roMap)) {
    const roId = `ro-${slug}`;
    map[roId] = vids;
    // Add corresponding En
    const enId = roToEn[roId];
    if (enId) map[enId] = vids;
  }

  // Add Urdu-only entries
  for (const [slug, vids] of Object.entries(urMap)) {
    map[`ur-${slug}`] = vids;
    map[`hn-${slug}`] = vids;
  }

  // Write file
  let output = `import type { YoutubeMap } from "@/src/types";\n\n`;
  output += `export const youtubeMap: YoutubeMap = {\n`;

  const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  for (const [id, vids] of sorted) {
    output += `  "${id}": ${JSON.stringify(vids)},\n`;
  }
  output += `};\n`;

  const outPath = path.join(__dirname, "..", "src", "data", "youtube.ts");
  fs.writeFileSync(outPath, output);
  console.log(`\nWrote ${Object.keys(map).length} entries to ${outPath}`);
  console.log(`Unmatched videos: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log("--- Unmatched ---");
    unmatched.forEach((t) => console.log(`  ${t}`));
  }
}

main().catch(console.error);
