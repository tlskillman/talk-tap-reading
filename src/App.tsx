import { useMemo, useCallback, useState } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechPlayback } from './hooks/useSpeechPlayback';
import { usePersistedSettings } from './hooks/usePersistedSettings';
import { SettingsPanel } from './components/SettingsPanel';
import { ReadingArea } from './components/ReadingArea';
import { detectSpeechEnvironment } from './utils/speechEnvironment';
import './App.css';

function transcriptToWords(transcript: string): string[] {
  return transcript ? transcript.split(/\s+/).filter(Boolean) : [];
}

function App() {
  const {
    isListening,
    isRetrying,
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    commitInterim,
    dismissError,
    isSupported,
    error,
  } = useSpeechRecognition();

  const [settings, setSettings] = usePersistedSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const speechEnv = useMemo(() => detectSpeechEnvironment(), []);
  const [envWarningDismissed, setEnvWarningDismissed] = useState(false);
  const showEnvWarning = speechEnv.likelyBlocked && !envWarningDismissed;

  const {
    highlightIndex,
    clickedIndex,
    isReadingBack,
    speakWord,
    startReadBack,
    stopReadBack,
  } = useSpeechPlayback({ isListening, startListening, stopListening });

  const words = useMemo(
    () => transcriptToWords(finalTranscript),
    [finalTranscript],
  );

  const hasReadableContent = words.length > 0 || !!interimTranscript;

  const handleReadBack = useCallback(() => {
    const transcript = commitInterim();
    startReadBack(transcriptToWords(transcript));
  }, [commitInterim, startReadBack]);

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

      {showEnvWarning && (
        <div className="warning-banner" role="status">
          <span className="warning-banner-text">{speechEnv.reason}</span>
          <button
            type="button"
            className="warning-banner-dismiss"
            onClick={() => setEnvWarningDismissed(true)}
            aria-label="Dismiss warning"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          <span className="error-banner-text">{error}</span>
          <button
            type="button"
            className="error-banner-dismiss"
            onClick={dismissError}
            aria-label="Dismiss error"
          >
            ×
          </button>
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
              onClick={handleReadBack}
              disabled={!hasReadableContent}
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
            disabled={!hasReadableContent}
          >
            Clear
          </button>
        </div>
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
        onWordClick={speakWord}
      />
    </div>
  );
}

export default App;
