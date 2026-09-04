import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface DatabaseSet {
  id: string;
  name: string;
  series?: string;
  printedTotal?: number;
  total?: number;
  releaseDate?: string;
  updatedAt?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
}

export interface DatabaseCard {
  id: string;
  name: string;
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

  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<string, unknown>;
  };

  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<string, unknown>;
  };

  set?: DatabaseSet;

  image_small?: string;
  image_large?: string;
  imageSmall?: string;
  imageLarge?: string;

  [key: string]: unknown;
}


/*
============================================================
DATABASE CONFIGURATION
============================================================
*/

const PROJECT_ROOT = process.cwd();

const DATABASE_PATH =
  process.env.POKEPRICES_DATABASE_PATH ||
  path.join(
    PROJECT_ROOT,
    "data",
    "pokemon.db"
  );

let database: Database.Database | null = null;


/*
============================================================
DATABASE CONNECTION
============================================================
*/

function getDatabase(): Database.Database {
  if (database) {
    return database;
  }

  if (!fs.existsSync(DATABASE_PATH)) {
    throw new Error(
      `Pokémon database not found at:\n${DATABASE_PATH}\n\n` +
      `Run "npm.cmd run import-data" first.`
    );
  }

  database = new Database(
    DATABASE_PATH
  );

  database.pragma(
    "journal_mode = WAL"
  );

  database.pragma(
    "foreign_keys = ON"
  );

  /*
  ----------------------------------------------------------
  PRICE HISTORY
  ----------------------------------------------------------
  */

  database.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      card_id TEXT NOT NULL,

      snapshot_date TEXT NOT NULL,

      tcgplayer REAL,
      cardmarket REAL,
      ebay REAL,
      average REAL,

      created_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      UNIQUE (
        card_id,
        snapshot_date
      ),

      FOREIGN KEY(card_id)
        REFERENCES cards(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS
      idx_price_history_card_date
    ON price_history (
      card_id,
      snapshot_date DESC
    );

    CREATE INDEX IF NOT EXISTS
      idx_price_history_date
    ON price_history (
      snapshot_date DESC
    );

    CREATE INDEX IF NOT EXISTS
      idx_price_history_average
    ON price_history (
      card_id,
      average,
      snapshot_date DESC
    );
  `);

  return database;
}


/*
============================================================
JSON HELPERS
============================================================
*/

function parseJson<T>(
  value: unknown,
  fallback: T
): T {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value !== "string"
  ) {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}


/*
============================================================
SET CONVERSION
============================================================
*/

function rowToSet(
  row: any
): DatabaseSet {
  return {
    id: row.id,

    name: row.name,

    series:
      row.series ||
      undefined,

    printedTotal:
      row.printed_total !== null &&
      row.printed_total !== undefined
        ? Number(
            row.printed_total
          )
        : undefined,

    total:
      row.total !== null &&
      row.total !== undefined
        ? Number(
            row.total
          )
        : undefined,

    releaseDate:
      row.release_date ||
      undefined,

    updatedAt:
      row.updated_at ||
      undefined,

    images: {
      symbol:
        row.symbol_image ||
        undefined,

      logo:
        row.logo_image ||
        undefined,
    },
  };
}


/*
============================================================
CARD CONVERSION
============================================================
*/

function rowToCard(
  row: any
): DatabaseCard {
  const types =
    parseJson<string[]>(
      row.types,
      []
    );

  return {
    id: row.id,

    name: row.name,

    supertype:
      row.supertype ||
      undefined,

    subtypes:
      parseJson<string[]>(
        row.subtypes,
        []
      ),

    level:
      row.level ||
      undefined,

    hp:
      row.hp ||
      undefined,

    types,

    evolvesFrom:
      row.evolves_from ||
      undefined,

    evolvesTo:
      parseJson<string[]>(
        row.evolves_to,
        []
      ),

    rules:
      parseJson<string[]>(
        row.rules,
        []
      ),

    attacks:
      parseJson<unknown[]>(
        row.attacks,
        []
      ),

    weaknesses:
      parseJson<unknown[]>(
        row.weaknesses,
        []
      ),

    resistances:
      parseJson<unknown[]>(
        row.resistances,
        []
      ),

    retreatCost:
      parseJson<string[]>(
        row.retreat_cost,
        []
      ),

    convertedRetreatCost:
      row.converted_retreat_cost !== null &&
      row.converted_retreat_cost !== undefined
        ? Number(
            row.converted_retreat_cost
          )
        : undefined,

    number:
      row.number ||
      undefined,

    artist:
      row.artist ||
      undefined,

    rarity:
      row.rarity ||
      undefined,

    flavorText:
      row.flavor_text ||
      undefined,

    nationalPokedexNumbers:
      parseJson<number[]>(
        row.national_pokedex_numbers,
        []
      ),

    legalities:
      parseJson<
        Record<string, string>
      >(
        row.legalities,
        {}
      ),

    regulationMark:
      row.regulation_mark ||
      undefined,

    images: {
      small:
        row.image_small ||
        undefined,

      large:
        row.image_large ||
        undefined,
    },

    image_small:
      row.image_small ||
      undefined,

    image_large:
      row.image_large ||
      undefined,

    imageSmall:
      row.image_small ||
      undefined,

    imageLarge:
      row.image_large ||
      undefined,

    tcgplayer:
      parseJson(
        row.tcgplayer,
        undefined
      ),

    cardmarket:
      parseJson(
        row.cardmarket,
        undefined
      ),

    set: {
      id:
        row.set_id ||
        undefined,

      name:
        row.set_name ||
        undefined,

      series:
        row.set_series ||
        undefined,

      printedTotal:
        row.set_printed_total !== null &&
        row.set_printed_total !== undefined
          ? Number(
              row.set_printed_total
            )
          : undefined,

      total:
        row.set_total !== null &&
        row.set_total !== undefined
          ? Number(
              row.set_total
            )
          : undefined,

      releaseDate:
        row.set_release_date ||
        undefined,

      updatedAt:
        row.set_updated_at ||
        undefined,

      images: {
        symbol:
          row.set_symbol_image ||
          undefined,

        logo:
          row.set_logo_image ||
          undefined,
      },
    },
  };
}


/*
============================================================
CARD LOOKUP
============================================================
*/

export function getCardById(
  id: string
): DatabaseCard | null {
  const db = getDatabase();

  const row =
    db
      .prepare(
        `
        SELECT
          c.*,

          s.name AS set_name,
          s.series AS set_series,
          s.printed_total AS set_printed_total,
          s.total AS set_total,
          s.release_date AS set_release_date,
          s.updated_at AS set_updated_at,
          s.symbol_image AS set_symbol_image,
          s.logo_image AS set_logo_image

        FROM cards c

        LEFT JOIN sets s
          ON
            LOWER(TRIM(s.id)) =
            LOWER(TRIM(c.set_id))
            OR
            LOWER(TRIM(s.name)) =
            LOWER(TRIM(c.set_id))

        WHERE c.id = ?

        LIMIT 1
        `
      )
      .get(id);

  if (!row) {
    return null;
  }

  return rowToCard(row);
}


/*
============================================================
CARD SEARCH
============================================================

IMPORTANT SET FIX

The database can contain:

cards.set_id = set ID

or, depending on how the data was imported:

cards.set_id = set name

The set page normally passes the set ID.

This search therefore resolves the selected value
against BOTH sets.id and sets.name.

It also normalises spaces and capitalisation so that:

  sv1
  SV1
  " sv1 "

are treated as the same value.
============================================================
*/

export interface SearchDatabaseCardsOptions {
  search?: string;
  setId?: string;
  rarity?: string;
  type?: string;
  supertype?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchDatabaseCardsResult {
  cards: DatabaseCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function searchDatabaseCards(
  options: SearchDatabaseCardsOptions = {}
): SearchDatabaseCardsResult {
  const db = getDatabase();

  const search =
    options.search?.trim() ||
    "";

  const setId =
    options.setId?.trim() ||
    "";

  const rarity =
    options.rarity?.trim() ||
    "";

  const type =
    options.type?.trim() ||
    "";

  const supertype =
    options.supertype?.trim() ||
    "";

  const page =
    Math.max(
      1,
      Number(options.page) || 1
    );

  const pageSize =
    Math.min(
      100,
      Math.max(
        1,
        Number(options.pageSize) || 24
      )
    );

  const conditions: string[] = [];

  const params: Record<
    string,
    unknown
  > = {};

  /*
  ----------------------------------------------------------
  CARD SEARCH
  ----------------------------------------------------------
  */

  if (search) {
    conditions.push(
      `(
        LOWER(c.name) LIKE LOWER(@search)
        OR LOWER(c.id) LIKE LOWER(@search)
        OR LOWER(c.number) LIKE LOWER(@search)
      )`
    );

    params.search =
      `%${search}%`;
  }


  /*
  ----------------------------------------------------------
  SET FILTER
  ----------------------------------------------------------

  Match the selected value against:

  1. cards.set_id directly

  2. sets.id

  3. sets.name

  Then compare the card's set_id against
  the resolved set ID/name.

  This handles both normal imports and
  older/imported databases where cards may
  contain the set name instead of the ID.
  ----------------------------------------------------------
  */

  if (setId) {
    conditions.push(
      `(
        LOWER(TRIM(c.set_id)) =
          LOWER(TRIM(@setId))

        OR

        EXISTS (
          SELECT 1

          FROM sets filter_set

          WHERE
            (
              LOWER(TRIM(filter_set.id)) =
                LOWER(TRIM(@setId))

              OR

              LOWER(TRIM(filter_set.name)) =
                LOWER(TRIM(@setId))
            )

            AND

            (
              LOWER(TRIM(c.set_id)) =
                LOWER(TRIM(filter_set.id))

              OR

              LOWER(TRIM(c.set_id)) =
                LOWER(TRIM(filter_set.name))
            )
        )
      )`
    );

    params.setId =
      setId;
  }


  /*
  ----------------------------------------------------------
  RARITY FILTER
  ----------------------------------------------------------
  */

  if (rarity) {
    conditions.push(
      `LOWER(TRIM(c.rarity)) =
       LOWER(TRIM(@rarity))`
    );

    params.rarity =
      rarity;
  }


  /*
  ----------------------------------------------------------
  SUPERTYPE FILTER
  ----------------------------------------------------------
  */

  if (supertype) {
    conditions.push(
      `LOWER(TRIM(c.supertype)) =
       LOWER(TRIM(@supertype))`
    );

    params.supertype =
      supertype;
  }


  /*
  ----------------------------------------------------------
  TYPE FILTER
  ----------------------------------------------------------
  */

  if (type) {
    conditions.push(`
      EXISTS (
        SELECT 1

        FROM card_types ct

        WHERE ct.card_id = c.id

          AND LOWER(TRIM(ct.type)) =
              LOWER(TRIM(@type))
      )
    `);

    params.type =
      type;
  }


  /*
  ----------------------------------------------------------
  WHERE CLAUSE
  ----------------------------------------------------------
  */

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(
          " AND "
        )}`
      : "";


  /*
  ----------------------------------------------------------
  COUNT RESULTS
  ----------------------------------------------------------
  */

  const countRow =
    db
      .prepare(
        `
        SELECT
          COUNT(*) AS count

        FROM cards c

        ${whereClause}
        `
      )
      .get(
        params
      ) as {
        count: number;
      };

  const total =
    Number(
      countRow?.count || 0
    );

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(
          total / pageSize
        );

  const safePage =
    totalPages > 0
      ? Math.min(
          page,
          totalPages
        )
      : 1;

  const offset =
    (safePage - 1) *
    pageSize;


  /*
  ----------------------------------------------------------
  GET CARDS
  ----------------------------------------------------------
  */

  const rows =
    db
      .prepare(
        `
        SELECT
          c.*,

          s.name AS set_name,
          s.series AS set_series,
          s.printed_total AS set_printed_total,
          s.total AS set_total,
          s.release_date AS set_release_date,
          s.updated_at AS set_updated_at,
          s.symbol_image AS set_symbol_image,
          s.logo_image AS set_logo_image

        FROM cards c

        LEFT JOIN sets s
          ON
            LOWER(TRIM(s.id)) =
            LOWER(TRIM(c.set_id))

            OR

            LOWER(TRIM(s.name)) =
            LOWER(TRIM(c.set_id))

        ${whereClause}

        ORDER BY
          s.release_date DESC,
          c.set_id ASC,
          c.number ASC,
          c.name ASC

        LIMIT @limit

        OFFSET @offset
        `
      )
      .all({
        ...params,

        limit:
          pageSize,

        offset,
      });


  /*
  ----------------------------------------------------------
  RETURN RESULT
  ----------------------------------------------------------
  */

  return {
    cards:
      rows.map(
        rowToCard
      ),

    total,

    page:
      safePage,

    pageSize,

    totalPages,
  };
}


/*
============================================================
SETS
============================================================
*/

export function getDatabaseSets(): DatabaseSet[] {
  const db = getDatabase();

  const rows =
    db
      .prepare(
        `
        SELECT
          id,
          name,
          series,
          printed_total,
          total,
          release_date,
          updated_at,
          symbol_image,
          logo_image

        FROM sets

        ORDER BY
          release_date DESC,
          name ASC
        `
      )
      .all();

  return rows.map(
    rowToSet
  );
}


export function getDatabaseSetById(
  id: string
): DatabaseSet | null {
  const db = getDatabase();

  const cleanId =
    id?.trim() || "";

  if (!cleanId) {
    return null;
  }

  /*
  ----------------------------------------------------------
  TRY SET ID FIRST
  ----------------------------------------------------------
  */

  let row =
    db
      .prepare(
        `
        SELECT
          id,
          name,
          series,
          printed_total,
          total,
          release_date,
          updated_at,
          symbol_image,
          logo_image

        FROM sets

        WHERE
          LOWER(TRIM(id)) =
          LOWER(TRIM(?))

        LIMIT 1
        `
      )
      .get(
        cleanId
      );


  /*
  ----------------------------------------------------------
  FALL BACK TO SET NAME
  ----------------------------------------------------------
  */

  if (!row) {
    row =
      db
        .prepare(
          `
          SELECT
            id,
            name,
            series,
            printed_total,
            total,
            release_date,
            updated_at,
            symbol_image,
            logo_image

          FROM sets

          WHERE
            LOWER(TRIM(name)) =
            LOWER(TRIM(?))

          LIMIT 1
          `
        )
        .get(
          cleanId
        );
  }

  if (!row) {
    return null;
  }

  return rowToSet(row);
}


/*
============================================================
RARITIES
============================================================
*/

export function getDatabaseRarities(): string[] {
  const db = getDatabase();

  const rows =
    db
      .prepare(
        `
        SELECT DISTINCT
          rarity

        FROM cards

        WHERE rarity IS NOT NULL
          AND rarity != ''

        ORDER BY
          rarity ASC
        `
      )
      .all() as Array<{
        rarity: string;
      }>;

  return rows.map(
    (row) =>
      row.rarity
  );
}


/*
============================================================
TYPES
============================================================
*/

export function getDatabaseTypes(): string[] {
  const db = getDatabase();

  const rows =
    db
      .prepare(
        `
        SELECT DISTINCT
          type

        FROM card_types

        WHERE type IS NOT NULL
          AND type != ''

        ORDER BY
          type ASC
        `
      )
      .all() as Array<{
        type: string;
      }>;

  return rows.map(
    (row) =>
      row.type
  );
}


/*
============================================================
SUPERTYPES
============================================================
*/

export function getDatabaseSupertypes(): string[] {
  const db = getDatabase();

  const rows =
    db
      .prepare(
        `
        SELECT DISTINCT
          supertype

        FROM cards

        WHERE supertype IS NOT NULL
          AND supertype != ''

        ORDER BY
          supertype ASC
        `
      )
      .all() as Array<{
        supertype: string;
      }>;

  return rows.map(
    (row) =>
      row.supertype
  );
}


/*
============================================================
RAREST CARDS
============================================================
*/

export function getRarestDatabaseCards(
  limit = 10
): DatabaseCard[] {
  const db = getDatabase();

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Math.floor(limit) || 10,
        50
      )
    );

  const rarityRows =
    db
      .prepare(
        `
        SELECT
          rarity,
          COUNT(*) AS cnt

        FROM cards

        WHERE rarity IS NOT NULL
          AND rarity != ''

        GROUP BY
          rarity

        ORDER BY
          cnt ASC,
          rarity ASC

        LIMIT @limit
        `
      )
      .all({
        limit:
          safeLimit,
      }) as Array<{
        rarity: string;
        cnt: number;
      }>;

  const cards:
    DatabaseCard[] = [];

  for (
    const {
      rarity,
    } of rarityRows
  ) {
    const row =
      db
        .prepare(
          `
          SELECT
            c.*,

            s.name AS set_name,
            s.series AS set_series,
            s.printed_total AS set_printed_total,
            s.total AS set_total,
            s.release_date AS set_release_date,
            s.updated_at AS set_updated_at,
            s.symbol_image AS set_symbol_image,
            s.logo_image AS set_logo_image

          FROM cards c

          LEFT JOIN sets s
            ON
              LOWER(TRIM(s.id)) =
              LOWER(TRIM(c.set_id))

              OR

              LOWER(TRIM(s.name)) =
              LOWER(TRIM(c.set_id))

          WHERE
            LOWER(TRIM(c.rarity)) =
            LOWER(TRIM(@rarity))

            AND c.image_large IS NOT NULL

            AND c.image_large != ''

          ORDER BY
            s.release_date DESC,
            c.name ASC

          LIMIT 1
          `
        )
        .get({
          rarity,
        });

    if (row) {
      cards.push(
        rowToCard(row)
      );
    }
  }

  return cards.slice(
    0,
    safeLimit
  );
}


