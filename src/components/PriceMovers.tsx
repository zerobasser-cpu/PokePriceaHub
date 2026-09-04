"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  PriceMover,
} from "@/lib/database";


type Period =
  | "7d"
  | "30d"
  | "90d"
  | "1y";


type Props = {
  data: Record<
    Period,
    {
      gainers: PriceMover[];
      losers: PriceMover[];
    }
  >;
};


/*
============================================================
FORMAT HELPERS
============================================================
*/

function formatMoney(
  value: number
): string {
  return `£${value.toFixed(2)}`;
}


function formatPercentage(
  value: number
): string {
  const sign =
    value > 0
      ? "+"
      : "";

  return `${sign}${value.toFixed(2)}%`;
}


function formatChange(
  value: number
): string {
  const sign =
    value > 0
      ? "+"
      : "";

  return `${sign}£${Math.abs(value).toFixed(2)}`;
}


function formatDate(
  value: string
): string {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


/*
============================================================
MOVER CARD
============================================================
*/

function MoverCard({
  mover,
  type,
  position,
}: {
  mover: PriceMover;
  type: "gainer" | "loser";
  position: number;
}) {
  const card =
    mover.card;

  const image =
    card.images?.small ||
    card.image_small ||
    card.images?.large ||
    card.image_large ||
    "/images/card-placeholder.png";

  return (
    <Link
      href={`/card/${encodeURIComponent(card.id)}`}
      className={`price-mover-card ${type}`}
    >

      <div className="price-mover-rank">
        #{position}
      </div>


      <div className="price-mover-image">

        <img
          src={image}
          alt={card.name}
          loading="lazy"
        />

      </div>


      <div className="price-mover-info">

        <h3>
          {card.name}
        </h3>


        <p className="price-mover-set">
          {card.set?.name ||
            "Pokémon TCG"}
        </p>


        <div className="price-mover-price">
          {formatMoney(
            mover.current
          )}
        </div>


        <div className="price-mover-change">

          <span>
            {type === "gainer"
              ? "▲"
              : "▼"}
          </span>

          {formatChange(
            mover.change
          )}

          <strong>
            {formatPercentage(
              mover.percentage
            )}
          </strong>

        </div>


        <p className="price-mover-history">
          From{" "}
          {formatMoney(
            mover.previous
          )}{" "}
          on{" "}
          {formatDate(
            mover.previousDate
          )}
        </p>

      </div>

    </Link>
  );
}


/*
============================================================
MOVER COLUMN
============================================================
*/

function MoverColumn({
  title,
  icon,
  movers,
  type,
}: {
  title: string;
  icon: string;
  movers: PriceMover[];
  type: "gainer" | "loser";
}) {
  return (
    <div
      className={`price-movers-column ${type}`}
    >

      <div className="price-movers-column-header">

        <div>

          <span className="price-movers-column-icon">
            {icon}
          </span>


          <div>

            <h3>
              {title}
            </h3>

            <p>
              {type === "gainer"
                ? "Cards with the strongest price increases"
                : "Cards with the strongest price decreases"}
            </p>

          </div>

        </div>

      </div>


      {movers.length === 0 ? (

        <div className="price-movers-empty">

          <span>
            📊
          </span>

          <p>
            Not enough price history yet.
          </p>

        </div>

      ) : (

        <div className="price-movers-list">

          {movers.map(
            (
              mover,
              index
            ) => (

              <MoverCard
                key={
                  mover.card.id
                }
                mover={mover}
                type={type}
                position={
                  index + 1
                }
              />

            )
          )}

        </div>

      )}

    </div>
  );
}


/*
============================================================
PRICE MOVERS
============================================================
*/

export default function PriceMovers({
  data,
}: Props) {
  const [
    period,
    setPeriod,
  ] =
    useState<Period>(
      "7d"
    );

  const current =
    data[period];

  const periods: Array<{
    id: Period;
    label: string;
  }> = [
    {
      id: "7d",
      label: "7D",
    },

    {
      id: "30d",
      label: "30D",
    },

    {
      id: "90d",
      label: "90D",
    },

    {
      id: "1y",
      label: "1Y",
    },
  ];


  const periodText =
    period === "7d"
      ? "7 days"
      : period === "30d"
        ? "30 days"
        : period === "90d"
          ? "90 days"
          : "1 year";


  return (
    <section className="price-movers-section">

      <div className="price-movers-heading">

        <div>

          <p className="eyebrow">
            MARKET MOVEMENT
          </p>

          <h2>
            Biggest Gainers &amp; Losers
          </h2>

          <p>
            See which Pokémon cards have
            moved the most in price.
          </p>

        </div>


        <div
          className="price-movers-periods"
          role="tablist"
          aria-label="Price movement period"
        >

          {periods.map(
            (item) => (

              <button
                key={
                  item.id
                }
                type="button"
                className={
                  period ===
                  item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPeriod(
                    item.id
                  )
                }
                role="tab"
                aria-selected={
                  period ===
                  item.id
                }
              >
                {item.label}
              </button>

            )
          )}

        </div>

      </div>


      <div className="price-movers-date">

        Comparing the latest available
        price with the price recorded
        approximately{" "}
        {periodText}{" "}
        earlier.

      </div>


      <div className="price-movers-grid">

        <MoverColumn
          title="Biggest Gainers"
          icon="📈"
          movers={
            current.gainers
          }
          type="gainer"
        />


        <MoverColumn
          title="Biggest Losers"
          icon="📉"
          movers={
            current.losers
          }
          type="loser"
        />

      </div>

    </section>
  );
}