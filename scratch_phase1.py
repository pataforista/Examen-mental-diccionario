import os
import json
import glob

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        # Add newline at end of file to keep it clean
        f.write('\n')

terms_dir = 'lexicon/terms'

# Helpers
def fix_context(file_path):
    if not os.path.exists(file_path): return
    data = load_json(file_path)
    changed = False
    if 'synonyms_and_slang' in data:
        for syn in data['synonyms_and_slang']:
            if syn.get('context') == 'clínico' or syn.get('context') == 'clinical':
                syn['context'] = 'clínico'
                changed = True
    if changed:
        save_json(file_path, data)

# 1. AFF Fixes
aff_files = glob.glob(f'{terms_dir}/AFF/*.json')
for f in aff_files:
    fix_context(f)

# Specific AFF fixes
# AFF_001
aff_001 = f'{terms_dir}/AFF/AFF_001_afecto_constrenido.json'
if os.path.exists(aff_001):
    data = load_json(aff_001)
    if 'synonyms_and_slang' in data:
        for syn in data['synonyms_and_slang']:
            if syn.get('context') == 'clinical_descriptive':
                pass # already correct
# AFF_003 term_kind
aff_003 = f'{terms_dir}/AFF/AFF_003_ambivalencia.json'
if os.path.exists(aff_003):
    data = load_json(aff_003)
    data['term_kind'] = 'síntoma'
    save_json(aff_003, data)
# AFF_004 risk_weight
aff_004 = f'{terms_dir}/AFF/AFF_004_ambivalencia_afectiva.json'
if os.path.exists(aff_004):
    data = load_json(aff_004)
    data['risk_weight'] = 1
    save_json(aff_004, data)
# AFF_005 term_kind and definition
aff_005 = f'{terms_dir}/AFF/AFF_005_angustia.json'
if os.path.exists(aff_005):
    data = load_json(aff_005)
    data['term_kind'] = 'síntoma'
    data['definition_clinical'] = data.get('definition_clinical', {})
    data['definition_clinical']['core'] = "Estado de malestar intenso y paroxístico, con predominio de sensaciones somáticas de opresión (pecho, nudo en la garganta) y una vivencia de desbordamiento o inminencia catastrófica, que puede acompañarse de agitación o inmovilidad."
    save_json(aff_005, data)
# AFF_008 term_kind and definition
aff_008 = f'{terms_dir}/AFF/AFF_008_ansiedad_afectiva.json'
if os.path.exists(aff_008):
    data = load_json(aff_008)
    data['term_kind'] = 'síntoma'
    save_json(aff_008, data)
# AFF_017 term_kind
aff_017 = f'{terms_dir}/AFF/AFF_017_eutimia.json'
if os.path.exists(aff_017):
    data = load_json(aff_017)
    data['term_kind'] = 'estado'
    save_json(aff_017, data)
# AFF_022 risk_weight and name
aff_022 = f'{terms_dir}/AFF/AFF_022_incontinencia_afectiva.json'
if os.path.exists(aff_022):
    data = load_json(aff_022)
    data['canonical_name'] = "Incontinencia afectiva"
    data['risk_weight'] = 1
    save_json(aff_022, data)
# AFF_023 term_kind
aff_023 = f'{terms_dir}/AFF/AFF_023_ira.json'
if os.path.exists(aff_023):
    data = load_json(aff_023)
    data['term_kind'] = 'síntoma'
    save_json(aff_023, data)
# AFF_033 risk_weight and name
aff_033 = f'{terms_dir}/AFF/AFF_033_rigidez_afectiva.json'
if os.path.exists(aff_033):
    data = load_json(aff_033)
    data['canonical_name'] = "Rigidez afectiva"
    data['risk_weight'] = 1
    save_json(aff_033, data)
# AFF_035 term_kind
aff_035 = f'{terms_dir}/AFF/AFF_035_animo_depresivo.json'
if os.path.exists(aff_035):
    data = load_json(aff_035)
    data['term_kind'] = 'síntoma'
    save_json(aff_035, data)
# AFF_036 term_kind
aff_036 = f'{terms_dir}/AFF/AFF_036_animo_elevado.json'
if os.path.exists(aff_036):
    data = load_json(aff_036)
    data['term_kind'] = 'síntoma'
    save_json(aff_036, data)