/*
============================================================
PRICE HISTORY TYPES
============================================================
*/

export type PriceHistoryRecord = {
  cardId: string;

  snapshotDate: string;

  tcgplayer: number | null;

  cardmarket: number | null;

  ebay: number | null;

  average: number | null;
};


/*
============================================================
PRICE HISTORY RANGE
============================================================
*/

export type PriceHistoryRange =
  | "7d"
  | "30d"
  | "90d"
  | "1y"
  | "all";


/*
============================================================
DATE HELPERS
============================================================
*/

function getDateDaysAgo(
  days: number
): string {
  const date =
    new Date();

  date.setUTCDate(
    date.getUTCDate() -
      days
  );

  return date
    .toISOString()
    .slice(0, 10);
}


function getRangeDays(
  range: PriceHistoryRange
): number | null {
  switch (range) {
    case "7d":
      return 7;

    case "30d":
      return 30;

    case "90d":
      return 90;

    case "1y":
      return 365;

    case "all":
    default:
      return null;
  }
}


/*
============================================================
SAVE PRICE SNAPSHOT
============================================================
*/

export function recordPriceSnapshot(
  cardId: string,
  prices: {
    tcgplayer?: number | null;
    cardmarket?: number | null;
    ebay?: number | null;
    average?: number | null;
  }
): void {
  const db = getDatabase();

  const snapshotDate =
    new Date()
      .toISOString()
      .slice(0, 10);

  const tcgplayer =
    typeof prices.tcgplayer ===
      "number" &&
    Number.isFinite(
      prices.tcgplayer
    )
      ? prices.tcgplayer
      : null;

  const cardmarket =
    typeof prices.cardmarket ===
      "number" &&
    Number.isFinite(
      prices.cardmarket
    )
      ? prices.cardmarket
      : null;

  const ebay =
    typeof prices.ebay ===
      "number" &&
    Number.isFinite(
      prices.ebay
    )
      ? prices.ebay
      : null;

  const average =
    typeof prices.average ===
      "number" &&
    Number.isFinite(
      prices.average
    )
      ? prices.average
      : null;

  if (
    tcgplayer === null &&
    cardmarket === null &&
    ebay === null &&
    average === null
  ) {
    return;
  }

  db.prepare(
    `
    INSERT INTO price_history (
      card_id,
      snapshot_date,
      tcgplayer,
      cardmarket,
      ebay,
      average,
      updated_at
    )

    VALUES (
      @cardId,
      @snapshotDate,
      @tcgplayer,
      @cardmarket,
      @ebay,
      @average,
      CURRENT_TIMESTAMP
    )

    ON CONFLICT (
      card_id,
      snapshot_date
    )

    DO UPDATE SET

      tcgplayer =
        excluded.tcgplayer,

      cardmarket =
        excluded.cardmarket,

      ebay =
        excluded.ebay,

      average =
        excluded.average,

      updated_at =
        CURRENT_TIMESTAMP
    `
  ).run({
    cardId,

    snapshotDate,

    tcgplayer,

    cardmarket,

    ebay,

    average,
  });
}


