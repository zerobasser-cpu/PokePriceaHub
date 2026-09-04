/**
 * pokemon.ts
 * ============================================================
 * Local Pokémon TCG database wrapper for PokePrices
 *
 * Card / set / filter catalogue is loaded from:
 *
 *   data/pokemon.db
 *
 * This replaces the unreliable Pokémon TCG API for:
 * - Card searching
 * - Card lookup
 * - Set list
 * - Set lookup
 * - Rarity filters
 * - Type filters
 * - Supertype filters
 * - Popular cards
 *
 * Pricing remains separate and can continue using:
 * - TCGplayer
 * - Cardmarket
 * - eBay
 * ============================================================
 */

import {
  getCardById as getDatabaseCardById,
  searchDatabaseCards,
  getDatabaseSets,
  getDatabaseSetById,
  getDatabaseRarities,
  getDatabaseTypes,
  getDatabaseSupertypes,
  getRarestDatabaseCards,
  type DatabaseCard,
  type DatabaseSet,
} from "./database";

import type {
  TCGPlayerPrices,
  CardmarketPrices,
} from "./types";


/* ============================================================
   CARD TYPE
============================================================ */

export interface Card {
  id: string;
  name: string;
  number?: string;
  supertype?: string;
  subtypes?: string[];
  types?: string[];
  hp?: string;
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  attacks?: unknown[];
  weaknesses?: unknown[];
  resistances?: unknown[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: Record<string, string>;
  regulationMark?: string;

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

  images?: {
    small?: string;
    large?: string;
  };

  image_small?: string;
  image_large?: string;
  imageSmall?: string;
  imageLarge?: string;

  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: TCGPlayerPrices;
  };

  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: CardmarketPrices;
  };

  [key: string]: unknown;
}


/* ============================================================
   PUBLIC TYPES
============================================================ */

export interface SearchCardsOptions {
  search?: string;
  q?: string;

  setId?: string;
  rarity?: string;
  type?: string;
  supertype?: string;

  page?: number;
  pageSize?: number;
}


export interface SearchCardsResponse {
  data: Card[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}


export interface PokemonSet {
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


export interface FilterOptions {
  sets: PokemonSet[];
  supertypes: string[];
  types: string[];
  rarities: string[];
}


/* ============================================================
   CONFIGURATION
============================================================ */

const DEFAULT_PAGE_SIZE = 24;

const MAX_PAGE_SIZE = 100;


/* ============================================================
   POPULAR POKÉMON
============================================================ */

const POPULAR_CARD_NAMES = [
  "Charizard",
  "Pikachu",
  "Umbreon",
  "Gengar",
  "Mew",
  "Rayquaza",
  "Lugia",
  "Giratina",
];


/* ============================================================
   CACHE
============================================================ */

interface CacheEntry<T> {
  value: T;
  expires: number;
}


const CACHE =
  new Map<string, CacheEntry<unknown>>();


const CACHE_TTL = {
  cards: 5 * 60 * 1000,
  sets: 30 * 60 * 1000,
  options: 30 * 60 * 1000,
};


/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return String(
    value ?? "",
  ).trim();
}


function clampPage(
  value: unknown,
): number {
  const page = Number(value);

  if (
    !Number.isFinite(page) ||
    page < 1
  ) {
    return 1;
  }

  return Math.floor(page);
}


function clampPageSize(
  value: unknown,
): number {
  const pageSize = Number(value);

  if (
    !Number.isFinite(pageSize) ||
    pageSize < 1
  ) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(
    Math.floor(pageSize),
    MAX_PAGE_SIZE,
  );
}


function getCached<T>(
  key: string,
): T | null {
  const entry =
    CACHE.get(key);

  if (!entry) {
    return null;
  }

  if (
    Date.now() >=
    entry.expires
  ) {
    CACHE.delete(key);
    return null;
  }

  return entry.value as T;
}


function setCached<T>(
  key: string,
  value: T,
  ttl: number,
): void {
  CACHE.set(
    key,
    {
      value,
      expires:
        Date.now() + ttl,
    },
  );
}


/* ============================================================
   PRICING JSON PARSER
============================================================ */

/**
 * SQLite stores the TCGplayer and Cardmarket columns as
 * JSON text.
 *
 * Example:
 *
 * {
 *   "url": "...",
 *   "prices": {
 *     "holofoil": {
 *       "market": 897.19
 *     }
 *   }
 * }
 *
 * When the database row is loaded, those fields may therefore
 * be strings rather than JavaScript objects.
 *
 * TypeScript casts do NOT parse JSON.
 *
 * This helper safely handles both:
 *
 * - already-parsed objects
 * - JSON strings
 *
 * Invalid or empty pricing data is treated as undefined so
 * one bad card cannot break the website.
 */

function parsePricingObject(
  value: unknown,
): Card["tcgplayer"] | Card["cardmarket"] | undefined {

  if (!value) {
    return undefined;
  }

  /*
   * Already a JavaScript object.
   */
  if (
    typeof value === "object" &&
    value !== null
  ) {
    return value as
      | Card["tcgplayer"]
      | Card["cardmarket"];
  }

  /*
   * SQLite normally gives us JSON as TEXT.
   */
  if (
    typeof value === "string"
  ) {

    const trimmed =
      value.trim();

    if (!trimmed) {
      return undefined;
    }

    try {

      const parsed =
        JSON.parse(trimmed);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return parsed as
          | Card["tcgplayer"]
          | Card["cardmarket"];
      }

    } catch {
      /*
       * Invalid JSON is treated as missing pricing.
       *
       * This deliberately does not throw because pricing
       * problems should never prevent a card from loading.
       */
    }
  }

