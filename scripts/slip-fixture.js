// OCR a bank slip image into a parser test fixture.
// Usage: npm run slip:fixture -- samples/bank-slips/aba-01.jpg [more images...]
// Writes src/parsers/bankSlip/__fixtures__/<name>.txt (OCR text) and <name>.json
// (expected fields, all null — fill them in by reading the slip).
const fs = require("fs");
const path = require("path");
const { createWorker } = require("tesseract.js");

const FIXTURE_DIR = path.join(__dirname, "..", "src", "parsers", "bankSlip", "__fixtures__");
const FIELDS = ["bank", "amount", "currency", "date", "time", "reference", "sender", "receiver"];

async function main() {
  const images = process.argv.slice(2);
  if (images.length === 0) {
    console.error("Usage: npm run slip:fixture -- <image> [more images...]");
    process.exit(1);
  }

  const worker = await createWorker("eng+khm");
  try {
    for (const image of images) {
      const name = path.basename(image, path.extname(image));
      const { data } = await worker.recognize(path.resolve(image));
      fs.writeFileSync(path.join(FIXTURE_DIR, `${name}.txt`), data.text.trim() + "\n");

      const jsonPath = path.join(FIXTURE_DIR, `${name}.json`);
      if (!fs.existsSync(jsonPath)) {
        const expected = Object.fromEntries(FIELDS.map((field) => [field, null]));
        fs.writeFileSync(jsonPath, JSON.stringify(expected, null, 2) + "\n");
      }
      console.log(`✓ ${name}: wrote ${name}.txt and ${name}.json`);
    }
  } finally {
    await worker.terminate();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
