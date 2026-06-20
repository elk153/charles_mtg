import "./Card.css";
import IconTurnAround from "../../assets/IconTurnAround";

const Card = ({ card, onSelect }) => {
  const isDoubleFaced = card.layout === "transform" || card.layout === "modal_dfc";

  return (
    <button type="button" className="cardButton" onClick={onSelect}>
      {isDoubleFaced ? (
        <div className="card-flip-outer">
          <div className="card-flip-inner">
            <div className="card-flip-front">
              <img className="card" src={card.card_faces[0].image_uris.normal} alt={card.name} />
            </div>
            <div className="card-flip-back">
              <img className="card" src={card.card_faces[1].image_uris.normal} alt={card.name} />
            </div>
          </div>
          <div className="card-icon">
            <IconTurnAround />
          </div>
        </div>
      ) : (
        <div>
          <img className="card" src={card.image_uris.normal} alt={card.name} />
        </div>
      )}
    </button>
  );
};

export default Card;