/*
============================================================
GET PRICE HISTORY
============================================================
*/

export function getPriceHistory(
  cardId: string,
  limit = 3650
): PriceHistoryRecord[] {
  const db = getDatabase();

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Math.floor(limit) || 3650,
        10000
      )
    );

  const rows =
    db
      .prepare(
        `
        SELECT
          card_id,
          snapshot_date,
          tcgplayer,
          cardmarket,
          ebay,
          average

        FROM price_history

        WHERE card_id = ?

        ORDER BY
          snapshot_date DESC

        LIMIT ?
        `
      )
      .all(
        cardId,
        safeLimit
      ) as Array<{
        card_id: string;
        snapshot_date: string;
        tcgplayer: number | null;
        cardmarket: number | null;
        ebay: number | null;
        average: number | null;
      }>;

  return rows
    .reverse()
    .map(
      (row) => ({
        cardId:
          row.card_id,

        snapshotDate:
          row.snapshot_date,

        tcgplayer:
          row.tcgplayer !== null
            ? Number(
                row.tcgplayer
              )
            : null,

        cardmarket:
          row.cardmarket !== null
            ? Number(
                row.cardmarket
              )
            : null,

        ebay:
          row.ebay !== null
            ? Number(
                row.ebay
              )
            : null,

        average:
          row.average !== null
            ? Number(
                row.average
              )
            : null,
      })
    );
}


