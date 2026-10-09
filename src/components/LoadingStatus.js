import { mutedTextClass } from "../lib/styles";

export default function LoadingStatus({ status }) {
  return (
    <div className="flex flex-col items-center gap-2 mt-6" role="status" aria-live="polite">
      <div className="w-6 h-6 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      {status && <span className={`text-sm ${mutedTextClass}`}>{status}</span>}
    </div>
  );
}
