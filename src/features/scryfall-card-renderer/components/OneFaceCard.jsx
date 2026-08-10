import CardFrame from './CardFrame.jsx';
import CardExtras from './extras/CardExtras.jsx';

/**
 * Covers: normal, leveler, class, case, saga, mutate, prototype, battle,
 * planar, scheme, vanguard, token, emblem, augment, host.
 *
 * This is the overwhelming majority of any real card pool, so it's the one
 * shape component imported eagerly in CardRenderer rather than lazy-loaded.
 */
export default function OneFaceCard({ card }) {
  const face = card.faces[0];

  return (
    <div className="scryfall-card scryfall-card--one-face">
      <CardFrame 
        face={face} 
        image={face.image ?? card.rootImage} 
      />
      <CardExtras 
        layout={card.layout} 
        face={face} 
      />
    </div>
  );
}