/*
============================================================
GET PRICE HISTORY BY RANGE
============================================================
*/

export function getPriceHistoryByRange(
  cardId: string,
  range: PriceHistoryRange = "all"
): PriceHistoryRecord[] {
  const db = getDatabase();

  const days =
    getRangeDays(range);

  let rows;

  if (days === null) {
    rows =
      db
        .prepare(
          `
          SELECT
            card_id,
            snapshot_date,
            tcgplayer,
            cardmarket,
            ebay,
            average

          FROM price_history

          WHERE card_id = ?

          ORDER BY
            snapshot_date ASC
          `
        )
        .all(
          cardId
        );
  } else {
    const startDate =
      getDateDaysAgo(
        days
      );

    rows =
      db
        .prepare(
          `
          SELECT
            card_id,
            snapshot_date,
            tcgplayer,
            cardmarket,
            ebay,
            average

          FROM price_history

          WHERE card_id = ?

            AND snapshot_date >= ?

          ORDER BY
            snapshot_date ASC
          `
        )
        .all(
          cardId,
          startDate
        );
  }

  return (
    rows as Array<{
      card_id: string;
      snapshot_date: string;
      tcgplayer: number | null;
      cardmarket: number | null;
      ebay: number | null;
      average: number | null;
    }>
  ).map(
    (row) => ({
      cardId:
        row.card_id,

      snapshotDate:
        row.snapshot_date,

      tcgplayer:
        row.tcgplayer !== null
          ? Number(
              row.tcgplayer
            )
          : null,

      cardmarket:
        row.cardmarket !== null
          ? Number(
              row.cardmarket
            )
          : null,

      ebay:
        row.ebay !== null
          ? Number(
              row.ebay
            )
          : null,

      average:
        row.average !== null
          ? Number(
              row.average
            )
          : null,
    })
  );
}


