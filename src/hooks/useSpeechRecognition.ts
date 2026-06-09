import { useCallback, useEffect, useRef, useState } from 'react';
import {
  microphoneDeniedMessage,
  requestMicrophoneAccess,
} from '../utils/microphoneAccess';

const SpeechRecognitionCtor =
  typeof window !== 'undefined'
    ? window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
    : null;

// Continuous mode still ends on silence; restart quickly so it feels like one session.
const SILENCE_RESTART_MS = 250;
// Escalating backoff for transient "network" errors before we give up.
const BACKOFF_MS = [500, 1000, 2000, 4000, 8000];
const MAX_NETWORK_RETRIES = BACKOFF_MS.length;

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isRetrying: boolean;
  finalTranscript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  commitInterim: () => string;
  dismissError: () => void;
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

  // Effect-scoped control fns are stored here so the stable public callbacks
  // can reach the live recognition instance without re-creating it.
  const startRef = useRef<() => void>(() => {});
  const stopRef = useRef<() => void>(() => {});

  const isSupported = !!SpeechRecognitionCtor;

  const rescueInterim = useCallback((): string => {
    const leftover = interimRef.current.trim();
    interimRef.current = '';
    setInterimTranscript('');
    if (leftover) {
      const updated = committedRef.current
        ? `${committedRef.current} ${leftover}`
        : leftover;
      committedRef.current = updated;
      setFinalTranscript(updated);
      return updated;
    }
    return committedRef.current;
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;

    // A single, reused recognition instance. Recreating it on every restart
    // is what tends to provoke spurious "network" errors in Chrome.
    const rec = new SpeechRecognitionCtor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const restart = (delayMs: number) => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (!wantListeningRef.current) return;
        try {
          rec.start();
        } catch {
          /* already started — onend will drive the next restart */
        }
      }, delayMs);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      if (!wantListeningRef.current) return;

      // A real result proves the service is reachable, so any retry is over.
      if (retryCountRef.current > 0) {
        retryCountRef.current = 0;
        setIsRetrying(false);
      }

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          if (transcript) {
            committedRef.current = committedRef.current
              ? `${committedRef.current} ${transcript}`
              : transcript;
          }
        }
      }

      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (!event.results[i].isFinal) {
          interim += event.results[i][0].transcript;
        }
      }

      setFinalTranscript(committedRef.current);
      interimRef.current = interim;
      setInterimTranscript(interim);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      switch (event.error) {
        case 'not-allowed':
          setError(microphoneDeniedMessage());
          wantListeningRef.current = false;
          clearTimer();
          setIsListening(false);
          setIsRetrying(false);
          break;

        case 'service-not-allowed':
          setError(
            'Speech recognition is not allowed on this browser or device. Use the ' +
              'full Chrome or Edge app (not an in-app browser), allow the microphone ' +
              'for this site in browser settings, then reload and press Talk again.',
          );
          wantListeningRef.current = false;
          clearTimer();
          setIsListening(false);
          setIsRetrying(false);
          break;

        case 'audio-capture':
          setError('No microphone was found. Make sure a microphone is plugged in.');
          wantListeningRef.current = false;
          clearTimer();
          setIsListening(false);
          setIsRetrying(false);
          break;

        case 'no-speech':
        case 'aborted':
          // Benign: silence timeout or our own abort. onend handles the restart.
          break;

        case 'network':
          // IMPORTANT: only onresult clears the retry count, so repeated
          // failures escalate the backoff and eventually give up cleanly.
          retryCountRef.current += 1;
          if (retryCountRef.current > MAX_NETWORK_RETRIES) {
            wantListeningRef.current = false;
            clearTimer();
            setIsRetrying(false);
            setIsListening(false);
            setError(
              'Could not reach the speech service. This usually means no internet ' +
                'connection, or a VPN/firewall is blocking it. Check your connection ' +
                'and press Talk to try again.',
            );
          } else {
            setIsRetrying(true);
          }
          break;

        default:
          setError(`Speech recognition error: ${event.error}`);
      }
    };

    rec.onend = () => {
      // Un-finalized interim from a session that ended is dropped on auto-restart;
      // it is only rescued on an explicit stop (see stopRef below).
      interimRef.current = '';
      setInterimTranscript('');

      if (!wantListeningRef.current) {
        setIsListening(false);
        setIsRetrying(false);
        return;
      }

      const retries = retryCountRef.current;
      const delayMs =
        retries > 0
          ? BACKOFF_MS[Math.min(retries, MAX_NETWORK_RETRIES) - 1]
          : SILENCE_RESTART_MS;
      restart(delayMs);
    };

    startRef.current = () => {
      setError(null);
      setIsRetrying(false);
      retryCountRef.current = 0;
      wantListeningRef.current = true;
      setIsListening(true);
      clearTimer();

      void requestMicrophoneAccess().then(granted => {
        if (!wantListeningRef.current) return;
        if (!granted) {
          wantListeningRef.current = false;
          setIsListening(false);
          setError(microphoneDeniedMessage());
          return;
        }
        try {
          rec.start();
        } catch {
          /* already running */
        }
      });
    };

    stopRef.current = () => {
      wantListeningRef.current = false;
      clearTimer();
      rescueInterim();
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
      setIsListening(false);
      setIsRetrying(false);
    };

    return () => {
      wantListeningRef.current = false;
      clearTimer();
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, [rescueInterim]);

  const startListening = useCallback(() => {
    startRef.current();
  }, []);

  const stopListening = useCallback(() => {
    stopRef.current();
  }, []);

  const clearTranscript = useCallback(() => {
    committedRef.current = '';
    interimRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const commitInterim = useCallback(() => rescueInterim(), [rescueInterim]);

  const dismissError = useCallback(() => setError(null), []);

  return {
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
  };
}