# 2. ARC Fixes
# ARC_003
arc_003 = f'{terms_dir}/ARC/ARC_003_bouffee_delirante.json'
if os.path.exists(arc_003):
    data = load_json(arc_003)
    data['canonical_name'] = "Bouffée délirante"
    if 'exclusions' in data:
        for exc in data['exclusions']:
            if exc.get('canonical_name') == "Dementia Praecox":
                exc['canonical_name'] = "Dementia praecox"
    save_json(arc_003, data)
# ARC_005
arc_005 = f'{terms_dir}/ARC/ARC_005_demencia_precox_concepto_kraepeliano.json'
if os.path.exists(arc_005):
    data = load_json(arc_005)
    data['canonical_name'] = "Demencia precox (concepto Kraepeliano)"
    if 'definition_clinical' in data and 'core' in data['definition_clinical']:
        core = data['definition_clinical']['core']
        core = core.replace("alucionaciones", "alucinaciones")
        core = core.replace("hebefrénia", "hebefrenia")
        data['definition_clinical']['core'] = core
    if 'synonyms_and_slang' in data:
        for syn in data['synonyms_and_slang']:
            if syn.get('term') == "Kraeplin":
                syn['term'] = "Kraepelin"
    save_json(arc_005, data)
# ARC_006
arc_006 = f'{terms_dir}/ARC/ARC_006_dementia_praecox.json'
if os.path.exists(arc_006):
    data = load_json(arc_006)
    data['canonical_name'] = "Dementia praecox"
    data['term_kind'] = 'concepto_histórico'
    save_json(arc_006, data)
# ARC_011
arc_011 = f'{terms_dir}/ARC/ARC_011_locura_circular.json'
if os.path.exists(arc_011):
    data = load_json(arc_011)
    data['canonical_name'] = "Locura circular"
    data['term_kind'] = 'concepto_histórico'
    save_json(arc_011, data)
# ARC_012
arc_012 = f'{terms_dir}/ARC/ARC_012_locura_de_la_duda.json'
if os.path.exists(arc_012):
    data = load_json(arc_012)
    data['canonical_name'] = "Locura de la duda"
    save_json(arc_012, data)
# ARC_014
arc_014 = f'{terms_dir}/ARC/ARC_014_mania_sin_delirio.json'
if os.path.exists(arc_014):
    data = load_json(arc_014)
    data['canonical_name'] = "Manía sin delirio"
    save_json(arc_014, data)
# ARC_015
arc_015 = f'{terms_dir}/ARC/ARC_015_monomania.json'
if os.path.exists(arc_015):
    data = load_json(arc_015)
    data['canonical_name'] = "Monomanía"
    if 'exclusions' in data:
        for exc in data['exclusions']:
            if exc.get('term_id') == "DEL_001":
                exc['term_id'] = "DEL_010"
                exc['canonical_name'] = "Delirio primario"
    save_json(arc_015, data)
# ARC_018
arc_018 = f'{terms_dir}/ARC/ARC_018_paranoia_querulans.json'
if os.path.exists(arc_018):
    data = load_json(arc_018)
    data['canonical_name'] = "Paranoia querulans"
    save_json(arc_018, data)
# ARC_020
arc_020 = f'{terms_dir}/ARC/ARC_020_wahnstimmung.json'
if os.path.exists(arc_020):
    data = load_json(arc_020)
    if 'synonyms_and_slang' in data:
        for syn in data['synonyms_and_slang']:
            if syn.get('context') == 'clínico':
                syn['context'] = 'clínico'
    if 'exclusions' in data:
        for exc in data['exclusions']:
            if exc.get('term_id') == "DEL_023":
                exc['term_id'] = "DEL_018"
                exc['canonical_name'] = "Humor delirante"
    save_json(arc_020, data)

# 3. APP, AKT, CAT, CNS
akt_001 = f'{terms_dir}/AKT/AKT_001_acatisia.json'
if os.path.exists(akt_001):
    data = load_json(akt_001)
    if 'synonyms_and_slang' in data:
        for syn in data['synonyms_and_slang']:
            if syn.get('context') == 'patient_report':
                syn['context'] = 'patient_report'
    save_json(akt_001, data)

