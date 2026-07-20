import json, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

JSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'ur-kalams.json')
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'ur-du-data.ts')

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

def esc(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${').replace('\n', ' ').replace('\r', '')

lines = []
lines.append("export const urDuData = [")
for k in data:
    verses_str = ",\n".join(
        f"    {{ m1: `{esc(v['m1'])}`, m2: `{esc(v['m2'])}` }}"
        for v in k['verses']
    )
    lines.append("  {")
    lines.append(f"    id: {k['id']},")
    lines.append(f"    titleUr: `{esc(k['titleUr'])}`,")
    lines.append(f"    category: `{esc(k['category'])}`,")
    lines.append(f"    verses: [")
    lines.append(verses_str)
    lines.append("    ],")
    lines.append("  },")
lines.append("];")

with open(OUT_PATH, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Written {len(data)} kalams to ur-du-data.ts ({os.path.getsize(OUT_PATH)} bytes)")
