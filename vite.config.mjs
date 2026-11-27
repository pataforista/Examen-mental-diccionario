import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// Files the app fetches or references at runtime by URL. Vite only bundles
// what index.html imports, so without this step dist/ would lack the clinical
// data and the service worker and could not be deployed on its own.
const RUNTIME_FILES = [
  "sw.js",
  "manifest.json",
  "robots.txt",
  "sitemap.xml",
  "og-image.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "favicon-16.png",
  "favicon-32.png",
  "assets/celada.jpeg",
  "shared",
  "screenshots",
  "domains",
  "lexicon/lexicon_bundle.json",
  "OSCE_001–003.json",
  "OSCE_004–OSCE_009.json",
  "OSCE_010–OSCE_015.json",
  "OSCE_016–025.json",
  "OSCE_026–035.json",
];

const copyRuntimeFiles = () => ({
  name: "copy-runtime-files",
  apply: "build",
  closeBundle() {
    for (const file of RUNTIME_FILES) {
      const src = resolve(__dirname, file);
      if (existsSync(src)) cpSync(src, resolve(__dirname, "dist", file), { recursive: true });
    }
    // Precaché del service worker: añade los archivos con hash de esta build.
    const sw = resolve(__dirname, "dist/sw.js");
    const built = readdirSync(resolve(__dirname, "dist/assets"))
      .filter(f => !/^manifest-.+\.json$/.test(f))
      .map(f => `  "assets/${f}",`)
      .join("\n");
    const swSrc = readFileSync(sw, "utf8");
    if (!swSrc.includes("/* __VITE_ASSETS__ */")) throw new Error("sw.js: falta el marcador /* __VITE_ASSETS__ */");
    writeFileSync(sw, swSrc.replace("  /* __VITE_ASSETS__ */", built));
    // Vite fingerprints the manifest into assets/, which breaks its relative
    // icon paths; point the page back at the root copy instead.
    const html = resolve(__dirname, "dist/index.html");
    writeFileSync(html, readFileSync(html, "utf8").replace(/href="\/assets\/manifest-[^"]+\.json"/, 'href="manifest.json"'));
    for (const f of readdirSync(resolve(__dirname, "dist/assets"))) {
      if (/^manifest-.+\.json$/.test(f)) rmSync(resolve(__dirname, "dist/assets", f));
    }
  },
});

export default defineConfig({
  plugins: [copyRuntimeFiles()],
});
