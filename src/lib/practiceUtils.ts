import { useEffect, useRef, useState } from "react";

export const useCountdown = (seconds: number, autostart = false) => {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(autostart);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          window.clearInterval(ref.current!);
          setRunning(false);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);

  return {
    left,
    running,
    start: () => { setLeft(seconds); setRunning(true); },
    skip: () => { if (ref.current) window.clearInterval(ref.current); setLeft(0); setRunning(false); },
    stop: () => setRunning(false),
    reset: () => { setLeft(seconds); setRunning(false); },
  };
};

export const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const speak = (text: string, rate = 0.95) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
};

export const stopSpeaking = () => window.speechSynthesis?.cancel();

export const playBeep = async () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; o.type = "sine";
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o.start(); o.stop(ctx.currentTime + 0.25);
  } catch {}
};
