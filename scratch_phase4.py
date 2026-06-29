import json
import os

registry_path = 'lexicon/term_id_registry.json'

with open(registry_path, 'r', encoding='utf-8') as f:
    registry = json.load(f)

# The terms to remove
removed_terms = {"AFF_004", "AFF_029", "ARC_005", "ARC_010"}

# Filter the terms_index
new_index = []
for entry in registry.get('terms_index', []):
    if entry.get('term_id') not in removed_terms:
        new_index.append(entry)

# Add RSK_001 if it's not there
has_rsk_001 = any(e.get('term_id') == 'RSK_001' for e in new_index)
if not has_rsk_001:
    new_index.append({
        "term_id": "RSK_001",
        "path": "lexicon/terms/RSK/RSK_001_riesgo_autolitico.json"
    })

# Sort the index by term_id
new_index.sort(key=lambda x: x['term_id'])
registry['terms_index'] = new_index

# Optionally, update next_seq
if 'AFF' in registry['prefixes']:
    # Let's count how many AFF terms we have or find the max
    aff_terms = [e for e in new_index if e['term_id'].startswith('AFF_')]
    if aff_terms:
        max_aff = max(int(e['term_id'].split('_')[1]) for e in aff_terms)
        registry['prefixes']['AFF']['next_seq'] = max_aff + 1

if 'ARC' in registry['prefixes']:
    arc_terms = [e for e in new_index if e['term_id'].startswith('ARC_')]
    if arc_terms:
        max_arc = max(int(e['term_id'].split('_')[1]) for e in arc_terms)
        registry['prefixes']['ARC']['next_seq'] = max_arc + 1

with open(registry_path, 'w', encoding='utf-8') as f:
    json.dump(registry, f, indent=2, ensure_ascii=False)
    f.write('\n')

print("Phase 4 term_id_registry.json cleanup complete.")
