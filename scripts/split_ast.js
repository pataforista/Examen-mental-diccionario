const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const { generate } = require('astring');

const appJsPath = path.join(__dirname, '../app.js');
const srcDir = path.join(__dirname, '../src');
const content = fs.readFileSync(appJsPath, 'utf8');

const ast = acorn.parse(content, { ecmaVersion: 2022, sourceType: 'script' });

let appDecl = null;
for (let node of ast.body) {
    if (node.type === 'VariableDeclaration') {
        for (let decl of node.declarations) {
            if (decl.id.name === 'App' && decl.init.type === 'ObjectExpression') {
                appDecl = decl.init;
                break;
            }
        }
    }
}

if (!appDecl) {
    console.error("Could not find const App = { ... }");
    process.exit(1);
}

const blocks = {
    state: null,
    utils: null,
    theme: null,
    integrator: null,
    game: null,
    donation: null,
    pwa: null
};

let dictionaryProps = [];

for (let prop of appDecl.properties) {
    const key = prop.key.name;
    if (key === 'data') blocks.state = prop.value;
    else if (blocks[key] !== undefined) blocks[key] = prop.value;
    else dictionaryProps.push(prop);
}

function writeModule(name, node, isDictionary = false) {
    let moduleContent = '';
    
    // Generate code for the AST node
    // We add some comments to fix linter errors since they reference globals
    moduleContent = `/* global App, document, window, navigator, gsap, Fuse, SpeechSynthesisUtterance, localStorage, fetch */\n\n`;

    if (isDictionary) {
        // Create an ObjectExpression for the dictionary
        const dictNode = { type: 'ObjectExpression', properties: node };
        moduleContent += `export const dictionary = ${generate(dictNode)};\n`;
    } else {
        moduleContent += `export const ${name} = ${generate(node)};\n`;
    }

    fs.writeFileSync(path.join(srcDir, `${name}.js`), moduleContent);
}

writeModule('state', blocks.state);
writeModule('utils', blocks.utils);
writeModule('theme', blocks.theme);
writeModule('integrator', blocks.integrator);
writeModule('game', blocks.game);
writeModule('donation', blocks.donation);
writeModule('pwa', blocks.pwa);
writeModule('dictionary', dictionaryProps, true);

const mainContent = `
import { state as data } from './state.js';
import { utils } from './utils.js';
import { theme } from './theme.js';
import { integrator } from './integrator.js';
import { game } from './game.js';
import { donation } from './donation.js';
import { pwa } from './pwa.js';
import { dictionary } from './dictionary.js';

const App = {
    data,
    utils,
    theme,
    integrator,
    game,
    donation,
    pwa,
    ...dictionary
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
`;

fs.writeFileSync(path.join(srcDir, 'main.js'), mainContent.trim() + '\n');
console.log("AST Refactoring complete.");