  return undefined;
}


/* ============================================================
   IMAGE HELPERS
============================================================ */

function safeImage(
  image: unknown,
): string {
  if (
    typeof image !== "string"
  ) {
    return "/static/images/card-placeholder.png";
  }

  const cleaned =
    image.trim();

  return (
    cleaned ||
    "/static/images/card-placeholder.png"
  );
}


function safeOptionalImage(
  image: unknown,
): string | undefined {
  if (
    typeof image !== "string"
  ) {
    return undefined;
  }

  const cleaned =
    image.trim();

  return cleaned || undefined;
}


/* ============================================================
   DATABASE CARD -> WEBSITE CARD
============================================================ */

function normaliseCard(
  raw: DatabaseCard,
): Card {

  const images = (raw.images || {}) as {
    small?: string;
    large?: string;
  };

  const set = (raw.set || {}) as {
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

  return {
    ...raw,

    id:
      cleanString(
        raw.id,
      ),

    name:
      cleanString(
        raw.name,
      ),

    number:
      cleanString(
        raw.number,
      ),

    supertype:
      cleanString(
        raw.supertype,
      ),

    subtypes:
      Array.isArray(
        raw.subtypes,
      )
        ? raw.subtypes
        : [],

    types:
      Array.isArray(
        raw.types,
      )
        ? raw.types
        : [],

    rarity:
      cleanString(
        raw.rarity,
      ),

    evolvesFrom:
      cleanString(
        raw.evolvesFrom,
      ) || undefined,

    evolvesTo:
      Array.isArray(
        raw.evolvesTo,
      )
        ? raw.evolvesTo
        : [],

    rules:
      Array.isArray(
        raw.rules,
      )
        ? raw.rules
        : [],

    attacks:
      Array.isArray(
        raw.attacks,
      )
        ? raw.attacks
        : [],

    weaknesses:
      Array.isArray(
        raw.weaknesses,
      )
        ? raw.weaknesses
        : [],

    resistances:
      Array.isArray(
        raw.resistances,
      )
        ? raw.resistances
        : [],

    retreatCost:
      Array.isArray(
        raw.retreatCost,
      )
        ? raw.retreatCost
        : [],

    images: {
      small:
        safeImage(
          images.small,
        ),

      large:
        safeImage(
          images.large,
        ),
    },

    image_small:
      safeImage(
        images.small,
      ),

    image_large:
      safeImage(
        images.large,
      ),

    imageSmall:
      safeImage(
        images.small,
      ),

    imageLarge:
      safeImage(
        images.large,
      ),

    set: {
      id:
        cleanString(
          set.id,
        ) || undefined,

      name:
        cleanString(
          set.name,
        ) || undefined,

      series:
        cleanString(
          set.series,
        ) || undefined,

      printedTotal:
        set.printedTotal,

      total:
        set.total,

      releaseDate:
        cleanString(
          set.releaseDate,
        ) || undefined,

      updatedAt:
        cleanString(
          set.updatedAt,
        ) || undefined,

      images: {
        symbol:
          safeOptionalImage(
            set.images?.symbol,
          ),

        logo:
          safeOptionalImage(
            set.images?.logo,
          ),
      },
    },

    /*
     * IMPORTANT:
     *
     * The database stores these as JSON strings.
     * Parse them before calculatePrices() receives
     * the card.
     */
    tcgplayer:
      parsePricingObject(
        raw.tcgplayer,
      ),

    cardmarket:
      parsePricingObject(
        raw.cardmarket,
      ),
  };
}


/* ============================================================
   SET NORMALISATION
============================================================ */

function normaliseSet(
  raw: DatabaseSet,
): PokemonSet {

  return {
    id:
      cleanString(
        raw.id,
      ),

    name:
      cleanString(
        raw.name,
      ),

    series:
      cleanString(
        raw.series,
      ) || undefined,

    printedTotal:
      raw.printedTotal,

    total:
      raw.total,

    releaseDate:
      cleanString(
        raw.releaseDate,
      ) || undefined,

    updatedAt:
      cleanString(
        raw.updatedAt,
      ) || undefined,

    images: {
      symbol:
        safeOptionalImage(
          raw.images?.symbol,
        ),

      logo:
        safeOptionalImage(
          raw.images?.logo,
        ),
    },
  };
}


/* ============================================================
   EMPTY RESPONSE
============================================================ */

function emptyResponse(
  page: number,
  pageSize: number,
): SearchCardsResponse {

  return {
    data: [],
    page,
    pageSize,
    count: 0,
    totalCount: 0,
  };
}


/* ============================================================
   LOCAL CARD SEARCH
============================================================ */

export async function searchCards(
  optionsOrSearch:
    | SearchCardsOptions
    | string = {},

  legacyPage = 1,

  legacyPageSize = DEFAULT_PAGE_SIZE,
): Promise<SearchCardsResponse> {

  let options:
    SearchCardsOptions;

  /*
   * Preserve backwards compatibility with:
   *
   * searchCards("Charizard", 1, 24)
   */
  if (
    typeof optionsOrSearch ===
    "string"
  ) {

    options = {
      search:
        optionsOrSearch,

      page:
        legacyPage,

      pageSize:
        legacyPageSize,
    };

  } else {

    options =
      optionsOrSearch ||
      {};
  }


  const search =
    cleanString(
      options.search ??
        options.q,
    );


  const setId =
    cleanString(
      options.setId,
    );


  const rarity =
    cleanString(
      options.rarity,
    );


  const type =
    cleanString(
      options.type,
    );


  const supertype =
    cleanString(
      options.supertype,
    );


  const page =
    clampPage(
      options.page,
    );


  const pageSize =
    clampPageSize(
      options.pageSize,
    );


  const cacheKey =
    [
      "search",
      search.toLowerCase(),
      setId.toLowerCase(),
      rarity.toLowerCase(),
      type.toLowerCase(),
      supertype.toLowerCase(),
      page,
      pageSize,
    ].join("|");


  const cached =
    getCached<SearchCardsResponse>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const result =
      searchDatabaseCards({
        search:
          search || undefined,

        setId:
          setId || undefined,

        rarity:
          rarity || undefined,

        type:
          type || undefined,

        supertype:
          supertype || undefined,

        page,

        pageSize,
      });


    const response:
      SearchCardsResponse = {

      data:
        result.cards.map(
          normaliseCard,
        ),

      page:
        result.page,

      pageSize:
        result.pageSize,

      count:
        result.cards.length,

      totalCount:
        result.total,
    };


    setCached(
      cacheKey,
      response,
      CACHE_TTL.cards,
    );


    return response;

  } catch (error) {

    console.error(
      "Local Pokémon database search failed:",
      error instanceof Error
        ? error.message
        : error,
    );

    return emptyResponse(
      page,
      pageSize,
    );
  }
}


