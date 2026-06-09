import { useCallback, useRef, useState } from 'react';

interface UseSpeechPlaybackOptions {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

interface UseSpeechPlaybackReturn {
  highlightIndex: number | null;
  clickedIndex: number | null;
  isReadingBack: boolean;
  speakWord: (word: string, index: number) => void;
  startReadBack: (words: string[]) => void;
  stopReadBack: () => void;
}

export function useSpeechPlayback({
  isListening,
  startListening,
  stopListening,
}: UseSpeechPlaybackOptions): UseSpeechPlaybackReturn {
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [isReadingBack, setIsReadingBack] = useState(false);

  const sessionRef = useRef(0);
  const readingBackRef = useRef(false);
  const wasListeningRef = useRef(false);

  const stopReadBack = useCallback(() => {
    sessionRef.current++;
    readingBackRef.current = false;
    window.speechSynthesis.cancel();
    setHighlightIndex(null);
    setIsReadingBack(false);
    setClickedIndex(null);
    if (wasListeningRef.current) {
      wasListeningRef.current = false;
      startListening();
    }
  }, [startListening]);

  const speakWord = useCallback(
    (word: string, index: number) => {
      const session = ++sessionRef.current;
      readingBackRef.current = false;
      window.speechSynthesis.cancel();
      setIsReadingBack(false);
      setHighlightIndex(null);

      const wasOn = isListening;
      if (wasOn) stopListening();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      utterance.onstart = () => {
        if (session !== sessionRef.current) return;
        setClickedIndex(index);
      };
      utterance.onend = () => {
        if (session !== sessionRef.current) return;
        setClickedIndex(null);
        if (wasOn) startListening();
      };
      utterance.onerror = () => {
        if (session !== sessionRef.current) return;
        setClickedIndex(null);
        if (wasOn) startListening();
      };
      window.speechSynthesis.speak(utterance);
    },
    [isListening, stopListening, startListening],
  );

  const startReadBack = useCallback(
    (words: string[]) => {
      if (words.length === 0) return;

      const session = ++sessionRef.current;
      wasListeningRef.current = isListening;
      if (isListening) stopListening();

      window.speechSynthesis.cancel();
      readingBackRef.current = true;
      setIsReadingBack(true);
      setClickedIndex(null);

      const wordsCopy = [...words];
      let idx = 0;

      const finishReadBack = () => {
        if (session !== sessionRef.current) return;
        readingBackRef.current = false;
        setHighlightIndex(null);
        setIsReadingBack(false);
        if (wasListeningRef.current) {
          wasListeningRef.current = false;
          startListening();
        }
      };

      const speakNext = () => {
        if (session !== sessionRef.current) return;
        if (!readingBackRef.current || idx >= wordsCopy.length) {
          finishReadBack();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(wordsCopy[idx]);
        utterance.rate = 1.0;
        const currentIdx = idx;
        utterance.onstart = () => {
          if (session !== sessionRef.current) return;
          setHighlightIndex(currentIdx);
        };
        utterance.onend = () => {
          if (session !== sessionRef.current) return;
          idx++;
          speakNext();
        };
        utterance.onerror = () => finishReadBack();
        window.speechSynthesis.speak(utterance);
      };

      speakNext();
    },
    [isListening, stopListening, startListening],
  );

  return {
    highlightIndex,
    clickedIndex,
    isReadingBack,
    speakWord,
    startReadBack,
    stopReadBack,
  };
}
