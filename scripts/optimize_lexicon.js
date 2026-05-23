const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TERMS_DIR = path.join(ROOT, 'lexicon/terms');
const REGISTRY_PATH = path.join(ROOT, 'lexicon/term_id_registry.json');
const BUNDLE_PATH = path.join(ROOT, 'lexicon/lexicon_bundle.json');

// Recursively collect every term .json file under lexicon/terms/**.
function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(p);
        return entry.name.endsWith('.json') ? [p] : [];
    });
}

// Stable order: by prefix, then by numeric sequence (term ids are PREFIX_NNN).
function compareTermId(a, b) {
    const [pa, sa] = a.split('_');
    const [pb, sb] = b.split('_');
    if (pa !== pb) return pa < pb ? -1 : 1;
    return (parseInt(sa, 10) || 0) - (parseInt(sb, 10) || 0);
}

function bundle() {
    console.log('🚀 Building lexicon bundle from term files (source of truth)...');

    const files = walk(TERMS_DIR);
    const terms = [];
    const index = [];
    let skipped = 0;

    for (const file of files) {
        let data;
        try {
            data = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
            console.error(`❌ Skipping ${path.relative(ROOT, file)}: invalid JSON (${e.message})`);
            skipped++;
            continue;
        }
        if (!data.term_id || !data.canonical_name) {
            console.warn(`⚠️  Skipping ${path.relative(ROOT, file)}: missing term_id or canonical_name`);
            skipped++;
            continue;
        }
        terms.push(data);
        index.push({ term_id: data.term_id, path: path.relative(ROOT, file).split(path.sep).join('/') });
    }

    // Detect duplicate term ids across files (would silently shadow each other in the app).
    const seen = new Map();
    for (const t of terms) seen.set(t.term_id, (seen.get(t.term_id) || 0) + 1);
    const dups = [...seen].filter(([, n]) => n > 1).map(([id]) => id);
    if (dups.length) {
        console.error(`❌ Duplicate term_ids found: ${dups.join(', ')}`);
        process.exit(1);
    }

    terms.sort((a, b) => compareTermId(a.term_id, b.term_id));
    index.sort((a, b) => compareTermId(a.term_id, b.term_id));

    // Preserve curated prefix descriptions from the previous registry when present.
    let prevPrefixes = {};
    let registryVersion = '1.0.0';
    try {
        const prev = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        prevPrefixes = prev.prefixes || {};
        registryVersion = prev.registry_version || registryVersion;
    } catch (e) { /* first build */ }

    const prefixes = {};
    for (const t of terms) {
        const [prefix, seqStr] = t.term_id.split('_');
        const seq = parseInt(seqStr, 10) || 0;
        if (!prefixes[prefix]) {
            prefixes[prefix] = {
                description: prevPrefixes[prefix]?.description || '',
                next_seq: 1,
                reserved: prevPrefixes[prefix]?.reserved || []
            };
        }
        prefixes[prefix].next_seq = Math.max(prefixes[prefix].next_seq, seq + 1);
    }

    const today = new Date().toISOString().split('T')[0];

    const bundleData = {
        version: registryVersion,
        generated_at: new Date().toISOString(),
        total_terms: terms.length,
        terms
    };
    fs.writeFileSync(BUNDLE_PATH, JSON.stringify(bundleData, null, 2) + '\n');

    const registryData = {
        registry_version: registryVersion,
        last_updated: today,
        prefixes,
        terms_index: index
    };
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registryData, null, 2) + '\n');

    const sizeKB = (fs.statSync(BUNDLE_PATH).size / 1024).toFixed(2);
    console.log(`✅ Bundled ${terms.length} terms (${skipped} skipped) → ${path.relative(ROOT, BUNDLE_PATH)} (${sizeKB} KB)`);
    console.log(`✅ Regenerated registry → ${path.relative(ROOT, REGISTRY_PATH)} (${index.length} entries, ${Object.keys(prefixes).length} prefixes)`);
}

try {
    bundle();
} catch (error) {
    console.error('❌ Error during bundling:', error);
    process.exit(1);
}
