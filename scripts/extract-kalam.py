#!/usr/bin/env python3
"""Extract Urdu Kalam text from the reference DB and merge into app data files."""
import json
import os
import re

REFERENCE_DIR = os.path.join(os.path.dirname(__file__), "..", "reference")
MERGED_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data", "merged")
DATA_INDEX = os.path.join(os.path.dirname(__file__), "..", "src", "data", "index.ts")

# Load extracted data
with open(os.path.join(REFERENCE_DIR, "headings.json"), "r", encoding="utf-8") as f:
    headings = json.load(f)

with open(os.path.join(REFERENCE_DIR, "texts.json"), "r", encoding="utf-8") as f:
    texts = json.load(f)

# Group texts by heading_id
texts_by_heading = {}
for t in texts:
    hid = t["heading_id"]
    if hid not in texts_by_heading:
        texts_by_heading[hid] = []
    texts_by_heading[hid].append(t)

# Print all headings for reference
print(f"Total headings: {len(headings)}")
print(f"Total text lines: {len(texts)}")
print(f"Headings with texts: {len(texts_by_heading)}")
print()

# Build a mapping of heading text -> slug for matching existing files
def text_to_slug(text):
    """Convert heading text to a slug for matching."""
    # Simple transliteration-ish slug from Urdu - won't match romanized
    return text.strip().lower()

# Print headings with their first line of text for manual matching
for h in headings:
    hid = h["id"]
    ht = h["heading_text"]
    cat = h["category_title"]
    order = h["show_order"]
    lines = texts_by_heading.get(hid, [])
    first_line = lines[0]["text"][:60] if lines else "(no text)"
    print(f"[{order:3d}] cat={cat} | heading_id={hid} | {ht}")
    if lines:
        print(f"      -> {first_line}")
    print()

# Export all headings+texts as a single JSON for easy reference
all_data = []
for h in headings:
    hid = h["id"]
    lines = texts_by_heading.get(hid, [])
    verses = []
    # Group pairs of lines into sher (m1, m2)
    for i in range(0, len(lines), 2):
        m1 = lines[i]["text"].strip()
        m2 = lines[i+1]["text"].strip() if i+1 < len(lines) else ""
        if m1:
            verses.append({"m1": m1, "m2": m2})
    
    all_data.append({
        "heading_id": hid,
        "title": h["heading_text"],
        "category": h["category_title"],
        "cat_id": h["cat_id"],
        "radif": h.get("radif", ""),
        "type": h.get("type", ""),
        "show_order": order,
        "verses": verses,
    })

with open(os.path.join(REFERENCE_DIR, "kalam_export.json"), "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"\nExported {len(all_data)} kalams to reference/kalam_export.json")
