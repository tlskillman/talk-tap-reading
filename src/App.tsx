import { useMemo, useCallback, useState, useRef } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechPlayback } from './hooks/useSpeechPlayback';
import { usePersistedSettings } from './hooks/usePersistedSettings';
import { SettingsPanel } from './components/SettingsPanel';
import { ReadingArea } from './components/ReadingArea';
import { AppBrand } from './components/AppBrand';
import { detectSpeechEnvironment } from './utils/speechEnvironment';
import {
  SAMPLE_WORDS,
  sentenceToWords,
  ICON_LISTEN,
  ICON_READ,
  ICON_NEW,
} from './constants';
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
    commitInterim,
    dismissError,
    isSupported,
    error,
  } = useSpeechRecognition();

  const [settings, setSettings] = usePersistedSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpSectionRef = useRef<HTMLDivElement>(null);

  const speechEnv = useMemo(() => detectSpeechEnvironment(), []);
  const [envWarningDismissed, setEnvWarningDismissed] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const showEnvWarning = speechEnv.likelyBlocked && !envWarningDismissed;

  const copyPageLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      setLinkCopied(false);
    }
  }, []);

  const {
    highlightIndex,
    clickedIndex,
    isReadingBack,
    speakWord,
    startReadBack,
    stopReadBack,
  } = useSpeechPlayback({ isListening, startListening, stopListening });

  const userWords = useMemo(
    () => sentenceToWords(finalTranscript),
    [finalTranscript],
  );

  const showingSample = userWords.length === 0 && !interimTranscript;
  const displayWords = showingSample ? SAMPLE_WORDS : userWords;
  const hasUserContent = userWords.length > 0 || !!interimTranscript;
  const hasReadableContent = displayWords.length > 0 || !!interimTranscript;

  const handleReadBack = useCallback(() => {
    const transcript = commitInterim();
    const fromTranscript = sentenceToWords(transcript);
    startReadBack(fromTranscript.length > 0 ? fromTranscript : SAMPLE_WORDS);
  }, [commitInterim, startReadBack]);

  const handleNew = useCallback(() => {
    stopReadBack();
    stopListening();
    clearTranscript();
  }, [stopReadBack, stopListening, clearTranscript]);

  const openHelp = useCallback(() => {
    setHelpOpen(true);
    requestAnimationFrame(() => {
      helpSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  if (!isSupported) {
    return (
      <div className="app">
        <header className="top-bar">
          <AppBrand />
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
        <AppBrand showHelp onHelpClick={openHelp} />
        {(isListening || isRetrying) && (
          <div
            className={`status-indicator ${isRetrying ? 'retrying' : 'listening'}`}
          >
            {isRetrying ? '🔄 Connecting…' : '🎙️ Talking'}
          </div>
        )}
      </header>

      {showEnvWarning && (
        <div className="warning-banner" role="status">
          <span className="warning-banner-text">{speechEnv.reason}</span>
          {speechEnv.recommendSafari && (
            <button
              type="button"
              className="warning-banner-action"
              onClick={copyPageLink}
            >
              {linkCopied ? 'Link copied ✓' : 'Copy link'}
            </button>
          )}
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
            <button
              type="button"
              className="btn btn-talk"
              onClick={startListening}
              disabled={speechEnv.talkUnavailable}
              aria-label="Talk: speak words into the app"
              title={speechEnv.talkUnavailable ? speechEnv.reason ?? undefined : undefined}
            >
              <img src={ICON_LISTEN} alt="" className="btn-label-icon" />
              <span>Talk</span>
            </button>
          ) : (
            <button className="btn btn-stop" onClick={stopListening}>
              Stop
            </button>
          )}

          {!isReadingBack ? (
            <button
              type="button"
              className="btn btn-tap"
              onClick={handleReadBack}
              disabled={!hasReadableContent}
              aria-label="Tap: hear words spoken one at a time"
            >
              <img src={ICON_READ} alt="" className="btn-label-icon" />
              <span>Tap</span>
            </button>
          ) : (
            <button className="btn btn-stop-reading" onClick={stopReadBack}>
              Stop
            </button>
          )}

          <button
            type="button"
            className="btn btn-new"
            onClick={handleNew}
            disabled={!hasUserContent}
            aria-label="New: start over with sample words"
          >
            <img src={ICON_NEW} alt="" className="btn-label-icon" />
            <span>New</span>
          </button>
        </div>
      </div>

      <ReadingArea
        words={displayWords}
        interimTranscript={interimTranscript}
        highlightIndex={highlightIndex}
        clickedIndex={clickedIndex}
        settings={settings}
        isSample={showingSample}
        onWordClick={speakWord}
      />

      <SettingsPanel
        settings={settings}
        onChange={setSettings}
        settingsOpen={settingsOpen}
        onSettingsToggle={() => setSettingsOpen(o => !o)}
        helpOpen={helpOpen}
        onHelpToggle={() => setHelpOpen(o => !o)}
        helpSectionRef={helpSectionRef}
      />

      <footer className="app-footer">
        <p>
          An experimental reading-support tool.{' '}
          <a href="mailto:tskillman@immsci.com?subject=Talk%20%26%20Tap%20Reading%20feedback">
            Send feedback
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
