import "./CardDetails.css";
import IconClose from "../../assets/IconClose";
import IconTurnAround from "../../assets/IconTurnAround";

const CardDetails = ({ card, cardPrices, cardRulings }) => {
  if (!card) {
    return null;
  }

  const isDoubleFaced = card.layout === "transform" || card.layout === "modal_dfc";

  return (
    <div className="card-details">

      <div className="card-info">
        
        <h2>{card.name}</h2>
        <p><em>{card.type_line}</em></p>
        <p><em>{card.rarity}</em></p>

        <h3>Rulings</h3>
        <ul>
          {cardRulings.map(({ source, date, ruling }, index) => (
            <li key={index}>
              {ruling} <em>({source}, {date})</em>
            </li>
          ))}
        </ul>

        <h3>Legality</h3>
        <ul>
          {Object.entries(card.legalities).map(([format, legality]) => (
            <li key={format}>
              {format}: {legality}
            </li>
          ))}
        </ul>

        <div>
          <div className="card-prints">
            {cardPrices.map(({ id, set, set_name, collector_number, layout, images }) => {
              const isDoubleFaced = layout === "transform" || layout === "modal_dfc";
              return (
                <div key={id}className="card-print">
                  <h3>{set_name}</h3>
                  <h4>{set.toUpperCase()+"/"+collector_number}</h4>

                  <table>
                    <thead>
                      <tr>
                        <td>EUR</td>
                        <td>EUR<br></br>(foil)</td>
                        <td>TIX</td>
                        <td>USD</td>
                        <td>USD<br></br>(etched)</td>
                        <td>USD<br></br>(foil)</td>
                      </tr>
                    </thead>
                    <tbody>
                      {cardPrices
                        .filter(card => card.id === id)
                        .map(({ id, prices }) => (
                        <tr key={id}>
                          {Object.values(prices).map((price, index) => (
                            <td key={index}>{price || ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;