/* ============================================================
   CARD LOOKUP
============================================================ */

export async function getCard(
  id: string,
): Promise<Card | null> {

  const cleanId =
    cleanString(
      id,
    );


  if (!cleanId) {
    return null;
  }


  const cacheKey =
    `card:${cleanId}`;


  const cached =
    getCached<Card>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const databaseCard =
      getDatabaseCardById(
        cleanId,
      );


    if (!databaseCard) {
      return null;
    }


    const card =
      normaliseCard(
        databaseCard,
      );


    setCached(
      cacheKey,
      card,
      CACHE_TTL.cards,
    );


    return card;

  } catch (error) {

    console.error(
      `Failed to load local card ${cleanId}:`,
      error instanceof Error
        ? error.message
        : error,
    );

    return null;
  }
}


export async function getCardById(
  id: string,
): Promise<Card | null> {

  return getCard(
    id,
  );
}


/* ============================================================
   SETS
============================================================ */

export async function getSets(): Promise<
  PokemonSet[]
> {

  const cacheKey =
    "sets";


  const cached =
    getCached<PokemonSet[]>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const sets =
      getDatabaseSets()
        .map(
          normaliseSet,
        );


    setCached(
      cacheKey,
      sets,
      CACHE_TTL.sets,
    );


    return sets;

  } catch (error) {

    console.error(
      "Failed to load local Pokémon sets:",
      error instanceof Error
        ? error.message
        : error,
    );

    return [];
  }
}


