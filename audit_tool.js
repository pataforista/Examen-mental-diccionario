const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const lexiconRoot = path.join(projectRoot, 'lexicon', 'terms');
const osceFiles = [
    'OSCE_001–003.json',
    'OSCE_004–OSCE_009.json',
    'OSCE_010–OSCE_015.json',
    'OSCE_016–025.json',
    'OSCE_026–035.json'
];

async function runAudit() {
    console.log('--- STARTING AUDIT ---');
    let errorCount = 0;
    let warningCount = 0;

    // 1. Audit Lexicon JSONs
    console.log('\n[1] Auditing Lexicon Terms...');
    const lexiconTerms = new Map();

    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                walkDir(filePath);
            } else if (file.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const term = JSON.parse(content);

                    // Validation 1: Required fields
                    if (!term.id || !term.term) {
                        console.error(`[FAIL] ${file}: Missing ID or Term`);
                        errorCount++;
                    }

                    // Validation 2: Duplicate ID check
                    if (lexiconTerms.has(term.id)) {
                        console.error(`[FAIL] Duplicate ID found: ${term.id} in ${file} and ${lexiconTerms.get(term.id)}`);
                        errorCount++;
                    } else {
                        lexiconTerms.set(term.id, file);
                    }

                    // Validation 3: Definitions
                    if (!term.definitions || term.definitions.length === 0) {
                        console.warn(`[WARN] ${file}: No definitions found`);
                        warningCount++;
                    }

                } catch (e) {
                    console.error(`[FATAL] ${file}: Invalid JSON syntax - ${e.message}`);
                    errorCount++;
                }
            }
        });
    }

    if (fs.existsSync(lexiconRoot)) {
        walkDir(lexiconRoot);
        console.log(`Verified ${lexiconTerms.size} lexicon items.`);
    } else {
        console.error(`[FATAL] Lexicon directory not found at ${lexiconRoot}`);
        errorCount++;
    }


    // 2. Audit OSCE Cases
    console.log('\n[2] Auditing OSCE Cases...');
    const osceIds = new Set();

    for (const file of osceFiles) {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const cases = JSON.parse(content);

                if (!Array.isArray(cases)) {
                    console.error(`[FAIL] ${file}: Root must be an array`);
                    errorCount++;
                    continue;
                }

                cases.forEach((c, index) => {
                    // Validation 1: ID uniqueness
                    if (osceIds.has(c.case_id)) {
                        console.error(`[FAIL] ${file}: Duplicate Case ID ${c.case_id}`);
                        errorCount++;
                    }
                    osceIds.add(c.case_id);

                    // Validation 2: Domain Structure
                    if (!c.domains || typeof c.domains !== 'object') {
                        console.error(`[FAIL] ${c.case_id}: Missing domains object`);
                        errorCount++;
                    } else {
                        // Check DOM-01 exists
                        if (!c.domains['DOM-01']) {
                            console.error(`[FAIL] ${c.case_id}: Missing DOM-01`);
                            errorCount++;
                        }
                    }

                    // Validation 3: Expected Engine Output
                    if (!c.expected_engine_output || !c.expected_engine_output.primary_syndrome) {
                        console.error(`[FAIL] ${c.case_id}: Missing expected engine output or syndrome`);
                        errorCount++;
                    }
                });
                console.log(`Verified ${cases.length} cases in ${file}`);

            } catch (e) {
                console.error(`[FATAL] ${file}: Invalid JSON syntax - ${e.message}`);
                errorCount++;
            }
        } else {
            console.error(`[FAIL] Missing OSCE file: ${file}`);
            errorCount++;
        }
    }

    // 3. App Logic Integrity (Basic Check)
    console.log('\n[3] Checking Resource Files...');
    const requiredFiles = ['app.js', 'style.css', 'index.html', 'manifest.json'];
    requiredFiles.forEach(f => {
        if (!fs.existsSync(path.join(projectRoot, f))) {
            console.error(`[FAIL] Missing core file: ${f}`);
            errorCount++;
        }
    });

    console.log('\n--- AUDIT COMPLETE ---');
    console.log(`Errors: ${errorCount}`);
    console.log(`Warnings: ${warningCount}`);

    if (errorCount === 0) {
        console.log('RESULT: PASS (Integrity Verified)');
    } else {
        console.log('RESULT: FAIL (Fix required)');
    }
}

runAudit();
