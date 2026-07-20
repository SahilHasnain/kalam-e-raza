#!/usr/bin/env python3
"""Extract ALL Urdu Kalam from reference DB → TypeScript data files."""
import json, os, re, sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "reference", "apktool-output", "assets", "databases", "faizaneraza", "faizaneraza.db")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data", "ur")
os.makedirs(OUT_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

headings = conn.execute("""
    SELECT h.id, h.heading_text, h.radif, h.type, h.cat_id, h.show_order,
           c.title as category_title
    FROM heading h
    LEFT JOIN category c ON h.cat_id = c.id
    ORDER BY h.show_order
""").fetchall()

all_texts = conn.execute("""
    SELECT heading_id, text, show_order
    FROM text
    ORDER BY heading_id, show_order
""").fetchall()
conn.close()

texts_by_heading = {}
for t in all_texts:
    hid = t["heading_id"]
    if hid not in texts_by_heading:
        texts_by_heading[hid] = []
    texts_by_heading[hid].append(t["text"].strip())

def slugify(text):
    text = text.strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.lower().strip('-')[:80]

def escape_ts(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

kalams = []
files_written = []

for h in headings:
    hid = h["id"]
    title = (h["heading_text"] or "").strip()
    cat = (h["category_title"] or "").strip()
    order = h["show_order"]
    lines = texts_by_heading.get(hid, [])

    if not title:
        continue

    verses = []
    i = 0
    while i < len(lines):
        m1 = lines[i]
        m2 = lines[i + 1] if i + 1 < len(lines) else ""
        verses.append({"m1": m1, "m2": m2})
        i += 2

    slug = slugify(title)
    if not slug:
        slug = f"kalam-{hid}"

    kalams.append({
        "id": slug,
        "titleUr": title,
        "category": cat,
        "show_order": order,
        "verses": verses,
    })

    ts_verses = ""
    for v in verses:
        m1 = escape_ts(v["m1"])
        m2 = escape_ts(v["m2"])
        ts_verses += f'    {{ m1: "{m1}", m2: "{m2}" }},\n'

    ts_content = f'''import type {{ Kalam }} from "@/src/types";

const kalam: Kalam = {{
  id: "{slug}",
  poetId: "alahazrat",
  poetName: "امام احمد رضا خان",
  poetNameRo: "Imam Ahmed Raza Khan",
  poetNameEn: "Imam Ahmed Raza Khan",
  titleUr: "{escape_ts(title)}",
  titleRo: "",
  titleEn: "",
  versesUr: [
{ts_verses}  ],
  versesRo: [],
  versesEn: [],
  versesHi: [],
}};

export default kalam;
'''
    filepath = os.path.join(OUT_DIR, f"{slug}.ts")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(ts_content)
    files_written.append(slug)

# Generate index.ts
index_imports = "\n".join(
    f'import {slug.replace("-", "_")} from "@/src/data/ur/{slug}";'
    for slug in files_written
)
index_array = ",\n".join(f"  {slug.replace('-', '_')}" for slug in files_written)

index_content = f'''import type {{ Kalam }} from "@/src/types";

{index_imports}

export const urKalams: Kalam[] = [
{index_array},
];
'''

with open(os.path.join(OUT_DIR, "index.ts"), "w", encoding="utf-8") as f:
    f.write(index_content)

print(f"Written {len(files_written)} kalam files to src/data/ur/")
print(f"Generated index.ts with {len(files_written)} entries")
