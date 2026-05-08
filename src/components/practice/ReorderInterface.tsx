import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { FeedbackCard } from "./FeedbackCard";
import { scorePTE, saveAttempt, ScoreResult } from "@/lib/scorePTE";
import { meta, ReorderQ } from "@/lib/practiceBank";
import { toast } from "sonner";

type Props = { slug: string; q: ReorderQ; questionType: string; onNext: () => void };

export const ReorderInterface = ({ slug, q, questionType, onNext }: Props) => {
  const initial = useMemo(() => [...q.items].sort(() => Math.random() - 0.5), [q.items]);
  const [order, setOrder] = useState(initial);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [errorText, setErrorText] = useState("");

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const arr = [...order]; [arr[i], arr[j]] = [arr[j], arr[i]];
    setOrder(arr);
  };

  const submit = async () => {
    setErrorText("");
    setScoring(true);
    try {
      const userOrder = order.map((o) => o.id);
      let correctPairs = 0;
      for (let i = 0; i < userOrder.length - 1; i++) {
        const a = q.correct.indexOf(userOrder[i]);
        const b = q.correct.indexOf(userOrder[i + 1]);
        if (b === a + 1) correctPairs++;
      }
      const overall = Math.round((correctPairs / (q.correct.length - 1)) * 90);
      const r = await scorePTE({
        questionType,
        questionPrompt: "Re-order paragraphs in logical order.",
        userResponse: `User order: ${userOrder.join(" → ")}. Correct: ${q.correct.join(" → ")}.`,
        criteria: ["Logical order"],
        expected: q.correct,
      });
      const final: ScoreResult = { ...r, overall, breakdown: [{ label: "Order accuracy", score: overall }] };
      setResult(final);
      const m = meta[slug];
      await saveAttempt({
        slug, name: m.name, category: m.category, score: overall,
        breakdown: final.breakdown,
        feedback: { strengths: final.strengths, improvements: final.improvements, modelAnswer: final.modelAnswer },
        userResponse: userOrder.join(" → "),
      });
    } catch { setErrorText("Something went wrong, please try again"); }
    finally { setScoring(false); }
  };

  const reset = () => { setOrder([...q.items].sort(() => Math.random() - 0.5)); setResult(null); setErrorText(""); };

  if (result || scoring) return <FeedbackCard result={result} loading={scoring} onRetry={reset} onNext={onNext} />;

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Re-order paragraphs into a logical sequence</p>
        <ul className="space-y-2">
          {order.map((it, i) => (
            <li key={it.id} className="glass rounded-xl p-4 flex items-start gap-3">
              <span className="h-7 w-7 shrink-0 rounded-lg bg-gradient-primary grid place-items-center text-xs font-bold text-primary-foreground">{i + 1}</span>
              <p className="flex-1 text-sm">{it.text}</p>
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, -1)} className="p-1 rounded hover:bg-secondary"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => move(i, 1)} className="p-1 rounded hover:bg-secondary"><ArrowDown className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Button variant="hero" size="lg" className="w-full" onClick={submit} disabled={scoring}>
        {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
      </Button>
      {errorText && <p className="text-sm text-destructive text-center">{errorText}</p>}
    </div>
  );
};
