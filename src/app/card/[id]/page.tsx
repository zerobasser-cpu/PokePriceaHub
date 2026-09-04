import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCardById,
} from "@/lib/pokemon";

import {
  calculatePrices,
} from "@/lib/pricing";

import {
  getPriceHistory,
  getPriceMovement,
  type PriceMovement,
} from "@/lib/database";

import PriceHistoryChart from "@/components/PriceHistoryChart";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type EbaySale = {
  title: string;
  price: number | null;
  url?: string | null;
};

function formatPrice(
  value: number | null | undefined
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "Unavailable";
  }

  return `£${value.toFixed(2)}`;
}

function formatMovementValue(
  value: number | null
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}£${value.toFixed(2)}`;
}

function formatPercentage(
  value: number | null
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(2)}%`;
}

function getMovementClass(
  movement: PriceMovement
): string {
  if (
    movement.change === null ||
    movement.percentage === null
  ) {
    return "";
  }

  if (movement.change > 0) {
    return "positive";
  }

  if (movement.change < 0) {
    return "negative";
  }

  return "";
}

function getMovementArrow(
  movement: PriceMovement
): string {
  if (
    movement.change === null ||
    movement.percentage === null
  ) {
    return "";
  }

  if (movement.change > 0) {
    return "↑";
  }

  if (movement.change < 0) {
    return "↓";
  }

  return "→";
}

type MovementCardProps = {
  label: string;
  movement: PriceMovement;
};

