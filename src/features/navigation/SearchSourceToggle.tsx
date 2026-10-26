import type { SearchSource } from "./types.ts";
import "./SearchSourceToggle.css";

type SearchSourceToggleProps = {
  value: SearchSource;
  onToggle: () => void;
};

export default function SearchSourceToggle({
  value,
  onToggle,
}: SearchSourceToggleProps) {
  const isCollection = value === "collection";

  return (
    <button
      type="button"
      className="nav-source-toggle"
      role="switch"
      aria-checked={isCollection}
      aria-label="Search personal collection"
      title={`Search source: ${isCollection ? "personal collection" : "Scryfall"}`}
      onClick={onToggle}
    >
      <span className="nav-source-toggle__label">
        {isCollection ? "Collection" : "Scryfall"}
      </span>
      <span className="nav-source-toggle__track" aria-hidden="true">
        <span className="nav-source-toggle__thumb" />
      </span>
    </button>
  );
}
