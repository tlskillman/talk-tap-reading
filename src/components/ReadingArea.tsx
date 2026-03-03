import { Fragment, type CSSProperties } from 'react';
import type { Settings } from '../types';

interface ReadingAreaProps {
  words: string[];
  interimTranscript: string;
  highlightIndex: number | null;
  clickedIndex: number | null;
  settings: Settings;
  showWordBoxes: boolean;
  onWordClick: (word: string, index: number) => void;
}

export function ReadingArea({
  words,
  interimTranscript,
  highlightIndex,
  clickedIndex,
  settings,
  showWordBoxes,
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

  const hasContent = words.length > 0 || interimTranscript;

  return (
    <div className="reading-card">
      <div className="reading-area" style={readingStyle}>
        {!hasContent && (
          <p className="placeholder-text">
            Click <strong>Start Listening</strong> and say something&hellip;
            <br />
            Your words will appear here!
          </p>
        )}

        {words.map((word, i) => {
          const isHighlighted = highlightIndex === i;
          const isClicked = clickedIndex === i;
          let cls = 'word-token';
          if (showWordBoxes) cls += ' word-boxed';
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
