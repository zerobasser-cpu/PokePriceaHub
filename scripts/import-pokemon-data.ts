import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

// ============================================================
// CONFIGURATION
// ============================================================

const SOURCE_ROOT =
  process.env.POKEMON_DATA_ROOT ||
  "C:\\Users\\zero_\\Downloads\\pokemon-tcg-data-master\\pokemon-tcg-data-master";

const CARDS_DIRECTORY = path.join(
  SOURCE_ROOT,
  "cards",
  "en"
);

const SETS_FILE = path.join(
  SOURCE_ROOT,
  "sets",
  "en.json"
);

const PROJECT_ROOT = process.cwd();

const DATA_DIRECTORY = path.join(
  PROJECT_ROOT,
  "data"
);

const DATABASE_FILE = path.join(
  DATA_DIRECTORY,
  "pokemon.db"
);

// ============================================================
// TYPES
// ============================================================

interface PokemonSet {
  id?: string;
  name?: string;
  series?: string;
  printedTotal?: number;
  total?: number;
  legalities?: Record<string, string>;
  ptcgoCode?: string;
  releaseDate?: string;
  updatedAt?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
}

interface PokemonCard {
  id?: string;
  name?: string;
  supertype?: string;
  subtypes?: string[];
  level?: string;
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  attacks?: unknown[];
  weaknesses?: unknown[];
  resistances?: unknown[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  number?: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: Record<string, string>;
  regulationMark?: string;

  images?: {
    small?: string;
    large?: string;
  };

  tcgplayer?: unknown;
  cardmarket?: unknown;

  set?: {
    id?: string;
    name?: string;
    series?: string;
    printedTotal?: number;
    total?: number;
    releaseDate?: string;
    updatedAt?: string;
    images?: {
      symbol?: string;
      logo?: string;
    };
  };

  [key: string]: unknown;
}

// ============================================================
// HELPERS
// ============================================================

function readJson(filePath: string): unknown {
  const contents = fs.readFileSync(
    filePath,
    "utf8"
  );

  return JSON.parse(contents);
}

function normaliseCards(raw: unknown): PokemonCard[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is PokemonCard =>
        typeof item === "object" &&
        item !== null &&
        "id" in item
    );
  }

  if (
    typeof raw === "object" &&
    raw !== null
  ) {
    const object = raw as Record<string, unknown>;

    // { data: [...] }
    if (Array.isArray(object.data)) {
      return object.data.filter(
        (item): item is PokemonCard =>
          typeof item === "object" &&
          item !== null &&
          "id" in item
      );
    }

    // Single card object
    if (
      typeof object.id === "string" &&
      typeof object.name === "string"
    ) {
      return [object as PokemonCard];
    }

    // Object keyed by card ID
    const values = Object.values(object);

    if (values.length > 0) {
      return values.filter(
        (item): item is PokemonCard =>
          typeof item === "object" &&
          item !== null &&
          "id" in item
      );
    }
  }

  return [];
}

function normaliseSets(raw: unknown): PokemonSet[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is PokemonSet =>
        typeof item === "object" &&
        item !== null &&
        "id" in item
    );
  }

  if (
    typeof raw === "object" &&
    raw !== null
  ) {
    const object = raw as Record<string, unknown>;

    if (Array.isArray(object.data)) {
      return object.data.filter(
        (item): item is PokemonSet =>
          typeof item === "object" &&
          item !== null &&
          "id" in item
      );
    }
  }

  return [];
}

function json(value: unknown): string {
  return JSON.stringify(
    value === undefined ? null : value
  );
}

