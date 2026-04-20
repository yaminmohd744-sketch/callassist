import { useCallback, useEffect, useState } from 'react';
import type { ProspectTone } from '../types';

const TONE_PARAMS: Record<ProspectTone | string, { rate: number; pitch: number }> = {
  Skeptical:  { rate: 0.91, pitch: 0.87 },
  Defensive:  { rate: 1.13, pitch: 1.09 },
  Warm:       { rate: 1.00, pitch: 1.14 },
  Frustrated: { rate: 1.19, pitch: 1.06 },
  Disengaged: { rate: 0.80, pitch: 0.80 },
  Curious:    { rate: 1.00, pitch: 1.07 },
  Excited:    { rate: 1.11, pitch: 1.20 },
  Hesitant:   { rate: 0.83, pitch: 0.91 },
  Neutral:    { rate: 1.00, pitch: 1.00 },
};

// Ordered list of preferred voice name fragments — more natural-sounding voices first
const VOICE_PREFS = [
  'Samantha', 'Karen', 'Victoria', 'Moira', 'Tessa', 'Fiona',
  'Google US English', 'Google UK English Female',
  'Microsoft Zira', 'Microsoft Mark',
];

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!voices.length) return null;
  const langPrefix = lang.split('-')[0];
  const pool = voices.filter(v => v.lang.startsWith(langPrefix));
  const candidates = pool.length ? pool : voices;
  for (const pref of VOICE_PREFS) {
    const found = candidates.find(v => v.name.includes(pref));
    if (found) return found;
  }
  return candidates[0] ?? null;
}

export function useProspectVoice(lang = 'en-US') {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Eagerly trigger voice loading so they're available on first speak() call
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.getVoices();
    const noop = () => {};
    synth.addEventListener('voiceschanged', noop);
    return () => synth.removeEventListener('voiceschanged', noop);
  }, []);

  const speak = useCallback((text: string, tone?: ProspectTone | string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel();

    const params = TONE_PARAMS[tone ?? 'Neutral'] ?? TONE_PARAMS['Neutral'];
    const utter = new SpeechSynthesisUtterance(text);

    const voice = pickVoice(lang);
    if (voice) utter.voice = voice;
    utter.rate   = params.rate;
    utter.pitch  = params.pitch;
    utter.volume = 1;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend   = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    synth.speak(utter);
  }, [lang]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
}
