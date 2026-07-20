import json, sys, io, os, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

URDU_JSON = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'ur-kalams.json')
MERGED_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'merged')

with open(URDU_JSON, 'r', encoding='utf-8') as f:
    urdu_kalams = json.load(f)

# Read all existing merged .ts files to extract their titleRo
import glob as g
existing_files = g.glob(os.path.join(MERGED_DIR, '*.ts'))
existing = []
for fp in existing_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    # Extract titleRo
    m = re.search(r'titleRo:\s*"([^"]*)"', content)
    title_ro = m.group(1) if m else ''
    # Extract id
    m = re.search(r'id:\s*"([^"]*)"', content)
    k_id = m.group(1) if m else ''
    # Extract titleUr  
    m = re.search(r'titleUr:\s*"([^"]*)"', content)
    title_ur_file = m.group(1) if m else ''
    existing.append({
        'file': os.path.basename(fp),
        'id': k_id,
        'titleRo': title_ro,
        'titleUr': title_ur_file,
    })

print(f"Existing merged files: {len(existing)}")
print(f"Urdu DB kalams: {len(urdu_kalams)}")
print()

# Try to match each existing file to a DB entry
# Use titleRo (romanized) -> compare against DB titleUr
def normalize(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

matched = {}
unmatched_existing = []
for ex in existing:
    # Try to match by searching DB titles for transliteration hints
    found = False
    for ur in urdu_kalams:
        # Check if the romanized title roughly matches
        ur_norm = normalize(ur['titleUr'])
        ro_norm = normalize(ex['titleRo'])
        if ro_norm and ur_norm and len(ro_norm) > 3:
            # Simple heuristic: check if key words appear
            # This won't be perfect but catches many
            pass
    # For now, just print for manual review
    print(f"  {ex['id']:50s} | Ro: {ex['titleRo'][:50]}")

print()
print("--- DB Urdu titles ---")
for ur in urdu_kalams:
    print(f"  id={ur['id']:3d} | {ur['titleUr'][:70]}")
