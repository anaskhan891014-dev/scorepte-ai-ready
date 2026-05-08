import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { speak, playBeep } from "@/lib/practiceUtils";
import { FeedbackCard } from "./FeedbackCard";
import { scorePTE, saveAttempt, ScoreResult } from "@/lib/scorePTE";
import { meta, SMWQ } from "@/lib/practiceBank";
import { toast } from "sonner";

export const SelectMissingWord = ({ slug, q, questionType, onNext }: { slug: string; q: SMWQ; questionType: string; onNext: () => void }) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorText, setErrorText] = useState("");

  const play = async () => {
    speak(q.audioText);
    setTimeout(playBeep, q.audioText.length * 60);
  };

  const submit = async () => {
    if (picked === null) { setErrorText("Pick a word."); return; }
    setErrorText("");
    setScoring(true);
    try {
      const correct = picked === q.correct;
      const overall = correct ? 90 : 0;
      const r = await scorePTE({
        questionType,
        questionPrompt: `Audio: "${q.audioText} ____". Options: ${q.options.join(", ")}.`,
        userResponse: q.options[picked],
        criteria: ["Accuracy"],
        expected: q.options[q.correct],
      });
      const final: ScoreResult = { ...r, overall, breakdown: [{ label: "Accuracy", score: overall }] };
      setResult(final);
      const m = meta[slug];
      await saveAttempt({
        slug, name: m.name, category: m.category, score: overall,
        breakdown: final.breakdown,
        feedback: { strengths: final.strengths, improvements: final.improvements, modelAnswer: final.modelAnswer },
        userResponse: q.options[picked],
      });
    } catch { setErrorText("Something went wrong, please try again"); }
    finally { setScoring(false); }
  };

  const reset = () => { setPicked(null); setResult(null); setErrorText(""); };

  if (result || scoring) return <FeedbackCard result={result} loading={scoring} onRetry={reset} onNext={onNext} />;

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Audio</p>
          <p className="mt-1 text-sm text-muted-foreground">A beep replaces the missing word.</p>
        </div>
        <Button variant="hero" onClick={play}><Volume2 className="h-4 w-4 mr-2" /> Play</Button>
      </div>
      <div className="glass rounded-2xl p-6 space-y-3">
        <p className="font-semibold">Select the missing word</p>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((o, i) => (
            <button
              key={o}
              onClick={() => setPicked(i)}
              className={`p-4 rounded-xl border text-sm transition-all ${
                picked === i ? "border-primary bg-primary/10" : "border-border bg-secondary/40 hover:bg-secondary/60"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        <Button variant="hero" size="lg" className="w-full" onClick={submit} disabled={scoring}>
          {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
        </Button>
        {errorText && <p className="text-sm text-destructive text-center">{errorText}</p>}
      </div>
    </div>
  );
};
