import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTime, useCountdown } from "@/lib/practiceUtils";
import { FeedbackCard } from "./FeedbackCard";
import { scorePTE, saveAttempt, ScoreResult } from "@/lib/scorePTE";
import { meta } from "@/lib/practiceBank";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
  slug: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  minutes: number;
  criteria: string[];
  questionType: string;
  onNext: () => void;
};

export const WritingInterface = (p: Props) => {
  const [text, setText] = useState("");
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const timer = useCountdown(p.minutes * 60, true);

  const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
  const inRange = wc >= p.minWords && wc <= p.maxWords;

  useEffect(() => {
    if (timer.left === 0 && !result && !scoring && text.trim()) submit();
  }, [timer.left]);

  const submit = async () => {
    if (!text.trim()) { toast.error("Please write a response."); return; }
    setScoring(true);
    try {
      const r = await scorePTE({
        questionType: p.questionType,
        questionPrompt: p.prompt,
        userResponse: text,
        criteria: p.criteria,
        modelAnswer: true,
      });
      setResult(r); timer.stop();
      const m = meta[p.slug];
      await saveAttempt({
        slug: p.slug, name: m.name, category: m.category,
        score: r.overall, breakdown: r.breakdown,
        feedback: { strengths: r.strengths, improvements: r.improvements, modelAnswer: r.modelAnswer },
        userResponse: text,
      });
    } catch (e: any) { toast.error(e.message || "Scoring failed"); }
    finally { setScoring(false); }
  };

  const reset = () => { setText(""); setResult(null); timer.reset(); setTimeout(() => timer.start(), 50); };

  if (result || scoring) return <FeedbackCard result={result} loading={scoring} onRetry={reset} onNext={p.onNext} />;

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Prompt</p>
        <p className="text-base md:text-lg leading-relaxed">{p.prompt}</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Words: </span>
            <span className={`font-semibold tabular-nums ${inRange ? "text-emerald-400" : "text-amber-400"}`}>{wc}</span>
            <span className="text-muted-foreground"> / {p.minWords}–{p.maxWords}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Time left: </span>
              <span className="font-semibold tabular-nums text-accent">{formatTime(timer.left)}</span>
            </div>
          </div>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your response here…"
          className="min-h-[280px] bg-secondary/40 border-border resize-y text-base leading-relaxed"
        />
        <Button variant="hero" size="lg" onClick={submit} disabled={scoring} className="w-full">
          {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for AI Scoring"}
        </Button>
      </div>
    </div>
  );
};
