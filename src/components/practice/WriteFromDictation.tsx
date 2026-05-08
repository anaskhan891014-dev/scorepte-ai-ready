import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, Loader2 } from "lucide-react";
import { speak } from "@/lib/practiceUtils";
import { FeedbackCard } from "./FeedbackCard";
import { scorePTE, saveAttempt, ScoreResult } from "@/lib/scorePTE";
import { meta, WFDQ } from "@/lib/practiceBank";

export const WriteFromDictation = ({ slug, q, questionType, onNext }: { slug: string; q: WFDQ; questionType: string; onNext: () => void }) => {
  const [text, setText] = useState("");
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorText, setErrorText] = useState("");

  const score = () => {
    const norm = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, "").trim().split(/\s+/);
    const a = norm(text), b = norm(q.audioText);
    const matches = a.filter((w, i) => w === b[i]).length;
    return Math.round((matches / b.length) * 90);
  };

  const submit = async () => {
    if (!text.trim()) { setErrorText("Type the sentence."); return; }
    setErrorText("");
    setScoring(true);
    try {
      const overall = score();
      const r = await scorePTE({
        questionType,
        questionPrompt: `Audio said: "${q.audioText}".`,
        userResponse: text,
        criteria: ["Spelling", "Word accuracy"],
        expected: q.audioText,
      });
      const final: ScoreResult = { ...r, overall, breakdown: [{ label: "Accuracy", score: overall }] };
      setResult(final);
      const m = meta[slug];
      await saveAttempt({
        slug, name: m.name, category: m.category, score: overall,
        breakdown: final.breakdown,
        feedback: { strengths: final.strengths, improvements: final.improvements, modelAnswer: final.modelAnswer },
        userResponse: text,
      });
    } catch { setErrorText("Something went wrong, please try again"); }
    finally { setScoring(false); }
  };

  const reset = () => { setText(""); setResult(null); setErrorText(""); };

  if (result || scoring) return <FeedbackCard result={result} loading={scoring} onRetry={reset} onNext={onNext} />;

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Dictation</p>
          <p className="mt-1 text-sm text-muted-foreground">Listen and type exactly what you hear.</p>
        </div>
        <Button variant="hero" onClick={() => speak(q.audioText)}><Volume2 className="h-4 w-4 mr-2" /> Play</Button>
      </div>
      <div className="glass rounded-2xl p-6 space-y-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type what you heard…"
          className="bg-secondary/40 border-border"
        />
        <Button variant="hero" size="lg" className="w-full" onClick={submit} disabled={scoring}>
          {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
        </Button>
        {errorText && <p className="text-sm text-destructive text-center">{errorText}</p>}
      </div>
    </div>
  );
};
