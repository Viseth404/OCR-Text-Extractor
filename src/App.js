import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image")) {
        const file = items[i].getAsFile();
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          setImage(imageUrl);
          setError("");
          setLoading(true);
          Tesseract.recognize(imageUrl, "eng+khm")
            .then(({ data: { text } }) => {
              setText(text);
              setLoading(false);
            })
            .catch(() => {
              setError("Failed to extract text. Try another image.");
              setLoading(false);
            });
          break;
        }
      }
    }
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
  }, []);

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
      <div className={`w-full max-w-xl ${theme.card} ${theme.border} border rounded-xl shadow-sm p-6 transition-all`}>
        <h1 className="text-3xl font-semibold text-center mb-6">OCR Text Extractor</h1>
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-center gap-2 py-2 mb-6 rounded-md text-sm font-medium ${theme.button} transition`}
        >
          {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          Switch to {isDarkMode ? "Light" : "Dark"} Mode
        </button>

        <label className={`block text-sm font-medium mb-1 ${theme.label}`}>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
          className={`w-full px-3 py-2 ${theme.border} ${theme.input} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black`}
        />

        {image && (
          <div className="mt-6">
            <label className={`block text-sm font-medium mb-1 ${theme.label}`}>Image Preview</label>
            <img src={image} alt="Preview" className="w-full rounded-lg shadow" />
          </div>
        )}

        {loading && (
          <div className="flex justify-center mt-6">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
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
        RITHKEOVISETH ❤️ — 2025
      </footer>
    </div>
  );
}

export default App;
