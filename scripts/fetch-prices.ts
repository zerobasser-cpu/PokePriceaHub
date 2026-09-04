import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

// ============================================================
// fetch-prices.ts
// ============================================================
//
// The local database (data/pokemon.db) was built from the
// offline "pokemon-tcg-data" GitHub snapshot, which contains
// card metadata (name, rarity, images, etc.) but NO pricing
// data — every card's `tcgplayer` / `cardmarket` column is
// null as a result.
//
// This script backfills real pricing by calling the official
// Pokémon TCG API (https://pokemontcg.io), which returns
// tcgplayer + cardmarket price objects per card, and writes
// them into the existing `cards` table.
//
// Usage:
//   npm run fetch-prices
//   npm.cmd run fetch-prices   (Windows)
//
// Re-running this script is safe — it just overwrites the
// price columns with fresh data.
// ============================================================

// ------------------------------------------------------------
// Load POKEMONTCG_API_KEY from .env (no dotenv dependency)
// ------------------------------------------------------------

function loadEnvFile(): void {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();

    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const API_KEY = process.env.POKEMONTCG_API_KEY?.trim();

if (!API_KEY) {
  console.error(
    "Missing POKEMONTCG_API_KEY in .env — add your Pokémon TCG API key first."
  );

  process.exit(1);
}

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const PROJECT_ROOT = process.cwd();

const DATABASE_PATH =
  process.env.POKEPRICES_DATABASE_PATH ||
  path.join(PROJECT_ROOT, "data", "pokemon.db");

const API_BASE = "https://api.pokemontcg.io/v2/cards";

const PAGE_SIZE = 250;

// Delay between requests, to stay well within API rate limits.
const REQUEST_DELAY_MS = 350;

// Retry a failed/rate-limited request this many times.
const MAX_RETRIES = 4;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ApiCard {
  id: string;
  tcgplayer?: unknown;
  cardmarket?: unknown;
}

interface ApiResponse {
  data: ApiCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

async function fetchCardsPage(
  setId: string,
  page: number
): Promise<ApiResponse | null> {
  const url =
    `${API_BASE}?q=${encodeURIComponent(`set.id:${setId}`)}` +
    `&page=${page}&pageSize=${PAGE_SIZE}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "X-Api-Key": API_KEY as string,
        },
      });

      if (response.status === 429) {
        const backoff = 1000 * attempt;

        console.warn(
          `  Rate limited on ${setId} (attempt ${attempt}/${MAX_RETRIES}), waiting ${backoff}ms...`
        );

        await sleep(backoff);
        continue;
      }

      if (!response.ok) {
        console.warn(
          `  Request failed for ${setId} page ${page}: HTTP ${response.status}`
        );

        return null;
      }

      return (await response.json()) as ApiResponse;
    } catch (error) {
      console.warn(
        `  Network error for ${setId} page ${page} (attempt ${attempt}/${MAX_RETRIES}):`,
        error instanceof Error ? error.message : error
      );

      await sleep(500 * attempt);
    }
  }

  return null;
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main(): Promise<void> {
  if (!fs.existsSync(DATABASE_PATH)) {
    console.error(`Database not found at:\n${DATABASE_PATH}`);
    process.exit(1);
  }

  const db = new Database(DATABASE_PATH);

  db.pragma("journal_mode = WAL");

  const sets = db
    .prepare(`SELECT id, name FROM sets ORDER BY release_date ASC`)
    .all() as Array<{ id: string; name: string }>;

  console.log(`Found ${sets.length} sets in the local database.`);
  console.log("Fetching pricing from the Pokémon TCG API...\n");

  const updateStmt = db.prepare(
    `UPDATE cards SET tcgplayer = @tcgplayer, cardmarket = @cardmarket WHERE id = @id`
  );

  const applyUpdates = db.transaction(
    (rows: Array<{ id: string; tcgplayer: string; cardmarket: string }>) => {
      for (const row of rows) {
        updateStmt.run(row);
      }
    }
  );

  let totalCardsUpdated = 0;
  let totalCardsWithPricing = 0;
  let setsFailed: string[] = [];

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];

    process.stdout.write(
      `[${i + 1}/${sets.length}] ${set.name} (${set.id})... `
    );

    let page = 1;
    let setCardCount = 0;
    let setPriceCount = 0;
    let setFailed = false;

    while (true) {
      const result = await fetchCardsPage(set.id, page);

      if (!result) {
        setFailed = true;
        break;
      }

      const rows = result.data.map((card) => {
        const hasPricing = Boolean(card.tcgplayer || card.cardmarket);

        if (hasPricing) {
          setPriceCount++;
        }

        return {
          id: card.id,
          tcgplayer: JSON.stringify(card.tcgplayer ?? null),
          cardmarket: JSON.stringify(card.cardmarket ?? null),
        };
      });

      applyUpdates(rows);

      setCardCount += rows.length;

      const fetchedSoFar = result.page * result.pageSize;

      if (fetchedSoFar >= result.totalCount || result.data.length === 0) {
        break;
      }

      page++;

      await sleep(REQUEST_DELAY_MS);
    }

    if (setFailed) {
      setsFailed.push(set.id);
      console.log("FAILED");
    } else {
      totalCardsUpdated += setCardCount;
      totalCardsWithPricing += setPriceCount;

      console.log(
        `${setCardCount} cards, ${setPriceCount} with pricing`
      );
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log("\n============================================================");
  console.log(`Done. Updated ${totalCardsUpdated} cards.`);
  console.log(`${totalCardsWithPricing} cards had pricing data available.`);

  if (setsFailed.length > 0) {
    console.log(
      `\n${setsFailed.length} set(s) failed and were skipped — re-run this script to retry them:`
    );
    console.log(setsFailed.join(", "));
  }

  console.log("============================================================");

  db.close();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
