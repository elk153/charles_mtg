import { useMemo } from "react";
import CardRenderer from "../CardRenderer";
import "./CardOverlay.css";
import IconTurnAround from "../../../assets/IconTurnAround";
import useFetchUrl from "../../../hooks/useFetchUrl.js";
import OracleText from "../components/OracleText.jsx";

const CardOverlay = ({ card, onSelect }) => {
  
  const { data: scryfallRulings,} = useFetchUrl("cardRulings", card?.rulings_uri)
  const { data: scryfallPrints,} = useFetchUrl("cardPrints", card?.prints_search_uri)
  
  const prints = useMemo(() => scryfallPrints || [], [scryfallPrints]);

  const printsReady = useMemo(() => {
    if (!prints || prints.length === 0) return false;
    return prints.every((p) => {
      const hasSingleImage = Boolean(p.image_uris && p.image_uris.normal);
      const hasFaces = Boolean(p.card_faces && p.card_faces.length > 0);
      const facesHaveImages = hasFaces && p.card_faces.every((f) => f.image_uris && f.image_uris.normal);
      return hasSingleImage || facesHaveImages;
    });
  }, [prints]);

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

        <CardRenderer card={card} />
        
        <h3>Rulings</h3>
        <ul className="rulings">
          {scryfallRulings?.length > 0
          ?
          scryfallRulings.map(({ source, published_at, comment }, index) => (
            <li key={index}>
              <OracleText text={comment} Component="span" /> <em>({source}, {published_at})</em>
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
        {!scryfallPrints ? (
          <div className="prints-loading">Loading prints…</div>
        ) : !printsReady ? (
          <div className="prints-loading">Preparing prints…</div>
        ) : (
          prints.map((cardPrint) => {
          //const isDoubleFaced = (cardPrint.card_faces ? true : false);
            const isDoubleFaced = cardPrint.layout === "transform" || cardPrint.layout === "modal_dfc" || (cardPrint.card_faces && cardPrint.card_faces.length > 1);

            const priceInfo = (scryfallPrints || []).find((p) => p.id === cardPrint.id)?.prices || {};

            return (
              <div key={cardPrint.id} className="card-print oracle-panel-dark corner-scroll">
                <div className="">
                  <h3>{cardPrint.set_name}</h3>
                  <p>{cardPrint.set?.toUpperCase() + "/" + cardPrint.collector_number + " (" + cardPrint.released_at + ")"}</p>
                  {priceInfo?.eur && (
                    <span className="rarity-pill rarity__common">{priceInfo.eur} €</span>
                  )}
                  &nbsp;
                  {priceInfo?.eur_foil && (
                    <span className="rarity-pill rarity-pill--foil rarity__common">Foil {priceInfo.eur_foil} €</span>
                  )}
                </div>
                &nbsp;

                <button type="button" className="cardButton" onClick={onSelect}>
                  {isDoubleFaced ? (
                    <div className="card-flip-outer">
                      <div className="card-flip-inner">
                        <div className="card-flip-front">
                          {cardPrint.card_faces?.[0]?.image_uris?.normal ? (
                            <img className="card" src={cardPrint.card_faces[0].image_uris.normal} alt={`${cardPrint.set} print front`} />
                          ) : <div className="card-placeholder">No image</div>}
                        </div>
                        <div className="card-flip-back">
                          {cardPrint.card_faces?.[1]?.image_uris?.normal ? (
                            <img className="card" src={cardPrint.card_faces[1].image_uris.normal} alt={`${cardPrint.set} print back`} />
                          ) : <div className="card-placeholder">No image</div>}
                        </div>
                      </div>
                      <div className="card-icon">
                        <IconTurnAround />
                      </div>
                    </div>
                  ) : (
                    (cardPrint.image_uris?.normal) ? (
                      <img className="card" src={cardPrint.image_uris.normal} alt={`${cardPrint.set} print`} />
                    ) : (
                      <div className="card-placeholder">No image</div>
                    )
                  )}
                </button>
                &nbsp;
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CardOverlay;
