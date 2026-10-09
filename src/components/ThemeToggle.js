import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { buttonClass } from "../lib/styles";

export default function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-center gap-2 py-2 mb-4 rounded-md text-sm font-medium ${buttonClass}`}
    >
      {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      Switch to {isDarkMode ? "Light" : "Dark"} Mode
    </button>
  );
}
