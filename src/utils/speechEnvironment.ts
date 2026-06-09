export interface SpeechEnvironment {
  /** The SpeechRecognition constructor exists in this browser. */
  hasApi: boolean;
  /**
   * The API exists but the environment is very likely to fail at runtime
   * (embedded webview, or a Chromium fork without Google's speech keys).
   */
  likelyBlocked: boolean;
  /** Human-readable explanation, or null when nothing is wrong. */
  reason: string | null;
}

const OPEN_IN_HINT =
  'Open this page directly in Google Chrome or Microsoft Edge.';

export function detectSpeechEnvironment(): SpeechEnvironment {
  if (typeof window === 'undefined') {
    return { hasApi: false, likelyBlocked: false, reason: null };
  }

  const hasApi = !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  const ua = navigator.userAgent || '';

  // Cursor/VS Code previews and other desktop-app webviews are Electron-based.
  // They run Chromium without Google's private speech API keys, so recognition
  // always fails with a "network" error.
  const isElectron = /Electron/i.test(ua);

  // The built-in editor preview renders the page inside an iframe. A cross-origin
  // parent makes `window.top` access throw, which is itself a strong signal.
  let isEmbedded = false;
  try {
    isEmbedded = window.self !== window.top;
  } catch {
    isEmbedded = true;
  }

  // Brave removed the Google speech endpoint entirely.
  const isBrave =
    typeof (navigator as Navigator & { brave?: unknown }).brave !== 'undefined';

  if (isElectron || isEmbedded) {
    return {
      hasApi,
      likelyBlocked: true,
      reason: `This looks like an embedded preview (for example, an editor's built-in browser). Speech recognition needs Google's speech service, which isn't available here. ${OPEN_IN_HINT}`,
    };
  }

  if (isBrave) {
    return {
      hasApi,
      likelyBlocked: true,
      reason: `Brave doesn't include the speech service this app relies on. ${OPEN_IN_HINT}`,
    };
  }

  return { hasApi, likelyBlocked: false, reason: null };
}