function MovementCard({
  label,
  movement,
}: MovementCardProps) {
  const movementClass =
    getMovementClass(movement);

  const arrow =
    getMovementArrow(movement);

  return (
    <div
      className={`price-movement-card ${movementClass}`}
    >
      <div className="price-movement-label">
        {label}
      </div>

      {movement.hasHistory ? (
        <>
          <div className="price-movement-change">
            {arrow && (
              <span className="price-movement-arrow">
                {arrow}
              </span>
            )}

            {formatMovementValue(
              movement.change
            )}
          </div>

          <div className="price-movement-percentage">
            {formatPercentage(
              movement.percentage
            )}
          </div>

          {movement.previous !== null && (
            <div className="price-movement-previous">
              From{" "}
              {formatPrice(
                movement.previous
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="price-movement-change unavailable">
            —
          </div>

          <div className="price-movement-percentage unavailable">
            Not enough history
          </div>
        </>
      )}
    </div>
  );
}

export default async function CardPage({
  params,
}: PageProps) {
  const { id } = await params;

  const card = await getCardById(
    decodeURIComponent(id)
  );

  if (!card) {
    notFound();
  }

  const [
    prices,
    priceHistory,
    movement7d,
    movement30d,
    movement90d,
    movement1y,
  ] = await Promise.all([
    calculatePrices(card),

    Promise.resolve(
      getPriceHistory(card.id)
    ),

    Promise.resolve(
      getPriceMovement(card.id, 7)
    ),

    Promise.resolve(
      getPriceMovement(card.id, 30)
    ),

    Promise.resolve(
      getPriceMovement(card.id, 90)
    ),

    Promise.resolve(
      getPriceMovement(card.id, 365)
    ),
  ]);

  return (
    <>
      <header className="site-header">
        <div className="site-container header-inner">
          <Link
            href="/"
            className="logo"
          >
            <span className="logo-ball" />

            <span>
              <span className="logo-poke">
                Poke
              </span>

              <span className="logo-prices">
                Prices
              </span>
            </span>
          </Link>

          <nav className="main-nav">
            <Link
              href="/"
              className="nav-link"
            >
              Home
            </Link>

            <Link
              href="/cards"
              className="nav-link"
            >
              Cards
            </Link>

            <Link
              href="/rarities"
              className="nav-link"
            >
              Rarities
            </Link>

            <a
              href="/deck-matchup-forecast.html"
              className="nav-link"
            >
              Deck Tester
            </a>
          </nav>
        </div>
      </header>

      <main className="site-container">
        <div
          style={{
            marginTop: 25,
            marginBottom: 20,
          }}
        >
          <Link
            href="/cards"
            className="nav-link"
          >
            ← Back to cards
          </Link>
        </div>

        <section className="section">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(280px, 420px) minmax(0, 1fr)",
              gap: 45,
              alignItems: "start",
            }}
          >
            <div
              className="card-image-wrapper"
              style={{
                maxWidth: 420,
                margin: "0 auto",
                width: "100%",
              }}
            >
              {card.images?.large ? (
                <img
                  src={card.images.large}
                  alt={`${card.name} Pokémon card`}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: 18,
                  }}
                />
              ) : (
                <div className="loading">
                  No image available
                </div>
              )}
            </div>

            <div>
              <div className="hero-badge">
                {card.rarity ??
                  "Pokémon Card"}
              </div>

              <h1
                className="hero-title"
                style={{
                  marginTop: 15,
                  marginBottom: 8,
                }}
              >
                {card.name}
              </h1>

              <p className="hero-subtitle">
                {card.set?.name ??
                  "Unknown Set"}

                {card.number
                  ? ` • #${card.number}`
                  : ""}
              </p>

              <div
                style={{
                  marginTop: 28,
                  padding: 24,
                  borderRadius: 18,
                  border:
                    "1px solid var(--border)",
                  background:
                    "var(--surface)",
                }}
              >
                <span className="price-label">
                  CURRENT MARKET PRICE
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "baseline",
                    gap: 10,
                    marginTop: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="price-value"
                    style={{
                      fontSize:
                        "2.2rem",
                    }}
                  >
                    {formatPrice(
                      prices.average
                    )}
                  </span>
                </div>

                <p
                  className="section-description"
                  style={{
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  Combined market
                  estimate based on
                  available pricing
                  sources.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  marginTop: 18,
                }}
              >
                {card.rarity && (
                  <div className="browse-item">
                    <span className="price-label">
                      Rarity
                    </span>

                    <span className="browse-name">
                      {card.rarity}
                    </span>
                  </div>
                )}

                {card.artist && (
                  <div className="browse-item">
                    <span className="price-label">
                      Artist
                    </span>

                    <span className="browse-name">
                      {card.artist}
                    </span>
                  </div>
                )}

                {card.hp && (
                  <div className="browse-item">
                    <span className="price-label">
                      HP
                    </span>

                    <span className="browse-name">
                      {card.hp}
                    </span>
                  </div>
                )}

                {card.types &&
                  card.types.length > 0 && (
                    <div className="browse-item">
                      <span className="price-label">
                        Type
                      </span>

                      <span className="browse-name">
                        {card.types.join(
                          ", "
                        )}
                      </span>
                    </div>
                  )}
              </div>

              <div
                style={{
                  marginTop: 30,
                }}
              >
                <h2 className="section-title">
                  Price comparison
                </h2>

                <p
                  className="section-description"
                  style={{
                    marginBottom: 18,
                  }}
                >
                  Available market
                  prices in GBP.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 15,
                  }}
                >
                  <div className="browse-item">
                    <span className="price-label">
                      TCGplayer
                    </span>

                    <span className="price-value">
                      {formatPrice(
                        prices.tcgplayer
                      )}
                    </span>
                  </div>

                  <div className="browse-item">
                    <span className="price-label">
                      Cardmarket
                    </span>

                    <span className="price-value">
                      {formatPrice(
                        prices.cardmarket
                      )}
                    </span>
                  </div>

                  <div className="browse-item">
                    <span className="price-label">
                      eBay
                    </span>

                    <span className="price-value">
                      {formatPrice(
                        prices.ebay
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 25,
                }}
              >
                {card.tcgplayer?.url && (
                  <a
                    href={
                      card.tcgplayer.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                  >
                    View on TCGplayer ↗
                  </a>
                )}

                {card.cardmarket?.url && (
                  <a
                    href={
                      card.cardmarket.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                  >
                    View on Cardmarket ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            PRICE MOVEMENT
            ============================================================ */}

        <section className="price-movement-panel">
          <div className="price-movement-header">
            <div>
              <p className="eyebrow">
                PRICE MOVEMENT
              </p>

              <h2 className="section-title">
                How the price has changed
              </h2>

              <p className="section-description">
                Change in the combined market
                price compared with the
                previous available snapshot.
              </p>
            </div>
          </div>

          <div className="price-movement-grid">
            <MovementCard
              label="7 Days"
              movement={movement7d}
            />

            <MovementCard
              label="30 Days"
              movement={movement30d}
            />

            <MovementCard
              label="90 Days"
              movement={movement90d}
            />

            <MovementCard
              label="1 Year"
              movement={movement1y}
            />
          </div>

          {!movement7d.hasHistory &&
            !movement30d.hasHistory &&
            !movement90d.hasHistory &&
            !movement1y.hasHistory && (
              <p className="price-movement-note">
                Price movement will appear
                automatically once enough
                historical snapshots have
                been collected.
              </p>
            )}
        </section>

        {/* ============================================================
            PRICE HISTORY CHART
            ============================================================ */}

        <PriceHistoryChart
          history={priceHistory}
        />

        {/* ============================================================
            RECENT EBAY SALES
            ============================================================ */}

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                RECENT SALES
              </p>

              <h2 className="section-title">
                eBay sold prices
              </h2>

              <p className="section-description">
                Recent eBay UK sold
                listings found for
                this card.
              </p>
            </div>
          </div>

          {prices.ebaySales &&
          prices.ebaySales.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {prices.ebaySales.map(
                (
                  sale: EbaySale,
                  index: number
                ) => (
                  <div
                    key={`${sale.title}-${index}`}
                    className="browse-item"
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: 15,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {sale.url ? (
                        <a
                          href={sale.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="browse-name"
                          style={{
                            textDecoration:
                              "none",
                          }}
                        >
                          {sale.title} ↗
                        </a>
                      ) : (
                        <span className="browse-name">
                          {sale.title}
                        </span>
                      )}
                    </div>

                    <strong
                      className="price-value"
                      style={{
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {formatPrice(
                        sale.price
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="loading">
              <p>
                No recent eBay sold
                listings could be
                retrieved.
              </p>

              <p>
                eBay may temporarily
                block automated
                requests or there may
                not be enough matching
                sold listings.
              </p>
            </div>
          )}
        </section>

        {/* ============================================================
            CARD INFORMATION
            ============================================================ */}

        {(card.flavorText ||
          card.evolvesFrom ||
          card.evolvesTo ||
          (card.rules &&
            card.rules.length > 0)) && (
          <section className="section">
            <p className="eyebrow">
              CARD DETAILS
            </p>

            <h2 className="section-title">
              Card information
            </h2>

            {card.flavorText && (
              <p className="section-description">
                {card.flavorText}
              </p>
            )}

            {card.evolvesFrom && (
              <p className="section-description">
                Evolves from:{" "}
                {card.evolvesFrom}
              </p>
            )}

            {card.evolvesTo &&
              card.evolvesTo.length >
                0 && (
                <p className="section-description">
                  Evolves to:{" "}
                  {card.evolvesTo.join(
                    ", "
                  )}
                </p>
              )}

            {card.rules &&
              card.rules.length > 0 && (
                <div
                  style={{
                    marginTop: 15,
                  }}
                >
                  {card.rules.map(
                    (
                      rule: string,
                      index: number
                    ) => (
                      <p
                        key={index}
                        className="section-description"
                      >
                        {rule}
                      </p>
                    )
                  )}
                </div>
              )}
          </section>
        )}

        <footer
          className="site-footer"
          style={{
            marginTop: 30,
          }}
        >
          <p>
            PokePrices — Pokémon Card
            Prices
          </p>
        </footer>
      </main>
    </>
  );
}