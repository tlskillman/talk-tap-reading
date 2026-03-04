import { useState, useRef, useCallback } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { SettingsPanel } from './components/SettingsPanel';
import { ReadingArea } from './components/ReadingArea';
import { DEFAULT_SETTINGS, type Settings } from './types';
import './App.css';

function App() {
  const {
    isListening,
    isRetrying,
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    isSupported,
    error,
  } = useSpeechRecognition();

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWordBoxes, setShowWordBoxes] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [isReadingBack, setIsReadingBack] = useState(false);
  const readingBackRef = useRef(false);
  const wasListeningRef = useRef(false);

  const words = finalTranscript
    ? finalTranscript.split(/\s+/).filter(Boolean)
    : [];

  const stopReadBack = useCallback(() => {
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
      window.speechSynthesis.cancel();
      readingBackRef.current = false;
      setIsReadingBack(false);
      setHighlightIndex(null);

      const wasOn = isListening;
      if (wasOn) stopListening();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      utterance.onstart = () => setClickedIndex(index);
      utterance.onend = () => {
        setClickedIndex(null);
        if (wasOn) startListening();
      };
      utterance.onerror = () => {
        setClickedIndex(null);
        if (wasOn) startListening();
      };
      window.speechSynthesis.speak(utterance);
    },
    [isListening, stopListening, startListening],
  );

  const startReadBack = useCallback(() => {
    if (words.length === 0) return;

    wasListeningRef.current = isListening;
    if (isListening) stopListening();

    window.speechSynthesis.cancel();
    readingBackRef.current = true;
    setIsReadingBack(true);
    setClickedIndex(null);

    const wordsCopy = [...words];
    let idx = 0;

    const finishReadBack = () => {
      readingBackRef.current = false;
      setHighlightIndex(null);
      setIsReadingBack(false);
      if (wasListeningRef.current) {
        wasListeningRef.current = false;
        startListening();
      }
    };

    const speakNext = () => {
      if (!readingBackRef.current || idx >= wordsCopy.length) {
        finishReadBack();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(wordsCopy[idx]);
      utterance.rate = 1.0;
      const currentIdx = idx;
      utterance.onstart = () => setHighlightIndex(currentIdx);
      utterance.onend = () => {
        idx++;
        speakNext();
      };
      utterance.onerror = () => finishReadBack();
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [words, isListening, stopListening, startListening]);

  const handleClear = useCallback(() => {
    stopReadBack();
    stopListening();
    clearTranscript();
  }, [stopReadBack, stopListening, clearTranscript]);

  if (!isSupported) {
    return (
      <div className="app">
        <header className="top-bar">
          <h1 className="app-title">Talk &amp; Tap Reading</h1>
        </header>
        <div className="unsupported-message">
          <h2>Browser Not Supported</h2>
          <p>
            This browser doesn&rsquo;t support speech recognition.
            <br />
            Please try <strong>Google Chrome</strong> or{' '}
            <strong>Microsoft Edge</strong> on a desktop or tablet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="top-bar">
        <h1 className="app-title">Talk &amp; Tap Reading</h1>
        {(isListening || isRetrying) && (
          <div
            className={`status-indicator ${isRetrying ? 'retrying' : 'listening'}`}
          >
            {isRetrying ? '🔄 Connecting…' : '🎙️ Listening'}
          </div>
        )}
      </header>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="controls-row">
        <div className="primary-controls">
          {!isListening ? (
            <button className="btn btn-start" onClick={startListening}>
              Listen
            </button>
          ) : (
            <button className="btn btn-stop" onClick={stopListening}>
              Stop
            </button>
          )}

          {!isReadingBack ? (
            <button
              className="btn btn-readback"
              onClick={startReadBack}
              disabled={words.length === 0}
            >
              Read
            </button>
          ) : (
            <button className="btn btn-stop-reading" onClick={stopReadBack}>
              Stop Reading
            </button>
          )}

          <button
            className="btn btn-clear"
            onClick={handleClear}
            disabled={words.length === 0 && !interimTranscript}
          >
            Clear
          </button>
        </div>

        {/* Show Boxes toggle hidden — boxes always on */}
      </div>

      <SettingsPanel
        settings={settings}
        onChange={setSettings}
        isOpen={settingsOpen}
        onToggle={() => setSettingsOpen(o => !o)}
      />

      <ReadingArea
        words={words}
        interimTranscript={interimTranscript}
        highlightIndex={highlightIndex}
        clickedIndex={clickedIndex}
        settings={settings}
        showWordBoxes={showWordBoxes}
        onWordClick={speakWord}
      />
    </div>
  );
}

export default App;
