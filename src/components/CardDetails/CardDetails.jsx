import "./CardDetails.css";
import IconClose from "../../assets/IconClose";
import IconTurnAround from "../../assets/IconTurnAround";

const CardDetails = ({ card, cardPrices, cardRulings }) => {
  if (!card) {
    return null;
  }
  console.log("cardPrices:");
  console.log(cardPrices);

  const isDoubleFaced = card.layout === "transform" || card.layout === "modal_dfc";

  return (
    <div className="card-details">

      <div className="card-info oracle-panel-dark corner-got parchment-frame-metallic">
        
        <h2>{card.name}</h2>
        <span><em>{card.type_line} &nbsp;</em></span><span className={`rarity-pill rarity__${card.rarity}`}>{card.rarity}</span>

        <h3>Oracle</h3>
        <ul className="oracle-list">
        <li>{card.oracle_text}</li>
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

        <h3>Legality</h3>
        <ul>
          {Object.entries(card.legalities).map(([format, legality]) => (
            <li key={format}>
              {format}: {legality}
            </li>
          ))}
        </ul>

        <table>
          <thead>
            <tr>
              <td>

              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>

              </td>
            </tr>
          </tbody>
        </table>
        
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
