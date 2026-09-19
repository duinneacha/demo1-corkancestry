import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("..", "corkancestry-extracted", "site");
const destRoot = path.resolve("src", "assets", "images");

const map = [
  ["Styles/CorkCityWatermark.jpg", "brand/cork-city-watermark.jpg"],
  ["Styles/Quill.JPG", "brand/quill.jpg"],
  ["About/City ArchivesStore.jpg", "about/city-archives.jpg"],
  ["Our Services/Genealogy/Sample Report.jpg", "services/sample-report.jpg"],
  ["Our Services/Genealogy/Family Tree - Ballinacurra.jpg", "services/family-tree-ballinacurra.jpg"],
  ["Our Services/Passport Applications/Passport to Europe.jpg", "services/passport-to-europe.jpg"],
  ["Databases/Parish Registers/Sample Search.jpg", "databases/sample-search.jpg"],
  ["Families of Note/Coppinger/Barryscourt.jpg", "families/coppinger/barryscourt.jpg"],
  ["Families of Note/Coppinger/Birth Stephen Coppinger - South Parish.bmp", "families/coppinger/stephen-coppinger-baptism.jpg"],
  ["Families of Note/Coppinger/Coppingers of Midleton - Burke's.bmp", "families/coppinger/coppingers-of-midleton-burke.jpg"],
  ["Families of Note/Coppinger/John Joseph Coppinger - Colonel/Colonel J J Coppinger’s birth - Cork Constitution 14 October 1834.jpg", "families/coppinger/jj-birth.jpg"],
  ["Families of Note/Coppinger/John Joseph Coppinger - Colonel/Appointed Ensign - Coventry Standard 19 October 1855.jpg", "families/coppinger/jj-ensign.jpg"],
  ["Families of Note/Coppinger/John Joseph Coppinger - Colonel/Appointed Lieutanent - Leamington Advertiser 2 October 1856.jpg", "families/coppinger/jj-lieutenant.jpg"],
  ["Families of Note/Coppinger/John Joseph Coppinger - Colonel/Medaglia di Pro Petri Sede.jpg", "families/coppinger/medaglia.jpg"],
  ["Families of Note/Coppinger/William Joseph Coppinger - Union Lodge/W J Coppinger & Margaret O'Brien - CC8 May 1832.jpg", "families/coppinger/wj-marriage.jpg"],
  ["Families of Note/Coppinger/William Joseph Coppinger - Union Lodge/First born son - SR21 May 1833.jpg", "families/coppinger/wj-first-born.jpg"],
  ["Families of Note/Coppinger/William Joseph Coppinger - Union Lodge/Sale Union Lodge - SR31 August 1833.jpg", "families/coppinger/wj-sale.jpg"],
  ["Families of Note/Coppinger/William Joseph Coppinger - Union Lodge/Union Lodge Valuation map.jpg", "families/coppinger/union-lodge-map.jpg"],
  ["Families of Note/Coppinger/William Joseph Coppinger - Union Lodge/Louisa Margaret Coppinger death - SR 8 June 1854.jpg", "families/coppinger/louisa-death.jpg"],
  ["Families of Note/Coppinger/William Joseph Coppinger - Union Lodge/W J Coppinger death - Freeman Journal 11 April 1855.jpg", "families/coppinger/wj-death.jpg"],
  ["Families of Note/Coppinger/William Joseph Coppinger - Union Lodge/Coppinger of Ballyvolane – Burke’s 1875.jpg", "families/coppinger/burke-1875.jpg"],
  ["Families of Note/Coppinger/William Joseph Coppinger - Union Lodge/Coppinger Brewery - Valuation House Book 18 Dec 1849.jpg", "families/coppinger/brewery-valuation.jpg"],
  ["Families of Note/England/John England/John England 25 Sept 1786 NP.jpg", "families/england/baptism-1786.jpg"],
  ["Families of Note/England/John England/John England.jpg", "families/england/john-england.jpg"],
  ["Historicial Interests/Architects/George Coppinger Ashlin/George Coppinger Ashlin.JPG", "historical/ashlin/george-coppinger-ashlin.jpg"],
  ["Historicial Interests/Architects/George Coppinger Ashlin/Carrigtwohill Church.jpg", "historical/ashlin/carrigtwohill-church.jpg"],
  ["Historicial Interests/Architects/John Conway/John Conway & Charlotte Scraggs - 4 February 1799 South Parish.jpg", "historical/conway/marriage.jpg"],
  ["Historicial Interests/Architects/John Conway/West Directory.jpg", "historical/conway/west-directory.jpg"],
  ["Historicial Interests/Architects/John Conway/Death Charlotte SR 13 DEc 1823.jpg", "historical/conway/charlotte-death.jpg"],
  ["Historicial Interests/Architects/John Conway/Death John SR 28 Jan 1837.jpg", "historical/conway/john-death.jpg"],
  ["Historicial Interests/Bankers/Roche Brothers/Camden Place cropped.jpg", "historical/roche/camden-place.jpg"],
  ["Historicial Interests/Bankers/Roche Brothers/Roche nine shilling  Bank Note 13 Oct 1800.jpg", "historical/roche/nine-shilling-note.jpg"],
  ["Historicial Interests/Bankers/Roche Brothers/Employment notice Saunders's News-Letter 20 Sept 1808.jpg", "historical/roche/employment-notice.jpg"],
  ["Historicial Interests/Bankers/Roche Brothers/Samuel West Camden Place.bmp", "historical/roche/samuel-west.jpg"],
  ["Historicial Interests/Brewers-Distillers/Murphy's/Distillery - 1886.jpg", "historical/murphy/distillery-1886.jpg"],
  ["Historicial Interests/Brewers-Distillers/Murphy's/James Murphy Baptism.jpg", "historical/murphy/james-murphy-baptism.jpg"],
  ["Historicial Interests/Brewers-Distillers/Coppinger Midleton Brewery/To Let Brewery - SR 21 August 1852.jpg", "historical/brewery/to-let-1852.jpg"],
  ["Historicial Interests/Brewers-Distillers/Coppinger Midleton Brewery/Guys 1845 Midleton.jpg", "historical/brewery/guys-1845.jpg"],
  ["Historicial Interests/Brewers-Distillers/Coppinger Midleton Brewery/To Let - 4 September 1850.jpg", "historical/brewery/to-let-1850.jpg"],
  ["Historicial Interests/Publications/Hibernian Chronicle/The Exchange.jpg", "historical/hibernian/the-exchange.jpg"],
  ["Historicial Interests/Hospitals-Instutions/Poor Law Unions/Midleton/Poor Law Union - 1852 Map Midleton.bmp", "historical/midleton/poor-law-map-1852.jpg"],
  ["Historicial Interests/Hospitals-Instutions/Poor Law Unions/Midleton/MidletonHospitalToday.jpg", "historical/midleton/hospital-today.jpg"],
  ["Historicial Interests/Irish Diaspora/Cobh Waterfront.jpg", "historical/diaspora/cobh-waterfront.jpg"],
  ["Historicial Interests/Policing/Sir Richard Willcocks.jpg", "historical/policing/sir-richard-willcocks.jpg"],
  ["Historicial Interests/Armed Services/Army/Regiment Listing.bmp", "defence/regiment-listing.jpg"],
  ["Historicial Interests/Armed Services/Royal Navy/Royal Navy Listings.bmp", "defence/royal-navy-listings.jpg"],
  ["Cemeteries/St Joseph's/Barial Act Combined.jpg", "cemeteries/burial-act.jpg"],
  ["Cemeteries/St Joseph's/botanic gardens 1875.jpg", "cemeteries/botanic-gardens-1875.jpg"],
  ["Cemeteries/St Joseph's/Father Mathew Cross.jpg", "cemeteries/father-mathew-cross.jpg"],
  ["Cemeteries/St Joseph's/Free Burial for Inmates - SR 10 Dec 1835.jpg", "cemeteries/free-burial-1835.jpg"],
  ["Cemeteries/St Joseph's/St Joseph's Cemetry Valuation 1847 House Book.jpg", "cemeteries/valuation-1847.jpg"],
];

async function findSource(rel) {
  const exact = path.join(root, rel);
  try {
    await fs.access(exact);
    return exact;
  } catch {
    const dir = path.dirname(exact);
    const base = path.basename(rel);
    try {
      const files = await fs.readdir(dir);
      const match = files.find((f) => f.toLowerCase() === base.toLowerCase());
      if (match) return path.join(dir, match);
    } catch {
      /* continue */
    }
  }
  return null;
}

async function copyOne(fromRel, toRel) {
  const from = await findSource(fromRel);
  if (!from) {
    console.warn("Missing:", fromRel);
    return;
  }
  const to = path.join(destRoot, toRel);
  await fs.mkdir(path.dirname(to), { recursive: true });
  const ext = path.extname(from).toLowerCase();
  try {
    if (ext === ".bmp") {
      await sharp(from).jpeg({ quality: 82 }).toFile(to);
    } else {
      await sharp(from).jpeg({ quality: 86 }).toFile(to);
    }
  } catch {
    await fs.copyFile(from, to.replace(/\.jpg$/i, ext));
    console.warn("Copied raw:", fromRel);
    return;
  }
  console.log(toRel);
}

for (const [from, to] of map) {
  await copyOne(from, to);
}
