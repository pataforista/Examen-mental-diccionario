import os

def replace_in_file(filepath, old_text, new_text):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Replaced in {filepath}")

# 1. Replace Oyeobode
files_to_fix = [
    'lexicon/OYEOBODE_GUIDE.md',
    'lexicon/oyebode_coverage.md',
    'lexicon/CROSS_CHECK_REPORT.md'
]
for file in files_to_fix:
    if os.path.exists(file):
        replace_in_file(file, 'Oyeobode', 'Oyebode')
        
# 2. Fix manifest
manifest_path = 'lexicon/lexicon.manifest.json'
if os.path.exists(manifest_path):
    replace_in_file(manifest_path, '"term_id_registry_path": "lexicon/term_id_registry.json"', '"term_id_registry_path": "./term_id_registry.json"')