/*
============================================================
LATEST SNAPSHOT
============================================================
*/

export function getLatestPriceSnapshot(
  cardId: string
): PriceHistoryRecord | null {
  const db = getDatabase();

  const row =
    db
      .prepare(
        `
        SELECT
          card_id,
          snapshot_date,
          tcgplayer,
          cardmarket,
          ebay,
          average

        FROM price_history

        WHERE card_id = ?

        ORDER BY
          snapshot_date DESC

        LIMIT 1
        `
      )
      .get(
        cardId
      ) as
      | {
          card_id: string;
          snapshot_date: string;
          tcgplayer: number | null;
          cardmarket: number | null;
          ebay: number | null;
          average: number | null;
        }
      | undefined;

  if (!row) {
    return null;
  }

  return {
    cardId:
      row.card_id,

    snapshotDate:
      row.snapshot_date,

    tcgplayer:
      row.tcgplayer !== null
        ? Number(
            row.tcgplayer
          )
        : null,

    cardmarket:
      row.cardmarket !== null
        ? Number(
            row.cardmarket
          )
        : null,

    ebay:
      row.ebay !== null
        ? Number(
            row.ebay
          )
        : null,

    average:
      row.average !== null
        ? Number(
            row.average
          )
        : null,
  };
}


/*
============================================================
HISTORICAL PRICE
============================================================
*/

