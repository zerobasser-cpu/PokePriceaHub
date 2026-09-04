/*
============================================================
PokePrices - eBay UK Sold Prices
============================================================

This module attempts to find recent sold eBay UK listings.

IMPORTANT:
- eBay may change its HTML at any time.
- eBay may block automated requests.
- Failure here MUST NEVER break PokePrices.
- If eBay cannot be read, the function simply returns
  an empty result.

The rest of the website can continue normally.
============================================================
*/

const EBAY_SEARCH_URL =
  "https://www.ebay.co.uk/sch/i.html";

const REQUEST_TIMEOUT = 8000;

const MAX_RESULTS = 10;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/140.0.0.0 Safari/537.36";


export interface EbaySale {
  title: string;
  price: number;
  currency: string;
  url?: string;
}


export interface EbayPriceResult {
  sales: EbaySale[];
  average: number | null;
}


/*
============================================================
NORMALISE SEARCH TEXT
============================================================
*/

function cleanSearchText(
  value: string
): string {
  return value
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/*
============================================================
PARSE PRICE
============================================================
*/

function parsePrice(
  value: string
): number | null {
  if (!value) {
    return null;
  }

  let cleaned =
    value
      .replace(/£/g, "")
      .replace(/GBP/gi, "")
      .replace(/\s/g, "")
      .trim();

  /*
  Handle common UK price formatting.
  */

  cleaned =
    cleaned.replace(
      /[^0-9.,-]/g,
      ""
    );

  if (!cleaned) {
    return null;
  }

  /*
  UK eBay normally uses:
  12.99
  1,299.99
  */

  if (
    cleaned.includes(",") &&
    cleaned.includes(".")
  ) {
    cleaned =
      cleaned.replace(/,/g, "");
  } else if (
    cleaned.includes(",") &&
    !cleaned.includes(".")
  ) {
    /*
    Could be either:
    12,99
    or
    1,299

    For eBay UK, a comma without a decimal
    is normally a thousands separator.
    */

    const parts =
      cleaned.split(",");

    if (
      parts.length === 2 &&
      parts[1].length === 2
    ) {
      cleaned =
        `${parts[0]}.${parts[1]}`;
    } else {
      cleaned =
        cleaned.replace(/,/g, "");
    }
  }

  const number =
    Number.parseFloat(cleaned);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return null;
  }

  return Math.round(
    number * 100
  ) / 100;
}


/*
============================================================
BUILD SEARCH URL
============================================================
*/

function buildSearchUrl(
  cardName: string,
  setName?: string,
  cardNumber?: string
): string {
  const parts: string[] = [];

  const cleanName =
    cleanSearchText(cardName);

  if (cleanName) {
    parts.push(cleanName);
  }

  if (setName) {
    const cleanSet =
      cleanSearchText(setName);

    if (cleanSet) {
      parts.push(cleanSet);
    }
  }

  if (cardNumber) {
    const cleanNumber =
      cleanSearchText(cardNumber);

    if (cleanNumber) {
      parts.push(cleanNumber);
    }
  }

  /*
  We add "Pokemon" to reduce unrelated results.
  */

  const search =
    `${parts.join(" ")} Pokemon`;

  const params =
    new URLSearchParams();

  params.set(
    "_nkw",
    search
  );

  /*
  Sold listings.
  */

  params.set(
    "LH_Sold",
    "1"
  );

  /*
  Completed listings.
  */

  params.set(
    "LH_Complete",
    "1"
  );

  /*
  Highest relevance first.
  */

  params.set(
    "_sop",
    "12"
  );

  return `${EBAY_SEARCH_URL}?${params.toString()}`;
}


/*
============================================================
FETCH PAGE
============================================================
*/

async function fetchEbayPage(
  url: string
): Promise<string | null> {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT
    );

  try {
    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {
            "User-Agent":
              USER_AGENT,

            "Accept":
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

            "Accept-Language":
              "en-GB,en;q=0.9",

            "Cache-Control":
              "no-cache"
          },

          signal:
            controller.signal,

          /*
          Do not cache an eBay page forever.
          A short cache also reduces repeated requests.
          */

          next: {
            revalidate: 300
          }
        }
      );

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}


/*
============================================================
EXTRACT EBAY ITEMS
============================================================
*/

