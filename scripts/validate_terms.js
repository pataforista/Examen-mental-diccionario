const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '../lexicon/term_id_registry.json');
const SCHEMA_PATH = path.join(__dirname, '../lexicon/lexicon.term.schema.json');

async function validate() {
    console.log('🔍 Starting Lexicon Validation Audit...');

    try {
        const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
        const termsIndex = registry.terms_index;
        let errors = 0;
        let warnings = 0;

        // Note: Simple validation for demonstration. 
        // A production version would use an AJV library for full schema validation.

        for (const entry of termsIndex) {
            const termPath = path.join(__dirname, '..', entry.path);
            if (!fs.existsSync(termPath)) {
                console.error(`❌ [ERROR] Missing file for ${entry.term_id} at ${entry.path}`);
                errors++;
                continue;
            }

            const termData = JSON.parse(fs.readFileSync(termPath, 'utf8'));

            // Critical checks
            if (termData.term_id !== entry.term_id) {
                console.error(`❌ [ERROR] ID mismatch in ${entry.path}. Expected ${entry.term_id}, found ${termData.term_id}`);
                errors++;
            }

            if (!termData.canonical_name || !termData.definition_clinical?.core) {
                console.error(`❌ [ERROR] Missing core definition fields in ${entry.path}`);
                errors++;
            }

            // Semantic checks
            if (!termData.mappings?.cie11?.code && !termData.term_id.startsWith('ARC')) {
                console.warn(`⚠️ [WARN] Missing CIE-11 mapping for modern term: ${termData.canonical_name} (${termData.term_id})`);
                warnings++;
            }
        }

        console.log('\n--- Audit Results ---');
        console.log(`Total Terms Checked: ${termsIndex.length}`);
        console.log(`Errors: ${errors}`);
        console.log(`Warnings: ${warnings}`);

        if (errors > 0) {
            console.error('\n❌ Validation failed. Please fix the errors listed above.');
            process.exit(1);
        } else {
            console.log('\n✅ Lexicon validation passed successfully!');
        }

    } catch (error) {
        console.error('❌ Critical system error during validation:', error);
        process.exit(1);
    }
}

validate();
