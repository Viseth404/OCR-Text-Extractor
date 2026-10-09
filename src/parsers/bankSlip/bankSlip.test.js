import fs from "fs";
import path from "path";
import { parseBankSlip, slipsToCsv } from ".";
import { parseAmount, normalizeText } from "./fields";

describe("field extractors", () => {
  test("parses amounts with the currency before or after the number", () => {
    expect(parseAmount("$ 1,250.50")).toEqual({ amount: "1250.50", currency: "USD" });
    expect(parseAmount("-25.00 USD")).toEqual({ amount: "25.00", currency: "USD" });
    expect(parseAmount("40,000 KHR")).toEqual({ amount: "40000", currency: "KHR" });
    expect(parseAmount("៛ 10000")).toEqual({ amount: "10000", currency: "KHR" });
    expect(parseAmount("no money here")).toBeNull();
  });

  test("converts Khmer digits", () => {
    expect(normalizeText("១២៣.៤៥")).toBe("123.45");
  });

  test("does not mistake 'Total' for a 'To' label", () => {
    const slip = parseBankSlip("Total: $5.00\nTo: SOK DARA");
    expect(slip.receiver).toBe("SOK DARA");
  });

  test("reads a value from the line after a standalone label", () => {
    const slip = parseBankSlip("Transaction ID\n12345678901\nAmount\n10.00 USD");
    expect(slip.reference).toBe("12345678901");
    expect(slip.amount).toBe("10.00");
  });

  test("returns nulls for text that is not a slip", () => {
    const slip = parseBankSlip("hello world");
    expect(Object.values(slip).every((value) => value === null)).toBe(true);
  });

  test("CSV escapes quotes and keeps empty fields", () => {
    const csv = slipsToCsv([{ bank: 'A "B"', amount: "1.00" }]);
    expect(csv.split("\n")[1]).toBe('"A ""B""","1.00","","","","","",""');
  });
});

// Real slips: every <name>.txt in __fixtures__ must parse to the fields in <name>.json.
// Create them with `npm run slip:fixture -- path/to/slip.jpg` (see __fixtures__/README.md).
const FIXTURE_DIR = path.join(__dirname, "__fixtures__");
const fixtures = fs
  .readdirSync(FIXTURE_DIR)
  .filter((file) => file.endsWith(".txt"))
  .map((file) => file.replace(/\.txt$/, ""))
  .filter((name) => fs.existsSync(path.join(FIXTURE_DIR, `${name}.json`)));

describe("sample slips", () => {
  if (fixtures.length === 0) {
    test.todo("add real bank slip fixtures to __fixtures__");
    return;
  }
  test.each(fixtures)("%s", (name) => {
    const text = fs.readFileSync(path.join(FIXTURE_DIR, `${name}.txt`), "utf8");
    const expected = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, `${name}.json`), "utf8"));
    expect(parseBankSlip(text)).toMatchObject(expected);
  });
});
