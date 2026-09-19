const status = document.querySelector("#search-status");
const form = document.querySelector("#surname-form");
const surnameInput = document.querySelector("#surname");
const parentsTable = document.querySelector("#parents-table");
const childrenTable = document.querySelector("#children-table");
const sponsorsTable = document.querySelector("#sponsors-table");

const prefix = document.querySelector("link[rel='stylesheet']")?.getAttribute("href")?.replace(/css\/site\.css$/, "") || "/";
const dbUrl = `${prefix}assets/data/baptisms.sqlite`;
const wasmUrl = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm";

let db;

function showStatus(message) {
  if (status) status.textContent = message;
}

function fillTable(table, rows, cells) {
  const body = table.querySelector("tbody");
  body.replaceChildren();
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.tabIndex = 0;
    if (row.key) tr.dataset.key = row.key;
    for (const value of cells(row)) {
      const td = document.createElement("td");
      td.textContent = value ?? "";
      tr.append(td);
    }
    body.append(tr);
  }
  table.hidden = rows.length === 0;
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function searchSurname(raw) {
  const surname = raw.trim();
  childrenTable.hidden = true;
  sponsorsTable.hidden = true;
  if (!surname) {
    parentsTable.hidden = true;
    showStatus("Enter a surname to search.");
    return;
  }
  const like = `${surname.toLowerCase()}%`;
  const rows = query(
    `SELECT parents_key AS key,
            father,
            mother,
            COUNT(*) AS children,
            MIN(year) AS start,
            MAX(year) AS last
       FROM baptised_child
      WHERE surname_normalized LIKE ?
         OR lower(surname) LIKE ?
         OR lower(surname_original) LIKE ?
      GROUP BY parents_key, father, mother
      ORDER BY father, mother`,
    [like, like, like]
  );
  fillTable(parentsTable, rows, (row) => [row.father, row.mother, row.children, row.start, row.last]);
  showStatus(rows.length ? `${rows.length} family grouping${rows.length === 1 ? "" : "s"} found.` : "No matching families.");
}

function showChildren(parentsKey) {
  sponsorsTable.hidden = true;
  const rows = query(
    `SELECT child_id AS key, child_id, year, house_name, address, town
       FROM baptised_child
      WHERE parents_key = ?
      ORDER BY year, child_id`,
    [parentsKey]
  );
  fillTable(childrenTable, rows, (row) => [row.child_id, row.year, row.house_name, row.address, row.town]);
}

function showSponsors(childId) {
  const rows = query(
    `SELECT wit_no, sponsor, by_proxy, sp_occupation
       FROM sponsor
      WHERE child_id = ?
      ORDER BY wit_no`,
    [Number(childId)]
  );
  fillTable(sponsorsTable, rows, (row) => [
    row.wit_no,
    row.sponsor,
    row.by_proxy ? "Yes" : "",
    row.sp_occupation,
  ]);
  if (!rows.length) showStatus("No sponsors recorded for this child.");
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  searchSurname(surnameInput.value);
});

parentsTable?.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-key]");
  if (row) showChildren(row.dataset.key);
});

childrenTable?.addEventListener("click", (event) => {
  const row = event.target.closest("tr[data-key]");
  if (row) showSponsors(row.dataset.key);
});

async function start() {
  try {
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    const response = await fetch(dbUrl);
    if (!response.ok) throw new Error("Register file missing");
    db = new SQL.Database(new Uint8Array(await response.arrayBuffer()));
    const count = query("SELECT COUNT(*) AS n FROM baptised_child")[0]?.n ?? 0;
    showStatus(`Register ready (${count} baptisms). Search a surname.`);
    const params = new URLSearchParams(window.location.search);
    if (params.get("surname")) {
      surnameInput.value = params.get("surname");
      searchSurname(surnameInput.value);
    }
  } catch (error) {
    showStatus("The baptism register is not available in this build.");
    console.error(error);
  }
}

start();
