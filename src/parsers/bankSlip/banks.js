// Known banks / wallets, detected by keywords in the slip text.
// A bank may add `parse(text, lines)` returning fields that override the generic ones,
// for layouts the generic extractors get wrong. Add these from real sample slips.
export const BANKS = [
  { id: "aba", name: "ABA Bank", keywords: [/\bABA\b/, /Advanced Bank of Asia/i] },
  { id: "acleda", name: "ACLEDA Bank", keywords: [/ACLEDA/i, /អេស៊ីលីដា/] },
  { id: "wing", name: "Wing Bank", keywords: [/\bWing\b/i, /វីង/] },
  { id: "canadia", name: "Canadia Bank", keywords: [/Canadia/i] },
  { id: "prince", name: "Prince Bank", keywords: [/Prince Bank/i] },
  { id: "sathapana", name: "Sathapana Bank", keywords: [/Sathapana/i] },
  { id: "chipmong", name: "Chip Mong Bank", keywords: [/Chip ?Mong/i] },
  { id: "amk", name: "AMK", keywords: [/\bAMK\b/] },
  { id: "bakong", name: "Bakong", keywords: [/Bakong/i, /បាគង/] },
];

export function detectBank(text) {
  return BANKS.find((bank) => bank.keywords.some((pattern) => pattern.test(text))) ?? null;
}
