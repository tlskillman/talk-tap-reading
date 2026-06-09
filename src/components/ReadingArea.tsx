import { Fragment, type CSSProperties } from 'react';
import type { Settings } from '../types';

interface ReadingAreaProps {
  words: string[];
  interimTranscript: string;
  highlightIndex: number | null;
  clickedIndex: number | null;
  settings: Settings;
  isSample?: boolean;
  onWordClick: (word: string, index: number) => void;
}

export function ReadingArea({
  words,
  interimTranscript,
  highlightIndex,
  clickedIndex,
  settings,
  isSample = false,
  onWordClick,
}: ReadingAreaProps) {
  const readingStyle: CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    wordSpacing: `${settings.wordSpacing}em`,
    letterSpacing: `${settings.letterSpacing}em`,
    maxWidth: `${settings.maxWidthCh}ch`,
    fontFamily: settings.fontFamily,
  };

  return (
    <div className="reading-card">
      <div className="reading-area" style={readingStyle}>
        {words.map((word, i) => {
          const isHighlighted = highlightIndex === i;
          const isClicked = clickedIndex === i;
          let cls = 'word-token word-boxed';
          if (isSample) cls += ' word-sample';
          if (isHighlighted) cls += ' word-highlighted';
          if (isClicked) cls += ' word-clicked';

          return (
            <Fragment key={i}>
              <button
                className={cls}
                onClick={() => onWordClick(word, i)}
                tabIndex={0}
                aria-label={`Hear the word: ${word}`}
              >
                {word}
              </button>
              {' '}
            </Fragment>
          );
        })}

        {interimTranscript && (
          <span className="interim-text">{interimTranscript}</span>
        )}
      </div>
    </div>
  );
}
