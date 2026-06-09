export interface SpeechEnvironment {
  /** The SpeechRecognition constructor exists in this browser. */
  hasApi: boolean;
  /**
   * The API exists but Talk is very likely to fail at runtime
   * (embedded webview, Chromium fork, or iOS non-Safari browser).
   */
  likelyBlocked: boolean;
  /** Disable the Talk button when Talk will not work in this environment. */
  talkUnavailable: boolean;
  /** Human-readable explanation, or null when nothing is wrong. */
  reason: string | null;
}

const DESKTOP_BROWSER_HINT =
  'Open this page directly in Google Chrome or Microsoft Edge.';

/** iOS requires Safari for Web Speech recognition — other browsers get service-not-allowed. */
export function isIOSNonSafariBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) return false;
  return /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

export function iosNonSafariTalkMessage(): string {
  return (
    'On iPhone and iPad, Talk only works in Safari. Chrome can use the microphone, ' +
    'but Apple does not allow speech recognition in other iOS browsers. ' +
    'Open this page in Safari and press Talk. Tap and New still work in Chrome.'
  );
}

export function detectSpeechEnvironment(): SpeechEnvironment {
  if (typeof window === 'undefined') {
    return { hasApi: false, likelyBlocked: false, talkUnavailable: false, reason: null };
  }

  const hasApi = !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  const ua = navigator.userAgent || '';

  const isElectron = /Electron/i.test(ua);

  let isEmbedded = false;
  try {
    isEmbedded = window.self !== window.top;
  } catch {
    isEmbedded = true;
  }

  const isBrave =
    typeof (navigator as Navigator & { brave?: unknown }).brave !== 'undefined';

  if (isIOSNonSafariBrowser()) {
    return {
      hasApi,
      likelyBlocked: true,
      talkUnavailable: true,
      reason: iosNonSafariTalkMessage(),
    };
  }

  if (isElectron || isEmbedded) {
    return {
      hasApi,
      likelyBlocked: true,
      talkUnavailable: true,
      reason: `This looks like an embedded preview (for example, an editor's built-in browser). Speech recognition needs Google's speech service, which isn't available here. ${DESKTOP_BROWSER_HINT}`,
    };
  }

  if (isBrave) {
    return {
      hasApi,
      likelyBlocked: true,
      talkUnavailable: true,
      reason: `Brave doesn't include the speech service this app relies on. ${DESKTOP_BROWSER_HINT}`,
    };
  }

  return { hasApi, likelyBlocked: false, talkUnavailable: false, reason: null };
}
