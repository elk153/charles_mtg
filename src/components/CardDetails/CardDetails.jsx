import "./CardDetails.css";
import IconClose from "../../assets/IconClose";
import IconTurnAround from "../../assets/IconTurnAround";

const CardDetails = ({ card, cardPrices, cardSymbols, cardRulings }) => {
  if (!card) {
    return null;
  }

  const cardLegalities = Object.entries(card.legalities).reduce(
    (acc, [format, legality]) => {
      if (!acc[legality]) acc[legality] = [];
      acc[legality].push(format);
      return acc;
    }, {});

  const symbolMap = Object.fromEntries(
    cardSymbols.map(s => [s.symbol, s])
  );
  
  const symbolRegex = /\{[^}]+\}/g;

  // when moving to component, look if possible to useMemo somewhere
  function renderOracleText(text) {
    const parts = text.split(symbolRegex);
    const matches = text.match(symbolRegex) || [];

    const result = [];

    for (let i = 0; i < parts.length; i++) {
      result.push(parts[i]);

      if (matches[i]) {
        const symbol = symbolMap[matches[i]];

        if (symbol) {
          result.push(
            <img
              key={`symbol-${i}`}
              src={symbol.svg_uri}
              alt={symbol.english}
              style={{
                width: "1em",
                height: "1em",
                verticalAlign: "text-bottom",
              }}
            />
          );
        }
      }
    }
    
    return result;
  };

  const isDoubleFaced = card.layout === "transform" || card.layout === "modal_dfc";

  return (
    <div className="card-details">

      <div className="card-info oracle-panel-dark corner-got parchment-frame-metallic">
        
        <h2>{card.name}</h2>
        <span><em>{card.type_line}</em></span>
        &nbsp;
        <span className={`rarity-pill rarity__${card.rarity}`}>{card.rarity}</span>
        &nbsp;
        <span className={`color-pill color__${card.color_identity.length === 1 ? card.color_identity[0] : "M"}`}>
          {card.power ? (card.power+"/"+card.toughness) : "N/A"}
        </span>

        <h3>Oracle</h3>
        <ul className="oracle-list">
        <li>{renderOracleText(card.oracle_text)}</li>
        <li><em>{card.flavor_text}</em></li>
        </ul>

        <h3>Rulings</h3>
        <ul className="rulings">
          {cardRulings.length !== 0
          ?
          cardRulings.map(({ source, date, ruling }, index) => (
            <li key={index}>
              {ruling} <em>({source}, {date})</em>
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
              {legality[1].map((format) => (
                <ul className="legalities-list">
                  <li className="rarity-pill rarity__common">{format}</li>
                </ul>
              ))}
            </div>  
          ))}
        </div>
        
      </div>
      
      <div className="card-prints">
        {cardPrices.map(({ id, set, set_name, released_at, collector_number, layout, images }) => {
          const isDoubleFaced = layout === "transform" || layout === "modal_dfc";
          return (
            <div key={id} className="card-print oracle-panel-dark corner-scroll">
              <div className="">
                <h3>{set_name}</h3>
                <p>{set.toUpperCase()+"/"+collector_number+" ("+released_at+")"}</p>
                {cardPrices.filter(card => card.id === id)[0].prices.eur &&
                  <span className="rarity-pill rarity__common">
                    {cardPrices.filter(card => card.id === id)[0].prices.eur} €
                  </span>
                }
                &nbsp;
                {cardPrices.filter(card => card.id === id)[0].prices.eur_foil &&
                  <span className="rarity-pill rarity-pill--foil rarity__common">
                    Foil {cardPrices.filter(card => card.id === id)[0].prices.eur_foil} €
                  </span>
                }
              </div>
              &nbsp;

              {isDoubleFaced ? (
                <div className="card-flip-outer">
                  <div className="card-flip-inner">
                    <div className="card-flip-front">
                      <img className="card" src={images[0]} alt={`${set} print front`} />
                    </div>
                    <div className="card-flip-back">
                      <img className="card" src={images[1]} alt={`${set} print back`} />
                    </div>
                  </div>
                  <div className="card-icon">
                    <IconTurnAround />
                  </div>
                </div>
              ) : (
                <img className="card" src={images[0]} alt={`${set} print`} />
              )}
              &nbsp;
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardDetails;
