import json, sys, io, os, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

URDU_JSON = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'ur-kalams.json')
MERGED_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'merged')

with open(URDU_JSON, 'r', encoding='utf-8') as f:
    urdu_kalams = json.load(f)

import glob as g
existing_files = []
for fp in sorted(g.glob(os.path.join(MERGED_DIR, '*.ts'))):
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'id:\s*"([^"]*)"', content)
    k_id = m.group(1) if m else ''
    m = re.search(r'titleRo:\s*"([^"]*)"', content)
    title_ro = m.group(1) if m else ''
    existing_files.append({'id': k_id, 'titleRo': title_ro, 'file': os.path.basename(fp)})

# Common Urdu→Roman transliteration pairs (word-level)
# We build a reverse map: romanized fragment → Urdu fragment
WORD_MAP = {
    'allah': 'اللہ', 'allahu': 'اللہ',
    'nabi': 'نبی', 'nabiy': 'نبی',
    'rasool': 'رسول', 'rasul': 'رسول',
    'rahmat': 'رحمت', 'rahim': 'رحیم',
    'mustafa': 'مصطفى', 'mustaf': 'مصطفى',
    'ahmad': 'احمد', 'ahmed': 'احمد',
    'ghaus': 'غوث', 'ghawth': 'غوث',
    'shafaat': 'شفاعت', 'shafa\'at': 'شفاعت',
    'qadir': 'قادر', 'qaadir': 'قادر',
    'abdul': 'عبد', 'abdu': 'عبد',
    'qabl': 'قابل', 'qaabil': 'قابل',
    'kamil': 'کامل', 'kaamil': 'کامل',
    'ya': 'یا',
    'hum': 'ہم', 'ham': 'ہم',
    'kya': 'کیا',
    'hai': 'ہے', 'haiñ': 'ہیں',
    'wo': 'وہ', 'woh': 'وہ',
    'mera': 'میرا', 'tere': 'تیرے', 'teri': 'تیری', 'tujh': 'تجھ',
    'dil': 'دل', 'jaan': 'جان',
    'khuda': 'خدا', 'khud': 'خد',
    'salat': 'صلاة', 'salaat': 'صلاة', 'salaam': 'سلام',
    'arsh': 'عرش', 'kursi': 'کرسی',
    'jannat': 'جنت', 'jahannum': 'جهنم',
    'deen': 'دین', 'dunya': 'دنیا',
    'aakhirat': 'آخرت',
    'hussain': 'حسین', 'ali': 'علی',
    'hasan': 'حسن',
    'raza': 'رضا', 'raza': 'رضا',
    'barelvi': 'بریلوی',
    'sunni': 'سنی',
    'sufi': 'صوفی',
    'momin': 'مومن', 'kafir': 'کافر',
    'najaat': 'نجات',
    'gunah': 'گناہ', 'gunahoñ': 'گناہوں',
    'aashiq': 'عاشق', 'aashiqaan': 'عاشقان',
    'sokhta': 'سوختہ',
    'subh': 'صبح', 'shaam': 'شام',
    'raat': 'رات', 'din': 'دن',
    'chaman': 'چمن', 'gulshan': 'گلشن',
    'gul': 'گل', 'phool': 'پھول',
    'badal': 'بدل', 'fard': 'فرد',
    'taiba': 'طیبہ', 'madina': 'مدینہ', 'madinah': 'مدینہ',
    'makkah': 'مکہ', 'kaaba': 'کعبہ', 'ka\'aba': 'کعبہ',
    'hajj': 'حج',
    'roza': 'روضة', 'rauza': 'روضة',
    'zameen': 'زمین', 'zamaan': 'زماں',
    'falak': 'فلک', 'asman': 'آسمان', 'aasmaan': 'آسمان',
    'chiragh': 'چراغ', 'shama': 'شمع',
    'noor': 'نور', 'noor': 'نور',
    'zulmat': 'ظلمت', 'andhera': 'اندھیرا',
    'aah': 'آہ', 'faryaad': 'فریاد',
    'sar': 'سر', 'sarwar': 'سرور',
    'malik': 'مالک', 'maula': 'مولیٰ', 'mawla': 'مولیٰ',
    'sultan': 'سلطان', 'badshah': 'بادشاہ',
    'shaan': 'شان', 'azmat': 'عزّت',
    'wajah': 'وجہ', 'sabab': 'سبب',
    'karam': 'کرم', 'jood': 'جود', 'ataa': 'عطا',
    'mehmaan': 'میہمان',
    'qissa': 'قصہ', 'waqia': 'واقعہ',
    'tarjuma': 'ترجمہ', 'matan': 'متن',
    'qaseeda': 'قصیدہ', 'qasida': 'قصیدہ',
    'naat': 'نعت', 'naath': 'نعت',
    'manqabat': 'منقبت', 'manqubat': 'منقبت',
    'madh': 'مدح',
    'wala': 'ولا', 'wilayat': 'ولایت',
    'aali': 'عالی', 'uzma': 'عظمیٰ',
    'darja': 'درجہ', 'martaba': 'مرتبہ',
    'hayaat': 'حیات', 'maut': 'مات',
    'qabr': 'قبر', 'lahad': 'لحد',
    'hashr': 'محشر', 'qayamat': 'قیامت',
    'jibril': 'جبرییل', 'mikaail': 'میکائیل',
    'israfeel': 'اسرافیل', 'izraeel': 'عزیز',
    'ismail': 'اسماعیل', 'ishaq': 'اسحاق',
    'yaqoob': 'یعقوب', 'yusuf': 'یوسف',
    'ayyub': 'ایوب', 'ayyub': 'ایوب',
    'musa': 'موسیٰ', 'isa': 'عیسیٰ',
    'dawood': 'داوود', 'sulaiman': 'سلیمان',
    'ibrhim': 'ابراہیم', 'ibrahim': 'ابراہیم',
    'lut': 'لوط', 'nuh': 'نوح',
    'adamb': 'آدم', 'adam': 'آدم',
    'shaitan': 'شیطان', 'iblis': 'ابلیس',
    'taqwa': 'تقویٰ', 'iman': 'ایمان',
    'kufr': 'کفر', 'shirk': 'شرک',
    'tawhid': 'توحید',
    'sunat': 'سنت', 'bidaat': 'بدعت',
    'pir': 'پیر', 'murshid': 'مرشد',
    'faqeer': 'فقیر', 'darvesh': 'درویش',
    'majzoob': 'مجذوب', 'wali': 'ولی',
    'qutub': 'قطب', 'abdaal': 'ابدال',
    'autaar': 'аватار',  # not relevant
    'ghous': 'غوث', 'ghouse': 'غوث',
    'azam': 'اعظم', 'aazam': 'اعظم',
    'shah': 'شاہ', 'meer': 'میر',
    'miyan': 'میاں', 'janab': 'جناب',
    'hazrat': 'حضرت',
    'baba': 'بابا', 'mianji': 'میاں جی',
    'ashiqan': 'عاشقان',
    'farsh': 'فرش',
    'arsh': 'عرش',
    'kursi': 'کرسی',
    'charkh': 'چرخ',
    'kaukar': 'کوثر',
    'tauba': 'توبہ', 'taubah': 'توبہ',
    'nida': 'نداء', 'sada': 'صدا',
    'gunahoñ': 'گناہوں',
    'maghfirat': ' Magnum',
    'bakshish': 'بخشش', 'bakhshish': 'بخشش',
    'naweed': 'نوید',
    'khush': 'خوش',
    'maali': 'مالی',
    'haatif': 'ہاٹف',
    'muzhda': 'مژدہ',
    'mujda': 'مژدہ',
    'pesh': 'پیش',
    'haq': 'حق',
    'sunaate': 'سُناتے',
    'jaayen': 'جائیں',
    'jaaenge': 'جائیں گے',
    'chamak': 'چمک',
    'paate': 'پاتے',
    'paane': 'پانے',
    'waale': 'والے',
    'aankhen': 'آنکھیں',
    'ro': 'رو',
    'sujaane': 'سجانے',
    'mahakte': 'مہکتے',
    'mahakne': 'مہکنے',
    'raah': 'راہ',
    'purkhaar': 'پُرخار',
    'jalwe': 'جلوہ',
    'jhalak': 'جھلک',
    'ujaala': 'اُجالا',
    'sarwar': 'سرور',
    'kahun': 'کہوں',
    'malik': 'مالک',
    'maula': 'مولیٰ',
    'subh': 'صبح',
    'batta': 'بٹتا',
    'noor': 'نور',
    'sunte': 'سنتے',
    'mahshar': 'محشر',
    'rasai': 'رسائی',
    'utha': 'اُٹھا',
    'parda': 'پردہ',
    'dikha': 'دِکھا',
    'chehra': 'چہرہ',
    'nobar': 'نورِباری',
    'hijab': 'حجاب',
    'andheri': 'اندھیری',
    'gham': 'غم',
    'ghata': 'گھٹا',
    'kali': 'کالی',
    'gunaah': 'گناہ',
    'gaaron': 'گاروں',
    'hatif': 'ہا ِتف',
    'naweed': 'نوید',
    'khush': 'خوش',
    'maalii': 'مآلی',
    'soona': 'سُونا',
    'jangal': 'جنگل',
    'badli': 'بدلی',
    'nabi': 'نبی',
    'sarwar': 'سرور',
    'rasool': ' رسول',
    'wali': 'ولی',
    'nah': 'نہ',
    'arsh': 'عرش',
    'aiman': 'ایمن',
    'innee': 'اِنِّیْ',
    'zaahib': 'ذاھِبٌ',
    'mehmani': 'میہمانی',
    'sunte': 'سنتے',
    'mahshar': 'محشر',
    'sirf': 'صرف',
    'rasai': 'رسائی',
    'hirz': 'حرز',
    'jaan': 'جاں',
    'zikr': 'ذِکر',
    'shiddat': 'شدّت',
    'dushman': 'دُشمن',
    'bheeni': 'بھینی',
    'suhaani': 'سُہانی',
    'thandak': 'ٹھنڈک',
    'jigar': 'جِگر',
    'waah': 'واہ',
    'martaba': 'مرتبہ',
    'shukr': 'شکر',
    'safar': 'سفر',
    'rooh': 'روح',
    'amina': 'امیں',
    'akhbar': 'خبر',
    'ahle': 'اہل',
    'siraat': 'صِراط',
    'rub': 'ربّ',
    'hama': 'ہَمہ',
    'banaaya': 'بنایا',
    'ain': 'ایمان',
    'qal': 'قال',
    'zare': 'ذرّے',
    'jhar': 'جھڑ',
    'pezaaron': 'پیزاروں',
    'lahad': 'لَحد',
    'ishq': 'عشق',
    'ruk': 'رُخ',
    'shah': 'شَہ',
    'daagh': 'داغ',
    'chale': 'چلے',
    'anbiya': 'اَنبیا',
    'ajal': 'اَجل',
    'mazh': 'مَظہر',
    'kamil': 'کامل',
    'haq': 'حق',
    'shan': 'شان',
    'izzat': 'عزّت',
    'nazr': 'نظر',
    'chaman': 'چمن',
    'nazar': 'نظَر',
    'do': 'دو',
    'chaar': 'چار',
    'sar': 'سر',
    'rauza': 'روضہ',
    'jhuka': 'جھکا',
    'phir': 'پھر',
    'tujhko': 'تجھ کو',
    'ya': 'یا',
    'ghous': 'غوث',
    'tera': 'تیرا',
    'zarrah': 'ذرّہ',
    'mah': 'مَہ',
    'kaamil': 'کامل',
    'badal': 'بَدل',
    'fard': 'فَرد',
    'talab': 'طلب',
    'munh': 'منھ',
}

