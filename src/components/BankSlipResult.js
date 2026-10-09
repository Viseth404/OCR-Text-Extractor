import { useCopy } from "../hooks/useCopy";
import { downloadText } from "../lib/download";
import { buttonClass, fieldClass, labelClass, mutedTextClass } from "../lib/styles";
import { parseBankSlip, slipsToCsv, SLIP_FIELDS } from "../parsers/bankSlip";

// Each page (image or PDF page) is treated as one slip.
export default function BankSlipResult({ pages, onError }) {
  const { copied, copy } = useCopy(onError);
  const slips = pages.map((page) => parseBankSlip(page.text));
  const multi = slips.length > 1;

  return (
    <>
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={() => copy(JSON.stringify(multi ? slips : slips[0], null, 2))}
          className={`flex-1 py-2 rounded-md text-sm font-medium ${buttonClass}`}
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          type="button"
          onClick={() => downloadText(slipsToCsv(slips), "bank_slips.csv", "text/csv")}
          className={`flex-1 py-2 rounded-md text-sm font-medium ${buttonClass}`}
        >
          Save CSV
        </button>
      </div>

      {slips.map((slip, i) => (
        <section key={i} className="mt-6">
          <h2 className={labelClass}>{multi ? `Slip ${i + 1}` : "Slip Details"}</h2>
          <dl className="divide-y divide-neutral-300 dark:divide-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm">
            {SLIP_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex gap-4 px-3 py-2">
                <dt className={`w-1/3 shrink-0 ${mutedTextClass}`}>{label}</dt>
                <dd className={`break-words ${slip[key] ? "" : "italic opacity-50"}`}>{slip[key] ?? "Not found"}</dd>
              </div>
            ))}
          </dl>
          <details className="mt-2">
            <summary className={`cursor-pointer text-xs ${mutedTextClass}`}>Show raw text</summary>
            <textarea
              readOnly
              aria-label={`Raw text of slip ${i + 1}`}
              value={pages[i].text}
              className={`${fieldClass} mt-2 h-32 resize-none`}
            />
          </details>
        </section>
      ))}
    </>
  );
}