function extractSales(
  html: string
): EbaySale[] {
  const results: EbaySale[] = [];

  /*
  eBay listing blocks normally use:
  s-item

  This deliberately uses lightweight parsing rather
  than bringing in another dependency.
  */

  const itemRegex =
    /<li[^>]*class="[^"]*\bs-item\b[^"]*"[\s\S]*?<\/li>/gi;

  const items =
    html.match(itemRegex) ?? [];

  for (
    const item of items
  ) {
    if (
      results.length >=
      MAX_RESULTS
    ) {
      break;
    }

    /*
    Extract title.
    */

    const titleMatch =
      item.match(
        /<div[^>]*class="[^"]*s-item__title[^"]*"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?<\/div>/i
      );

    if (!titleMatch) {
      continue;
    }

    const title =
      decodeHtml(
        stripHtml(
          titleMatch[1]
        )
      ).trim();

    if (
      !title ||
      title.toLowerCase() ===
        "shop on ebay"
    ) {
      continue;
    }


    /*
    Extract price.
    */

    const priceMatch =
      item.match(
        /<span[^>]*class="[^"]*s-item__price[^"]*"[^>]*>([\s\S]*?)<\/span>/i
      );

    if (!priceMatch) {
      continue;
    }

    const priceText =
      decodeHtml(
        stripHtml(
          priceMatch[1]
        )
      ).trim();

    const price =
      parsePrice(
        priceText
      );

    if (price === null) {
      continue;
    }


    /*
    Extract listing URL.
    */

    const urlMatch =
      item.match(
        /<a[^>]*class="[^"]*s-item__link[^"]*"[^>]*href="([^"]+)"/i
      );

    let url: string | undefined;

    if (urlMatch) {
      url =
        decodeHtmlAttribute(
          urlMatch[1]
        );
    }


    /*
    Ignore obvious non-card results.
    */

    const lowerTitle =
      title.toLowerCase();

    if (
      lowerTitle.includes(
        "digital"
      ) ||
      lowerTitle.includes(
        "proxy"
      ) ||
      lowerTitle.includes(
        "custom card"
      ) ||
      lowerTitle.includes(
        "jumbo"
      )
    ) {
      continue;
    }


    results.push({
      title,
      price,
      currency: "GBP",
      url
    });
  }

  return results;
}


/*
============================================================
STRIP HTML
============================================================
*/

function stripHtml(
  value: string
): string {
  return value
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<[^>]+>/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


/*
============================================================
DECODE HTML
============================================================
*/

function decodeHtml(
  value: string
): string {
  return value
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /&apos;/gi,
      "'"
    )
    .replace(
      /&lt;/gi,
      "<"
    )
    .replace(
      /&gt;/gi,
      ">"
    )
    .replace(
      /&nbsp;/gi,
      " "
    );
}


/*
============================================================
DECODE HTML ATTRIBUTE
============================================================
*/

function decodeHtmlAttribute(
  value: string
): string {
  return decodeHtml(
    value
      .replace(
        /\\u0026/gi,
        "&"
      )
      .replace(
        /&amp;/gi,
        "&"
      )
  );
}


/*
============================================================
AVERAGE
============================================================
*/

function calculateAverage(
  sales: EbaySale[]
): number | null {
  const prices =
    sales
      .map(
        sale => sale.price
      )
      .filter(
        price =>
          Number.isFinite(
            price
          ) &&
          price > 0
      );

  if (!prices.length) {
    return null;
  }

  const total =
    prices.reduce(
      (
        sum,
        price
      ) => sum + price,
      0
    );

  return Math.round(
    (
      total /
      prices.length
    ) * 100
  ) / 100;
}


/*
============================================================
GET RECENT EBAY SALES
============================================================
*/

export async function getEbaySoldPrices(
  cardName: string,
  setName?: string,
  cardNumber?: string
): Promise<EbayPriceResult> {
  /*
  Validate card name first.
  */

  if (
    !cardName ||
    !cardName.trim()
  ) {
    return {
      sales: [],
      average: null
    };
  }


  try {
    const url =
      buildSearchUrl(
        cardName,
        setName,
        cardNumber
      );

    const html =
      await fetchEbayPage(
        url
      );

    if (!html) {
      return {
        sales: [],
        average: null
      };
    }

    const sales =
      extractSales(
        html
      );

    return {
      sales,
      average:
        calculateAverage(
          sales
        )
    };
  } catch {
    /*
    Absolutely no eBay error is allowed
    to propagate to the rest of the website.
    */

    return {
      sales: [],
      average: null
    };
  }
}