export function getPriceAtOrBefore(
  cardId: string,
  date: string
): PriceHistoryRecord | null {
  const db = getDatabase();

  const row =
    db
      .prepare(
        `
        SELECT
          card_id,
          snapshot_date,
          tcgplayer,
          cardmarket,
          ebay,
          average

        FROM price_history

        WHERE card_id = ?

          AND snapshot_date <= ?

        ORDER BY
          snapshot_date DESC

        LIMIT 1
        `
      )
      .get(
        cardId,
        date
      ) as
      | {
          card_id: string;
          snapshot_date: string;
          tcgplayer: number | null;
          cardmarket: number | null;
          ebay: number | null;
          average: number | null;
        }
      | undefined;

  if (!row) {
    return null;
  }

  return {
    cardId:
      row.card_id,

    snapshotDate:
      row.snapshot_date,

    tcgplayer:
      row.tcgplayer !== null
        ? Number(
            row.tcgplayer
          )
        : null,

    cardmarket:
      row.cardmarket !== null
        ? Number(
            row.cardmarket
          )
        : null,

    ebay:
      row.ebay !== null
        ? Number(
            row.ebay
          )
        : null,

    average:
      row.average !== null
        ? Number(
            row.average
          )
        : null,
  };
}


/*
============================================================
PRICE MOVEMENT
============================================================
*/

export type PriceMovement = {
  current: number | null;

  previous: number | null;

  change: number | null;

  percentage: number | null;

  currentDate: string | null;

  previousDate: string | null;

  hasHistory: boolean;
};


export function getPriceMovement(
  cardId: string,
  days: number
): PriceMovement {
  const latest =
    getLatestPriceSnapshot(
      cardId
    );

  if (
    !latest ||
    latest.average === null
  ) {
    return {
      current: null,
      previous: null,
      change: null,
      percentage: null,
      currentDate: null,
      previousDate: null,
      hasHistory: false,
    };
  }

  const safeDays =
    Math.max(
      1,
      Math.floor(
        Number(days) || 1
      )
    );

  const previousDate =
    (() => {
      const date =
        new Date(
          `${latest.snapshotDate}T00:00:00Z`
        );

      date.setUTCDate(
        date.getUTCDate() -
          safeDays
      );

      return date
        .toISOString()
        .slice(0, 10);
    })();

  const previous =
    getPriceAtOrBefore(
      cardId,
      previousDate
    );

  if (
    !previous ||
    previous.average === null
  ) {
    return {
      current:
        latest.average,

      previous: null,

      change: null,

      percentage: null,

      currentDate:
        latest.snapshotDate,

      previousDate: null,

      hasHistory: false,
    };
  }

  const change =
    latest.average -
    previous.average;

  const percentage =
    previous.average !== 0
      ? (
          change /
          previous.average
        ) * 100
      : null;

  return {
    current:
      latest.average,

    previous:
      previous.average,

    change:
      Math.round(
        change * 100
      ) / 100,

    percentage:
      percentage !== null
        ? Math.round(
            percentage * 100
          ) / 100
        : null,

    currentDate:
      latest.snapshotDate,

    previousDate:
      previous.snapshotDate,

    hasHistory: true,
  };
}


/*
============================================================
PRICE HISTORY SUMMARY
============================================================
*/

export type PriceHistorySummary = {
  count: number;

  current: number | null;

  lowest: number | null;

  highest: number | null;

  first: number | null;

  firstDate: string | null;

  latestDate: string | null;

  change: number | null;

  percentage: number | null;
};