function numberOrNull(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function stringOrNull(
  value: unknown
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return String(value);
}

function getJsonFiles(directory: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(directory)) {
    return results;
  }

  const entries = fs.readdirSync(
    directory,
    { withFileTypes: true }
  );

  for (const entry of entries) {
    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      results.push(
        ...getJsonFiles(fullPath)
      );
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".json")
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

// ============================================================
// VALIDATE SOURCE DATA
// ============================================================

console.log("");
console.log("============================================================");
console.log(" POKE PRICES - POKEMON DATA IMPORTER");
console.log("============================================================");
console.log("");

console.log(
  `Source directory:\n${SOURCE_ROOT}`
);
console.log("");

if (!fs.existsSync(SOURCE_ROOT)) {
  throw new Error(
    `Pokemon data directory does not exist:\n${SOURCE_ROOT}`
  );
}

if (!fs.existsSync(CARDS_DIRECTORY)) {
  throw new Error(
    `Cards directory does not exist:\n${CARDS_DIRECTORY}`
  );
}

if (!fs.existsSync(SETS_FILE)) {
  throw new Error(
    `Sets file does not exist:\n${SETS_FILE}`
  );
}

console.log("Source data found.");
console.log("");

// ============================================================
// LOAD SETS
// ============================================================

console.log("Loading sets...");

const setsRaw = readJson(
  SETS_FILE
);

const sets = normaliseSets(
  setsRaw
);

console.log(
  `Found ${sets.length.toLocaleString()} sets.`
);

console.log("");

// ============================================================
// LOAD CARDS
// ============================================================

console.log("Finding card JSON files...");

const cardFiles = getJsonFiles(
  CARDS_DIRECTORY
);

console.log(
  `Found ${cardFiles.length.toLocaleString()} JSON files.`
);

console.log("");

if (cardFiles.length === 0) {
  throw new Error(
    `No JSON card files were found in:\n${CARDS_DIRECTORY}`
  );
}

// ============================================================
// PREPARE DATABASE DIRECTORY
// ============================================================

fs.mkdirSync(
  DATA_DIRECTORY,
  { recursive: true }
);

// ============================================================
// REMOVE OLD DATABASE
// ============================================================

console.log("Preparing database...");

if (fs.existsSync(DATABASE_FILE)) {
  console.log(
    "Existing pokemon.db found."
  );

  try {
    fs.unlinkSync(DATABASE_FILE);
  } catch (error) {
    throw new Error(
      `Could not remove existing database.\n\n${String(error)}\n\n` +
      `Make sure Next.js is not currently running.`
    );
  }
}

// Remove SQLite sidecar files if present
for (const suffix of [
  "-wal",
  "-shm"
]) {
  const file = `${DATABASE_FILE}${suffix}`;

  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
    } catch {
      // Ignore
    }
  }
}

// ============================================================
// OPEN SQLITE
// ============================================================

