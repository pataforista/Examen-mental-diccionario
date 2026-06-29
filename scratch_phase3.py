import os
import glob
import json

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

mappings_dir = 'lexicon/mappings'
terms_dir = 'lexicon/terms'

high_priority_prefixes = ['AFF', 'THO', 'VOL', 'SPE', 'PER', 'CAT', 'SNM', 'SER']

for prefix in high_priority_prefixes:
    # Find all terms in this prefix
    term_files = glob.glob(f'{terms_dir}/{prefix}/*.json')
    for tf in term_files:
        if '_deprecated' in tf: continue
        term_data = load_json(tf)
        term_id = term_data.get('term_id')
        if not term_id: continue
        
        # Check if codes file exists
        code_file = f'{mappings_dir}/{term_id}.codes.json'
        if not os.path.exists(code_file):
            # Generate one
            code_data = {
              "term_id": term_id,
              "coding_standards": {
                "ICD-11": [
                  {
                    "code": "MB24.Y",
                    "label": "Other specified symptoms or signs involving appearance or behaviour",
                    "relationship": "broad"
                  }
                ]
              },
              "notes": "Generated automatically. Please refine with specific codes if available.",
              "version": "1.0.0"
            }
            save_json(code_file, code_data)
            print(f"Generated code file for {term_id}")

print("Phase 3 complete.")
