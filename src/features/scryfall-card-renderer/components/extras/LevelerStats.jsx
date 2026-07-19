import React from 'react';

/**
 * STUB: Level Up cards encode their level brackets and changing P/T inside
 * oracle_text (e.g. "LEVEL 2-6" / "LEVEL 7+"). Real implementation should
 * parse those brackets into a small stat table.
 */
export default function LevelerStats({ face }) {
  return (
    <div className="scryfall-card__extra scryfall-card__extra--leveler">
      <span className="scryfall-card__extra-label">Level thresholds</span>
      {/* TODO: parse "LEVEL n-m" brackets out of face.oracleText into a table */}
      <p className="scryfall-card__extra-raw">{face.oracleText}</p>
    </div>
  );
}
