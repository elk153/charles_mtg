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
  let paragraph = [];
  let italicBuffer = [];
  let isItalic = false;

  for (let i = 0; i < oracleText.length; i++) {
    const token = oracleText[i];
    const symbol = symbolMap[token];

    if (token === "\n") {
      oracleTextRender.push(<p key={`p-${i}`}>{paragraph}</p>);
      paragraph = [];
      continue;
    }

    if (token === "(") {
      isItalic = true;
      paragraph.push(token);
      continue;
    }

    if (token === ")") {
      isItalic = false;
      italicBuffer.push(")");
      paragraph.push(<em key={`italic-${i}`}>{italicBuffer}</em>);
      italicBuffer = [];
      continue;
    }

    if (symbol) {
      paragraph.push(
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
      continue;
    }

    if (isItalic) {
      italicBuffer.push(token);
    } else {
      paragraph.push(token);
    }
  }

  // push remaining text if no trailing newline
  if (paragraph.length) {
    oracleTextRender.push(
      <p key="p-final">{paragraph}</p>
    );
  }

  return renderOracleText;  
  
};