import json
import glob

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

terms_dir = 'lexicon/terms'

# We'll just remove exclusions that point to these invalid IDs
invalid_refs = {"CAT_999", "COG_006", "THO_012", "SOM_003"}

all_files = glob.glob(f'{terms_dir}/*/*.json')

for f in all_files:
    if '_deprecated' in f: continue
    try:
        data = load_json(f)
        changed = False
        if 'exclusions' in data:
            new_excl = []
            for exc in data['exclusions']:
                if exc.get('term_id') not in invalid_refs:
                    new_excl.append(exc)
            if len(new_excl) != len(data['exclusions']):
                data['exclusions'] = new_excl
                changed = True
        
        if 'related_terms' in data:
            new_rel = []
            for rel in data['related_terms']:
                if rel.get('term_id') not in invalid_refs:
                    new_rel.append(rel)
            if len(new_rel) != len(data['related_terms']):
                data['related_terms'] = new_rel
                changed = True
                
        if changed:
            save_json(f, data)
            print(f"Fixed {data.get('term_id')}")
    except Exception as e:
        pass

