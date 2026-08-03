import { useMemo } from "react";

const useOracleText = (text, symbols) => {

  const symbolMap = useMemo( () => 
      Object.fromEntries(symbols.map(s => [s.symbol, s])),
      [symbols]
  );

  const oracleTextRegex = /(\{[^}]+\}|[()]|\n)/g; // matches {01 char}, (, ), and \n

  // Split the oracle_text at symbols, parenthesis and return line.
  const oracleText = text.split(oracleTextRegex).filter(Boolean); // removes empty elements

  const oracleTextRender = [];
  let paragraphBuffer = [];
  let italicBuffer = [];
  let symbolBuffer = []
  let isItalic = false;

  const renderSymbol = (i, symbol) => {
    return(
    <span key={`symbol-${i}`}>
      &nbsp;
      <img
        src={symbol.svg_uri}
        alt={symbol.english}
        style={{
          width: "1em",
          height: "1em",
          verticalAlign: "text-bottom",
        }}
      />
    </span>
    );
  };
 
  for (let i = 0; i < oracleText.length; i++) {
    const token = oracleText[i]
    const symbol = symbolMap[token];

    if (token === "(") {
      isItalic = true;
      italicBuffer.push(token);
      continue;
    }

    if (token === ")") {
      isItalic = false;
      italicBuffer.push(token);
      paragraphBuffer.push(<em key={`em-${i}`}>{italicBuffer}</em>);        
      italicBuffer = [];
      continue;
    };
  
    if (token === "\n") {
      oracleTextRender.push(<p key={`p-${i}`}>{paragraphBuffer}</p>);
      paragraphBuffer = [];
      continue;
    };
    
    if (isItalic === false) {
      if (symbol) {
        paragraphBuffer.push(renderSymbol(i, symbol));
        continue;
      };
      paragraphBuffer.push(token);
     };

    if (isItalic === true) {
      if (symbol) {
        italicBuffer.push(renderSymbol(i, symbol));
        continue;
      };
      italicBuffer.push(token);
    };

  };

  if(paragraphBuffer.length) /* if paragraphBuffer not empty */ {
    oracleTextRender.push(<p key={"p-last"}>{paragraphBuffer}</p>);
  }
  
   return oracleTextRender;
  
};

export default useOracleText;