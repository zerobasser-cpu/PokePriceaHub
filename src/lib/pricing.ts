import type { Card } from "@/lib/pokemon";

import {
  recordPriceSnapshot,
} from "@/lib/database";

import {
  getEbaySoldPrices,
} from "@/lib/ebay";

/*
============================================================
CONFIGURATION
============================================================
*/

const FRANKFURTER_URL =
  "https://api.frankfurter.app/latest";

const FALLBACK_USD_TO_GBP = 0.74;
const FALLBACK_EUR_TO_GBP = 0.86;

/*
============================================================
PRICE RESULT
============================================================
*/

export type PriceResult = {
  tcgplayer: number | null;
  cardmarket: number | null;
  ebay: number | null;

  ebaySales: {
    title: string;
    price: number;
    currency: string;
    url?: string;
  }[];

  average: number | null;
};

/*
============================================================
SAFE NUMBER
============================================================
*/

function safeNumber(
  value: unknown
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

/*
============================================================
ROUND PRICE
============================================================
*/

function roundPrice(
  value: number
): number {
  return Math.round(value * 100) / 100;
}

/*
============================================================
USD -> GBP
============================================================
*/

async function getUsdToGbp(): Promise<number> {
  try {
    const response = await fetch(
      `${FRANKFURTER_URL}?from=USD&to=GBP`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "USD exchange request failed"
      );
    }

    const data = await response.json();

    const rate = data?.rates?.GBP;

    if (
      typeof rate !== "number" ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      throw new Error(
        "Invalid USD exchange rate"
      );
    }

    return rate;
  } catch {
    return FALLBACK_USD_TO_GBP;
  }
}

/*
============================================================
EUR -> GBP
============================================================
*/

async function getEurToGbp(): Promise<number> {
  try {
    const response = await fetch(
      `${FRANKFURTER_URL}?from=EUR&to=GBP`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "EUR exchange request failed"
      );
    }

    const data = await response.json();

    const rate = data?.rates?.GBP;

    if (
      typeof rate !== "number" ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      throw new Error(
        "Invalid EUR exchange rate"
      );
    }

    return rate;
  } catch {
    return FALLBACK_EUR_TO_GBP;
  }
}

/*
============================================================
TCGPLAYER
============================================================
*/

function getTcgplayerUsd(
  card: Card
): number | null {
  const prices =
    card.tcgplayer?.prices;

  if (!prices) {
    return null;
  }

  /*
  ----------------------------------------------------------
  Preferred finishes
  ----------------------------------------------------------
  */

  const finishes = [
    prices.holofoil,
    prices.reverseHolofoil,
    prices.normal,
    prices["1stEditionHolofoil"],
    prices["1stEditionNormal"],
  ];

  for (const finish of finishes) {
    if (!finish) {
      continue;
    }

    const market =
      safeNumber(finish.market);

    if (market !== null) {
      return market;
    }

    const mid =
      safeNumber(finish.mid);

    if (mid !== null) {
      return mid;
    }
  }

  /*
  ----------------------------------------------------------
  Remaining finishes
  ----------------------------------------------------------
  */

  for (const finish of Object.values(prices)) {
    if (!finish) {
      continue;
    }

    const market =
      safeNumber(finish.market);

    if (market !== null) {
      return market;
    }

    const mid =
      safeNumber(finish.mid);

    if (mid !== null) {
      return mid;
    }
  }

  return null;
}

/*
============================================================
CARDMARKET
============================================================
*/

function getCardmarketEur(
  card: Card
): number | null {
  const prices =
    card.cardmarket?.prices;

  if (!prices) {
    return null;
  }

  const average =
    safeNumber(
      prices.averageSellPrice
    );

  if (average !== null) {
    return average;
  }

  const trend =
    safeNumber(
      prices.trendPrice
    );

  if (trend !== null) {
    return trend;
  }

  const suggested =
    safeNumber(
      prices.suggestedPrice
    );

  if (suggested !== null) {
    return suggested;
  }

  const low =
    safeNumber(
      prices.lowPrice
    );

  if (low !== null) {
    return low;
  }

  return null;
}

