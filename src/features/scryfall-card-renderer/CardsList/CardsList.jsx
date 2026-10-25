import { useParams, useOutletContext } from "react-router";
import Card from '../../original-card-renderer/Card/Card.jsx';
import CardFilters from "../../card-filters/CardFilters.tsx";
import { useCardsTable } from "../../card-filters/useCardsTable.ts";
import "./CardsList.css";

const CardsList = () => {
  const { searchQuery } = useParams();
  const { scryfallCards, isLoadingCards = false, onCardSelect } = useOutletContext() ?? {};
  const decodedQuery = searchQuery ? decodeURIComponent(searchQuery) : "";

  // Hooks must run on every render, before any early return.
  const { table, filters, setFilters, resetFilters } = useCardsTable(scryfallCards);
  const rows = table.getRowModel().rows;
  const total = scryfallCards?.length ?? 0;

  if (isLoadingCards) {
    return <div className="cards-list">Loading cards…</div>;
  }

  if (total === 0) {
    return (
      <div className="cards-list">
        {decodedQuery ? (
          <p>No cards found for <strong>{decodedQuery}</strong>.</p>
        ) : (
          <p>Search for a card to display results.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <CardFilters
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
        shown={rows.length}
        total={total}
      />
      <div className="cards-list">
        {rows.length === 0 && <p>No cards match these filters.</p>}
        {rows.map((row) => (
          <Card key={row.original.id} card={row.original} onSelect={() => onCardSelect?.(row.original.id)} />
        ))}
      </div>
    </>
  );
};

export default CardsList;
