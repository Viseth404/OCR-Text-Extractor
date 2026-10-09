import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.js",
  import.meta.url
).toString();

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
  // isEvalSupported: false mitigates CVE-2024-4367 in pdfjs-dist < 4.2.67.
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), isEvalSupported: false }).promise;
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
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    pages.push({ image: await canvasToObjectUrl(canvas), text: embeddedText });
  }
  return { pages, totalPages: pdf.numPages };
}
