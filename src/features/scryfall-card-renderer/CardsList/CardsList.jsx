import { Link, useParams } from "react-router";
import Card from '../../original-card-renderer/Card/Card.jsx';
import "./CardsList.css";
import useScryfallCardsSearch from "../../../hooks/useScryfallCardsSearch.jsx";

const CardsList = () => {

  const {searchQuery} = useParams();
  console.log("CardsList.jsx: searchQuery = ", searchQuery);
    const { data: scryfallCards, isLoading: isLoadingCards } = useScryfallCardsSearch("cards/search",searchQuery);
  console.log("CardsList.jsx: scryfallCards = ", scryfallCards);
  
/*
  return (
    <div className="cards-list">
      {cardData.map((card) => (
        <Card key={card.id} card={card} onSelect={() => onCardSelect(card.id)} />
      ))}
    </div>
  )*/
};

export default CardsList;
