import { useMemo } from "react";

const useOracleText = (text, symbols) => {

  const symbolMap = useMemo( () => 
      Object.fromEntries(symbols.map(s => [s.symbol, s])),
      [symbols]
  );

  const oracleTextRegex = /(\{[^}]+\}|[()]|\n)/g; // matches {01 char}, (, ), and \n

  // Split the oracle_text at symbols, parenthesis and return line.
  const oracleText = text.split(oracleTextRegex).filter(Boolean); // removes empty elements
  console.log(oracleText)

  const oracleTextRender = [];
  let paragraphBuffer = [];
  let italicBuffer = [];
  let symbolBuffer = []
  let isItalic = false;

  const renderSymbol = (i, symbol) => {
    return(
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
  
    if (isItalic === false && token !== "\n") {
      if (symbol) {
        paragraphBuffer.push(renderSymbol(i, symbol));
        console.log("not italic - symbol");
        continue;
      };
      paragraphBuffer.push(token);
      console.log("not italic - text");
     };

    if (isItalic === true && token !== "\n") {
      if (symbol) {
        italicBuffer.push(renderSymbol(i, symbol));
        console.log("italic - symbol");
        continue;
      };
      italicBuffer.push(token);
      console.log("italic - text");
    };

    if (token === "\n" || i === oracleText.length - 1) {
      oracleTextRender.push(<p key={`p-${i}`}>{paragraphBuffer}</p>);
      paragraphBuffer = [];
      console.log("return or end");
      continue;
    };

  };
  
  console.log("oracleTextRender:");
  console.log(oracleTextRender);
  return oracleTextRender;
  
};

export default useOracleText;