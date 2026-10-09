import { useState, useEffect, useCallback, useRef } from "react";
import Tesseract from "tesseract.js";
import { isPdfFile, readPdfPages, MAX_PDF_PAGES } from "../lib/pdf";

const OCR_LANGS = "eng+khm";

// Turns an image or PDF into a list of pages: [{ image, text }].
export function useOcr() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const workerRef = useRef(null);
  const busyRef = useRef(false);
  const imageUrlsRef = useRef([]);
  const stepLabelRef = useRef("");

  // Reuse one Tesseract worker so language data is only loaded once.
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = Tesseract.createWorker(OCR_LANGS, undefined, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStatus(`${stepLabelRef.current} ${Math.round(m.progress * 100)}%`);
          }
        },
      }).catch((err) => {
        workerRef.current = null; // allow a retry on the next file
        throw err;
      });
    }
    return workerRef.current;
  }, []);

  const processFile = useCallback(
    async (file) => {
      if (!file || busyRef.current) return;
      const isPdf = isPdfFile(file);
      if (!isPdf && !file.type.startsWith("image")) {
        setError("Unsupported file. Please use an image or a PDF.");
        return;
      }

      busyRef.current = true;
      setError("");
      setNotice("");
      setPages([]);
      setLoading(true);
      try {
        let sources;
        if (isPdf) {
          const result = await readPdfPages(file, (i, n) => setStatus(`Reading PDF page ${i} of ${n}...`));
          sources = result.pages;
          if (result.totalPages > MAX_PDF_PAGES) {
            setNotice(`Only the first ${MAX_PDF_PAGES} of ${result.totalPages} pages were processed.`);
          }
        } else {
          sources = [{ image: URL.createObjectURL(file), text: "" }];
        }
        imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        imageUrlsRef.current = sources.map((p) => p.image);

        const results = [];
        for (let i = 0; i < sources.length; i++) {
          let text = sources[i].text;
          if (!text) {
            stepLabelRef.current =
              sources.length > 1 ? `Extracting page ${i + 1} of ${sources.length}...` : "Extracting text...";
            setStatus(stepLabelRef.current);
            const worker = await getWorker();
            const { data } = await worker.recognize(sources[i].image);
            text = data.text.trim();
          }
          results.push({ image: sources[i].image, text });
        }
        setPages(results);
      } catch (err) {
        console.error(err);
        setError(isPdf ? "Failed to read this PDF. Try another file." : "Failed to extract text. Try another image.");
      } finally {
        busyRef.current = false;
        setLoading(false);
        setStatus("");
      }
    },
    [getWorker]
  );

  useEffect(
    () => () => {
      workerRef.current?.then((worker) => worker.terminate()).catch(() => {});
      workerRef.current = null;
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      imageUrlsRef.current = [];
    },
    []
  );

  return { pages, loading, status, notice, error, setError, processFile };
}
