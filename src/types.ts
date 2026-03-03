export interface Settings {
  fontSize: number;
  lineHeight: number;
  wordSpacing: number;
  letterSpacing: number;
  maxWidthCh: number;
  fontFamily: string;
}

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 44,
  lineHeight: 1.7,
  wordSpacing: 0.25,
  letterSpacing: 0.03,
  maxWidthCh: 38,
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

export const FONT_OPTIONS = [
  { label: 'System Sans', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Atkinson Hyperlegible', value: '"Atkinson Hyperlegible", sans-serif' },
  { label: 'OpenDyslexic', value: 'OpenDyslexic, sans-serif' },
];
