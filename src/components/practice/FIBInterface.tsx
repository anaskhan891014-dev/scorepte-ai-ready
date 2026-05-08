import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2 } from "lucide-react";
import { speak } from "@/lib/practiceUtils";
import { FeedbackCard } from "./FeedbackCard";
import { scorePTE, saveAttempt, ScoreResult } from "@/lib/scorePTE";
import { meta, FIBQ } from "@/lib/practiceBank";
import { toast } from "sonner";

type Props = {
  slug: string;
  q: FIBQ;
  variant: "dropdown" | "drag" | "type";
  audio?: boolean;
  audioText?: string;
  questionType: string;
  onNext: () => void;
};

const splitTemplate = (template: string) => {
  // splits "abc {0} def {1}" into [["abc "], 0, [" def "], 1]
  const parts: (string | number)[] = [];
  let last = 0;
  const re = /\{(\d+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template))) {
    if (m.index > last) parts.push(template.slice(last, m.index));
    parts.push(parseInt(m[1], 10));
    last = m.index + m[0].length;
  }
  if (last < template.length) parts.push(template.slice(last));
  return parts;
};

export const FIBInterface = ({ slug, q, variant, audio, audioText, questionType, onNext }: Props) => {
  const parts = useMemo(() => splitTemplate(q.template), [q.template]);
  const blanks = q.correct.length;
  const [answers, setAnswers] = useState<string[]>(Array(blanks).fill(""));
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  // For drag variant: track which bank words have been used
  const allOptions = useMemo(() => {
    if (variant === "drag" || variant === "dropdown") {
      const set = new Set<string>([...q.bank, ...q.correct]);
      return Array.from(set).sort(() => Math.random() - 0.5);
    }
    return [];
  }, [q.bank.join(","), q.correct.join(","), variant]);

  const setAt = (i: number, v: string) => setAnswers((a) => { const n = [...a]; n[i] = v; return n; });

  const submit = async () => {
    if (answers.some((a) => !a.trim())) { toast.error("Fill in all blanks."); return; }
    setScoring(true);
    try {
      const correctCount = answers.reduce((acc, a, i) => acc + (a.trim().toLowerCase() === q.correct[i].toLowerCase() ? 1 : 0), 0);
      const overall = Math.round((correctCount / blanks) * 90);
      const r = await scorePTE({
        questionType,
        questionPrompt: q.template + (audio ? `\n(Audio said: ${audioText})` : ""),
        userResponse: `User filled: ${answers.join(", ")}. Correct: ${q.correct.join(", ")}.`,
        criteria: ["Accuracy"],
        expected: q.correct,
      });
      const final: ScoreResult = { ...r, overall, breakdown: [{ label: "Accuracy", score: overall }] };
      setResult(final);
      const m = meta[slug];
      await saveAttempt({
        slug, name: m.name, category: m.category, score: overall,
        breakdown: final.breakdown,
        feedback: { strengths: final.strengths, improvements: final.improvements, modelAnswer: final.modelAnswer },
        userResponse: answers.join(" | "),
      });
    } catch (e: any) { toast.error("Something went wrong, please try again"); }
    finally { setScoring(false); }
  };

  const reset = () => { setAnswers(Array(blanks).fill("")); setResult(null); };

  if (result || scoring) return <FeedbackCard result={result} loading={scoring} onRetry={reset} onNext={onNext} />;

  const renderBlank = (i: number) => {
    if (variant === "dropdown") {
      return (
        <select
          key={`b${i}`}
          value={answers[i]}
          onChange={(e) => setAt(i, e.target.value)}
          className="inline-block mx-1 px-2 py-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">— select —</option>
          {allOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (variant === "type") {
      return (
        <input
          key={`b${i}`}
          value={answers[i]}
          onChange={(e) => setAt(i, e.target.value)}
          className="inline-block mx-1 w-28 px-2 py-1 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="…"
        />
      );
    }
    // drag = click-to-place
    return (
      <span
        key={`b${i}`}
        onClick={() => setAt(i, "")}
        className={`inline-block mx-1 min-w-[80px] px-3 py-1 rounded-md border border-dashed text-sm cursor-pointer ${
          answers[i] ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-muted-foreground"
        }`}
      >
        {answers[i] || "drop here"}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {audio && audioText && (
        <div className="glass rounded-2xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Audio</p>
            <p className="mt-1 text-sm text-muted-foreground">Listen, then fill the blanks.</p>
          </div>
          <Button variant="hero" onClick={() => speak(audioText)}><Volume2 className="h-4 w-4 mr-2" /> Play</Button>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Passage</p>
        <p className="text-base md:text-lg leading-loose">
          {parts.map((p, i) => (typeof p === "string" ? <span key={i}>{p}</span> : renderBlank(p)))}
        </p>
      </div>

      {variant === "drag" && (
        <div className="glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Word bank</p>
          <div className="flex flex-wrap gap-2">
            {allOptions.map((w) => {
              const used = answers.includes(w);
              return (
                <button
                  key={w}
                  disabled={used}
                  onClick={() => {
                    const idx = answers.findIndex((a) => !a);
                    if (idx >= 0) setAt(idx, w);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    used ? "bg-secondary/30 text-muted-foreground line-through" : "bg-secondary hover:bg-secondary/80 border border-border"
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Button variant="hero" size="lg" className="w-full" onClick={submit} disabled={scoring}>
        {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
      </Button>
    </div>
  );
};
