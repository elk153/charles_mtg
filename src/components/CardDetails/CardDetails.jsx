import "./CardDetails.css";
import IconClose from "../../assets/IconClose";
import IconTurnAround from "../../assets/IconTurnAround";

const CardDetails = ({ card, onClose, cardPrices }) => {
  if (!card) {
    return null;
  }

  const isDoubleFaced = card.layout === "transform" || card.layout === "modal_dfc";

  return (
    <div className="card-details">
      <button className="nav-icon" onClick={onClose}>
        <IconClose />
      </button>

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

      <div className="card-info">
        <h2>Card Information</h2>
        <ul>
          <li>
            {card.name} ({card.mana_cost})
          </li>
          <li>{card.type_line}</li>
          <li>{card.oracle_text}</li>
          <li>
            Illustrated by {card.artist}, framed in {card.frame}
          </li>
          <li>
            Legalities
            <ul>
              {Object.entries(card.legalities).map(([format, legality]) => (
                <li key={format}>
                  {format}: {legality}
                </li>
              ))}
            </ul>
          </li>
          <li>
            Prices (Scryfall)
            <table>
              <thead>
                <tr>
                  <td>Prints</td>
                  <td>EUR</td>
                  <td>EUR<br></br>(foil)</td>
                  <td>TIX</td>
                  <td>USD</td>
                  <td>USD<br></br>(etched)</td>
                  <td>USD<br></br>(foil)</td>
                </tr>
              </thead>
              <tbody>
                {cardPrices.map(({ id, set, prices }) => (
                  <tr key={id}>
                    <td>{set}</td>
                    {Object.values(prices).map((price, index) => (
                      <td key={index}>{price || ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="card-prints-title">Card Prints</h2>
        <div className="card-prints">
          {cardPrices.map(({ id, set, layout, images }) => {
            const isDoubleFaced = layout === "transform" || layout === "modal_dfc";
            return (
              <div key={id}className="card-print">
                <h3>{set}</h3>
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
  );
};

export default CardDetails;
