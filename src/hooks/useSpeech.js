"use client";
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Cross-browser Speech hook.
 *
 * Design principles:
 *  - Recognition instance is created ONCE (empty dep array).
 *  - All mutable state that callbacks need is accessed via refs,
 *    so closures never go stale.
 *  - `speak()` returns a Promise that resolves when the utterance
 *    truly finishes, preventing runaway question chains.
 *  - Transcript is accumulated across pauses (append, never replace).
 *  - `warmup()` must be called synchronously from a click handler
 *    to unlock audio in Chromium browsers.
 */
export function useSpeech() {
  /* ---- state exposed to consumers ---- */
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [error, setError] = useState(null);

  /* ---- refs (never cause re-renders, never go stale in callbacks) ---- */
  const recognitionRef = useRef(null);
  const wantListeningRef = useRef(false);
  const mountedRef = useRef(true);
  const accumulatedRef = useRef("");
  const heartbeatRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const voicesReadyRef = useRef(false);

  /* --------------------------------------------------------------- */
  /*  ONE-TIME initialisation (empty dependency array)                */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    /* -- STT -- */
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      setSttSupported(true);

      const rec = new SR();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event) => {
        let chunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            chunk += event.results[i][0].transcript;
          }
        }
        if (chunk) {
          const trimmed = chunk.trim();
          accumulatedRef.current = accumulatedRef.current
            ? `${accumulatedRef.current} ${trimmed}`
            : trimmed;
          setTranscript(accumulatedRef.current);
        }
      };

      rec.onerror = (e) => {
        if (e.error === "no-speech" || e.error === "aborted") return;
        console.error("[STT] error:", e.error);
        if (e.error === "not-allowed") {
          setError("Microphone access denied. Please allow mic permissions.");
          wantListeningRef.current = false;
          setIsListening(false);
        }
      };

      rec.onend = () => {
        if (wantListeningRef.current && mountedRef.current) {
          try { rec.start(); } catch (_) {}
        } else {
          setIsListening(false);
        }
      };

      rec.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current = rec;
    }

    /* -- TTS -- */
    if (window.speechSynthesis) {
      setTtsSupported(true);

      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) voicesReadyRef.current = true;
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    /* -- cleanup -- */
    return () => {
      mountedRef.current = false;
      wantListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, []);

  /* --------------------------------------------------------------- */
  /*  STT controls                                                    */
  /* --------------------------------------------------------------- */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (wantListeningRef.current) return;

    wantListeningRef.current = true;
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (_) {}
  }, []);

  const stopListening = useCallback(() => {
    wantListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    accumulatedRef.current = "";
    setTranscript("");
  }, []);

  /* --------------------------------------------------------------- */
  /*  TTS warmup - MUST be called synchronously from a click handler  */
  /*  This "unlocks" audio in Chrome/Thorium/Safari so that later     */
  /*  speak() calls (which happen in setTimeout/async) still work.    */
  /* --------------------------------------------------------------- */
  const warmup = useCallback(() => {
    if (audioUnlockedRef.current) return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();
    // Speak a silent utterance to unlock the audio context
    const silent = new SpeechSynthesisUtterance(" ");
    silent.volume = 0.01; // near-silent but valid
    silent.rate = 10;     // as fast as possible
    synth.speak(silent);
    audioUnlockedRef.current = true;
  }, []);

  /* --------------------------------------------------------------- */
  /*  TTS - returns a Promise that resolves when speech truly ends    */
  /* --------------------------------------------------------------- */
  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) { resolve(); return; }

      // Cancel anything in-flight (including warmup residue)
      synth.cancel();

      // Wait for voices to be available (up to 2s)
      const waitForVoices = () => {
        return new Promise((res) => {
          const voices = synth.getVoices();
          if (voices.length > 0) { res(voices); return; }
          // Poll every 100ms, timeout after 2s
          let elapsed = 0;
          const interval = setInterval(() => {
            elapsed += 100;
            const v = synth.getVoices();
            if (v.length > 0 || elapsed >= 2000) {
              clearInterval(interval);
              res(v);
            }
          }, 100);
        });
      };

      // Short delay after cancel() so Chromium doesn't treat
      // the next utterance as "cancelled"
      setTimeout(async () => {
        if (!mountedRef.current) { resolve(); return; }

        const voices = await waitForVoices();

        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = "en-US";
        utt.rate = 1.0;
        utt.pitch = 1.0;

        // Pick the best voice
        const pick =
          voices.find(v => v.lang === "en-US" && /google|natural/i.test(v.name)) ||
          voices.find(v => v.lang === "en-US") ||
          voices.find(v => v.lang?.startsWith("en")) ||
          voices[0] ||
          null;
        if (pick) utt.voice = pick;

        let resolved = false;
        const finish = () => {
          if (resolved) return;
          resolved = true;
          if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
          }
          setIsSpeaking(false);
          resolve();
        };

        // Safety timeout: if nothing happens in 15s, force-resolve
        const safetyTimeout = setTimeout(() => {
          if (!resolved) {
            console.warn("[TTS] safety timeout fired - forcing resolve");
            synth.cancel();
            finish();
          }
        }, 30000);

        utt.onstart = () => {
          setIsSpeaking(true);
        };
        utt.onend = () => {
          clearTimeout(safetyTimeout);
          finish();
        };
        utt.onerror = (e) => {
          console.warn("[TTS] error:", e?.error || e);
          clearTimeout(safetyTimeout);
          finish();
        };

        synth.speak(utt);

        // Chrome/Thorium bug: long utterances get cut off silently.
        // A pause/resume heartbeat keeps them alive.
        heartbeatRef.current = setInterval(() => {
          if (!synth.speaking) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
            finish();
          } else {
            synth.pause();
            synth.resume();
          }
        }, 5000);
      }, 200);
    });
  }, []);

  const cancelSpeech = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  /* --------------------------------------------------------------- */
  return {
    // STT
    isListening,
    transcript,
    sttSupported,
    startListening,
    stopListening,
    resetTranscript,
    // TTS
    isSpeaking,
    ttsSupported,
    speak,
    cancelSpeech,
    warmup,
    // misc
    error,
    setTranscript,
  };
}
