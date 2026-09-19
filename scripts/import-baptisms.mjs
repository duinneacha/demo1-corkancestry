import fs from "node:fs/promises";
import path from "node:path";
import initSqlJs from "sql.js";

const schema = `
CREATE TABLE IF NOT EXISTS baptised_child (
  child_id INTEGER PRIMARY KEY,
  surname TEXT,
  surname_normalized TEXT,
  surname_original TEXT,
  given_name TEXT,
  father TEXT,
  mother TEXT,
  parents_key TEXT,
  year INTEGER,
  house_name TEXT,
  address TEXT,
  town TEXT
);
CREATE TABLE IF NOT EXISTS sponsor (
  child_id INTEGER,
  wit_no INTEGER,
  sponsor TEXT,
  by_proxy INTEGER,
  sp_occupation TEXT
);
CREATE INDEX IF NOT EXISTS idx_child_surname ON baptised_child(surname_normalized);
CREATE INDEX IF NOT EXISTS idx_child_parents ON baptised_child(parents_key);
CREATE INDEX IF NOT EXISTS idx_sponsor_child ON sponsor(child_id);
`;

function normalize(value = "") {
  return String(value).trim().toLowerCase().replace(/[^a-z]/g, "");
}

function parentsKey(father, mother) {
  return `${normalize(father)}|${normalize(mother)}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  return body.map((values) => {
    const record = {};
    header.forEach((key, index) => {
      record[key.trim()] = values[index] ?? "";
    });
    return record;
  });
}

function pick(record, names) {
  for (const name of names) {
    if (record[name] != null && String(record[name]).trim() !== "") {
      return String(record[name]).trim();
    }
  }
  return "";
}

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(schema);

  const csvPath = process.argv[2];
  let children = [];
  let sponsors = [];

  if (csvPath) {
    const text = await fs.readFile(csvPath, "utf8");
    const records = parseCsv(text);
    const looksLikeSponsor = records.some((r) => pick(r, ["Sponsor", "sponsor", "SPOccupation"]));
    if (looksLikeSponsor && records.every((r) => !pick(r, ["Father", "father"]))) {
      sponsors = records;
    } else {
      children = records;
    }
    console.log(`Imported ${records.length} rows from ${csvPath}`);
  } else {
    children = [
      {
        child_id: 1,
        surname: "Sullivan",
        surname_original: "Sulvn",
        given_name: "Mary",
        father: "John Sullivan",
        mother: "Margaret Murphy",
        year: 1812,
        house_name: "North Mall",
        address: "3 North Mall",
        town: "Cork",
      },
      {
        child_id: 2,
        surname: "Sullivan",
        surname_original: "Sullivan",
        given_name: "Patrick",
        father: "John Sullivan",
        mother: "Margaret Murphy",
        year: 1814,
        house_name: "North Mall",
        address: "3 North Mall",
        town: "Cork",
      },
      {
        child_id: 3,
        surname: "Sullivan",
        surname_original: "Sullivane",
        given_name: "Ellen",
        father: "Daniel Sullivan",
        mother: "Honora Walsh",
        year: 1808,
        house_name: "Barrack Street",
        address: "Barrack Street",
        town: "Cork",
      },
      {
        child_id: 4,
        surname: "Coppinger",
        surname_original: "Coppinger",
        given_name: "Stephen",
        father: "John Coppinger",
        mother: "Alice Coppinger",
        year: 1792,
        house_name: "",
        address: "South Parish",
        town: "Cork",
      },
    ];
    sponsors = [
      { child_id: 1, wit_no: 1, sponsor: "James Sullivan", by_proxy: 0, sp_occupation: "Cooper" },
      { child_id: 1, wit_no: 2, sponsor: "Mary Murphy", by_proxy: 0, sp_occupation: "" },
      { child_id: 2, wit_no: 1, sponsor: "Timothy Sullivan", by_proxy: 1, sp_occupation: "Sailor" },
      { child_id: 3, wit_no: 1, sponsor: "Michael Walsh", by_proxy: 0, sp_occupation: "" },
      { child_id: 4, wit_no: 1, sponsor: "Wm Coppinger", by_proxy: 0, sp_occupation: "" },
      { child_id: 4, wit_no: 2, sponsor: "Anne Coppinger", by_proxy: 0, sp_occupation: "" },
    ];
  }

  const insertChild = db.prepare(
    `INSERT INTO baptised_child
      (child_id, surname, surname_normalized, surname_original, given_name, father, mother, parents_key, year, house_name, address, town)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const record of children) {
    const father = pick(record, ["father", "Father"]);
    const mother = pick(record, ["mother", "Mother"]);
    const surname = pick(record, ["surname", "Surname"]) || father.split(" ").slice(-1)[0];
    insertChild.run([
      Number(pick(record, ["child_id", "ChildID", "Children"])) || undefined,
      surname,
      normalize(pick(record, ["surname_normalized", "SurnameNormalized"]) || surname),
      pick(record, ["surname_original", "SurnameOriginal"]) || surname,
      pick(record, ["given_name", "GivenName", "Child"]),
      father,
      mother,
      pick(record, ["parents_key", "Parents"]) || parentsKey(father, mother),
      Number(pick(record, ["year", "Year"])) || null,
      pick(record, ["house_name", "HouseName"]),
      pick(record, ["address", "Address"]),
      pick(record, ["town", "Town"]),
    ]);
  }
  insertChild.free();

  const insertSponsor = db.prepare(
    `INSERT INTO sponsor (child_id, wit_no, sponsor, by_proxy, sp_occupation) VALUES (?, ?, ?, ?, ?)`
  );
  for (const record of sponsors) {
    insertSponsor.run([
      Number(pick(record, ["child_id", "ChildID"])),
      Number(pick(record, ["wit_no", "WitNo"])) || 1,
      pick(record, ["sponsor", "Sponsor"]),
      /^(1|true|yes)$/i.test(pick(record, ["by_proxy", "ByProxy"])) ? 1 : 0,
      pick(record, ["sp_occupation", "SPOccupation"]),
    ]);
  }
  insertSponsor.free();

  const out = path.resolve("src/assets/data/baptisms.sqlite");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, Buffer.from(db.export()));
  console.log(`Wrote ${out}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
