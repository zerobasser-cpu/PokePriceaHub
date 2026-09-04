const Database = require("better-sqlite3");

const db = new Database("data/pokemon.db");

const total = db
  .prepare("SELECT COUNT(*) AS n FROM cards")
  .get().n;

const tcgplayer = db
  .prepare("SELECT COUNT(*) AS n FROM cards WHERE tcgplayer IS NOT NULL AND tcgplayer != ''")
  .get().n;

const cardmarket = db
  .prepare("SELECT COUNT(*) AS n FROM cards WHERE cardmarket IS NOT NULL AND cardmarket != ''")
  .get().n;

const neither = db
  .prepare("SELECT COUNT(*) AS n FROM cards WHERE (tcgplayer IS NULL OR tcgplayer = '') AND (cardmarket IS NULL OR cardmarket = '')")
  .get().n;

console.log("");
console.log("=================================");
console.log("        PRICE DATABASE CHECK");
console.log("=================================");
console.log("");
console.log("Total cards:       ", total);
console.log("TCGplayer data:    ", tcgplayer);
console.log("Cardmarket data:   ", cardmarket);
console.log("Neither source:    ", neither);
console.log("");

console.log("Sample cards with pricing:");
console.table(
  db.prepare(`
    SELECT id, name,
           CASE WHEN tcgplayer IS NOT NULL AND tcgplayer != '' THEN 'YES' ELSE 'NO' END AS tcgplayer,
           CASE WHEN cardmarket IS NOT NULL AND cardmarket != '' THEN 'YES' ELSE 'NO' END AS cardmarket
    FROM cards
    WHERE tcgplayer IS NOT NULL
       OR cardmarket IS NOT NULL
    LIMIT 10
  `).all()
);

db.close();