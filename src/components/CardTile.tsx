import Link from "next/link";
import type { PokemonCard } from "@/lib/types";

type Props = {
  card: PokemonCard;
  marketPrice?: number | null;
};

function formatPrice(value: number | null | undefined) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `£${value.toFixed(2)}`;
}

export default function CardTile({
  card,
  marketPrice = null
}: Props) {
  return (
    <Link
      href={`/card/${encodeURIComponent(card.id)}`}
      className="card-tile"
    >
      <div className="card-image-wrapper">
        {card.images?.large ? (
          <img
            src={card.images.large}
            alt={`${card.name} Pokémon card`}
            className="card-image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="loading">
            No image
          </div>
        )}
      </div>

      <div className="card-info">
        <h3 className="card-name">
          {card.name}
        </h3>

        <p className="card-set">
          {card.set?.name ?? "Unknown set"}

          {card.number
            ? ` #${card.number}`
            : ""}
        </p>

        {card.rarity && (
          <p className="card-set">
            {card.rarity}
          </p>
        )}

        <div className="card-price">
          <span className="price-label">
            Market
          </span>

          <span className="price-value">
            {formatPrice(marketPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}