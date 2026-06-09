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
        A child speaks a sentence, sees the words appear, then taps any word to hear
        it spoken back. The goal is to reinforce the connection between the printed
        word and the sound of the word.
      </p>

      <h3>How to use</h3>
      <ol>
        <li>
          On first visit, sample words appear in the reading area. The child can tap
          them to hear how it works, or press <strong>Listen</strong> and speak a
          sentence.
        </li>
        <li>Tap any word in any order to hear it again.</li>
        <li>Press <strong>Read</strong> to hear all words in sequence.</li>
        <li>
          Press <strong>New</strong> to clear the sentence and start over with the
          sample words.
        </li>
      </ol>

      <h3>Privacy</h3>
      <ul>
        <li>
          This app has no server and does not store or upload sentences you speak or
          display.
        </li>
        <li>
          Display settings (font size, spacing, etc.) are saved only in this browser
          on this device.
        </li>
        <li>
          <strong>Listen</strong> uses your browser&rsquo;s speech recognition, which
          sends audio to a cloud service (Google in Chrome, Microsoft in Edge) to
          convert speech to text.
        </li>
        <li>
          Tap-to-hear and <strong>Read</strong> use text-to-speech built into your
          browser, which runs on your device.
        </li>
      </ul>

      <h3>Known limitations</h3>
      <ul>
        <li>Works best in Google Chrome or Microsoft Edge on a desktop or tablet.</li>
        <li>
          <strong>Listen</strong> requires a microphone and an internet connection.
        </li>
        <li>
          Tap-to-hear and <strong>Read</strong> work without a microphone once words
          are on screen.
        </li>
        <li>
          Speech recognition may fail in embedded browser previews (for example, inside
          an editor). Open the page directly in Chrome or Edge.
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
