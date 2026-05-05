import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Volume2, Loader2 } from "lucide-react";
import { speak } from "@/lib/practiceUtils";
import { FeedbackCard } from "./FeedbackCard";
import { scorePTE, saveAttempt, ScoreResult } from "@/lib/scorePTE";
import { meta, MCQQ } from "@/lib/practiceBank";
import { toast } from "sonner";

type Props = {
  slug: string;
  q: MCQQ;
  multi: boolean;
  audio?: boolean;
  questionType: string;
  onNext: () => void;
};

export const MCQInterface = ({ slug, q, multi, audio, questionType, onNext }: Props) => {
  const [picked, setPicked] = useState<number[]>([]);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const toggle = (i: number) => {
    if (multi) setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    else setPicked([i]);
  };

  const submit = async () => {
    if (!picked.length) { toast.error("Please pick an answer."); return; }
    setScoring(true);
    try {
      const userAnswer = picked.map((i) => q.options[i]).join("; ");
      const expected = q.correct.map((i) => q.options[i]).join("; ");
      const correctSet = new Set(q.correct);
      const pickedSet = new Set(picked);
      const allCorrect = picked.length === q.correct.length && picked.every((i) => correctSet.has(i));

      const r = await scorePTE({
        questionType,
        questionPrompt: `${q.passage || q.audioText || ""}\n\nQuestion: ${q.question}\nOptions: ${q.options.map((o, i) => `${i + 1}. ${o}`).join(" | ")}`,
        userResponse: `Picked: ${userAnswer}. ${allCorrect ? "All correct." : "Some incorrect."}`,
        criteria: ["Accuracy"],
        expected,
      });
      // override score deterministically based on correctness
      const correctCount = picked.filter((i) => correctSet.has(i)).length;
      const wrongCount = picked.filter((i) => !correctSet.has(i)).length;
      const accuracy = Math.max(0, correctCount - wrongCount) / q.correct.length;
      const overall = Math.round(accuracy * 90);
      const final: ScoreResult = { ...r, overall, breakdown: [{ label: "Accuracy", score: overall }] };
      setResult(final);
      const m = meta[slug];
      await saveAttempt({
        slug, name: m.name, category: m.category, score: overall,
        breakdown: final.breakdown,
        feedback: { strengths: final.strengths, improvements: final.improvements, modelAnswer: final.modelAnswer },
        userResponse: userAnswer,
      });
    } catch (e: any) { toast.error(e.message || "Scoring failed"); }
    finally { setScoring(false); }
  };

  const reset = () => { setPicked([]); setResult(null); };

  if (result || scoring) return <FeedbackCard result={result} loading={scoring} onRetry={reset} onNext={onNext} />;

  return (
    <div className="space-y-5">
      {audio && q.audioText ? (
        <div className="glass rounded-2xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Audio</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap play, then answer.</p>
          </div>
          <Button variant="hero" onClick={() => speak(q.audioText!)}><Volume2 className="h-4 w-4 mr-2" /> Play</Button>
        </div>
      ) : q.passage ? (
        <div className="glass rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Passage</p>
          <p className="text-base leading-relaxed">{q.passage}</p>
        </div>
      ) : null}

      <div className="glass rounded-2xl p-6 space-y-4">
        <p className="font-semibold">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const selected = picked.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  selected ? "border-primary bg-primary/10" : "border-border bg-secondary/40 hover:bg-secondary/60"
                }`}
              >
                {multi ? (
                  <Checkbox checked={selected} className="mt-0.5 pointer-events-none" />
                ) : (
                  <span className={`mt-0.5 h-4 w-4 rounded-full border-2 ${selected ? "border-accent bg-accent" : "border-border"}`} />
                )}
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
        </div>
        <Button variant="hero" size="lg" className="w-full" onClick={submit} disabled={scoring}>
          {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
        </Button>
      </div>
    </div>
  );
};