/*
============================================================
COMBINED MARKET PRICE
============================================================
*/

function calculateCombinedPrice(
  prices: Array<number | null>
): number | null {
  const valid =
    prices.filter(
      (
        value
      ): value is number =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0
    );

  if (!valid.length) {
    return null;
  }

  const total =
    valid.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  return roundPrice(
    total / valid.length
  );
}

/*
============================================================
MAIN PRICING FUNCTION
============================================================
*/

export async function calculatePrices(
  card: Card
): Promise<PriceResult> {

  /*
  ----------------------------------------------------------
  EBAY
  ----------------------------------------------------------
  */

  const ebayPromise =
    getEbaySoldPrices(
      card.name,
      card.set?.name,
      card.number
    ).catch(
      () => ({
        sales: [],
        average: null,
      })
    );

  /*
  ----------------------------------------------------------
  CURRENCY RATES
  ----------------------------------------------------------
  */

  const currencyPromise =
    Promise.all([
      getUsdToGbp(),
      getEurToGbp(),
    ]).catch(
      () =>
        [
          FALLBACK_USD_TO_GBP,
          FALLBACK_EUR_TO_GBP,
        ] as [
          number,
          number
        ]
    );

  /*
  ----------------------------------------------------------
  GET EXCHANGE RATES
  ----------------------------------------------------------
  */

  const [
    usdToGbp,
    eurToGbp,
  ] = await currencyPromise;

  /*
  ----------------------------------------------------------
  TCGPLAYER
  ----------------------------------------------------------
  */

  let tcgplayer:
    | number
    | null = null;

  try {
    const usd =
      getTcgplayerUsd(card);

    if (usd !== null) {
      tcgplayer =
        roundPrice(
          usd * usdToGbp
        );
    }
  } catch {
    tcgplayer = null;
  }

  /*
  ----------------------------------------------------------
  CARDMARKET
  ----------------------------------------------------------
  */

  let cardmarket:
    | number
    | null = null;

  try {
    const eur =
      getCardmarketEur(card);

    if (eur !== null) {
      cardmarket =
        roundPrice(
          eur * eurToGbp
        );
    }
  } catch {
    cardmarket = null;
  }

  /*
  ----------------------------------------------------------
  EBAY
  ----------------------------------------------------------
  */

  const ebay =
    await ebayPromise;

  const ebayPrice =
    safeNumber(
      ebay.average
    );

  /*
  ----------------------------------------------------------
  COMBINED MARKET PRICE
  ----------------------------------------------------------
  */

  const average =
    calculateCombinedPrice([
      tcgplayer,
      cardmarket,
      ebayPrice,
    ]);

  /*
  ----------------------------------------------------------
  SAVE PRICE HISTORY
  ----------------------------------------------------------
  
  Every successful price calculation creates or updates
  today's snapshot for this card.

  The database uses:
  
    card_id + snapshot_date

  as the unique key, so repeatedly viewing the same card
  on the same day does NOT create duplicate history rows.

  History failures are deliberately non-fatal. If SQLite
  fails, the live price is still returned normally.
  */

  try {
    recordPriceSnapshot(
      card.id,
      {
        tcgplayer,
        cardmarket,
        ebay: ebayPrice,
        average,
      }
    );
  } catch {
    /*
    --------------------------------------------------------
    IMPORTANT
    --------------------------------------------------------

    Never allow price-history storage to break the live
    pricing system.
    */
  }

  /*
  ----------------------------------------------------------
  RETURN LIVE PRICES
  ----------------------------------------------------------
  */

  return {
    tcgplayer,
    cardmarket,
    ebay: ebayPrice,
    ebaySales: ebay.sales,
    average,
  };
}