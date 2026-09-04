import type { PokemonCard } from "@/lib/types";
import CardTile from "./CardTile";

type CardWithPrice = {
  card: PokemonCard;
  marketPrice: number | null;
};

type Props = {
  cards: CardWithPrice[];
};

export default function CardGrid({
  cards
}: Props) {
  if (!cards.length) {
    return (
      <div className="loading">
        <p>
          No cards found.
        </p>

        <p>
          Try another Pokémon name or change your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {cards.map(
        ({ card, marketPrice }) => (
          <CardTile
            key={card.id}
            card={card}
            marketPrice={marketPrice}
          />
        )
      )}
    </div>
  );
}