function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function microphoneDeniedMessage(): string {
  if (isMobile()) {
    return (
      'Microphone access was blocked for this website. On mobile Chrome, open ' +
      'Site settings (tap the lock or ⋮ icon next to the address bar), set ' +
      'Microphone to Allow, then reload the page and press Talk again. ' +
      'Allowing the microphone in Chrome\u2019s main settings is not enough — ' +
      'this site needs its own permission too.'
    );
  }
  return (
    'Microphone access was blocked for this website. Click the lock icon ' +
    'next to the address bar, allow the microphone for this site, reload, ' +
    'and press Talk again.'
  );
}

/**
 * Request mic permission explicitly before SpeechRecognition.start().
 * On Android Chrome this often surfaces the prompt and avoids immediate
 * not-allowed errors when only global mic access is enabled.
 */
export async function requestMicrophoneAccess(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return true;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return false;
  }
}