const db = new Database(
  DATABASE_FILE
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ============================================================
// CREATE SCHEMA
// ============================================================

console.log("Creating database tables...");

db.exec(`
  CREATE TABLE sets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    series TEXT,
    printed_total INTEGER,
    total INTEGER,
    release_date TEXT,
    updated_at TEXT,
    symbol_image TEXT,
    logo_image TEXT,
    data_json TEXT NOT NULL
  );

  CREATE TABLE cards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    supertype TEXT,
    subtypes TEXT,
    level TEXT,
    hp TEXT,
    types TEXT,
    evolves_from TEXT,
    evolves_to TEXT,
    rules TEXT,
    attacks TEXT,
    weaknesses TEXT,
    resistances TEXT,
    retreat_cost TEXT,
    converted_retreat_cost INTEGER,
    number TEXT,
    artist TEXT,
    rarity TEXT,
    flavor_text TEXT,
    national_pokedex_numbers TEXT,
    legalities TEXT,
    regulation_mark TEXT,
    image_small TEXT,
    image_large TEXT,
    tcgplayer TEXT,
    cardmarket TEXT,

    set_id TEXT,
    set_name TEXT,
    set_series TEXT,
    set_printed_total INTEGER,
    set_total INTEGER,
    set_release_date TEXT,
    set_updated_at TEXT,
    set_symbol_image TEXT,
    set_logo_image TEXT,

    data_json TEXT NOT NULL,

    FOREIGN KEY (set_id)
      REFERENCES sets(id)
      ON DELETE SET NULL
  );

  CREATE TABLE card_types (
    card_id TEXT NOT NULL,
    type TEXT NOT NULL,

    PRIMARY KEY (
      card_id,
      type
    ),

    FOREIGN KEY (card_id)
      REFERENCES cards(id)
      ON DELETE CASCADE
  );

  CREATE INDEX idx_cards_name
    ON cards(name);

  CREATE INDEX idx_cards_number
    ON cards(number);

  CREATE INDEX idx_cards_rarity
    ON cards(rarity);

  CREATE INDEX idx_cards_supertype
    ON cards(supertype);

  CREATE INDEX idx_cards_set_id
    ON cards(set_id);

  CREATE INDEX idx_cards_release_date
    ON cards(set_release_date);

  CREATE INDEX idx_card_types_type
    ON card_types(type);

  CREATE INDEX idx_card_types_card_id
    ON card_types(card_id);

  CREATE INDEX idx_sets_name
    ON sets(name);

  CREATE INDEX idx_sets_series
    ON sets(series);

  CREATE INDEX idx_sets_release_date
    ON sets(release_date);
`);

// ============================================================
// SET INSERT
// ============================================================

const insertSet = db.prepare(`
  INSERT OR REPLACE INTO sets (
    id,
    name,
    series,
    printed_total,
    total,
    release_date,
    updated_at,
    symbol_image,
    logo_image,
    data_json
  )
  VALUES (
    @id,
    @name,
    @series,
    @printed_total,
    @total,
    @release_date,
    @updated_at,
    @symbol_image,
    @logo_image,
    @data_json
  )
`);

// ============================================================
// CARD INSERT
// ============================================================

const insertCard = db.prepare(`
  INSERT OR REPLACE INTO cards (
    id,
    name,
    supertype,
    subtypes,
    level,
    hp,
    types,
    evolves_from,
    evolves_to,
    rules,
    attacks,
    weaknesses,
    resistances,
    retreat_cost,
    converted_retreat_cost,
    number,
    artist,
    rarity,
    flavor_text,
    national_pokedex_numbers,
    legalities,
    regulation_mark,
    image_small,
    image_large,
    tcgplayer,
    cardmarket,

    set_id,
    set_name,
    set_series,
    set_printed_total,
    set_total,
    set_release_date,
    set_updated_at,
    set_symbol_image,
    set_logo_image,

    data_json
  )
  VALUES (
    @id,
    @name,
    @supertype,
    @subtypes,
    @level,
    @hp,
    @types,
    @evolves_from,
    @evolves_to,
    @rules,
    @attacks,
    @weaknesses,
    @resistances,
    @retreat_cost,
    @converted_retreat_cost,
    @number,
    @artist,
    @rarity,
    @flavor_text,
    @national_pokedex_numbers,
    @legalities,
    @regulation_mark,
    @image_small,
    @image_large,
    @tcgplayer,
    @cardmarket,

    @set_id,
    @set_name,
    @set_series,
    @set_printed_total,
    @set_total,
    @set_release_date,
    @set_updated_at,
    @set_symbol_image,
    @set_logo_image,

    @data_json
  )
`);

// ============================================================
// TYPE INSERT
// ============================================================

const insertCardType = db.prepare(`
  INSERT OR IGNORE INTO card_types (
    card_id,
    type
  )
  VALUES (
    @card_id,
    @type
  )
`);

// ============================================================
// IMPORT SETS
// ============================================================

console.log("Importing sets...");

const importSets = db.transaction(
  (setList: PokemonSet[]) => {
    for (const set of setList) {
      if (!set.id || !set.name) {
        continue;
      }

      insertSet.run({
        id: set.id,
        name: set.name,
        series: stringOrNull(
          set.series
        ),
        printed_total: numberOrNull(
          set.printedTotal
        ),
        total: numberOrNull(
          set.total
        ),
        release_date: stringOrNull(
          set.releaseDate
        ),
        updated_at: stringOrNull(
          set.updatedAt
        ),
        symbol_image: stringOrNull(
          set.images?.symbol
        ),
        logo_image: stringOrNull(
          set.images?.logo
        ),
        data_json: json(set),
      });
    }
  }
);

importSets(sets);

console.log(
  `Imported ${sets.length.toLocaleString()} sets.`
);

console.log("");

// ============================================================
// IMPORT CARDS
// ============================================================

console.log("Importing cards...");
console.log("");

let totalCards = 0;
let failedFiles = 0;

const importCards = db.transaction(
  (cards: PokemonCard[]) => {
    for (const card of cards) {
      if (!card.id || !card.name) {
        continue;
      }

      const cardSet = card.set;

      insertCard.run({
        id: card.id,
        name: card.name,

        supertype: stringOrNull(
          card.supertype
        ),

        subtypes: json(
          card.subtypes || []
        ),

        level: stringOrNull(
          card.level
        ),

        hp: stringOrNull(
          card.hp
        ),

        types: json(
          card.types || []
        ),

        evolves_from: stringOrNull(
          card.evolvesFrom
        ),

        evolves_to: json(
          card.evolvesTo || []
        ),

        rules: json(
          card.rules || []
        ),

        attacks: json(
          card.attacks || []
        ),

        weaknesses: json(
          card.weaknesses || []
        ),

        resistances: json(
          card.resistances || []
        ),

        retreat_cost: json(
          card.retreatCost || []
        ),

        converted_retreat_cost:
          numberOrNull(
            card.convertedRetreatCost
          ),

        number: stringOrNull(
          card.number
        ),

        artist: stringOrNull(
          card.artist
        ),

        rarity: stringOrNull(
          card.rarity
        ),

        flavor_text: stringOrNull(
          card.flavorText
        ),

        national_pokedex_numbers: json(
          card.nationalPokedexNumbers || []
        ),

        legalities: json(
          card.legalities || {}
        ),

        regulation_mark: stringOrNull(
          card.regulationMark
        ),

        image_small: stringOrNull(
          card.images?.small
        ),

        image_large: stringOrNull(
          card.images?.large
        ),

        tcgplayer: json(
          card.tcgplayer
        ),

        cardmarket: json(
          card.cardmarket
        ),

        set_id: stringOrNull(
          cardSet?.id
        ),

        set_name: stringOrNull(
          cardSet?.name
        ),

        set_series: stringOrNull(
          cardSet?.series
        ),

        set_printed_total:
          numberOrNull(
            cardSet?.printedTotal
          ),

        set_total:
          numberOrNull(
            cardSet?.total
          ),

        set_release_date:
          stringOrNull(
            cardSet?.releaseDate
          ),

        set_updated_at:
          stringOrNull(
            cardSet?.updatedAt
          ),

        set_symbol_image:
          stringOrNull(
            cardSet?.images?.symbol
          ),

        set_logo_image:
          stringOrNull(
            cardSet?.images?.logo
          ),

        data_json: json(card),
      });

      // Store each type separately for fast filtering
      if (Array.isArray(card.types)) {
        for (const type of card.types) {
          if (
            typeof type === "string" &&
            type.trim()
          ) {
            insertCardType.run({
              card_id: card.id,
              type: type.trim(),
            });
          }
        }
      }

      totalCards++;
    }
  }
);

// ============================================================
// PROCESS CARD FILES
// ============================================================

for (
  let i = 0;
  i < cardFiles.length;
  i++
) {
  const file = cardFiles[i];

  try {
    const raw = readJson(file);

    const cards = normaliseCards(
      raw
    );

    if (cards.length > 0) {
      importCards(cards);
    }

    if (
      (i + 1) % 100 === 0 ||
      i === cardFiles.length - 1
    ) {
      const percent = (
        ((i + 1) / cardFiles.length) *
        100
      ).toFixed(1);

      process.stdout.write(
        `\rProcessing card files: ${i + 1}/${cardFiles.length} (${percent}%) | Cards: ${totalCards.toLocaleString()}`
      );
    }
  } catch (error) {
    failedFiles++;

    console.error("");
    console.error(
      `Failed to import: ${file}`
    );
    console.error(String(error));
  }
}

console.log("");
console.log("");

// ============================================================
// OPTIMISE DATABASE
// ============================================================

console.log("Optimising database...");

db.exec(`
  ANALYZE;
  VACUUM;
`);

console.log("");

// ============================================================
// STATISTICS
// ============================================================

const cardCount = db
  .prepare(
    `SELECT COUNT(*) AS count FROM cards`
  )
  .get() as { count: number };

const setCount = db
  .prepare(
    `SELECT COUNT(*) AS count FROM sets`
  )
  .get() as { count: number };

const rarityCount = db
  .prepare(
    `
    SELECT COUNT(DISTINCT rarity) AS count
    FROM cards
    WHERE rarity IS NOT NULL
      AND rarity != ''
    `
  )
  .get() as { count: number };

const typeCount = db
  .prepare(
    `
    SELECT COUNT(DISTINCT type) AS count
    FROM card_types
    WHERE type IS NOT NULL
      AND type != ''
    `
  )
  .get() as { count: number };

// ============================================================
// CLOSE DATABASE
// ============================================================

db.close();

// ============================================================
// COMPLETE
// ============================================================

console.log("============================================================");
console.log(" IMPORT COMPLETE");
console.log("============================================================");
console.log("");

console.log(
  `Cards:     ${Number(cardCount.count).toLocaleString()}`
);

console.log(
  `Sets:      ${Number(setCount.count).toLocaleString()}`
);

console.log(
  `Rarities:  ${Number(rarityCount.count).toLocaleString()}`
);

console.log(
  `Types:     ${Number(typeCount.count).toLocaleString()}`
);

console.log(
  `Bad files: ${failedFiles.toLocaleString()}`
);

console.log("");

console.log(
  `Database:\n${DATABASE_FILE}`
);

console.log("");
console.log("============================================================");
console.log("");