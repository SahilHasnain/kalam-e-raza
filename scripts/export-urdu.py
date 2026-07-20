import sqlite3, json, sys, io, re, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB = os.path.join(os.path.dirname(__file__), '..', 'reference', 'apktool-output', 'assets', 'databases', 'faizaneraza', 'faizaneraza.db')
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'ur-kalams.json')

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row

headings = conn.execute("""
    SELECT h.id, h.heading_text, h.radif, h.type, h.cat_id, h.show_order,
           c.title as category_title
    FROM heading h LEFT JOIN category c ON h.cat_id = c.id
    ORDER BY h.show_order
""").fetchall()

texts = conn.execute("SELECT heading_id, text FROM text ORDER BY heading_id, show_order").fetchall()
conn.close()

by_hid = {}
for t in texts:
    by_hid.setdefault(t['heading_id'], []).append(t['text'])

result = []
for h in headings:
    title = (h['heading_text'] or '').strip()
    if not title:
        continue
    lines = by_hid.get(h['id'], [])
    verses = []
    for txt in lines:
        parts = (txt or '').split('\n')
        m1 = parts[0].strip() if len(parts) > 0 else ''
        m2 = parts[1].strip() if len(parts) > 1 else ''
        if m1:
            verses.append({'m1': m1, 'm2': m2})

    result.append({
        'id': h['id'],
        'titleUr': title,
        'category': (h['category_title'] or '').strip(),
        'show_order': h['show_order'],
        'verses': verses,
    })

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f'Exported {len(result)} kalams, {sum(len(k["verses"]) for k in result)} total shers')
