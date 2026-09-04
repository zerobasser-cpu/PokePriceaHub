type Props = {
  initialQuery?: string;
};

export default function SearchBar({ initialQuery = "" }: Props) {
  return (
    <form action="/cards" method="GET" className="search-wrapper">
      <span className="search-icon">🔎</span>

      <input
        className="search-box"
        name="q"
        type="search"
        defaultValue={initialQuery}
        placeholder="Search Charizard, Pikachu, Obsidian Flames..."
        autoComplete="off"
      />

      <button
        type="submit"
        className="filter"
        aria-label="Search cards"
      >
        Search
      </button>
    </form>
  );
}