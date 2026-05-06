import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { fullTest, miniTest, buildSectional, totalDurationSeconds, sectionLabel, type MockQ, type SectionKey } from "@/lib/mockBank";
import { formatTime } from "@/lib/practiceUtils";
import { ExamQuestion } from "@/components/mock/ExamQuestion";
import { scorePTE } from "@/lib/scorePTE";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Plan = { qs: MockQ[]; sectionStarts: number[]; sections: SectionKey[]; type: string; duration: number };

const buildPlan = (type: string): Plan => {
  if (type === "full") {
    const sections: SectionKey[] = ["sw", "r", "l"];
    const qs: MockQ[] = [];
    const starts: number[] = [];
    sections.forEach((s) => { starts.push(qs.length); qs.push(...fullTest[s]); });
    return { qs, sectionStarts: starts, sections, type, duration: totalDurationSeconds(qs) };
  }
  if (type.startsWith("sectional-")) {
    const s = type.split("-")[1] as SectionKey;
    const qs = buildSectional(s);
    return { qs, sectionStarts: [0], sections: [s], type, duration: totalDurationSeconds(qs) };
  }
  // mini
  return { qs: miniTest, sectionStarts: [0], sections: ["sw"], type, duration: 30 * 60 };
};

const sectionFor = (idx: number, plan: Plan): SectionKey => {
  let s: SectionKey = plan.sections[0];
  for (let i = 0; i < plan.sectionStarts.length; i++) {
    if (idx >= plan.sectionStarts[i]) s = plan.sections[i];
  }
  return s;
};

