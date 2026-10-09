# Bank slip fixtures

Each real slip becomes a pair of files that `bankSlip.test.js` checks automatically:

- `<name>.txt` — the OCR text of the slip
- `<name>.json` — the fields the parser must extract from it

## Adding a slip

1. Put the image in `samples/bank-slips/` (git-ignored, so real slips are never committed).
   Name it after the bank, e.g. `aba-01.jpg`, `acleda-02.png`.
2. Run `npm run slip:fixture -- samples/bank-slips/aba-01.jpg`
3. Open `aba-01.json` and fill in the correct values by reading the slip.
   Leave a field `null` only if the slip really doesn't show it.
   Use `"amount": "25.00"` (no commas), `"currency": "USD"` or `"KHR"`, and copy date/time as printed.
4. Run `npm test` — any failures show exactly which field the parser got wrong.
   Fix the generic rules in `fields.js`, or add a `parse()` override for that bank in `banks.js`.

## Privacy

This repo is public. Before committing a fixture, replace real names and account
numbers in **both** the `.txt` and `.json` with fake ones (keep the same format).
