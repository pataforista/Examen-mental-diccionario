import os
import glob
import json
from collections import defaultdict

terms_dir = 'lexicon/terms'
registry_path = 'lexicon/term_id_registry.json'

with open(registry_path, 'r', encoding='utf-8') as f:
    registry = json.load(f)

# Normalize paths to use forward slash
registered_paths = {entry['path'].replace('\\', '/') for entry in registry.get('terms_index', [])}
registered_ids = {entry['term_id'] for entry in registry.get('terms_index', [])}

all_json_files = glob.glob(os.path.join(terms_dir, '**', '*.json'), recursive=True)
# Normalize actual paths
actual_paths = {p.replace('\\', '/') for p in all_json_files if '_deprecated' not in p.replace('\\', '/')}

errors = []

# 1. Check for unregistered files
unregistered = actual_paths - registered_paths
for p in unregistered:
    errors.append(f"[ORPHAN FILE] Exists on disk but not in registry: {p}")

# 2. Check for missing files
missing = registered_paths - actual_paths
for p in missing:
    errors.append(f"[MISSING FILE] In registry but not on disk: {p}")

# 3. Check for Duplicate Canonical Names or missing data
names = defaultdict(list)
for p in actual_paths:
    try:
        with open(p, 'r', encoding='utf-8') as f:
            data = json.load(f)
        tid = data.get('term_id')
        name = data.get('canonical_name')
        if not name or not tid:
            errors.append(f"[INVALID FILE] Missing term_id or canonical_name: {p}")
        else:
            names[name.lower()].append(tid)
    except Exception as e:
        errors.append(f"[PARSE ERROR] {p}: {str(e)}")

for name, tids in names.items():
    if len(tids) > 1:
        errors.append(f"[DUPLICATE NAME] '{name}' used in multiple terms: {', '.join(tids)}")

print(f"Total checked: {len(actual_paths)} files.")
if errors:
    print("Found issues:")
    for e in errors:
        print(e)
else:
    print("Deep Diagnostic: PERFECT! No orphans, no missing files, no duplicate names.")