const MockExam = () => {
  const { type = "full" } = useParams();
  const nav = useNavigate();
  const plan = useMemo(() => buildPlan(type), [type]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<any[]>(() => Array(plan.qs.length).fill(undefined));
  const [endOpen, setEndOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [left, setLeft] = useState(plan.duration);
  const tick = useRef<number | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    tick.current = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, []);

  useEffect(() => {
    if (left === 0 && !submitting) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const q = plan.qs[idx];
  const currentSection = sectionFor(idx, plan);

  const setAnswer = (v: any) => {
    setAnswers((a) => { const n = [...a]; n[idx] = v; return n; });
  };

  const next = () => {
    if (idx < plan.qs.length - 1) setIdx(idx + 1);
    else setEndOpen(true);
  };

  // Lock back-nav across section boundaries (real PTE behavior)
  const prevAllowed = idx > 0 && sectionFor(idx - 1, plan) === currentSection;
  const prev = () => prevAllowed && setIdx(idx - 1);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setEndOpen(false);

    const details: any[] = [];
    const catScores: Record<string, number[]> = { speaking: [], writing: [], reading: [], listening: [] };

    try {
      for (let i = 0; i < plan.qs.length; i++) {
        const item = plan.qs[i];
        const ans = answers[i];
        let userResponse = "";
        if (typeof ans === "string") userResponse = ans;
        else if (Array.isArray(ans)) userResponse = ans.map((x) => (typeof x === "number" ? item.data.options?.[x] ?? x : x)).join(", ");
        else userResponse = "";

        // Skip scoring if empty
        let score = 0; let breakdown: any[] = []; let strengths: string[] = []; let improvements: string[] = []; let modelAnswer = "";
        if (userResponse.trim()) {
          try {
            const r = await scorePTE({
              questionType: item.name,
              questionPrompt: item.data.prompt || item.data.audioText || item.data.passage || item.data.question || item.data.transcript || "(see question)",
              userResponse,
              criteria: criteriaFor(item.category),
              expected: item.data.correct,
            });
            score = r.overall; breakdown = r.breakdown; strengths = r.strengths; improvements = r.improvements; modelAnswer = r.modelAnswer;
          } catch (e) {
            console.error("score err", e);
          }
        }
        catScores[item.category].push(score);
        details.push({ slug: item.slug, name: item.name, category: item.category, score, breakdown, strengths, improvements, modelAnswer, userResponse });
        setProgress(Math.round(((i + 1) / plan.qs.length) * 100));
      }

      const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
      const communicative = {
        speaking: avg(catScores.speaking),
        writing: avg(catScores.writing),
        reading: avg(catScores.reading),
        listening: avg(catScores.listening),
      };
      const all = [...catScores.speaking, ...catScores.writing, ...catScores.reading, ...catScores.listening];
      const overall = avg(all);

      // Enabling skills derived from speaking/writing breakdowns when present, else from overall
      const enabling = deriveEnabling(details, overall);

      const aiSummary = buildSummary(communicative, enabling);
      const duration = Math.round((Date.now() - startedAt.current) / 1000);

      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { toast.error("Please log in to save your result"); return; }
      const { data: ins, error } = await supabase
        .from("mock_test_results")
        .insert({
          user_id: u.user.id,
          test_type: plan.type,
          section: plan.sections[0],
          overall_score: overall,
          communicative,
          enabling,
          ai_summary: aiSummary,
          details,
          duration_seconds: duration,
        })
        .select("id")
        .single();
      if (error) throw error;
      nav(`/mock-tests/result/${ins.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to score test");
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xl">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500 grid place-items-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Scoring your test</h2>
          <p className="mt-2 text-sm text-slate-600">Gemini AI is evaluating each response against the official PTE rubric.</p>
          <div className="mt-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-xs text-slate-500">{progress}%</p>
        </div>
      </div>
    );
  }

  const lowTime = left < 5 * 60;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top bar */}
      <header className="h-14 sticky top-0 z-30 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-7 w-7 rounded-md bg-emerald-500 grid place-items-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-bold text-sm md:text-base">Score<span className="text-emerald-600">PTE</span></span>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="hidden sm:inline-block text-sm text-slate-700">{sectionLabel[currentSection]}</span>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          <span className="text-xs md:text-sm text-slate-600 tabular-nums">Q {idx + 1} of {plan.qs.length}</span>
          <span className={`tabular-nums font-bold text-base md:text-lg ${lowTime ? "text-rose-600 animate-pulse" : "text-slate-900"}`}>
            {formatTime(left)}
          </span>
          <Button size="sm" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setEndOpen(true)}>
            End Test
          </Button>
        </div>
      </header>

      {/* Question area */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-10">
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">{q.name}</p>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-0.5">Question {idx + 1}</h2>
            </div>
          </div>
          <ExamQuestion q={q} value={answers[idx]} onChange={setAnswer} />
        </div>
      </main>

      {/* Footer nav */}
      <footer className="bg-white border-t border-slate-200 px-4 md:px-8 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button variant="outline" disabled={!prevAllowed} onClick={prev} className="border-slate-300">
            Previous
          </Button>
          <Button onClick={next} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {idx === plan.qs.length - 1 ? "Submit Test" : "Next"}
          </Button>
        </div>
      </footer>

      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> End test now?
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Your answered questions will be scored. Unanswered questions will receive 0 marks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndOpen(false)} className="border-slate-300">Continue Test</Button>
            <Button onClick={submit} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "End & Score"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const criteriaFor = (cat: string) => {
  if (cat === "speaking") return ["Content", "Oral Fluency", "Pronunciation"];
  if (cat === "writing") return ["Content", "Grammar", "Vocabulary", "Spelling", "Written Discourse"];
  if (cat === "reading") return ["Accuracy"];
  return ["Listening Accuracy"];
};

const deriveEnabling = (details: any[], overall: number) => {
  const collect = (label: string) => {
    const all: number[] = [];
    details.forEach((d) => d.breakdown?.forEach((b: any) => {
      if (b.label?.toLowerCase().includes(label.toLowerCase())) all.push(b.score);
    }));
    return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : Math.max(10, overall - 5);
  };
  return {
    grammar: collect("grammar"),
    oral_fluency: collect("fluency"),
    pronunciation: collect("pronunciation"),
    spelling: collect("spelling"),
    vocabulary: collect("vocabulary"),
    written_discourse: collect("discourse"),
  };
};

const buildSummary = (c: any, e: any) => {
  const entries = Object.entries(c) as [string, number][];
  const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const weakest = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  return `Your strongest area is ${strongest[0]} (${strongest[1]}). Your weakest area is ${weakest[0]} (${weakest[1]}). Focus on targeted ${weakest[0]} drills and review enabling skills like ${Object.entries(e).sort((a, b) => (a[1] as number) - (b[1] as number))[0][0].replace("_", " ")} to lift your overall score.`;
};

export default MockExam;
