import React, { useState, useEffect, useCallback } from "react";
import { useOcr } from "./hooks/useOcr";
import { useTheme } from "./hooks/useTheme";
import ThemeToggle from "./components/ThemeToggle";
import ModeSwitch, { MODES } from "./components/ModeSwitch";
import FileInput from "./components/FileInput";
import PreviewList from "./components/PreviewList";
import LoadingStatus from "./components/LoadingStatus";
import TextResult from "./components/TextResult";
import BankSlipResult from "./components/BankSlipResult";

const MODE_KEY = "mode";

function getInitialMode() {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (MODES.some((m) => m.id === saved)) return saved;
  } catch {}
  return "general";
}

function App() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { pages, loading, status, notice, error, setError, processFile } = useOcr();
  const [mode, setMode] = useState(getInitialMode);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {}
  }, [mode]);

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

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files[0]);
  };

  const isBankSlip = mode === "bankSlip";
  const hasText = pages.some((page) => page.text);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black dark:bg-black dark:text-white p-6 transition-all duration-300">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-xl bg-white dark:bg-neutral-900 border rounded-xl shadow-sm p-6 transition-all ${
          isDragging ? "border-dashed border-2 border-black dark:border-white" : "border-neutral-300 dark:border-neutral-700"
        }`}
      >
        <h1 className="text-3xl font-semibold text-center mb-6">OCR Text Extractor</h1>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
        <ModeSwitch mode={mode} onChange={setMode} disabled={loading} />

        <FileInput
          label={isBankSlip ? "Upload Bank Slip (Image or PDF)" : "Upload Image or PDF"}
          disabled={loading}
          onFile={processFile}
        />

        <PreviewList images={pages.map((page) => page.image)} />

        {loading && <LoadingStatus status={status} />}

        {hasText &&
          (isBankSlip ? (
            <BankSlipResult pages={pages} onError={setError} />
          ) : (
            <TextResult pages={pages} onError={setError} />
          ))}

        {!loading && pages.length > 0 && !hasText && (
          <div className="mt-4 text-sm text-center opacity-70">No text was found in this file.</div>
        )}

        {notice && <div className="mt-4 text-sm text-amber-500 text-center font-medium">{notice}</div>}

        {error && (
          <div className="mt-4 text-sm text-red-500 text-center font-medium" role="alert">
            {error}
          </div>
        )}
      </div>

      <footer className="text-xs text-center mt-8 opacity-50 select-none">
        RITHKEOVISETH — {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