/* ============================================================
   SINGLE SET
============================================================ */

export async function getSet(
  id: string,
): Promise<PokemonSet | null> {

  const cleanId =
    cleanString(
      id,
    );


  if (!cleanId) {
    return null;
  }


  const cacheKey =
    `set:${cleanId}`;


  const cached =
    getCached<PokemonSet>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const databaseSet =
      getDatabaseSetById(
        cleanId,
      );


    if (!databaseSet) {
      return null;
    }


    const set =
      normaliseSet(
        databaseSet,
      );


    setCached(
      cacheKey,
      set,
      CACHE_TTL.sets,
    );


    return set;

  } catch (error) {

    console.error(
      `Failed to load local set ${cleanId}:`,
      error instanceof Error
        ? error.message
        : error,
    );

    return null;
  }
}


/* ============================================================
   SUPERTYPES
============================================================ */

export async function getSupertypes(): Promise<
  string[]
> {

  const cacheKey =
    "supertypes";


  const cached =
    getCached<string[]>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const values =
      getDatabaseSupertypes();


    setCached(
      cacheKey,
      values,
      CACHE_TTL.options,
    );


    return values;

  } catch (error) {

    console.error(
      "Failed to load local supertypes:",
      error instanceof Error
        ? error.message
        : error,
    );

    return [];
  }
}


/* ============================================================
   TYPES
============================================================ */

export async function getTypes(): Promise<
  string[]
> {

  const cacheKey =
    "types";


  const cached =
    getCached<string[]>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const values =
      getDatabaseTypes();


    setCached(
      cacheKey,
      values,
      CACHE_TTL.options,
    );


    return values;

  } catch (error) {

    console.error(
      "Failed to load local Pokémon types:",
      error instanceof Error
        ? error.message
        : error,
    );

    return [];
  }
}


/* ============================================================
   RARITIES
============================================================ */

export async function getRarities(): Promise<
  string[]
> {

  const cacheKey =
    "rarities";


  const cached =
    getCached<string[]>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const values =
      getDatabaseRarities();


    setCached(
      cacheKey,
      values,
      CACHE_TTL.options,
    );


    return values;

  } catch (error) {

    console.error(
      "Failed to load local rarities:",
      error instanceof Error
        ? error.message
        : error,
    );

    return [];
  }
}


/* ============================================================
   FILTER OPTIONS
============================================================ */

export async function getFilterOptions(): Promise<
  FilterOptions
> {

  const cacheKey =
    "filter-options";


  const cached =
    getCached<FilterOptions>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const [
      sets,
      supertypes,
      types,
      rarities,
    ] =
      await Promise.all([
        getSets(),
        getSupertypes(),
        getTypes(),
        getRarities(),
      ]);


    const options:
      FilterOptions = {

      sets,

      supertypes,

      types,

      rarities,
    };


    setCached(
      cacheKey,
      options,
      CACHE_TTL.options,
    );


    return options;

  } catch (error) {

    console.error(
      "Failed to load filter options:",
      error instanceof Error
        ? error.message
        : error,
    );

    return {
      sets: [],
      supertypes: [],
      types: [],
      rarities: [],
    };
  }
}


/* ============================================================
   POPULAR CARDS
============================================================ */

