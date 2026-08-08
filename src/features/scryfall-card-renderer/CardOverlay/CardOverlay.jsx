import useOracleText from "../../../hooks/useOracleText";
import CardRenderer from "../CardRenderer";
import "./CardOverlay.css";
import IconTurnAround from "../../../assets/IconTurnAround";

const CardOverlay = ({ card, cardPrints, cardSymbols, cardRulings, onSelect }) => {
  if (!card) {
    return null;
  }

  const cardLegalities = Object.entries(card.legalities).reduce(
    (acc, [format, legality]) => {
      if (!acc[legality]) acc[legality] = [];
      acc[legality].push(format);
      return acc;
    }, {});

  return (
    <div className="card-details">

      <div className="card-overlay-info oracle-panel-dark corner-got parchment-frame-metallic">

        <CardRenderer card={card} cardSymbols={cardSymbols} />
        
        <h3>Rulings</h3>
        <ul className="rulings">
          {cardRulings?.length > 0
          ?
          cardRulings.map(({ source, published_at, comment }, index) => (
            <li key={index}>
              {useOracleText(comment,cardSymbols)} <em>({source}, {published_at})</em>
            </li>
          ))
          :
          <li><em>None</em></li>
        }
        </ul>

        <h3>Legalities</h3>
        <div className="legalities-container">
          {Object.entries(cardLegalities).map((legality, key) => (
            <div key={key}>
              <span>{legality[0].replace("_"," ").toUpperCase()}</span>
              {legality[1].map((format, key) => (
                <ul key={`ul-${key}`} className="legalities-list">
                  <li className="rarity-pill rarity__common">{format}</li>
                </ul>
              ))}
            </div>  
          ))}
        </div>
        
      </div>
      
      <div className="card-prints">
        {cardPrints?.map((cardPrint) => {
          //const isDoubleFaced = (cardPrint.card_faces ? true : false);
          const isDoubleFaced = cardPrint.layout === "transform" || cardPrint.layout === "modal_dfc";
          return (
            <div key={cardPrint.id} className="card-print oracle-panel-dark corner-scroll">
              <div className="">
                <h3>{cardPrint.set_name}</h3>
                <p>{cardPrint.set.toUpperCase()+"/"+cardPrint.collector_number+" ("+cardPrint.released_at+")"}</p>
                {cardPrints.filter(card => card.id === cardPrint.id)[0].prices.eur &&
                  <span className="rarity-pill rarity__common">
                    {cardPrints.filter(card => card.id === cardPrint.id)[0].prices.eur} €
                  </span>
                }
                &nbsp;
                {cardPrints.filter(card => card.id === cardPrint.id)[0].prices.eur_foil &&
                  <span className="rarity-pill rarity-pill--foil rarity__common">
                    Foil {cardPrints.filter(card => card.id === cardPrint.id)[0].prices.eur_foil} €
                  </span>
                }
              </div>
              &nbsp;

              <button type="button" className="cardButton" onClick={onSelect}>
                {isDoubleFaced ? (
                  <div className="card-flip-outer">
                    <div className="card-flip-inner">
                      <div className="card-flip-front">
                        <img className="card" src={cardPrint.card_faces[0].image_uris.normal} alt={`${cardPrint.set} print front`} />
                      </div>
                      <div className="card-flip-back">
                        <img className="card" src={cardPrint.card_faces[1].image_uris.normal} alt={`${cardPrint.set} print back`} />
                      </div>
                    </div>
                    <div className="card-icon">
                      <IconTurnAround />
                    </div>
                  </div>
                ) : (
                  <img className="card" src={cardPrint.image_uris.normal} alt={`${cardPrint.set} print`} />
                )}
              </button>
              &nbsp;
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardOverlay;
