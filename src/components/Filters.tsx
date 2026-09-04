import type { CardSet } from "@/lib/types";

type Props = {
  sets: CardSet[];
  rarities: string[];
  types: string[];
  selectedSet?: string;
  selectedRarity?: string;
  selectedType?: string;
  searchQuery?: string;
};

export default function Filters({
  sets,
  rarities,
  types,
  selectedSet = "",
  selectedRarity = "",
  selectedType = "",
  searchQuery = "",
}: Props) {
  return (
    <div className="filters">
      <select
        name="setId"
        defaultValue={selectedSet}
        className="filter"
        aria-label="Filter by set"
      >
        <option value="">All sets</option>

        {sets.map((set) => (
          <option
            key={set.id}
            value={set.id}
          >
            {set.name}
          </option>
        ))}
      </select>

      <select
        name="rarity"
        defaultValue={selectedRarity}
        className="filter"
        aria-label="Filter by rarity"
      >
        <option value="">All rarities</option>

        {rarities.map((rarity) => (
          <option
            key={rarity}
            value={rarity}
          >
            {rarity}
          </option>
        ))}
      </select>

      <select
        name="type"
        defaultValue={selectedType}
        className="filter"
        aria-label="Filter by type"
      >
        <option value="">All types</option>

        {types.map((type) => (
          <option
            key={type}
            value={type}
          >
            {type}
          </option>
        ))}
      </select>

      {searchQuery && (
        <input
          type="hidden"
          name="search"
          value={searchQuery}
        />
      )}

      <button
        type="submit"
        className="filter"
      >
        Apply filters
      </button>

      <a
        href="/cards"
        className="filter"
        style={{
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Clear Filters
      </a>
    </div>
  );
}