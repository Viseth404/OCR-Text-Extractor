// Generic field extractors for OCR'd bank slip text. Bank-specific rules live in banks.js.

const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";

export function normalizeText(raw) {
  return raw
    .replace(/[០-៩]/g, (d) => String(KHMER_DIGITS.indexOf(d)))
    .replace(/[：]/g, ":")
    .replace(/[ \t]+/g, " ");
}

export function toLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// Lookahead instead of \b: \b does not work next to Khmer characters.
const labelPattern = (labels) => new RegExp(`^(?:${labels.join("|")})(?=$|[\\s:.#-])[\\s:.#-]*(.*)$`, "i");

// Value after a label on the same line, or on the next line when the label stands alone.
export function findLabeledValue(lines, labels) {
  const pattern = labelPattern(labels);
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(pattern);
    if (!match) continue;
    const value = match[1].trim() || lines[i + 1] || "";
    if (value) return value;
  }
  return null;
}

const CURRENCY_ALIASES = { $: "USD", usd: "USD", "៛": "KHR", khr: "KHR", riel: "KHR", riels: "KHR" };
const NUMBER = "\\d{1,3}(?:[,\\s]\\d{3})+(?:\\.\\d{1,2})?|\\d+(?:\\.\\d{1,2})?";
const CURRENCY = "\\$|usd|khr|riels?|៛";
const AMOUNT_PATTERNS = [
  new RegExp(`(${CURRENCY})\\s*[-+]?\\s*(${NUMBER})`, "i"),
  new RegExp(`[-+]?(${NUMBER})\\s*(${CURRENCY})`, "i"),
];

export function parseAmount(line) {
  for (const [index, pattern] of AMOUNT_PATTERNS.entries()) {
    const match = line.match(pattern);
    if (!match) continue;
    const [currencyRaw, numberRaw] = index === 0 ? [match[1], match[2]] : [match[2], match[1]];
    return {
      amount: numberRaw.replace(/[,\s]/g, ""),
      currency: CURRENCY_ALIASES[currencyRaw.toLowerCase()] ?? currencyRaw.toUpperCase(),
    };
  }
  return null;
}

const AMOUNT_LABELS = ["amount", "total amount", "transfer amount", "ចំនួនទឹកប្រាក់", "ទឹកប្រាក់"];

// Prefer an amount on (or right after) an "Amount" line; fall back to the first currency amount.
export function findAmount(lines) {
  const labeled = findLabeledValue(lines, AMOUNT_LABELS);
  return (labeled && parseAmount(labeled)) ?? lines.map(parseAmount).find(Boolean) ?? null;
}

const MONTH = "jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec";
const DATE_PATTERNS = [
  /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/, // 2025-01-31
  /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/, // 31/01/2025
  new RegExp(`\\b\\d{1,2}[\\s-](?:${MONTH})[a-z]*[\\s-,]*\\d{4}\\b`, "i"), // 31 Jan 2025
  new RegExp(`\\b(?:${MONTH})[a-z]*\\s+\\d{1,2},?\\s+\\d{4}\\b`, "i"), // Jan 31, 2025
];

export function findDate(text) {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

export function findTime(text) {
  const match = text.match(/\b([01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(?:\s?[AP]M)?\b/i);
  return match ? match[0] : null;
}

const REFERENCE_LABELS = [
  "transaction id",
  "transaction no\\.?",
  "transaction hash",
  "trx\\.? id",
  "txn id",
  "reference no\\.?",
  "reference",
  "ref\\.? no\\.?",
  "ref",
  "hash",
  "លេខប្រតិបត្តិការ",
  "លេខយោង",
];

export function findReference(lines) {
  const value = findLabeledValue(lines, REFERENCE_LABELS);
  const token = value?.match(/[A-Z0-9][A-Z0-9-]{5,}/i);
  return token ? token[0] : null;
}

const SENDER_LABELS = ["from account", "from", "sender", "sender name", "ពី", "អ្នកផ្ញើ"];
const RECEIVER_LABELS = ["to account", "to", "receiver", "receiver name", "beneficiary", "ទៅ", "អ្នកទទួល"];

export const findSender = (lines) => findLabeledValue(lines, SENDER_LABELS);
export const findReceiver = (lines) => findLabeledValue(lines, RECEIVER_LABELS);