export async function getPopularCards(
  limit = 8,
): Promise<Card[]> {

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Math.floor(
          Number(limit) || 8,
        ),
        POPULAR_CARD_NAMES.length,
      ),
    );


  const cacheKey =
    `popular-cards:${safeLimit}`;


  const cached =
    getCached<Card[]>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  const results:
    Card[] = [];


  for (
    const name of POPULAR_CARD_NAMES.slice(
      0,
      safeLimit,
    )
  ) {

    try {

      const result =
        await searchCards({
          search:
            name,

          page: 1,

          pageSize: 1,
        });


      if (
        result.data[0]
      ) {

        results.push(
          result.data[0],
        );
      }

    } catch {
      // Continue with the next popular Pokémon.
    }
  }


  if (
    results.length > 0
  ) {

    setCached(
      cacheKey,
      results,
      CACHE_TTL.cards,
    );
  }


  return results;
}


/* ============================================================
   RAREST CARDS
============================================================ */

/**
 * A homepage-friendly highlight of the rarest cards in the
 * catalogue (one card per rarest rarity tier, by print count).
 */
export async function getRarestCards(
  limit = 10,
): Promise<Card[]> {

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Math.floor(
          Number(limit) || 10,
        ),
        50,
      ),
    );


  const cacheKey =
    `rarest-cards:${safeLimit}`;


  const cached =
    getCached<Card[]>(
      cacheKey,
    );


  if (cached) {
    return cached;
  }


  try {

    const rows =
      getRarestDatabaseCards(
        safeLimit,
      );

    const results =
      rows.map(
        normaliseCard,
      );


    if (
      results.length > 0
    ) {

      setCached(
        cacheKey,
        results,
        CACHE_TTL.cards,
      );
    }


    return results;

  } catch (error) {

    console.error(
      "Failed to load rarest cards:",
      error instanceof Error
        ? error.message
        : error,
    );

    return [];
  }
}


/* ============================================================
   SEARCH HELPERS
============================================================ */

export async function searchPokemon(
  query: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<SearchCardsResponse> {

  return searchCards({
    search:
      query,

    page,

    pageSize,
  });
}


export async function findCards(
  query: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<SearchCardsResponse> {

  return searchCards({
    search:
      query,

    page,

    pageSize,
  });
}


/* ============================================================
   CARD PREPARATION
============================================================ */

export function prepareCard(
  card: Card,
): Card {

  if (!card) {
    return card;
  }

  return {
    ...card,

    images: {
      small:
        getCardImageSmall(
          card,
        ),

      large:
        getCardImageLarge(
          card,
        ),
    },

    image_small:
      getCardImageSmall(
        card,
      ),

    image_large:
      getCardImageLarge(
        card,
      ),

    imageSmall:
      getCardImageSmall(
        card,
      ),

    imageLarge:
      getCardImageLarge(
        card,
      ),
  };
}


export function prepareCards(
  cards: Card[],
): Card[] {

  if (
    !Array.isArray(
      cards,
    )
  ) {
    return [];
  }

  return cards.map(
    prepareCard,
  );
}


/* ============================================================
   IMAGE HELPERS
============================================================ */

export function getCardImageSmall(
  card: Card,
): string {

  return safeImage(
    card?.images?.small ||
      card?.image_small ||
      card?.imageSmall,
  );
}


export function getCardImageLarge(
  card: Card,
): string {

  return safeImage(
    card?.images?.large ||
      card?.image_large ||
      card?.imageLarge,
  );
}


/* ============================================================
   CACHE CONTROL
============================================================ */

export function clearPokemonCache(): void {

  CACHE.clear();
}


/* ============================================================
   API STATUS
============================================================ */

/*
 * Kept for backwards compatibility with the existing website.
 *
 * The catalogue no longer depends on the API key.
 */
export function hasPokemonApiKey(): boolean {

  return Boolean(
    process.env.POKEMONTCG_API_KEY?.trim(),
  );
}


/* ============================================================
   DEFAULT EXPORT
============================================================ */

const pokemonApi = {

  searchCards,

  searchPokemon,

  findCards,

  getCard,

  getCardById,

  getSets,

  getSet,

  getSupertypes,

  getTypes,

  getRarities,

  getFilterOptions,

  getPopularCards,

  getRarestCards,

  prepareCard,

  prepareCards,

  getCardImageSmall,

  getCardImageLarge,

  clearPokemonCache,

  hasPokemonApiKey,
};


export default pokemonApi;