export function getPriceHistorySummary(
  cardId: string
): PriceHistorySummary {
  const db = getDatabase();

  const row =
    db
      .prepare(
        `
        SELECT

          COUNT(*) AS count,

          MIN(
            CASE
              WHEN average > 0
              THEN average
            END
          ) AS lowest,

          MAX(
            CASE
              WHEN average > 0
              THEN average
            END
          ) AS highest,

          MIN(snapshot_date)
            AS first_date,

          MAX(snapshot_date)
            AS latest_date

        FROM price_history

        WHERE card_id = ?

          AND average IS NOT NULL

          AND average > 0
        `
      )
      .get(
        cardId
      ) as {
        count: number;
        lowest: number | null;
        highest: number | null;
        first_date: string | null;
        latest_date: string | null;
      };

  const first =
    row.first_date
      ? getPriceAtOrBefore(
          cardId,
          row.first_date
        )
      : null;

  const latest =
    row.latest_date
      ? getPriceAtOrBefore(
          cardId,
          row.latest_date
        )
      : null;

  const firstPrice =
    first?.average ??
    null;

  const latestPrice =
    latest?.average ??
    null;

  let change:
    | number
    | null = null;

  let percentage:
    | number
    | null = null;

  if (
    firstPrice !== null &&
    latestPrice !== null
  ) {
    change =
      Math.round(
        (
          latestPrice -
          firstPrice
        ) * 100
      ) / 100;

    if (
      firstPrice !== 0
    ) {
      percentage =
        Math.round(
          (
            (
              latestPrice -
              firstPrice
            ) /
            firstPrice
          ) *
            10000
        ) / 100;
    }
  }

  return {
    count:
      Number(
        row.count || 0
      ),

    current:
      latestPrice,

    lowest:
      row.lowest !== null
        ? Number(
            row.lowest
          )
        : null,

    highest:
      row.highest !== null
        ? Number(
            row.highest
          )
        : null,

    first:
      firstPrice,

    firstDate:
      row.first_date,

    latestDate:
      row.latest_date,

    change,

    percentage,
  };
}


/*
============================================================
PRICE HISTORY COUNT
============================================================
*/

export function getPriceHistoryCount(
  cardId: string
): number {
  const db = getDatabase();

  const row =
    db
      .prepare(
        `
        SELECT
          COUNT(*) AS count

        FROM price_history

        WHERE card_id = ?
        `
      )
      .get(
        cardId
      ) as {
        count: number;
      };

  return Number(
    row?.count || 0
  );
}


/*
============================================================
BIGGEST PRICE MOVERS
============================================================
*/

export type PriceMover = {
  card: DatabaseCard;

  current: number;

  previous: number;

  change: number;

  percentage: number;

  currentDate: string;

  previousDate: string;
};


