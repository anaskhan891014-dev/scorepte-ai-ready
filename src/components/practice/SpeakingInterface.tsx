import { useEffect, useRef, useState } from "react";
import { Mic, Square, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime, speak, stopSpeaking, playBeep, useCountdown } from "@/lib/practiceUtils";
import { FeedbackCard } from "./FeedbackCard";
import { scorePTE, saveAttempt, ScoreResult } from "@/lib/scorePTE";
import { meta } from "@/lib/practiceBank";

type Props = {
  slug: string;
  prompt: string;        // shown text (or hidden if audioOnly)
  audioOnly?: boolean;   // if true, prompt is read aloud and not shown until after
  prepSeconds: number;
  recordSeconds: number;
  criteria: string[];    // scoring criteria
  questionType: string;  // human-readable for AI
  onNext: () => void;
};

export const SpeakingInterface = (p: Props) => {
  const [phase, setPhase] = useState<"idle" | "playing" | "prep" | "recording" | "scoring" | "done">("idle");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [level, setLevel] = useState(0);
  const [errorText, setErrorText] = useState("");
  const recRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const prep = useCountdown(p.prepSeconds);
  const rec = useCountdown(p.recordSeconds);

  // auto-flow
  useEffect(() => {
    if (phase === "prep" && prep.left === 0) startRecording();
    if (phase === "recording" && rec.left === 0) stopRecording();
  }, [prep.left, rec.left, phase]);

  useEffect(() => () => {
    stopSpeaking();
    cleanupMic();
  }, []);

  const cleanupMic = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null; audioCtxRef.current = null;
    try { recRef.current?.stop?.(); } catch {}
  };

  const start = async () => {
    setResult(null); setTranscript(""); setErrorText(""); setPhase("playing");
    if (p.audioOnly) {
      speak(p.prompt);
      // wait for speech to finish ~ approximate by length
      const ms = Math.min(40000, Math.max(2500, p.prompt.length * 60));
      setTimeout(() => beginPrepOrRecord(), ms);
    } else {
      beginPrepOrRecord();
    }
  };

  const beginPrepOrRecord = async () => {
    if (p.prepSeconds > 0) { setPhase("prep"); prep.start(); }
    else startRecording();
  };

  const startRecording = async () => {
    await playBeep();
    setPhase("recording"); rec.start();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(avg / 255);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setErrorText("Microphone access denied — type your response in the box below.");
    }

    // Web Speech API for transcript
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = "en-US";
      let full = "";
      r.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) full += t + " ";
          else interim += t;
        }
        setTranscript(full + interim);
      };
      r.onerror = () => {};
      try { r.start(); recRef.current = r; } catch {}
    }
  };

  const stopRecording = async () => {
    cleanupMic(); rec.stop();
    setPhase("scoring");
    try {
      const finalText = transcript.trim() || "(silent attempt — no speech detected)";
      const r = await scorePTE({
        questionType: p.questionType,
        questionPrompt: p.prompt,
        userResponse: finalText,
        criteria: p.criteria,
        modelAnswer: true,
      });
      setResult(r); setPhase("done");
      const m = meta[p.slug];
      await saveAttempt({
        slug: p.slug, name: m.name, category: m.category,
        score: r.overall, breakdown: r.breakdown,
        feedback: { strengths: r.strengths, improvements: r.improvements, modelAnswer: r.modelAnswer },
        userResponse: finalText,
      });
    } catch (e: any) {
      setErrorText("Something went wrong, please try again"); setPhase("idle");
    }
  };

  const reset = () => { setResult(null); setTranscript(""); setErrorText(""); setPhase("idle"); prep.reset(); rec.reset(); };

  return (
    <div className="space-y-5">
      {!p.audioOnly && (
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Prompt</p>
          <p className="text-base md:text-lg leading-relaxed">{p.prompt}</p>
        </div>
      )}

      {p.audioOnly && phase !== "idle" && phase !== "playing" && (
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Audio transcript (revealed after listening)</p>
          <p className="text-base leading-relaxed text-foreground/80">{p.prompt}</p>
        </div>
      )}

      <div className="glass rounded-2xl p-6 space-y-5">
        {phase === "idle" && (
          <Button variant="hero" size="lg" onClick={start} className="w-full">
            {p.audioOnly ? <><Volume2 className="h-4 w-4 mr-2" /> Play Audio & Begin</> : "Start"}
          </Button>
        )}
        {errorText && <p className="text-sm text-destructive text-center">{errorText}</p>}
        {phase === "playing" && (
          <div className="text-center text-muted-foreground flex items-center justify-center gap-2">
            <Volume2 className="h-4 w-4 text-accent animate-pulse" /> Listening to audio…
          </div>
        )}
        {phase === "prep" && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Preparation</p>
            <p className="mt-2 text-5xl font-display font-extrabold gradient-text tabular-nums">{formatTime(prep.left)}</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <p className="text-sm text-muted-foreground">Recording starts automatically</p>
              <button onClick={() => { prep.skip(); startRecording(); }} className="text-xs px-2.5 py-1 rounded-md bg-secondary/70 text-muted-foreground hover:text-foreground transition">Skip →</button>
            </div>
          </div>
        )}
        {phase === "recording" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" /> Recording
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">{formatTime(rec.left)}</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {[...Array(32)].map((_, i) => {
                const h = Math.max(4, Math.min(64, level * 64 * (0.4 + Math.sin((Date.now() / 100) + i) * 0.6 + 0.4)));
                return <div key={i} className="flex-1 rounded-full bg-gradient-primary" style={{ height: h }} />;
              })}
            </div>
            {transcript && <p className="text-xs text-muted-foreground italic line-clamp-3">"{transcript}"</p>}
            <Button variant="glass" size="lg" onClick={stopRecording} className="w-full">
              <Square className="h-4 w-4 mr-2" /> Stop & Submit
            </Button>
          </div>
        )}
        {phase === "scoring" && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-accent" />
            <p className="mt-3 text-sm text-muted-foreground">AI is scoring your response…</p>
          </div>
        )}
      </div>

      {phase === "done" && <FeedbackCard result={result} loading={false} onRetry={reset} onNext={p.onNext} />}
    </div>
  );
};
