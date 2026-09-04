export interface CardPrice {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  directLow?: number;
}

export interface TCGPlayerPrices {
  normal?: CardPrice;
  holofoil?: CardPrice;
  reverseHolofoil?: CardPrice;
  "1stEditionHolofoil"?: CardPrice;
  "1stEditionNormal"?: CardPrice;

  [key: string]: CardPrice | undefined;
}

export interface CardmarketPrices {
  averageSellPrice?: number;
  lowPrice?: number;
  trendPrice?: number;
  germanProLow?: number;
  suggestedPrice?: number;
  reverseHoloAvgSellPrice?: number;
  reverseHoloTrendPrice?: number;

  [key: string]: number | undefined;
}

export interface CardSet {
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

export interface PokemonCard {
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

  /*
  ----------------------------------------------------------
  SET
  ----------------------------------------------------------

  Keep id/name optional here because the Pokémon API wrapper
  can return partially populated set information.
  */

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

  /*
  ----------------------------------------------------------
  TCGPLAYER
  ----------------------------------------------------------
  */

  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: TCGPlayerPrices;
  };

  /*
  ----------------------------------------------------------
  CARDMARKET
  ----------------------------------------------------------
  */

  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: CardmarketPrices;
  };

  /*
  ----------------------------------------------------------
  LEGACY / COMPATIBILITY FIELDS
  ----------------------------------------------------------
  */

  image_small?: string;
  image_large?: string;

  imageSmall?: string;
  imageLarge?: string;

  /*
  Allow additional API fields without causing
  TypeScript failures.
  */

  [key: string]: unknown;
}


/*
============================================================
SEARCH RESPONSE
============================================================
*/

export interface CardSearchResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}


/*
============================================================
SET SEARCH RESPONSE
============================================================
*/

export interface SetSearchResponse {
  data: CardSet[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}


/*
============================================================
FILTER OPTIONS
============================================================
*/

export interface FilterOptions {
  types: string[];
  rarities: string[];
  supertypes: string[];
  sets: CardSet[];
}