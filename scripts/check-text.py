import sqlite3, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

conn = sqlite3.connect('reference/apktool-output/assets/databases/faizaneraza/faizaneraza.db')
rows = conn.execute('SELECT id, text, first_last FROM text WHERE heading_id = 2 ORDER BY show_order LIMIT 8').fetchall()
for r in rows:
    text = r[1] or ''
    fl = r[2] or ''
    lines = text.split('\n')
    print(f'id={r[0]} | first_last="{fl}" | num_lines={len(lines)}')
    for i, l in enumerate(lines):
        print(f'  line {i}: "{l.strip()}"')
    print()
conn.close()
