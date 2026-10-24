import { useMemo, type ElementType, type ReactElement, type ReactNode } from "react";
import useFetchUrl from "./useFetchUrl.js";

type CardSymbol = {
  symbol: string;
  svg_uri: string;
  english: string;
};

function isCardSymbol(value: unknown): value is CardSymbol {
  if (typeof value !== "object" || value === null) return false;

  return (
    "symbol" in value &&
    typeof value.symbol === "string" &&
    "svg_uri" in value &&
    typeof value.svg_uri === "string" &&
    "english" in value &&
    typeof value.english === "string"
  );
}

function renderSymbol(key: string, symbol: CardSymbol): ReactElement {
  return (
    <span key={key}>
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
}

/** Renders mana symbols and parenthetical reminder text within one line. */
function renderInlineText(
  line: string,
  symbolMap: ReadonlyMap<string, CardSymbol>,
  keyPrefix: string,
): ReactNode[] {
  const tokens = line.split(/(\{[^}]+\}|[()])/g).filter(Boolean);
  const nodes: ReactNode[] = [];
  let italicBuffer: ReactNode[] = [];
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

    const symbol = symbolMap.get(token);
    const content = symbol
      ? renderSymbol(`${keyPrefix}-symbol-${index}`, symbol)
      : token;

    if (isItalic) {
      italicBuffer.push(content);
    } else {
      nodes.push(content);
    }
  });

  if (italicBuffer.length > 0) {
    nodes.push(<em key={`em-${keyPrefix}-last`}>{italicBuffer}</em>);
  }

  return nodes;
}

/**
 * Renders Scryfall Oracle text with inline mana symbols, reminder text, and
 * semantic lists for consecutive modal-choice lines.
 *
 * Each non-empty newline-separated line becomes a paragraph unless it starts
 * with Scryfall's "•" marker; consecutive choice lines are grouped into a list.
 */
export default function useOracleText(
  text: string | null | undefined,
  Component: ElementType = "p",
): ReactElement[] {
  const { data: fetchedSymbols } = useFetchUrl(
    "cardSymbols",
    "https://api.scryfall.com/symbology",
    Infinity,
  );

  const symbolMap = useMemo(() => {
    const symbols: unknown[] = Array.isArray(fetchedSymbols) ? fetchedSymbols : [];
    const validSymbols = symbols.filter(isCardSymbol);

    return new Map<string, CardSymbol>(
      validSymbols.map((symbol) => [symbol.symbol, symbol]),
    );
  }, [fetchedSymbols]);

  const rendered: ReactElement[] = [];
  let listItems: ReactElement[] = [];
  let listStart = 0;

  const flushList = () => {
    if (listItems.length === 0) return;

    rendered.push(
      <ul key={`choices-${listStart}`} className="oracle-text__choices">
        {listItems}
      </ul>,
    );
    listItems = [];
  };

  const lines = (text ?? "").split(/\r\n?|\n/);

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
          {renderInlineText(bullet[1], symbolMap, `line-${lineIndex}`)}
        </li>,
      );
      return;
    }

    flushList();
    rendered.push(
      <Component key={`line-${lineIndex}`}>
        {renderInlineText(line, symbolMap, `line-${lineIndex}`)}
      </Component>,
    );
  });

  flushList();
  return rendered;
}