export function getBiggestPriceMovers(
  days: number,
  limit = 5
): {
  gainers: PriceMover[];
  losers: PriceMover[];
} {
  const db = getDatabase();

  const safeDays =
    Math.max(
      1,
      Math.min(
        Math.floor(
          Number(days) || 1
        ),
        3650
      )
    );

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Math.floor(
          Number(limit) || 5
        ),
        25
      )
    );

  const dateOffset =
    `-${safeDays} days`;

  const rows =
    db
      .prepare(
        `
        SELECT

          current_prices.card_id,

          current_prices.current_date,

          current_prices.current_average,

          previous_prices.previous_date,

          previous_prices.previous_average,

          c.*,

          s.name AS set_name,

          s.series AS set_series,

          s.printed_total AS set_printed_total,

          s.total AS set_total,

          s.release_date AS set_release_date,

          s.updated_at AS set_updated_at,

          s.symbol_image AS set_symbol_image,

          s.logo_image AS set_logo_image

        FROM (

          SELECT
            ph.card_id,

            ph.snapshot_date
              AS current_date,

            ph.average
              AS current_average

          FROM price_history ph

          INNER JOIN (

            SELECT
              card_id,

              MAX(snapshot_date)
                AS latest_date

            FROM price_history

            WHERE average IS NOT NULL

              AND average > 0

            GROUP BY
              card_id

          ) latest

            ON latest.card_id =
               ph.card_id

           AND latest.latest_date =
               ph.snapshot_date

          WHERE ph.average IS NOT NULL

            AND ph.average > 0

        ) current_prices

        INNER JOIN (

          SELECT

            current_ref.card_id,

            current_ref.snapshot_date
              AS current_date,

            previous.snapshot_date
              AS previous_date,

            previous.average
              AS previous_average

          FROM price_history previous

          INNER JOIN (

            SELECT
              ph.card_id,

              ph.snapshot_date,

              ph.average

            FROM price_history ph

            INNER JOIN (

              SELECT
                card_id,

                MAX(snapshot_date)
                  AS latest_date

              FROM price_history

              WHERE average IS NOT NULL

                AND average > 0

              GROUP BY
                card_id

            ) latest

              ON latest.card_id =
                 ph.card_id

             AND latest.latest_date =
                 ph.snapshot_date

            WHERE ph.average IS NOT NULL

              AND ph.average > 0

          ) current_ref

            ON current_ref.card_id =
               previous.card_id

          WHERE previous.average IS NOT NULL

            AND previous.average > 0

            AND previous.snapshot_date = (

              SELECT
                MAX(history.snapshot_date)

              FROM price_history history

              WHERE history.card_id =
                    previous.card_id

                AND history.average IS NOT NULL

                AND history.average > 0

                AND history.snapshot_date <=
                    date(
                      current_ref.snapshot_date,
                      @dateOffset
                    )

            )

        ) previous_prices

          ON previous_prices.card_id =
             current_prices.card_id

         AND previous_prices.current_date =
             current_prices.current_date

        INNER JOIN cards c

          ON c.id =
             current_prices.card_id

        LEFT JOIN sets s

          ON
            LOWER(TRIM(s.id)) =
            LOWER(TRIM(c.set_id))

            OR

            LOWER(TRIM(s.name)) =
            LOWER(TRIM(c.set_id))
        `
      )
      .all({
        dateOffset,
      }) as Array<{
        card_id: string;
        current_date: string;
        current_average: number;
        previous_date: string;
        previous_average: number;

        [key: string]: unknown;
      }>;

  const movers:
    PriceMover[] = [];

  for (
    const row of rows
  ) {
    const current =
      Number(
        row.current_average
      );

    const previous =
      Number(
        row.previous_average
      );

    if (
      !Number.isFinite(
        current
      ) ||
      !Number.isFinite(
        previous
      ) ||
      current <= 0 ||
      previous <= 0
    ) {
      continue;
    }

    const change =
      current -
      previous;

    const percentage =
      (
        change /
        previous
      ) * 100;

    if (
      !Number.isFinite(
        percentage
      )
    ) {
      continue;
    }

    movers.push({
      card:
        rowToCard(
          row
        ),

      current:
        Math.round(
          current * 100
        ) / 100,

      previous:
        Math.round(
          previous * 100
        ) / 100,

      change:
        Math.round(
          change * 100
        ) / 100,

      percentage:
        Math.round(
          percentage * 100
        ) / 100,

      currentDate:
        row.current_date,

      previousDate:
        row.previous_date,
    });
  }


  /*
  ----------------------------------------------------------
  BIGGEST GAINERS
  ----------------------------------------------------------
  */

  const gainers =
    movers
      .filter(
        (item) =>
          item.percentage > 0
      )
      .sort(
        (a, b) =>
          b.percentage -
          a.percentage
      )
      .slice(
        0,
        safeLimit
      );


  /*
  ----------------------------------------------------------
  BIGGEST LOSERS
  ----------------------------------------------------------
  */

  const losers =
    movers
      .filter(
        (item) =>
          item.percentage < 0
      )
      .sort(
        (a, b) =>
          a.percentage -
          b.percentage
      )
      .slice(
        0,
        safeLimit
      );

  return {
    gainers,
    losers,
  };
}


/*
============================================================
DATABASE STATISTICS
============================================================
*/

export function getDatabaseStats() {
  const db = getDatabase();

  const cards =
    db
      .prepare(
        `
        SELECT
          COUNT(*) AS count
        FROM cards
        `
      )
      .get() as {
        count: number;
      };

  const sets =
    db
      .prepare(
        `
        SELECT
          COUNT(*) AS count
        FROM sets
        `
      )
      .get() as {
        count: number;
      };

  const rarities =
    db
      .prepare(
        `
        SELECT
          COUNT(DISTINCT rarity) AS count

        FROM cards

        WHERE rarity IS NOT NULL
          AND rarity != ''
        `
      )
      .get() as {
        count: number;
      };

  const types =
    db
      .prepare(
        `
        SELECT
          COUNT(DISTINCT type) AS count

        FROM card_types

        WHERE type IS NOT NULL
          AND type != ''
        `
      )
      .get() as {
        count: number;
      };

  const priceSnapshots =
    db
      .prepare(
        `
        SELECT
          COUNT(*) AS count

        FROM price_history
        `
      )
      .get() as {
        count: number;
      };

  return {
    cards:
      Number(
        cards.count || 0
      ),

    sets:
      Number(
        sets.count || 0
      ),

    rarities:
      Number(
        rarities.count || 0
      ),

    types:
      Number(
        types.count || 0
      ),

    priceSnapshots:
      Number(
        priceSnapshots.count || 0
      ),

    databasePath:
      DATABASE_PATH,
  };
}


/*
============================================================
CLOSE DATABASE
============================================================
*/

export function closeDatabase(): void {
  if (database) {
    database.close();

    database = null;
  }
}