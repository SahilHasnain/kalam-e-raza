import json, sys, io, os, re, glob as g
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

MERGED_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'merged')
URDU_JSON = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'ur-kalams.json')

with open(URDU_JSON, 'r', encoding='utf-8') as f:
    urdu_kalams = json.load(f)

# Extract metadata from existing merged files
existing = []
for fp in sorted(g.glob(os.path.join(MERGED_DIR, '*.ts'))):
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'id:\s*"([^"]*)"', content)
    k_id = m.group(1) if m else ''
    m = re.search(r'titleRo:\s*"([^"]*)"', content)
    title_ro = m.group(1) if m else ''
    m = re.search(r'titleUr:\s*"([^"]*)"', content)
    title_ur_file = m.group(1) if m else ''
    # Count versesRo
    ro_count = len(re.findall(r'"m1":', content))
    # Check if versesUr is empty
    has_ur = 'versesUr: [\n' in content and 'versesUr: [],' not in content
    existing.append({
        'file': os.path.basename(fp),
        'id': k_id,
        'titleRo': title_ro,
        'titleUr': title_ur_file,
        'ro_verses': ro_count,
        'has_ur': has_ur,
    })

print(f"=== {len(existing)} EXISTING MERGED FILES ===")
for e in existing:
    ur_mark = "✓Ur" if e['has_ur'] else " Ur"
    print(f"  {e['id']:50s} | {e['titleRo'][:45]:45s} | {ur_mark} | {e['ro_verses']:3d} shers")

print(f"\n=== {len(urdu_kalams)} DB URDU KALAMS ===")
for u in urdu_kalams:
    print(f"  id={u['id']:3d} | {u['titleUr'][:70]}")
