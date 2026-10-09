// Copy pdf.js's worker and runtime assets into public/pdfjs/ so they are served as-is.
// Bundling the worker through CRA runs Babel over it, which breaks the module, and the
// wasm decoders (scanned/JBIG2/JPEG 2000 images), cmaps and standard fonts are
// fetched by pdf.js at runtime, so they must be plain static files.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pdfjs = path.join(root, "node_modules", "pdfjs-dist");
const out = path.join(root, "public", "pdfjs");

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(pdfjs, "legacy", "build", "pdf.worker.min.mjs"), path.join(out, "pdf.worker.min.mjs"));
for (const dir of ["wasm", "cmaps", "standard_fonts", "iccs"]) {
  fs.cpSync(path.join(pdfjs, dir), path.join(out, dir), { recursive: true });
}
