import { useParams, useOutletContext } from "react-router";
import Card from '../../original-card-renderer/Card/Card.jsx';
import "./CardsList.css";

const CardsList = () => {
  const { searchQuery } = useParams();
  const { scryfallCards = [], isLoadingCards = false, onCardSelect } = useOutletContext() ?? {};
  const decodedQuery = searchQuery ? decodeURIComponent(searchQuery) : "";

  if (isLoadingCards) {
    return <div className="cards-list">Loading cards…</div>;
  }

  if (!scryfallCards || scryfallCards.length === 0) {
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
    <div className="cards-list">
      {scryfallCards.map((card) => (
        <Card key={card.id} card={card} onSelect={() => onCardSelect?.(card.id)} />
      ))}
    </div>
  );
};

export default CardsList;
