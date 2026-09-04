import Link from "next/link";

import {
  getRarities
} from "@/lib/pokemon";

export const dynamic = "force-dynamic";

export default async function RaritiesPage() {
  const rarities = await getRarities();

  return (
    <main className="page-shell">

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


      <section className="page-hero">

        <div className="container">

          <p className="eyebrow">
            POKÉMON TCG DATABASE
          </p>

          <h1>
            Card Rarities
          </h1>

          <p className="hero-subtitle">
            Browse Pokémon cards by rarity.
          </p>

        </div>

      </section>


      <section className="container content-section">

        {rarities.length === 0 ? (

          <div className="loading">
            <p>
              Unable to load rarities.
            </p>

            <p>
              Please try again shortly.
            </p>
          </div>

        ) : (

          <div className="rarity-grid">

            {rarities.map((rarity) => (

              <Link
                key={rarity}
                href={`/cards?rarity=${encodeURIComponent(
                  rarity
                )}`}
                className="rarity-card"
              >

                <span className="rarity-icon">
                  ✦
                </span>

                <span className="rarity-name">
                  {rarity}
                </span>

                <span className="rarity-arrow">
                  →
                </span>

              </Link>

            ))}

          </div>

        )}

      </section>


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