import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { speak } from "@/lib/practiceUtils";
import { FeedbackCard } from "./FeedbackCard";
import { scorePTE, saveAttempt, ScoreResult } from "@/lib/scorePTE";
import { meta, HIWQ } from "@/lib/practiceBank";

const tokenize = (s: string) => s.split(/(\s+)/);

export const HighlightIncorrect = ({ slug, q, questionType, onNext }: { slug: string; q: HIWQ; questionType: string; onNext: () => void }) => {
  const transcriptTokens = tokenize(q.transcript).filter((t) => t.trim());
  const spokenTokens = tokenize(q.spoken).filter((t) => t.trim());
  const wrongIndexes = new Set<number>();
  transcriptTokens.forEach((t, i) => {
    if ((spokenTokens[i] || "").toLowerCase().replace(/[.,]/g, "") !== t.toLowerCase().replace(/[.,]/g, "")) wrongIndexes.add(i);
  });

  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorText, setErrorText] = useState("");

  const toggle = (i: number) => {
    setPicked((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const submit = async () => {
    setErrorText("");
    setScoring(true);
    try {
      let correct = 0, wrong = 0;
      picked.forEach((i) => (wrongIndexes.has(i) ? correct++ : wrong++));
      const overall = Math.max(0, Math.round(((correct - wrong) / wrongIndexes.size) * 90));
      const r = await scorePTE({
        questionType,
        questionPrompt: `Transcript shown: "${q.transcript}". Audio actually said: "${q.spoken}".`,
        userResponse: `User picked words at positions: ${Array.from(picked).join(", ")}. Correct positions: ${Array.from(wrongIndexes).join(", ")}.`,
        criteria: ["Listening accuracy"],
      });
      const final: ScoreResult = { ...r, overall, breakdown: [{ label: "Accuracy", score: overall }] };
      setResult(final);
      const m = meta[slug];
      await saveAttempt({
        slug, name: m.name, category: m.category, score: overall,
        breakdown: final.breakdown,
        feedback: { strengths: final.strengths, improvements: final.improvements, modelAnswer: final.modelAnswer },
        userResponse: Array.from(picked).map((i) => transcriptTokens[i]).join(", "),
      });
    } catch { setErrorText("Something went wrong, please try again"); }
    finally { setScoring(false); }
  };

  const reset = () => { setPicked(new Set()); setResult(null); setErrorText(""); };

  if (result || scoring) return <FeedbackCard result={result} loading={scoring} onRetry={reset} onNext={onNext} />;

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Audio</p>
          <p className="mt-1 text-sm text-muted-foreground">Click the words that differ from what you hear.</p>
        </div>
        <Button variant="hero" onClick={() => speak(q.spoken)}><Volume2 className="h-4 w-4 mr-2" /> Play</Button>
      </div>
      <div className="glass rounded-2xl p-6 leading-loose text-base">
        {transcriptTokens.map((t, i) => (
          <span key={i}>
            <button
              onClick={() => toggle(i)}
              className={`px-1.5 rounded transition-colors ${picked.has(i) ? "bg-rose-500/20 text-rose-300" : "hover:bg-secondary"}`}
            >
              {t}
            </button>{" "}
          </span>
        ))}
      </div>
      <Button variant="hero" size="lg" className="w-full" onClick={submit} disabled={scoring}>
        {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
      </Button>
      {errorText && <p className="text-sm text-destructive text-center">{errorText}</p>}
    </div>
  );
};
