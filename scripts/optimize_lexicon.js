const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../lexicon/term_id_registry.json');
const OUTPUT_PATH = path.join(__dirname, '../lexicon/lexicon_bundle.json');

async function bundle() {
    console.log('🚀 Starting Lexicon Bundling...');

    try {
        const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        const termsIndex = registry.terms_index;
        const bundledTerms = [];

        for (const entry of termsIndex) {
            const termPath = path.join(__dirname, '..', entry.path);
            if (fs.existsSync(termPath)) {
                const termData = JSON.parse(fs.readFileSync(termPath, 'utf8'));
                bundledTerms.push(termData);
            } else {
                console.warn(`⚠️ Warning: Missing file for ${entry.term_id} at ${entry.path}`);
            }
        }

        const bundle = {
            version: registry.registry_version,
            generated_at: new Date().toISOString(),
            total_terms: bundledTerms.length,
            terms: bundledTerms
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(bundle, null, 2));
        console.log(`✅ Success! Bundled ${bundledTerms.length} terms into ${OUTPUT_PATH}`);

        // Calculate size reduction comparison
        const stats = fs.statSync(OUTPUT_PATH);
        console.log(`📦 Bundle size: ${(stats.size / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('❌ Error during bundling:', error);
        process.exit(1);
    }
}

bundle();
