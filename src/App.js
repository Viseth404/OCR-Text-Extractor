import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";

const proxyUrl = "https://cors-anywhere.herokuapp.com/";

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Handle pasted images
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    let foundImage = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image")) {
        const file = items[i].getAsFile();
        if (file) {
          setImage(URL.createObjectURL(file));
          setError("");
          foundImage = true;
          break; // Stop searching after the first image is found
        }
      }
    }

    if (!foundImage) {
      setError("No image found in the clipboard. Please paste a valid image.");
    }
  };

  // Extract text from the image
  const extractText = () => {
    if (!image) {
      setError("Please upload an image, paste an image, or enter a URL first!");
      return;
    }

    setLoading(true);
    setError("");
    setText("");
    setSaveSuccess(false);

    Tesseract.recognize(image, "eng+khm")
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError("Failed to extract text. Please try another image.");
        setLoading(false);
      });
  };

  // Save extracted text
  const saveText = () => {
    if (!text) {
      setError("No text to save!");
      return;
    }

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "extracted_text.txt";
    link.click();
    setSaveSuccess(true);
  };

  // Copy extracted text
  const copyText = () => {
    if (!text) {
      setError("No text to copy!");
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      setSaveSuccess(true);
      setError(""); // Clear previous errors
    }).catch((err) => {
      console.error("Error copying text:", err);
      setError("Failed to copy text.");
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Handle Enter key
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      extractText();
    }
  };

  // Attach event listeners for both paste and keydown
  useEffect(() => {
    const handlePasteWrapper = (event) => handlePaste(event);
    const handleKeyDownWrapper = (event) => handleKeyDown(event);

    // Add event listeners
    window.addEventListener("paste", handlePasteWrapper);
    window.addEventListener("keydown", handleKeyDownWrapper);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("paste", handlePasteWrapper);
      window.removeEventListener("keydown", handleKeyDownWrapper);
    };
  }, [image]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen ${
        isDarkMode ? "bg-[#121212] text-gray-300" : "bg-[#f0f0f0] text-gray-900"
      } font-sans p-6`}
    >
      <div
        className={`${
          isDarkMode ? "bg-[#181818] border-[#333]" : "bg-white border-[#ddd]"
        } rounded-lg shadow-lg p-8 max-w-lg w-full border`}
      >
        <h1 className="text-4xl font-extrabold text-[#E50914] text-center mb-6">
          Image to Text
        </h1>

        <button
          onClick={toggleTheme}
          className={`mb-4 w-full py-2 px-4 rounded-md flex items-center justify-center transition ${
            isDarkMode ? "bg-[#E50914] text-white" : "bg-[#333] text-white"
          }`}
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 mr-2" />
          ) : (
            <MoonIcon className="w-5 h-5 mr-2" />
          )}
          Switch to {isDarkMode ? "Light" : "Dark"} Mode
        </button>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              setImage(URL.createObjectURL(event.target.files[0]))
            }
            className="w-full px-3 py-2 border border-[#333] rounded-md text-sm focus:outline-none focus:ring-2"
          />
        </div>

        {image && (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-400 mb-2">
              Image Preview
            </h2>
            <img
              src={image}
              alt="Uploaded Preview"
              className="rounded-md shadow-md"
            />
          </div>
        )}

        <button
          onClick={extractText}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md mt-4 transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[#E50914] hover:bg-[#B81D24] text-white"
          }`}
        >
          {loading ? (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            "Extract Text"
          )}
        </button>

        {text && (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={copyText}
              className="w-32 bg-[#E50914] text-white py-2 px-4 rounded-md mt-4 hover:bg-[#B81D24] transition duration-300"
            >
              Copy Text
            </button>
            <button
              onClick={saveText}
              className="w-32 bg-[#E50914] text-white py-2 px-4 rounded-md mt-4 hover:bg-[#B81D24] transition duration-300"
            >
              Save Text
            </button>
          </div>
        )}

        {text && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-300 mb-2">
              Extracted Text
            </h2>
            <textarea
              value={text}
              readOnly
              className={`w-full px-3 py-2 border border-[#333] rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E50914] h-40 ${
                isDarkMode
                  ? "bg-[#181818] text-gray-200"
                  : "bg-white text-gray-900"
              }`}
            ></textarea>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
