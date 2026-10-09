import { fieldClass, labelClass, mutedTextClass } from "../lib/styles";

export default function FileInput({ label, disabled, onFile }) {
  return (
    <>
      <label htmlFor="file-input" className={labelClass}>
        {label}
      </label>
      <input
        id="file-input"
        type="file"
        accept="image/*,application/pdf"
        disabled={disabled}
        onChange={(e) => {
          onFile(e.target.files[0]);
          e.target.value = "";
        }}
        className={fieldClass}
      />
      <p className={`mt-1 text-xs ${mutedTextClass}`}>You can also paste an image or drop a file here.</p>
    </>
  );
}
