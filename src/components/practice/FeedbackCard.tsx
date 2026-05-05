import { CheckCircle2, XCircle, Lightbulb, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreResult } from "@/lib/scorePTE";

export const FeedbackCard = ({
  result,
  loading,
  onRetry,
  onNext,
}: {
  result: ScoreResult | null;
  loading: boolean;
  onRetry: () => void;
  onNext: () => void;
}) => {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-accent" />
        <p className="mt-4 text-sm text-muted-foreground">AI is scoring your response…</p>
      </div>
    );
  }
  if (!result) return null;

  return (
    <div className="gradient-border rounded-2xl animate-scale-in">
      <div className="glass-strong rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Overall Score</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-6xl md:text-7xl font-display font-extrabold gradient-text">{Math.round(result.overall)}</span>
              <span className="text-muted-foreground mb-2">/ 90</span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            {result.breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{b.label}</span>
                  <span className="tabular-nums">{Math.round(b.score)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${Math.min(100, (b.score / 90) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" /> What you did well
            </div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/90">
              {result.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-emerald-400">•</span>{s}</li>)}
            </ul>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <XCircle className="h-4 w-4" /> What to improve
            </div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/90">
              {result.improvements.map((s, i) => <li key={i} className="flex gap-2"><span className="text-rose-400">•</span>{s}</li>)}
            </ul>
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 text-accent font-semibold text-sm">
            <Lightbulb className="h-4 w-4" /> Model answer
          </div>
          <p className="mt-3 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{result.modelAnswer}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="glass" size="lg" onClick={onRetry} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" /> Try Again
          </Button>
          <Button variant="hero" size="lg" onClick={onNext} className="flex-1">
            Next Question <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
