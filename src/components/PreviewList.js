import { labelClass } from "../lib/styles";

export default function PreviewList({ images }) {
  if (images.length === 0) return null;
  return (
    <div className="mt-6">
      <h2 className={labelClass}>Preview{images.length > 1 ? ` (${images.length} pages)` : ""}</h2>
      <div className="max-h-96 overflow-y-auto space-y-3">
        {images.map((src, i) => (
          <img key={src} src={src} alt={`Page ${i + 1}`} className="w-full rounded-lg shadow" />
        ))}
      </div>
    </div>
  );
}
