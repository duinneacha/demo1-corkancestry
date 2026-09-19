# Cork Ancestral Archive & Genealogical Research

Static rebuild of [corkancestry.com](https://www.corkancestry.com/) for GitHub Pages.

- **Live site:** https://duinneacha.github.io/demo1-corkancestry/
- **Repository:** https://github.com/duinneacha/demo1-corkancestry

## Local development

```bash
npm install
npm run import-baptisms
npm start
```

The local server is at http://localhost:8080/demo1-corkancestry/

## Baptism register

The public search uses SQLite in the browser (`sql.js`). Until the full CSV export arrives, `npm run import-baptisms` writes a small fixture database to `src/assets/data/baptisms.sqlite`.

When the CSV is available:

```bash
npm run import-baptisms -- path/to/baptisms.csv
```

Expected columns (any subset; extras ignored): `child_id`, `surname`, `surname_normalized`, `surname_original`, `given_name`, `father`, `mother`, `parents_key`, `year`, `house_name`, `address`, `town`, plus a sponsors file/rows with `child_id`, `wit_no`, `sponsor`, `by_proxy`, `sp_occupation`.

## Contact form

Set `formspree` in `src/_data/site.json` to a Formspree form id. Until then the request page falls back to `mailto:Ancestors@corkancestry.com`.
