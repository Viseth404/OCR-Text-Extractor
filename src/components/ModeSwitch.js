export const MODES = [
  { id: "general", label: "General Image" },
  { id: "bankSlip", label: "Bank Slip" },
];

export default function ModeSwitch({ mode, onChange, disabled }) {
  return (
    <div
      role="group"
      aria-label="Extraction mode"
      className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-md bg-neutral-100 dark:bg-neutral-800"
    >
      {MODES.map(({ id, label }) => {
        const active = id === mode;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(id)}
            className={`py-2 rounded text-sm font-medium transition disabled:opacity-50 ${
              active
                ? "bg-black text-white dark:bg-white dark:text-black shadow"
                : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
