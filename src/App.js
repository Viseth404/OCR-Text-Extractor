import React, { useState, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.js",
  import.meta.url
).toString();

const OCR_LANGS = "eng+khm";
const PDF_RENDER_SCALE = 2;

// Render every page of a PDF to a PNG data URL so Tesseract can read it.
async function renderPdfPages(file) {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    pages.push(canvas.toDataURL("image/png"));
  }
  return pages;
}

function App() {
  const [previews, setPreviews] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");
    if (!isPdf && !file.type.startsWith("image")) {
      setError("Unsupported file. Please use an image or a PDF.");
      return;
    }

    setError("");
    setText("");
    setLoading(true);
    let worker;
    try {
      let images;
      if (isPdf) {
        setStatus("Reading PDF...");
        images = await renderPdfPages(file);
      } else {
        images = [URL.createObjectURL(file)];
      }
      setPreviews(images);

      worker = await Tesseract.createWorker(OCR_LANGS);
      const results = [];
      for (let i = 0; i < images.length; i++) {
        setStatus(images.length > 1 ? `Extracting page ${i + 1} of ${images.length}...` : "Extracting text...");
        const { data } = await worker.recognize(images[i]);
        results.push(images.length > 1 ? `--- Page ${i + 1} ---\n${data.text.trim()}` : data.text);
      }
      setText(results.join("\n\n"));
    } catch (err) {
      console.error(err);
      setError(isPdf ? "Failed to read this PDF. Try another file." : "Failed to extract text. Try another image.");
    } finally {
      if (worker) await worker.terminate();
      setLoading(false);
      setStatus("");
    }
  }, []);

  const handlePaste = useCallback(
    (event) => {
      const items = event.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image") || items[i].type === "application/pdf") {
          processFile(items[i].getAsFile());
          break;
        }
      }
    },
    [processFile]
  );

  const handleDrop = (event) => {
    event.preventDefault();
    processFile(event.dataTransfer.files[0]);
  };

  const saveText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "extracted_text.txt";
    link.click();
  };

  const copyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {
      setError("Failed to copy text.");
    });
  };

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const theme = isDarkMode
    ? {
        bg: "bg-black",
        card: "bg-neutral-900",
        text: "text-white",
        border: "border-neutral-700",
        input: "bg-neutral-800 text-white",
        label: "text-neutral-400",
        button: "bg-white text-black hover:bg-neutral-200",
      }
    : {
        bg: "bg-white",
        card: "bg-white",
        text: "text-black",  
        border: "border-neutral-300",
        input: "bg-neutral-100 text-black",
        label: "text-neutral-600",
        button: "bg-black text-white hover:bg-neutral-800",
      };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme.bg} ${theme.text} p-6 transition-all duration-300`}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`w-full max-w-xl ${theme.card} ${theme.border} border rounded-xl shadow-sm p-6 transition-all`}
      >
        <h1 className="text-3xl font-semibold text-center mb-6">OCR Text Extractor</h1>
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-center gap-2 py-2 mb-6 rounded-md text-sm font-medium ${theme.button} transition`}
        >
          {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          Switch to {isDarkMode ? "Light" : "Dark"} Mode
        </button>

        <label className={`block text-sm font-medium mb-1 ${theme.label}`}>Upload Image or PDF</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          disabled={loading}
          onChange={(e) => {
            processFile(e.target.files[0]);
            e.target.value = "";
          }}
          className={`w-full px-3 py-2 ${theme.border} ${theme.input} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black`}
        />

        <p className={`mt-1 text-xs ${theme.label}`}>You can also paste an image or drop a file here.</p>

        {previews.length > 0 && (
          <div className="mt-6">
            <label className={`block text-sm font-medium mb-1 ${theme.label}`}>
              Preview{previews.length > 1 ? ` (${previews.length} pages)` : ""}
            </label>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {previews.map((src, i) => (
                <img key={i} src={src} alt={`Page ${i + 1}`} className="w-full rounded-lg shadow" />
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-2 mt-6">
            <div className={`w-6 h-6 border-4 ${isDarkMode ? "border-white" : "border-black"} border-t-transparent rounded-full animate-spin`} />
            {status && <span className={`text-sm ${theme.label}`}>{status}</span>}
          </div>
        )}

        {text && (
          <>
            <div className="flex gap-4 mt-6">
              <button
                onClick={copyText}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${theme.button} transition`}
              >
                Copy
              </button>
              <button
                onClick={saveText}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${theme.button} transition`}
              >
                Save
              </button>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium mb-1 ${theme.label}`}>Extracted Text</label>
              <textarea
                readOnly
                value={text}
                className={`w-full h-40 px-3 py-2 ${theme.input} ${theme.border} border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black`}
              />
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-500 text-center font-medium">{error}</div>
        )}
      </div>

      <footer className="text-xs text-center mt-8 opacity-50 select-none">
        RITHKEOVISETH — 2025
      </footer>
    </div>
  );
}

export default App;
