import { useCopy } from "../hooks/useCopy";
import { downloadText } from "../lib/download";
import { buttonClass, fieldClass, labelClass } from "../lib/styles";

export default function TextResult({ pages, onError }) {
  const { copied, copy } = useCopy(onError);
  const multi = pages.length > 1;
  const text = pages.map((page, i) => (multi ? `--- Page ${i + 1} ---\n${page.text}` : page.text)).join("\n\n");

  return (
    <>
      <div className="flex gap-4 mt-6">
        <button type="button" onClick={() => copy(text)} className={`flex-1 py-2 rounded-md text-sm font-medium ${buttonClass}`}>
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={() => downloadText(text, "extracted_text.txt")}
          className={`flex-1 py-2 rounded-md text-sm font-medium ${buttonClass}`}
        >
          Save
        </button>
      </div>

      <div className="mt-6">
        <label htmlFor="extracted-text" className={labelClass}>
          Extracted Text
        </label>
        <textarea id="extracted-text" readOnly value={text} className={`${fieldClass} h-40 resize-none`} />
      </div>
    </>
  );
}
