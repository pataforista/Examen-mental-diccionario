import os
import json
import shutil
import glob

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

terms_dir = 'lexicon/terms'
dep_dir = f'{terms_dir}/_deprecated'
os.makedirs(dep_dir, exist_ok=True)

def merge_terms(source_file, target_file, target_id):
    if not os.path.exists(source_file) or not os.path.exists(target_file):
        return
    s_data = load_json(source_file)
    t_data = load_json(target_file)
    
    # Merge synonyms
    if 'synonyms_and_slang' in s_data:
        t_data.setdefault('synonyms_and_slang', [])
        # Also add the canonical name of source as a synonym
        t_data['synonyms_and_slang'].append({
            "term": s_data['canonical_name'],
            "context": "clínico",
            "region": "universal",
            "notes": "Término unificado"
        })
        for syn in s_data['synonyms_and_slang']:
            if syn not in t_data['synonyms_and_slang']:
                t_data['synonyms_and_slang'].append(syn)
                
    save_json(target_file, t_data)
    # Move source to deprecated
    shutil.move(source_file, os.path.join(dep_dir, os.path.basename(source_file)))

# 1. AFF_004 -> AFF_003
merge_terms(
    f'{terms_dir}/AFF/AFF_004_ambivalencia_afectiva.json',
    f'{terms_dir}/AFF/AFF_003_ambivalencia.json',
    'AFF_003'
)

# 2. AFF_029 -> AFF_021
merge_terms(
    f'{terms_dir}/AFF/AFF_029_paratimia.json',
    f'{terms_dir}/AFF/AFF_021_incongruencia_afectiva.json',
    'AFF_021'
)

# 3. ARC_005 -> ARC_006
merge_terms(
    f'{terms_dir}/ARC/ARC_005_demencia_precox_concepto_kraepeliano.json',
    f'{terms_dir}/ARC/ARC_006_dementia_praecox.json',
    'ARC_006'
)

# 4. ARC_010 -> ARC_009
merge_terms(
    f'{terms_dir}/ARC/ARC_010_histeria_neurosis_histerica.json',
    f'{terms_dir}/ARC/ARC_009_histeria.json',
    'ARC_009'
)

# Fix exclusions that point to deprecated IDs across all files
deprecated_mapping = {
    "AFF_004": "AFF_003",
    "AFF_029": "AFF_021",
    "ARC_005": "ARC_006",
    "ARC_010": "ARC_009"
}

all_files = glob.glob(f'{terms_dir}/*/*.json')
for f in all_files:
    if '_deprecated' in f: continue
    data = load_json(f)
    changed = False
    if 'exclusions' in data:
        for exc in data['exclusions']:
            tid = exc.get('term_id')
            if tid in deprecated_mapping:
                exc['term_id'] = deprecated_mapping[tid]
                changed = True
    if 'related_terms' in data:
        for rel in data['related_terms']:
            tid = rel.get('term_id')
            if tid in deprecated_mapping:
                rel['term_id'] = deprecated_mapping[tid]
                changed = True
    if changed:
        save_json(f, data)

# 5. Create RSK_001
rsk_001_path = f'{terms_dir}/RSK/RSK_001_riesgo_autolitico.json'
rsk_001_data = {
  "term_id": "RSK_001",
  "canonical_name": "Riesgo autolítico (general)",
  "term_kind": "factor de riesgo",
  "granularity": "atomic",
  "risk_weight": 3,
  "definition_clinical": {
    "core": "Presencia de cualquier ideación, conducta o planificación dirigida a causarse daño a sí mismo, sin especificar el tipo o nivel de inminencia.",
    "required_features": [
      "Potencial de daño autoinfligido",
      "Puede o no haber intencionalidad letal clara"
    ]
  },
  "operationalization": {
    "detectable_by": ["clinical_interview", "patient_report", "collateral_history"],
    "time_relation": ["current", "past"]
  },
  "alerts": [
    "Requiere evaluación urgente de la inminencia, intencionalidad letal y planificación.",
    "Activar protocolos de seguridad y prevención del suicidio si se confirma."
  ],
  "synonyms_and_slang": [
    {
      "term": "Riesgo de suicidio",
      "context": "clínico",
      "region": "universal",
      "notes": "Término genérico"
    }
  ],
  "exclusions": [],
  "related_terms": [
    {
      "term_id": "RSK_006",
      "relationship": "broadens"
    },
    {
      "term_id": "RSK_007",
      "relationship": "broadens"
    }
  ],
  "teaching_notes": [
    "Término paraguas que incluye desde ideación suicida pasiva hasta intento suicida. Útil cuando no se puede o no se ha especificado el nivel exacto de riesgo."
  ],
  "cognitive_pitfalls": [],
  "version": "1.0.0"
}
save_json(rsk_001_path, rsk_001_data)

# Document in CHANGELOG
changelog_path = 'CHANGELOG_TERMS.md'
changelog_content = """## Fusiones Realizadas (Fase 2)

- AFF_004 -> AFF_003 (Ambivalencia afectiva -> Ambivalencia)
- AFF_029 -> AFF_021 (Paratimia -> Incongruencia afectiva)
- ARC_005 -> ARC_006 (Demencia Precox concepto Kraepeliano -> Dementia Praecox)
- ARC_010 -> ARC_009 (Histeria Neurosis Histérica -> Histeria)

## Nuevos términos creados
- RSK_001 (Riesgo autolítico general)
"""
with open(changelog_path, 'a', encoding='utf-8') as f:
    f.write(changelog_content)

print("Phase 2 complete: Terms merged, RSK_001 created, Changelog updated.")
