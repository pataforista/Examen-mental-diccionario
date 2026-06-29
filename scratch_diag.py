import os
import glob
import json

terms_dir = 'lexicon/terms'
registry_path = 'lexicon/term_id_registry.json'

with open(registry_path, 'r', encoding='utf-8') as f:
    registry = json.load(f)

valid_ids = {entry['term_id'] for entry in registry.get('terms_index', [])}

all_files = glob.glob(f'{terms_dir}/*/*.json')
errors = []

for f in all_files:
    if '_deprecated' in f: continue
    try:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        tid = data.get('term_id')
        
        # Check exclusions
        if 'exclusions' in data:
            for exc in data['exclusions']:
                ref_id = exc.get('term_id')
                if ref_id and ref_id not in valid_ids:
                    errors.append(f"[{tid}] Invalid exclusion ref: {ref_id}")
                    
        # Check related_terms
        if 'related_terms' in data:
            for rel in data['related_terms']:
                ref_id = rel.get('term_id')
                if ref_id and ref_id not in valid_ids:
                    errors.append(f"[{tid}] Invalid related_term ref: {ref_id}")
    except Exception as e:
        errors.append(f"Error parsing {f}: {str(e)}")

print(f"Total valid terms: {len(valid_ids)}")
if errors:
    print("Found broken cross-references:")
    for e in errors:
        print(e)
else:
    print("All cross-references are valid!")
