import Link from "next/link";

import {
  getFilterOptions,
  getRarestCards,
  getCardImageSmall,
} from "@/lib/pokemon";

import {
  getBiggestPriceMovers,
} from "@/lib/database";

import PriceMovers from "@/components/PriceMovers";


export const dynamic = "force-dynamic";


export default async function HomePage() {

  /*
  ============================================================
  LOAD HOMEPAGE DATA
  ============================================================
  */

  const [
    filterOptions,
    rareCards,
    movers7d,
    movers30d,
    movers90d,
    movers1y,
  ] =
    await Promise.all([

      getFilterOptions(),

      getRarestCards(12),

      getBiggestPriceMovers(
        7,
        5
      ),

      getBiggestPriceMovers(
        30,
        5
      ),

      getBiggestPriceMovers(
        90,
        5
      ),

      getBiggestPriceMovers(
        365,
        5
      ),

    ]);


  const sets =
    filterOptions.sets ?? [];


  /*
  ============================================================
  HOMEPAGE STATS
  ============================================================
  */

  const totalSets =
    sets.length;


  const totalRareCards =
    rareCards.length;


  const totalMovers =
    movers7d.gainers.length +
    movers7d.losers.length;


  return (
    <main className="page-shell">

      {/* ====================================================
          HEADER
          ==================================================== */}

      <header className="site-header">

        <div className="container header-inner">

          <Link
            href="/"
            className="brand"
          >

            <span className="brand-ball">
              ◉
            </span>

            <span>
              PokePrices
            </span>

          </Link>


          <nav className="main-nav">

            <Link href="/">
              Home
            </Link>

            <Link href="/cards">
              Cards
            </Link>

            <Link href="/rarities">
              Rarities
            </Link>

            <a href="/deck-matchup-forecast.html">
              Deck Tester
            </a>

          </nav>

        </div>

      </header>


      {/* ====================================================
          HERO / SEARCH
          ==================================================== */}

      <section className="home-hero">

        <div className="container home-hero-inner">

          <p className="eyebrow">
            POKÉMON TCG PRICE DATABASE
          </p>


          <h1>

            Find the value of your

            <span>
              {" "}Pokémon cards.
            </span>

          </h1>


          <p className="hero-subtitle">
            Search thousands of Pokémon TCG
            cards, explore sets, rarities and
            card prices.
          </p>


          <form
            action="/cards"
            method="GET"
            className="home-search"
          >

            <div className="home-search-box">

              <span className="home-search-icon">
                🔎
              </span>


              <input
                type="search"
                name="search"
                placeholder="Search for a Pokémon card..."
                aria-label="Search for a Pokémon card"
                autoComplete="off"
              />


              <button type="submit">
                Search
              </button>

            </div>

          </form>


          <div className="home-search-links">

            <span>
              Try:
            </span>


            <Link href="/cards?search=Charizard">
              Charizard
            </Link>


            <Link href="/cards?search=Pikachu">
              Pikachu
            </Link>


            <Link href="/cards?search=Umbreon">
              Umbreon
            </Link>


            <Link href="/cards?search=Gengar">
              Gengar
            </Link>

          </div>

        </div>

      </section>


      {/* ====================================================
          MARKET OVERVIEW
          ==================================================== */}

      <section className="container home-market-overview">

        <div className="market-overview-heading">

          <div>

            <p className="eyebrow">
              MARKET OVERVIEW
            </p>

            <h2>
              Pokémon Card Market
            </h2>

            <p>
              Explore cards, sets and recent
              price movements across PokePrices.
            </p>

          </div>

        </div>


        <div className="market-overview-grid">

          <Link
            href="/cards"
            className="market-stat-card"
          >

            <span className="market-stat-icon">
              🃏
            </span>

            <span className="market-stat-content">

              <strong>
                Card Database
              </strong>

              <small>
                Search Pokémon cards
              </small>

            </span>

            <span className="market-stat-arrow">
              →
            </span>

          </Link>


          <Link
            href="/sets"
            className="market-stat-card"
          >

            <span className="market-stat-icon">
              📦
            </span>

            <span className="market-stat-content">

              <strong>
                {totalSets}
              </strong>

              <small>
                Sets available
              </small>

            </span>

            <span className="market-stat-arrow">
              →
            </span>

          </Link>


          <Link
            href="/rarities"
            className="market-stat-card"
          >

            <span className="market-stat-icon">
              💎
            </span>

            <span className="market-stat-content">

              <strong>
                {totalRareCards}
              </strong>

              <small>
                Rare cards highlighted
              </small>

            </span>

            <span className="market-stat-arrow">
              →
            </span>

          </Link>


          <div className="market-stat-card">

            <span className="market-stat-icon">
              📊
            </span>

            <span className="market-stat-content">

              <strong>
                {totalMovers}
              </strong>

              <small>
                7D price movers tracked
              </small>

            </span>

            <span className="market-stat-arrow">
              ↗
            </span>

          </div>

        </div>

      </section>


      {/* ====================================================
          QUICK LINKS
          ==================================================== */}

      <section className="container home-quick-links">


        <Link
          href="/cards"
          className="quick-link"
        >

          <span className="quick-link-icon">
            🃏
          </span>


          <span>

            <strong>
              Browse Cards
            </strong>

            <small>
              Search the full card database
            </small>

          </span>


          <span className="quick-link-arrow">
            →
          </span>

        </Link>


        <Link
          href="/sets"
          className="quick-link"
        >

          <span className="quick-link-icon">
            📦
          </span>


          <span>

            <strong>
              Browse Sets
            </strong>

            <small>
              Explore Pokémon TCG expansions
            </small>

          </span>


          <span className="quick-link-arrow">
            →
          </span>

        </Link>


        <Link
          href="/rarities"
          className="quick-link"
        >

          <span className="quick-link-icon">
            ⭐
          </span>


          <span>

            <strong>
              Browse Rarities
            </strong>

            <small>
              Find rare and valuable cards
            </small>

          </span>


          <span className="quick-link-arrow">
            →
          </span>

        </Link>


        <Link
          href="/deck-matchup-forecast.html"
          className="quick-link"
        >

          <span className="quick-link-icon">
            ⚔️
          </span>


          <span>

            <strong>
              Deck Tester
            </strong>

            <small>
              Test two Pokémon decks
              against each other
            </small>

          </span>


          <span className="quick-link-arrow">
            →
          </span>

        </Link>


      </section>


      {/* ====================================================
          RARE CARDS
          ==================================================== */}

      <section className="container content-section">

        <div className="section-heading">

          <div>

            <p className="eyebrow">
              COLLECTOR HIGHLIGHTS
            </p>


            <h2>
              Rare Pokémon Cards
            </h2>


            <p>
              Explore some of the rarest
              cards in the PokePrices database.
            </p>

          </div>


          <Link
            href="/cards"
            className="section-link"
          >
            View all cards →
          </Link>

        </div>


        {rareCards.length === 0 ? (

          <div className="loading">

            <p>
              Unable to load cards right now.
            </p>

          </div>

        ) : (

          <div className="home-card-grid">

            {rareCards.map(
              (card) => (

                <Link
                  key={card.id}
                  href={`/card/${encodeURIComponent(card.id)}`}
                  className="home-card"
                >

                  <div className="home-card-image">

                    <img
                      src={getCardImageSmall(card)}
                      alt={card.name}
                      loading="lazy"
                    />

                  </div>


                  <div className="home-card-info">

                    <h3>
                      {card.name}
                    </h3>


                    <p>
                      {card.set?.name ||
                        "Pokémon TCG"}
                    </p>


                    <div className="home-card-meta">

                      {card.rarity && (

                        <span>
                          {card.rarity}
                        </span>

                      )}


                      {card.number && (

                        <span>
                          #{card.number}
                        </span>

                      )}

                    </div>

                  </div>

                </Link>

              )
            )}

          </div>

        )}

      </section>


      {/* ====================================================
          PRICE MOVERS
          ==================================================== */}

      <div className="container">

        <PriceMovers
          data={{

            "7d":
              movers7d,

            "30d":
              movers30d,

            "90d":
              movers90d,

            "1y":
              movers1y,

          }}
        />

      </div>


      {/* ====================================================
          SETS
          ==================================================== */}

      <section className="container content-section">

        <div className="section-heading">

          <div>

            <p className="eyebrow">
              EXPANSIONS
            </p>


            <h2>
              Pokémon Card Sets
            </h2>


            <p>
              Browse cards from your
              favourite Pokémon TCG sets.
            </p>

          </div>


          <Link
            href="/sets"
            className="section-link"
          >
            View all sets →
          </Link>

        </div>


        {sets.length > 0 ? (

          <div className="home-set-grid">

            {sets
              .slice(0, 12)
              .map(
                (set) => (

                  <Link
                    key={set.id}
                    href={`/cards?setId=${encodeURIComponent(set.id)}`}
                    className="home-set-card"
                  >

                    <span className="home-set-name">
                      {set.name}
                    </span>


                    {set.series && (

                      <span className="home-set-series">
                        {set.series}
                      </span>

                    )}


                    <span className="home-set-arrow">
                      →
                    </span>

                  </Link>

                )
              )}

          </div>

        ) : (

          <div className="loading">

            <p>
              No sets available right now.
            </p>

          </div>

        )}

      </section>


      {/* ====================================================
          FOOTER
          ==================================================== */}

      <footer className="site-footer">

        <div className="container">

          <p>
            PokePrices — Pokémon Card Prices
          </p>

        </div>

      </footer>

    </main>
  );
}
