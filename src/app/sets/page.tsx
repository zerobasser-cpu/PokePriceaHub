import Link from "next/link";

import {
  getFilterOptions,
} from "@/lib/pokemon";

export const dynamic = "force-dynamic";

export default async function SetsPage() {
  const filterOptions = await getFilterOptions();

  const sets = filterOptions.sets ?? [];

  return (
    <main className="page-shell">

      {/* ==================================================
          HEADER
      ================================================== */}

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
          </nav>

        </div>
      </header>


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="page-hero">
        <div className="container">

          <p className="eyebrow">
            POKÉMON TCG DATABASE
          </p>

          <h1>
            Pokémon Card Sets
          </h1>

          <p className="hero-subtitle">
            Browse Pokémon cards by set.
          </p>

        </div>
      </section>


      {/* ==================================================
          SETS
      ================================================== */}

      <section className="container content-section">

        {sets.length === 0 ? (

          <div className="loading">

            <p>
              Unable to load card sets.
            </p>

            <p>
              Please try again shortly.
            </p>

          </div>

        ) : (

          <div className="set-grid">

            {sets.map((set) => {

              /*
               * Sets normally come from the database/API
               * as objects containing:
               *
               *   id
               *   name
               *
               * Some fallback data may still be simple
               * strings, so handle both safely.
               */

              const setValue =
                typeof set === "string"
                  ? set
                  : set.id;

              const setName =
                typeof set === "string"
                  ? set
                  : set.name;

              /*
               * IMPORTANT:
               *
               * Use setId because the cards database filters
               * cards using:
               *
               *     cards.set_id
               *
               * This ensures the value passed to /cards is
               * the actual database set ID.
               */

              return (
                <Link
                  key={setValue}
                  href={`/cards?setId=${encodeURIComponent(
                    setValue
                  )}`}
                  className="set-card"
                >

                  <span className="set-name">
                    {setName}
                  </span>

                  <span className="set-arrow">
                    →
                  </span>

                </Link>
              );

            })}

          </div>

        )}

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

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