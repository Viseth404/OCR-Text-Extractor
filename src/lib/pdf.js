// Legacy build: polyfills newer JS features so older browsers still work.
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Copied into public/pdfjs/ by scripts/copy-pdfjs-assets.js (runs before start/build).
// Absolute URL: the wasm/cmap/font URLs are fetched from inside the worker, where a
// relative path would resolve against the worker's location instead of the page.
// (PUBLIC_URL is "." because "homepage" is relative, for GitHub Pages and Vercel alike.)
const PDFJS_ASSETS = new URL(`${process.env.PUBLIC_URL}/pdfjs`, window.location.href).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_ASSETS}/pdf.worker.min.mjs`;

const PDF_RENDER_SCALE = 2;
export const MAX_PDF_PAGES = 50;

function canvasToObjectUrl(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("Canvas export failed"))), "image/png")
  );
}

export function isPdfFile(file) {
  return file.type === "application/pdf" || Boolean(file.name?.toLowerCase().endsWith(".pdf"));
}

// Render each PDF page to an image and grab its embedded text layer, if any.
// Pages with a text layer can skip OCR entirely.
export async function readPdfPages(file, onPage) {
  const pdf = await pdfjsLib.getDocument({
    data: await file.arrayBuffer(),
    wasmUrl: `${PDFJS_ASSETS}/wasm/`,
    cMapUrl: `${PDFJS_ASSETS}/cmaps/`,
    standardFontDataUrl: `${PDFJS_ASSETS}/standard_fonts/`,
    iccUrl: `${PDFJS_ASSETS}/iccs/`,
  }).promise;
  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const pages = [];
  for (let i = 1; i <= pageCount; i++) {
    onPage(i, pageCount);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const embeddedText = content.items.map((item) => item.str + (item.hasEOL ? "\n" : "")).join("").trim();

    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, viewport }).promise;
    pages.push({ image: await canvasToObjectUrl(canvas), text: embeddedText });
  }
  return { pages, totalPages: pdf.numPages };
}
