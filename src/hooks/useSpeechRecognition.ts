import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognitionCtor: (new () => SpeechRecognition) | null =
  typeof window !== 'undefined'
    ? window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
    : null;

const BACKOFF_MS = [500, 1000, 2000, 3000, 5000];
const MAX_NETWORK_RETRIES = BACKOFF_MS.length;

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isRetrying: boolean;
  finalTranscript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  isSupported: boolean;
  error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wantListeningRef = useRef(false);
  const committedRef = useRef('');
  const interimRef = useRef('');
  const retryCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported = !!SpeechRecognitionCtor;

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;

    const rec = new SpeechRecognitionCtor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    const scheduleRestart = (delayMs: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!wantListeningRef.current) return;
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }, delayMs);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      // Bug 2 fix: ignore late results that arrive after the user clicked Stop
      if (!wantListeningRef.current) return;

      if (retryCountRef.current > 0) {
        retryCountRef.current = 0;
        setIsRetrying(false);
      }

      let sessionFinal = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          sessionFinal += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const base = committedRef.current;
      const trimmed = sessionFinal.trim();
      const full = trimmed
        ? base
          ? base + ' ' + trimmed
          : trimmed
        : base;

      setFinalTranscript(full);
      interimRef.current = interim;
      setInterimTranscript(interim);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError(
          'Microphone access was denied. Please allow microphone access in your browser settings.',
        );
        setIsListening(false);
        wantListeningRef.current = false;
      } else if (event.error === 'no-speech' || event.error === 'aborted') {
        /* silence timeout or user abort — onend will handle restart */
      } else if (event.error === 'network') {
        retryCountRef.current++;
        if (retryCountRef.current > MAX_NETWORK_RETRIES) {
          setIsRetrying(false);
          setError(
            'Could not reach the speech service after several attempts. ' +
              'Check your internet connection and click Start Listening to try again.',
          );
          setIsListening(false);
          wantListeningRef.current = false;
        } else {
          setIsRetrying(true);
        }
      } else if (event.error === 'audio-capture') {
        setError(
          'No microphone was found. Make sure a microphone is plugged in.',
        );
        setIsListening(false);
        wantListeningRef.current = false;
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    rec.onend = () => {
      if (wantListeningRef.current) {
        // Auto-restart path: commit finals, keep interim alive for next session
        setFinalTranscript(prev => {
          committedRef.current = prev;
          return prev;
        });
        setInterimTranscript('');
        interimRef.current = '';

        const r = retryCountRef.current;
        if (r > 0 && r <= MAX_NETWORK_RETRIES) {
          scheduleRestart(BACKOFF_MS[r - 1]);
        } else {
          try {
            rec.start();
          } catch {
            /* already started */
          }
        }
      } else {
        // User-initiated stop path: rescue already happened synchronously
        // in stopListening, so just commit and clean up.
        setFinalTranscript(prev => {
          committedRef.current = prev;
          return prev;
        });
        setInterimTranscript('');
        interimRef.current = '';
        setIsListening(false);
        setIsRetrying(false);
      }
    };

    recognitionRef.current = rec;

    return () => {
      wantListeningRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setIsRetrying(false);
    retryCountRef.current = 0;
    wantListeningRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      /* already running */
    }
  }, []);

  const stopListening = useCallback(() => {
    // Mark intent to stop first — guards onresult and onend
    wantListeningRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);

    // Bug 1 fix: synchronously rescue any interim text BEFORE calling stop()
    const leftover = interimRef.current.trim();
    interimRef.current = '';
    setInterimTranscript('');
    if (leftover) {
      setFinalTranscript(prev => {
        const updated = prev ? prev + ' ' + leftover : leftover;
        committedRef.current = updated;
        return updated;
      });
    }

    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setIsListening(false);
    setIsRetrying(false);
  }, []);

  const clearTranscript = useCallback(() => {
    committedRef.current = '';
    interimRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isRetrying,
    finalTranscript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    isSupported,
    error,
  };
}
