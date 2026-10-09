import { detectBank } from "./banks";
import { normalizeText, toLines, findAmount, findDate, findTime, findReference, findSender, findReceiver } from "./fields";

export const SLIP_FIELDS = [
  { key: "bank", label: "Bank" },
  { key: "amount", label: "Amount" },
  { key: "currency", label: "Currency" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "reference", label: "Reference / Transaction ID" },
  { key: "sender", label: "From" },
  { key: "receiver", label: "To" },
];

// Turn OCR text of one bank slip into structured fields. Missing fields are null.
export function parseBankSlip(rawText) {
  const text = normalizeText(rawText);
  const lines = toLines(text);
  const bank = detectBank(text);
  const amount = findAmount(lines);

  const fields = {
    bank: bank?.name ?? null,
    amount: amount?.amount ?? null,
    currency: amount?.currency ?? null,
    date: findDate(text),
    time: findTime(text),
    reference: findReference(lines),
    sender: findSender(lines),
    receiver: findReceiver(lines),
  };

  const overrides = bank?.parse?.(text, lines) ?? {};
  for (const [key, value] of Object.entries(overrides)) {
    if (value != null) fields[key] = value;
  }
  return fields;
}

export function slipsToCsv(slips) {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = SLIP_FIELDS.map((f) => escape(f.label)).join(",");
  const rows = slips.map((slip) => SLIP_FIELDS.map((f) => escape(slip[f.key])).join(","));
  return [header, ...rows].join("\n");
}
