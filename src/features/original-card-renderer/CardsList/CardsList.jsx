import Card from "../Card/Card";
import "./CardsList.css";

const CardsListProp = ({ cardData, onCardSelect }) => (
  <div className="cards-list">
    {cardData.map((card) => (
      <Card key={card.id} card={card} onSelect={() => onCardSelect(card.id)} />
    ))}
  </div>
);

export default CardsListProp;