def normalize_ro(s):
    """Normalize romanized text for comparison."""
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def try_match(ro_title, ur_title):
    """Try to match a romanized title to an Urdu title."""
    ro_norm = normalize_ro(ro_title)
    
    # Direct word-level matching: check if key Ro words appear as Urdu equivalents
    matched_words = 0
    total_ro_words = len(ro_norm.split())
    
    for ro_word in ro_norm.split():
        if len(ro_word) < 2:
            continue
        if ro_word in WORD_MAP:
            ur_equiv = WORD_MAP[ro_word]
            if ur_equiv in ur_title:
                matched_words += 1
    
    if total_ro_words > 0 and matched_words > 0:
        score = matched_words / total_ro_words
        return score
    return 0

# Build matching
best_matches = {}  # ro_file_id -> { ur_id, score, ur_title }
remaining_ur = list(range(len(urdu_kalams)))

for e_file in existing_files:
    best_score = 0
    best_ur = None
    for ur_idx in remaining_ur:
        ur = urdu_kalams[ur_idx]
        score = try_match(e_file['titleRo'], ur['titleUr'])
        if score > best_score:
            best_score = score
            best_ur = ur_idx
    if best_ur is not None and best_score > 0:
        best_matches[e_file['id']] = {
            'ur_id': urdu_kalams[best_ur]['id'],
            'ur_title': urdu_kalams[best_ur]['titleUr'],
            'score': best_score,
        }
        remaining_ur.remove(best_ur)

# Print results
print(f"=== MATCHED {len(best_matches)} OF {len(existing_files)} ===")
for e in existing_files:
    m = best_matches.get(e['id'])
    if m:
        print(f"  ✓ {e['id']:45s} → ur_id={m['ur_id']:3d} (score={m['score']:.2f}) | {m['ur_title'][:50]}")
    else:
        print(f"  ✗ {e['id']:45s} → NO MATCH")

print(f"\n=== UNMATCHED DB KALAMS: {len(remaining_ur)} ===")
for idx in remaining_ur:
    ur = urdu_kalams[idx]
    print(f"  id={ur['id']:3d} | {ur['titleUr'][:70]}")

# Save mapping
mapping = {
    'matched': best_matches,
    'unmatched_ur': [urdu_kalams[i]['id'] for i in remaining_ur],
}
with open(os.path.join(os.path.dirname(__file__), '..', 'reference', 'kalam-mapping.json'), 'w', encoding='utf-8') as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)
