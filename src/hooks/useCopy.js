import { useState, useEffect, useRef } from "react";

// Copies text to the clipboard and exposes a short-lived `copied` flag for feedback.
export function useCopy(onError) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = (text) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => onError?.("Failed to copy text."));
  };

  return { copied, copy };
}
