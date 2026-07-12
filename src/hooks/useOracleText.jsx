import { useMemo } from "react";

export default function renderOracleText(text, symbols) {

  const symbolMap = useMemo( () => 
      Object.fromEntries(symbols.map(s => [s.symbol, s])),
      [symbols]
  );

  const oracleTextRegex = /(\{[^}]+\}|[()]|\n)/g; // matches symbols, (, ), and \n

  // Split the oracle_text at symbol (delete) and token (keep). Make an arrya with the symbols
  const oracleText = text.split(oracleTextRegex).filter(Boolean); // removes empty elements

  const oracleTextRender = [];
  let italicBuffer = [];
  let isItalic = false;

  for (let i = 0; i < oracleText.length; i++) {

    const symbol = symbolMap[oracleText[i]];

    if (oracleText[i] === "\n") {
    oracleTextRender.push(<br />);
    continue;
    };
    
    if (oracleText[i] === "(") {
    isItalic = true;
    }

    if (oracleText[i] === ")") {
    isItalic = false;
    italicBuffer.push(")");
    oracleTextRender.push(<em>{italicBuffer}</em>);        
    italicBuffer = [];
    continue;
    };

    if ( isItalic === false ) {

    if (symbol) {
      oracleTextRender.push(
      <>
        &nbsp;
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
      </>
      );
      continue;
    };

    oracleTextRender.push(oracleText[i])
    };

    if ( isItalic === true ) {

    if (symbol) {
      italicBuffer.push(
      <>
        &nbsp;
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
      </>
      );
      continue;
    };

    italicBuffer.push(oracleText[i])
    };

  };

  return oracleTextRender;
  
};