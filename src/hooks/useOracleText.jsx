import { useMemo } from "react";
import useFetchUrl from "./useFetchUrl.js";

export default function useOracleText (text, Component = "p") {

  // Fetch the card symbols from Scryfall API and cache them for 1 day (86400 seconds)
  const { data: symbols } = useFetchUrl("cardSymbols", "https://api.scryfall.com/symbology", Infinity);

  // Create a map of symbols for quick lookup
  const symbolMap = useMemo( () => 
      Object.fromEntries((symbols || []).map(s => [s.symbol, s])),
      [symbols]
  );

  // Regular expression to match symbols, parentheses, and newlines
  const oracleTextRegex = /(\{[^}]+\}|[()]|\n)/g; // matches {01 char}, (, ), and \n

  // Split the oracle_text at symbols, parenthesis and return line.
  const oracleText = text.split(oracleTextRegex).filter(Boolean); // removes empty elements

  const oracleTextRender = [];
  let paragraphBuffer = [];
  let italicBuffer = [];
  let isItalic = false;

  // render symbol
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
 
  // Iterate through the oracleText array and build the rendered output
  for (let i = 0; i < oracleText.length; i++) {
    const token = oracleText[i]
    const symbol = symbolMap[token];

    // ( marks the starts of an italic section. Activate the isItalic System State and push the token to the italicBuffer.)
    if (token === "(") {
      isItalic = true;
      italicBuffer.push(token);
      continue;
    }

    // ) marks the end of an italic section. Deactivate the isItalic System State, push the token to the italicBuffer,
    // and then push the entire italicBuffer to the paragraphBuffer.
    if (token === ")") {
      isItalic = false;
      italicBuffer.push(token);
      paragraphBuffer.push(<em key={`em-${i}`}>{italicBuffer}</em>);        
      italicBuffer = [];
      continue;
    };
  
    // \n marks the end of a paragraph. Push the current paragraphBuffer to the oracleTextRender array and reset the paragraphBuffer.
    if (token === "\n") {
      oracleTextRender.push(<Component key={`p-${i}`}>{paragraphBuffer}</Component>);
      paragraphBuffer = [];
      continue;
    };
    
    // If the token is a symbol, render it and push it to the appropriate buffer based on the isItalic System State.
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

  // After the loop, if there are any remaining tokens in the paragraphBuffer, 
  // push them to the oracleTextRender array as a final paragraph.
  if(paragraphBuffer.length) {
    oracleTextRender.push(<Component key={"p-last"}>{paragraphBuffer}</Component>);
  }
  
  const renderInline = (line, keyPrefix) => {
    const tokens = line.split(/(\{[^}]+\}|[()])/g).filter(Boolean);
    const nodes = [];
    let italicBuffer = [];
    let isItalic = false;

    tokens.forEach((token, index) => {
      if (token === "(") {
        isItalic = true;
        italicBuffer.push(token);
        return;
      }

      if (token === ")" && isItalic) {
        italicBuffer.push(token);
        nodes.push(<em key={`em-${keyPrefix}-${index}`}>{italicBuffer}</em>);
        italicBuffer = [];
        isItalic = false;
        return;
      }

      const symbol = symbolMap[token];
      const content = symbol
        ? renderSymbol(`${keyPrefix}-${index}`, symbol)
        : token;

      if (isItalic) {
        italicBuffer.push(content);
      } else {
        nodes.push(content);
      }
    });

    if (italicBuffer.length) {
      nodes.push(<em key={`em-${keyPrefix}-last`}>{italicBuffer}</em>);
    }

    return nodes;
  };

  const lines = (text ?? "").split(/\r\n?|\n/);
  const rendered = [];
  let listItems = [];
  let listStart = 0;

  const flushList = () => {
    if (listItems.length === 0) return;

    rendered.push(
      <ul
        key={`choices-${listStart}`}
        className="oracle-text__choices"
      >
        {listItems}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, lineIndex) => {
    if (!line.trim()) {
      flushList();
      return;
    }

    const bullet = line.match(/^\s*•\s?(.*)$/);

    if (bullet) {
      if (listItems.length === 0) listStart = lineIndex;

      listItems.push(
        <li key={`choice-${lineIndex}`}>
          {renderInline(bullet[1], `line-${lineIndex}`)}
        </li>
      );
      return;
    }

    flushList();
    rendered.push(
      <Component key={`line-${lineIndex}`}>
        {renderInline(line, `line-${lineIndex}`)}
      </Component>
    );
  });

  flushList();
  return rendered;
  
};