app_001 = f'{terms_dir}/APP/APP_001_actitud_hacia_el_entrevistador.json'
if os.path.exists(app_001):
    fix_context(app_001)

app_002 = f'{terms_dir}/APP/APP_002_alino_e_higiene.json'
if os.path.exists(app_002):
    fix_context(app_002)

app_004 = f'{terms_dir}/APP/APP_004_facies_y_mimica.json'
if os.path.exists(app_004):
    fix_context(app_004)
    data = load_json(app_004)
    if 'exclusions' in data:
        data['exclusions'] = [e for e in data['exclusions'] if e.get('term_id') != "APP_004"]
    save_json(app_004, data)

cat_002 = f'{terms_dir}/CAT/CAT_002_estupor_catatonico.json'
if os.path.exists(cat_002):
    data = load_json(cat_002)
    data['canonical_name'] = "Estupor catatónico"
    save_json(cat_002, data)

cat_004 = f'{terms_dir}/CAT/CAT_004_mutismo_catatonico.json'
if os.path.exists(cat_004):
    data = load_json(cat_004)
    data['canonical_name'] = "Mutismo catatónico"
    save_json(cat_004, data)

cat_005 = f'{terms_dir}/CAT/CAT_005_obediencia_automatica.json'
if os.path.exists(cat_005):
    data = load_json(cat_005)
    data['canonical_name'] = "Obediencia automática"
    save_json(cat_005, data)

cns_003 = f'{terms_dir}/CNS/CNS_003_conciencia_ladeada_twilight_state.json'
if os.path.exists(cns_003):
    data = load_json(cns_003)
    data['canonical_name'] = "Estado crepuscular"
    if 'synonyms_and_slang' in data:
        for syn in data['synonyms_and_slang']:
            if syn.get('term') == "ESTADO ONIROIDE EPILÉPTICO":
                syn['term'] = "Estado oniroide epiléptico"
            if syn.get('term') == "Estado Crepuscular":
                syn['term'] = "Estado crepuscular"
    save_json(cns_003, data)

cns_005 = f'{terms_dir}/CNS/CNS_005_estupor_psiquiatrico.json'
if os.path.exists(cns_005):
    data = load_json(cns_005)
    data['canonical_name'] = "Estupor psiquiátrico"
    save_json(cns_005, data)

print("Phase 1 term fixes complete.")

# 4. Handle Exclusions to undefined terms (PHO, CON, etc.)
def clean_exclusions():
    undefined_refs = ["COG_0XX", "PAN_001", "Angustia vital", "Depresión mayor", "Culpa adaptativa", "Duelo normal", "Temperamento hipertímico", "Hostilidad", "Afecto fugaz", "Incontinencia afectiva pseudobulbar", "Confusión", "Ansiedad generalizada", "Crisis autonómica médica", "Depersonalización afectiva", "Esquizofrenia concepto Bleuleriano", "Psicosis maníaco-depresiva", "DSM-5", "CIE-11 Trastorno", "Presión del habla", "Autolesión no suicida", "Actos impuestos", "Obsesiones", "Bradipsiquia", "Afasia"]
    
    # We will remove exclusions that point to PHO_ or CON_ or text that doesn't have a valid term_id and matches undefined.
    all_files = glob.glob(f'{terms_dir}/*/*.json')
    for f in all_files:
        if '_deprecated' in f: continue
        data = load_json(f)
        if 'exclusions' in data:
            new_excl = []
            for exc in data['exclusions']:
                tid = exc.get('term_id', '')
                cname = exc.get('canonical_name', '')
                if tid.startswith('PHO_') or tid.startswith('CON_'):
                    continue
                if tid in ["COG_0XX", "PAN_001"]:
                    continue
                if "Depresión mayor" in cname or "Duelo normal" in cname or "Temperamento" in cname or "Hostilidad" in cname or "Confusión" in cname or "Ansiedad generalizada" in cname or "Bleuleriano" in cname or "DSM" in cname:
                    continue
                new_excl.append(exc)
            if len(new_excl) != len(data['exclusions']):
                data['exclusions'] = new_excl
                save_json(f, data)

clean_exclusions()
print("Exclusions cleaned.")
