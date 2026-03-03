import { FONT_OPTIONS, type Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
  isOpen: boolean;
  onToggle: () => void;
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

export function SettingsPanel({ settings, onChange, isOpen, onToggle }: SettingsPanelProps) {
  const update = (key: keyof Settings, value: number | string) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-panel">
      <button
        className="settings-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="settings-content"
      >
        <span className="settings-toggle-icon">{isOpen ? '▼' : '▶'}</span>
        <span>Settings</span>
      </button>

      {isOpen && (
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
            <SliderRow
              label="Word gap"
              value={settings.readBackRate}
              min={0.3}
              max={1.5}
              step={0.05}
              unit="×"
              onChange={v => update('readBackRate', v)}
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
    </div>
  );
}
