import Link from "next/link";

import SearchBar from "@/components/SearchBar";
import Filters from "@/components/Filters";
import CardGrid from "@/components/CardGrid";

import {
  getFilterOptions,
  searchCards,
} from "@/lib/pokemon";

import { calculatePrices } from "@/lib/pricing";

type SearchParams = {
  q?: string;
  search?: string;

  set?: string;
  setId?: string;

  rarity?: string;
  type?: string;
  supertype?: string;

  page?: string;
};

export const dynamic = "force-dynamic";

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const query =
    typeof params.search === "string"
      ? params.search
      : typeof params.q === "string"
        ? params.q
        : "";

  const setId =
    typeof params.setId === "string"
      ? params.setId
      : typeof params.set === "string"
        ? params.set
        : "";

  const rarity =
    typeof params.rarity === "string"
      ? params.rarity
      : "";

  const type =
    typeof params.type === "string"
      ? params.type
      : "";

  const supertype =
    typeof params.supertype === "string"
      ? params.supertype
      : "";

  const requestedPage = Number(
    params.page ?? "1"
  );

  const page =
    Number.isFinite(requestedPage) &&
    requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  const [
    filterOptions,
    searchResults,
  ] = await Promise.all([
    getFilterOptions(),

    searchCards({
      search: query,
      setId,
      rarity,
      type,
      supertype,
      page,
      pageSize: 24,
    }),
  ]);

  const cardsWithPrices =
    await Promise.all(
      searchResults.data.map(
        async (card) => {
          try {
            const prices =
              await calculatePrices(card);

            return {
              card,
              marketPrice:
                prices.average,
            };
          } catch {
            return {
              card,
              marketPrice: null,
            };
          }
        }
      )
    );

  const totalPages = Math.max(
    1,
    Math.ceil(
      searchResults.totalCount /
        searchResults.pageSize
    )
  );

  function createPageUrl(
    nextPage: number
  ) {
    const url =
      new URLSearchParams();

    if (query) {
      url.set("search", query);
    }

    if (setId) {
      url.set("setId", setId);
    }

    if (rarity) {
      url.set("rarity", rarity);
    }

    if (type) {
      url.set("type", type);
    }

    if (supertype) {
      url.set("supertype", supertype);
    }

    url.set(
      "page",
      String(nextPage)
    );

    return `/cards?${url.toString()}`;
  }

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

            <span>PokePrices</span>
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

      <main className="container">
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                CARD DATABASE
              </p>

              <h1 className="section-title">
                Pokémon Cards
              </h1>

              <p className="section-description">
                Search and filter the PokePrices
                Pokémon TCG card database.
              </p>
            </div>
          </div>

          <SearchBar
            initialQuery={query}
          />

          <form
            action="/cards"
            method="GET"
            style={{ marginTop: 15 }}
          >
            <Filters
              sets={filterOptions.sets}
              rarities={
                filterOptions.rarities
              }
              types={filterOptions.types}
              selectedSet={setId}
              selectedRarity={rarity}
              selectedType={type}
              searchQuery={query}
            />
          </form>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                RESULTS
              </p>

              <h2 className="section-title">
                {query
                  ? `Search results for "${query}"`
                  : "All Pokémon Cards"}
              </h2>

              <p className="section-description">
                Showing{" "}
                {searchResults.data.length}{" "}
                of{" "}
                {searchResults.totalCount}{" "}
                cards
              </p>
            </div>
          </div>

          {searchResults.data.length === 0 ? (
            <div className="loading">
              <p>
                No cards found matching your
                filters.
              </p>

              <p style={{ marginTop: 10 }}>
                Try another Pokémon name or
                change your filters.
              </p>

              <div
                style={{
                  marginTop: 18,
                }}
              >
                <Link
                  href="/cards"
                  className="nav-link"
                >
                  Clear all filters
                </Link>
              </div>
            </div>
          ) : (
            <>
              <CardGrid
                cards={cardsWithPrices}
              />

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 30,
                    flexWrap: "wrap",
                  }}
                >
                  {page > 1 && (
                    <Link
                      href={createPageUrl(
                        page - 1
                      )}
                      className="nav-link"
                    >
                      ← Previous
                    </Link>
                  )}

                  <span className="section-description">
                    Page {page} of{" "}
                    {totalPages}
                  </span>

                  {page <
                    totalPages && (
                    <Link
                      href={createPageUrl(
                        page + 1
                      )}
                      className="nav-link"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

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