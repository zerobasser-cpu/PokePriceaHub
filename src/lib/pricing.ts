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

Accepts:

- numbers
- numeric strings

Rejects:

- null
- undefined
- NaN
- Infinity
- zero
- negative values
*/

function safeNumber(
  value: unknown,
): number | null {

  if (
    typeof value === "number"
  ) {

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return null;
    }

    return value;
  }


  if (
    typeof value === "string"
  ) {

    const cleaned =
      value
        .replace(/[$£€,]/g, "")
        .trim();

    if (!cleaned) {
      return null;
    }

    const parsed =
      Number(cleaned);

    if (
      !Number.isFinite(parsed) ||
      parsed <= 0
    ) {
      return null;
    }

    return parsed;
  }


  return null;
}


/*
============================================================
ROUND PRICE
============================================================
*/

function roundPrice(
  value: number,
): number {

  return Math.round(
    value * 100
  ) / 100;
}


/*
============================================================
USD -> GBP
============================================================
*/

async function getUsdToGbp(): Promise<number> {

  try {

    const response =
      await fetch(
        `${FRANKFURTER_URL}?from=USD&to=GBP`,
        {
          next: {
            revalidate: 3600,
          },
        },
      );


    if (!response.ok) {
      throw new Error(
        "USD exchange request failed",
      );
    }


    const data =
      await response.json();


    const rate =
      safeNumber(
        data?.rates?.GBP,
      );


    if (rate === null) {
      throw new Error(
        "Invalid USD exchange rate",
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

    const response =
      await fetch(
        `${FRANKFURTER_URL}?from=EUR&to=GBP`,
        {
          next: {
            revalidate: 3600,
          },
        },
      );


    if (!response.ok) {
      throw new Error(
        "EUR exchange request failed",
      );
    }


    const data =
      await response.json();


    const rate =
      safeNumber(
        data?.rates?.GBP,
      );


    if (rate === null) {
      throw new Error(
        "Invalid EUR exchange rate",
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

TCGplayer can contain several finishes, for example:

- holofoil
- reverseHolofoil
- normal
- 1stEditionHolofoil
- 1stEditionNormal
- unlimitedHolofoil
- unlimitedNormal
- promo
- other finishes

We check preferred finishes first and then inspect every
remaining finish.

Price preference:

1. market
2. mid
3. low

We deliberately do NOT use "high" as a market price because
high represents the upper end of listings rather than a
typical market value.
============================================================
*/

function getTcgplayerUsd(
  card: Card,
): number | null {

  const prices =
    card.tcgplayer?.prices;


  if (
    !prices ||
    typeof prices !== "object"
  ) {
    return null;
  }


  /*
  ----------------------------------------------------------
  Helper for one finish
  ----------------------------------------------------------
  */

  function getFinishPrice(
    finish: unknown,
  ): number | null {

    if (
      !finish ||
      typeof finish !== "object"
    ) {
      return null;
    }


    const data =
      finish as Record<
        string,
        unknown
      >;


    /*
     * Market is the preferred value.
     */
    const market =
      safeNumber(
        data.market,
      );


    if (market !== null) {
      return market;
    }


    /*
     * Mid is the next best fallback.
     */
    const mid =
      safeNumber(
        data.mid,
      );


    if (mid !== null) {
      return mid;
    }


    /*
     * Low is preferable to returning no
     * price at all when market/mid are absent.
     */
    const low =
      safeNumber(
        data.low,
      );


    if (low !== null) {
      return low;
    }


    return null;
  }


  /*
  ----------------------------------------------------------
  Preferred finishes
  ----------------------------------------------------------
  */

  const preferredFinishes = [
    "holofoil",
    "reverseHolofoil",
    "normal",
    "1stEditionHolofoil",
    "1stEditionNormal",
    "unlimitedHolofoil",
    "unlimitedNormal",
  ];


  for (
    const finishName of preferredFinishes
  ) {

    const finish =
      (
        prices as Record<
          string,
          unknown
        >
      )[finishName];


    const value =
      getFinishPrice(
        finish,
      );


    if (value !== null) {
      return value;
    }
  }


  /*
  ----------------------------------------------------------
  Remaining finishes
  ----------------------------------------------------------
  */

  for (
    const finish of Object.values(
      prices as Record<
        string,
        unknown
      >,
    )
  ) {

    const value =
      getFinishPrice(
        finish,
      );


    if (value !== null) {
      return value;
    }
  }


  return null;
}


/*
============================================================
CARDMARKET
============================================================

Cardmarket normally provides:

- averageSellPrice
- lowPrice
- trendPrice
- suggestedPrice
- lowPriceExPlus
- avg1
- avg7
- avg30

Preference:

1. averageSellPrice
2. trendPrice
3. lowPrice
4. lowPriceExPlus
5. avg7
6. avg30
7. avg1
8. suggestedPrice

Zero values are ignored.
============================================================
*/

function getCardmarketEur(
  card: Card,
): number | null {

  const prices =
    card.cardmarket?.prices;


  if (
    !prices ||
    typeof prices !== "object"
  ) {
    return null;
  }


  const data =
    prices as Record<
      string,
      unknown
    >;


  /*
  ----------------------------------------------------------
  Average sell price
  ----------------------------------------------------------
  */

  const average =
    safeNumber(
      data.averageSellPrice,
    );


  if (average !== null) {
    return average;
  }


  /*
  ----------------------------------------------------------
  Trend price
  ----------------------------------------------------------
  */

  const trend =
    safeNumber(
      data.trendPrice,
    );


  if (trend !== null) {
    return trend;
  }


  /*
  ----------------------------------------------------------
  Low price
  ----------------------------------------------------------
  */

  const low =
    safeNumber(
      data.lowPrice,
    );


  if (low !== null) {
    return low;
  }


  /*
  ----------------------------------------------------------
  Low price EX+
  ----------------------------------------------------------
  */

  const lowExPlus =
    safeNumber(
      data.lowPriceExPlus,
    );


  if (lowExPlus !== null) {
    return lowExPlus;
  }


  /*
  ----------------------------------------------------------
  Seven-day average
  ----------------------------------------------------------
  */

  const avg7 =
    safeNumber(
      data.avg7,
    );


  if (avg7 !== null) {
    return avg7;
  }


  /*
  ----------------------------------------------------------
  Thirty-day average
  ----------------------------------------------------------
  */

  const avg30 =
    safeNumber(
      data.avg30,
    );


  if (avg30 !== null) {
    return avg30;
  }


  /*
  ----------------------------------------------------------
  One-day average
  ----------------------------------------------------------
  */

  const avg1 =
    safeNumber(
      data.avg1,
    );


  if (avg1 !== null) {
    return avg1;
  }


  /*
  ----------------------------------------------------------
  Suggested price
  ----------------------------------------------------------
  */

  const suggested =
    safeNumber(
      data.suggestedPrice,
    );


  if (suggested !== null) {
    return suggested;
  }


  return null;
}


/*
============================================================
COMBINED MARKET PRICE
============================================================

Combines the available GBP prices.

If eBay is unavailable, the average still uses:

- TCGplayer
- Cardmarket

If only one source is available, that source becomes the
market price.

============================================================
*/

function calculateCombinedPrice(
  prices: Array<number | null>,
): number | null {

  const valid =
    prices.filter(
      (
        value,
      ): value is number =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0,
    );


  if (
    !valid.length
  ) {
    return null;
  }


  const total =
    valid.reduce(
      (
        sum,
        value,
      ) =>
        sum + value,
      0,
    );


  return roundPrice(
    total / valid.length,
  );
}


/*
============================================================
MAIN PRICING FUNCTION
============================================================
*/

export async function calculatePrices(
  card: Card,
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
      card.number,
    ).catch(
      () => ({
        sales: [],
        average: null,
      }),
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
          number,
        ],
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
      getTcgplayerUsd(
        card,
      );


    if (
      usd !== null &&
      Number.isFinite(usdToGbp) &&
      usdToGbp > 0
    ) {

      tcgplayer =
        roundPrice(
          usd * usdToGbp,
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
      getCardmarketEur(
        card,
      );


    if (
      eur !== null &&
      Number.isFinite(eurToGbp) &&
      eurToGbp > 0
    ) {

      cardmarket =
        roundPrice(
          eur * eurToGbp,
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
      ebay.average,
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

  as the unique key.

  History failures are deliberately non-fatal.
  */

  try {

    recordPriceSnapshot(
      card.id,
      {
        tcgplayer,
        cardmarket,
        ebay: ebayPrice,
        average,
      },
    );

  } catch {

    /*
     * Price-history storage must never break
     * live pricing.
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