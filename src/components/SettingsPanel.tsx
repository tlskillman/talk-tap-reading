import type { RefObject } from 'react';
import { FONT_OPTIONS, type Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  settingsOpen: boolean;
  onSettingsToggle: () => void;
  helpOpen: boolean;
  onHelpToggle: () => void;
  helpSectionRef?: RefObject<HTMLDivElement | null>;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="settings-row">
      <label className="settings-label">
        <span>{label}</span>
        <span className="settings-value">
          {value}
          {unit}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="settings-slider"
      />
    </div>
  );
}

function ParentsTeachersContent() {
  return (
    <div className="help-prose">
      <p>
        <strong>Talk &amp; Tap Reading</strong> is a small experimental reading-support
        tool. It is not a medical or educational treatment, and it does not claim to
        diagnose or treat dyslexia.
      </p>

      <h3>What it does</h3>
      <p>
        A child talks, sees their words appear, then taps any word to hear it spoken
        back. The goal is to reinforce the connection between the printed word and the
        sound of the word.
      </p>

      <h3>How to use</h3>
      <p>
        The main buttons use the child&rsquo;s actions — <strong>Talk</strong> and{' '}
        <strong>Tap</strong> — not what the app is doing behind the scenes.
      </p>
      <ol>
        <li>
          On first visit, sample words appear: <em>Talk. See words. Tap to hear.</em>{' '}
          The child can tap them to try it, or press <strong>Talk</strong> and speak a
          sentence.
        </li>
        <li>Tap any word in the reading area, in any order, to hear it again.</li>
        <li>
          Press <strong>Tap</strong> to hear all words in sequence, one at a time with
          highlighting.
        </li>
        <li>
          Press <strong>New</strong> to clear the sentence and start fresh with an
          empty space, ready for the child to speak again.
        </li>
      </ol>

      <h3>What the buttons mean</h3>
      <ul>
        <li>
          <strong>Talk</strong> — turns on speech recognition so the child can speak
          words into the app.
        </li>
        <li>
          <strong>Tap</strong> — reads all words aloud in order (the child can also tap
          individual words anytime without pressing this button).
        </li>
        <li>
          <strong>Stop</strong> — ends talking or stops the Tap sequence.
        </li>
        <li>
          <strong>New</strong> — clears the current sentence so the child can start
          again. (The opening sample words show only on the first visit.)
        </li>
      </ul>

      <h3>Privacy</h3>
      <ul>
        <li>
          This app has no server and does not store or upload sentences the child
          speaks or displays.
        </li>
        <li>
          Display settings (font size, spacing, etc.) are saved only in this browser
          on this device.
        </li>
        <li>
          <strong>Talk</strong> uses your browser&rsquo;s speech recognition, which
          sends audio to a cloud service (Google in Chrome, Microsoft in Edge) to
          convert speech to text.
        </li>
        <li>
          Tapping a word and pressing <strong>Tap</strong> use text-to-speech built
          into your browser, which runs on your device.
        </li>
      </ul>

      <h3>Known limitations</h3>
      <ul>
        <li>Works best in Google Chrome or Microsoft Edge on a desktop or tablet.</li>
        <li>
          <strong>Talk</strong> requires a microphone and an internet connection.
        </li>
        <li>
          Tapping words and pressing <strong>Tap</strong> work without a microphone once
          words are on screen.
        </li>
        <li>
          Speech recognition may fail in embedded browser previews (for example, inside
          an editor). Open the page directly in Chrome or Edge.
        </li>
        <li>
          On <strong>iPhone and iPad</strong>, <strong>Talk</strong> only works in{' '}
          <strong>Safari</strong>. Other browsers (Chrome, Firefox, Edge) can use the
          microphone but Apple blocks speech recognition outside Safari.{' '}
          <strong>Tap</strong> and <strong>New</strong> work in any browser.
        </li>
        <li>
          On Android, Chrome has a <strong>per-site</strong> microphone setting (lock
          or menu icon next to the address bar). Allowing the microphone in Chrome&rsquo;s
          main app settings is not always enough — this website must be allowed too.
        </li>
      </ul>
    </div>
  );
}

export function SettingsPanel({
  settings,
  onChange,
  settingsOpen,
  onSettingsToggle,
  helpOpen,
  onHelpToggle,
  helpSectionRef,
}: SettingsPanelProps) {
  const update = (key: keyof Settings, value: number | string) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-panel">
      <button
        className="settings-toggle"
        onClick={onSettingsToggle}
        aria-expanded={settingsOpen}
        aria-controls="settings-content"
      >
        <span className="settings-toggle-icon">{settingsOpen ? '▼' : '▶'}</span>
        <span>Settings</span>
      </button>

      {settingsOpen && (
        <div id="settings-content" className="settings-content">
          <div className="settings-grid">
            <SliderRow
              label="Font size"
              value={settings.fontSize}
              min={24}
              max={72}
              step={2}
              unit="px"
              onChange={v => update('fontSize', v)}
            />
            <SliderRow
              label="Line spacing"
              value={settings.lineHeight}
              min={1.2}
              max={2.4}
              step={0.1}
              unit=""
              onChange={v => update('lineHeight', v)}
            />
            <SliderRow
              label="Word spacing"
              value={settings.wordSpacing}
              min={0}
              max={0.6}
              step={0.05}
              unit="em"
              onChange={v => update('wordSpacing', v)}
            />
            <SliderRow
              label="Letter spacing"
              value={settings.letterSpacing}
              min={0}
              max={0.15}
              step={0.01}
              unit="em"
              onChange={v => update('letterSpacing', v)}
            />
            <SliderRow
              label="Line width"
              value={settings.maxWidthCh}
              min={20}
              max={60}
              step={2}
              unit="ch"
              onChange={v => update('maxWidthCh', v)}
            />
            <div className="settings-row">
              <label className="settings-label">
                <span>Font</span>
              </label>
              <select
                value={settings.fontFamily}
                onChange={e => update('fontFamily', e.target.value)}
                className="settings-select"
              >
                {FONT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div ref={helpSectionRef}>
        <button
          className="settings-toggle"
          onClick={onHelpToggle}
          aria-expanded={helpOpen}
          aria-controls="parents-teachers-content"
        >
          <span className="settings-toggle-icon">{helpOpen ? '▼' : '▶'}</span>
          <span>For parents and teachers</span>
        </button>

        {helpOpen && (
          <div id="parents-teachers-content" className="settings-content help-content">
            <ParentsTeachersContent />
          </div>
        )}
      </div>
    </div>
  );
}
