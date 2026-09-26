import { useCallback, useEffect, useRef, useState } from "react";
import { LANG_OPTIONS, useI18n } from "../i18n";

const TTS_URL = import.meta.env.VITE_TTS_URL as string | undefined;

/**
 * Read text aloud in the current language.
 * Uses the team's AI4Bharat TTS service when VITE_TTS_URL is set
 * (POST { text, lang } returning audio), otherwise the browser's built-in voices.
 */
export function useSpeech() {
  const { lang } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supported = Boolean(TTS_URL) || (typeof window !== "undefined" && "speechSynthesis" in window);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    audioRef.current?.pause();
    setSpeaking(false);
  }, []);

  useEffect(() => stop, [stop]);

  const speak = useCallback(
    async (text: string, textLang: string = lang) => {
      stop();
      const speechLang = LANG_OPTIONS.find((l) => l.code === textLang)?.speech ?? "en-IN";
      if (TTS_URL) {
        try {
          const res = await fetch(TTS_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, lang: textLang }) });
          if (res.ok) {
            const url = URL.createObjectURL(await res.blob());
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => setSpeaking(false);
            setSpeaking(true);
            await audio.play();
            return;
          }
        } catch {
          /* fall back to browser voices */
        }
      }
      if (!("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang;
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(speechLang.slice(0, 2)));
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [lang, stop],
  );

  return { speak, stop, speaking, supported };
}
