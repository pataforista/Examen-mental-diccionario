const fs = require('fs');
const path = require('path');

const TERMS_DIR = path.join(__dirname, '../lexicon/terms');

const termKindMap = {
    'symptom': 'síntoma',
    'sign': 'signo',
    'syndrome': 'síndrome',
    'state': 'estado',
    'capacity': 'capacidad',
    'phenomenon': 'fenómeno'
};

const domainRemaps = {
    'CAT_002': 'DOM-04',
    'CAT_003': 'DOM-04',
    'CAT_005': 'DOM-04',
    'ARC_001': 'DOM-04',
    'ARC_010': 'DOM-16',
    'ARC_015': 'DOM-07',
    'ARC_018': 'DOM-07',
    'ARC_020': 'DOM-09',
    'JUD_002': 'DOM-11',
    'MOT_004': 'DOM-04'
};

function fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing ${filePath}: ${e.message}`);
        return;
    }

    let modified = false;

    // 1. Term Kind
    if (termKindMap[data.term_kind]) {
        data.term_kind = termKindMap[data.term_kind];
        modified = true;
    }

    // 2. Synonyms refactoring
    if (Array.isArray(data.synonyms_and_slang) && data.synonyms_and_slang.length > 0) {
        if (typeof data.synonyms_and_slang[0] === 'string') {
            data.synonyms_and_slang = data.synonyms_and_slang.map(s => ({
                term: s,
                context: "clínico",
                locale: "es"
            }));
            modified = true;
        }
    } else if (typeof data.synonyms_and_slang === 'string' && data.synonyms_and_slang.length > 0) {
        // Handle cases where it was a single string
        data.synonyms_and_slang = [{
            term: data.synonyms_and_slang,
            context: "clínico",
            locale: "es"
        }];
        modified = true;
    }

    // 3. Domain Links Rectification
    const prefix = data.term_id.split('_')[0];
    
    // Series-based remapping
    if (prefix === 'AFF' && data.domain_links && data.domain_links.some(l => l.domain_id === 'DOM-03')) {
        data.domain_links.forEach(l => { if (l.domain_id === 'DOM-03') l.domain_id = 'DOM-09'; });
        modified = true;
    }
    if (prefix === 'MEM' && data.domain_links && data.domain_links.some(l => l.domain_id === 'DOM-09')) {
        data.domain_links.forEach(l => { if (l.domain_id === 'DOM-09') l.domain_id = 'DOM-10'; });
        modified = true;
    }
    if (prefix === 'NEG' && data.domain_links && data.domain_links.some(l => l.domain_id === 'DOM-08')) {
        data.domain_links.forEach(l => { if (l.domain_id === 'DOM-08') l.domain_id = 'DOM-09'; });
        modified = true;
    }
    if ((prefix === 'SOM' || prefix === 'SOM') && data.domain_links && data.domain_links.some(l => l.domain_id === 'DOM-14')) {
        data.domain_links.forEach(l => { if (l.domain_id === 'DOM-14') l.domain_id = 'DOM-07'; });
        modified = true;
    }
    if (prefix === 'THO' && data.domain_links && data.domain_links.some(l => l.domain_id === 'DOM-02' || l.domain_id === 'DOM-04')) {
        data.domain_links.forEach(l => { if (l.domain_id === 'DOM-02' || l.domain_id === 'DOM-04') l.domain_id = 'DOM-06'; });
        modified = true;
    }
    if (prefix === 'SPE' && data.term_id !== 'SPE_007' && data.domain_links && data.domain_links.some(l => l.domain_id === 'DOM-03' || l.domain_id === 'DOM-02' || l.domain_id === 'DOM-10')) {
        data.domain_links.forEach(l => { if (l.domain_id === 'DOM-03' || l.domain_id === 'DOM-02' || l.domain_id === 'DOM-10') l.domain_id = 'DOM-05'; });
        modified = true;
    }
    if (data.term_id === 'VOL_007' && data.domain_links && data.domain_links.some(l => l.domain_id === 'DOM-16')) {
        data.domain_links.forEach(l => { if (l.domain_id === 'DOM-16') l.domain_id = 'DOM-04'; });
        modified = true;
    }

    // 4. Default Mappings
    if (!data.mappings || !data.mappings.cie11 || !data.mappings.cie11.code) {
        if (!data.mappings) data.mappings = {};
        if (!data.mappings.cie11) data.mappings.cie11 = {};
        
        if (prefix === 'THO') {
            data.mappings.cie11.code = 'MB20.Z';
            modified = true;
        } else if (prefix === 'SPE') {
            data.mappings.cie11.code = 'MB24.Y';
            modified = true;
        } else if (data.term_id === 'SNM_001' || data.term_id === 'SER_001') {
            data.mappings.cie11.code = 'EH60';
            modified = true;
        }
    }

    // 5. Exclusion Cleanups
    const exclusionsToRemove = {
        'THO_001': ['THO_003'],
        'THO_003': ['THO_002'],
        'THO_005': ['THO_004'],
        'THO_006': ['THO_001'],
        'THO_009': ['THO_012'],
        'SPE_004': ['SPE_011'],
        'SPE_010': ['SPE_010']
    };
    if (exclusionsToRemove[data.term_id] && data.exclusions) {
        data.exclusions = data.exclusions.filter(e => !exclusionsToRemove[data.term_id].includes(e.term_id));
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${data.term_id}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.json')) {
            fixFile(fullPath);
        }
    });
}

walk(TERMS_DIR);
console.log("Bulk repair completed.");
