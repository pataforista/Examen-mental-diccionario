const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8').split('\n');

function findLine(prefix) {
    return lines.findIndex(l => l.startsWith(prefix));
}

const idxData = findLine('  data: {');
const idxUtils = findLine('  utils: {');
const idxTheme = findLine('  theme: {');
const idxIntegrator = findLine('  integrator: {');
const idxGame = findLine('  game: {');
const idxDonation = findLine('  donation: {');
const idxPwa = findLine('  pwa: {');
const idxRootFunctionsStart = findLine('  init: async function () {');
const idxRenderView = findLine('  renderView: function (viewName) {');
const idxAppEnd = lines.findIndex(l => l.startsWith('};'));

function extract(start, end, name, isDictionary = false) {
    let blockLines = lines.slice(start, end);
    // Remove the trailing comma from the last line of the block if it exists
    let lastLine = blockLines[blockLines.length - 1];
    if (lastLine && lastLine.trim() === '},') {
        blockLines[blockLines.length - 1] = lastLine.replace('},', '}');
    }
    
    let content = blockLines.join('\n');
    let moduleContent = '';
    
    if (isDictionary) {
        moduleContent = `export const dictionary = {\n${content}\n};\n`;
    } else {
        let cleaned = content.replace(new RegExp(`^\\s*${name}:\\s*`), '');
        moduleContent = `export const ${name} = ${cleaned}\n`;
    }

    moduleContent = `/* global App, document, window, navigator, gsap, Fuse, SpeechSynthesisUtterance, localStorage, fetch */\n\n${moduleContent}`;
    fs.writeFileSync(path.join(__dirname, '../src', `${name}.js`), moduleContent);
}

// Slice the blocks
extract(idxData, idxUtils, 'state');
extract(idxUtils, idxTheme, 'utils');
extract(idxTheme, idxIntegrator, 'theme');
// Wait, the functions of `dictionary` are spread before integrator and after pwa.
// `init: async function`, `renderAllTerms`, etc are between data and integrator, wait no.
// Let's re-verify the lines from our Select-String earlier.
// data: 2
// init: 13
// ... wait, init is inside data? No, init is at root!
// That means `data` ends before `init`!

