import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Search, Shuffle, Volume2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getPracticeQuestion, meta, questionBank, type Difficulty } from "@/lib/practiceBank";
import { SpeakingInterface } from "@/components/practice/SpeakingInterface";
import { WritingInterface } from "@/components/practice/WritingInterface";
import { MCQInterface } from "@/components/practice/MCQInterface";
import { FIBInterface } from "@/components/practice/FIBInterface";
import { ReorderInterface } from "@/components/practice/ReorderInterface";
import { SelectMissingWord } from "@/components/practice/SelectMissingWord";
import { HighlightIncorrect } from "@/components/practice/HighlightIncorrect";
import { WriteFromDictation } from "@/components/practice/WriteFromDictation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { speak } from "@/lib/practiceUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PracticeSession = () => {
  const { slug = "", questionId } = useParams();
  const navigate = useNavigate();
  const m = meta[slug];
  const picked = getPracticeQuestion(slug, questionId);
  const q = picked?.data;

  const next = () => navigate(`/practice/${slug}`);

  if (!m || !picked) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Question not found.</p>
      </DashboardLayout>
    );
  }

  if (!questionId) return <QuestionList slug={slug} />;

  const renderInterface = () => {
    switch (slug) {
      case "read-aloud":
        return <SpeakingInterface slug={slug} prompt={q.prompt} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;
      case "describe-image":
        return <SpeakingInterface slug={slug} prompt={q.prompt} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;
      case "respond-to-situation":
        return <SpeakingInterface slug={slug} prompt={q.prompt} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Relevance", "Naturalness", "Fluency"]} questionType={m.name} onNext={next} />;
      case "repeat-sentence":
        return <SpeakingInterface slug={slug} audioOnly prompt={q.audioText} prepSeconds={0} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;
      case "retell-lecture":
        return <SpeakingInterface slug={slug} audioOnly prompt={q.audioText} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;
      case "answer-short-question":
        return <SpeakingInterface slug={slug} audioOnly prompt={q.audioText} prepSeconds={0} recordSeconds={q.record} criteria={["Accuracy"]} questionType={m.name} onNext={next} />;
      case "summarize-group-discussion":
        return <SpeakingInterface slug={slug} audioOnly prompt={q.audioText} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;

      case "summarize-written-text":
        return <WritingInterface slug={slug} prompt={q.prompt} minWords={q.minWords} maxWords={q.maxWords} minutes={q.minutes} criteria={["Content", "Grammar", "Vocabulary", "Structure"]} questionType={m.name} onNext={next} />;
      case "write-essay":
        return <WritingInterface slug={slug} prompt={q.prompt} minWords={q.minWords} maxWords={q.maxWords} minutes={q.minutes} criteria={["Content", "Grammar", "Vocabulary", "Structure"]} questionType={m.name} onNext={next} />;
      case "sst":
        return (
          <div className="space-y-5">
            <AudioBanner text={q.audioText} />
            <WritingInterface slug={slug} prompt={q.audioText} minWords={50} maxWords={70} minutes={10} criteria={["Content", "Grammar", "Vocabulary", "Structure"]} questionType={m.name} onNext={next} />
          </div>
        );

      case "rw-fib":
        return <FIBInterface slug={slug} q={q} variant="dropdown" questionType={m.name} onNext={next} />;
      case "r-fib":
        return <FIBInterface slug={slug} q={q} variant="drag" questionType={m.name} onNext={next} />;
      case "l-fib":
        return <FIBInterface slug={slug} q={q} variant="type" audio audioText={q.audioText || ""} questionType={m.name} onNext={next} />;

      case "r-mcq-multi":
        return <MCQInterface slug={slug} q={q} multi questionType={m.name} onNext={next} />;
      case "r-mcq-single":
        return <MCQInterface slug={slug} q={q} multi={false} questionType={m.name} onNext={next} />;
      case "l-mcq-multi":
        return <MCQInterface slug={slug} q={q} multi audio questionType={m.name} onNext={next} />;
      case "l-mcq-single":
      case "hcs":
        return <MCQInterface slug={slug} q={q} multi={false} audio questionType={m.name} onNext={next} />;

      case "reorder":
        return <ReorderInterface slug={slug} q={q} questionType={m.name} onNext={next} />;
      case "smw":
        return <SelectMissingWord slug={slug} q={q} questionType={m.name} onNext={next} />;
      case "hiw":
        return <HighlightIncorrect slug={slug} q={q} questionType={m.name} onNext={next} />;
      case "wfd":
        return <WriteFromDictation slug={slug} q={q} questionType={m.name} onNext={next} />;
      default:
        return <p>Unsupported question type.</p>;
    }
  };

  return (
    <DashboardLayout>
      <button onClick={() => navigate(`/practice/${slug}`)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </button>
      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">{m.category} · Question {picked.number}</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold">{m.name}</h1>
        </div>
      </div>
      <div className="mt-6 max-w-3xl mx-auto">{renderInterface()}</div>
    </DashboardLayout>
  );
};

const QuestionList = ({ slug }: { slug: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const m = meta[slug];
  const list = questionBank[slug] || [];
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | Difficulty>("All");
  const [attempted, setAttempted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase.from("practice_attempts").select("feedback,question_slug").eq("question_slug", slug).limit(1000)
      .then(({ data }) => {
        const ids = new Set<string>();
        (data || []).forEach((a: any) => {
          const qid = a.feedback?.questionId;
          if (qid) ids.add(qid);
        });
        setAttempted(ids);
      });
  }, [user, slug]);

  const filtered = useMemo(() => list.filter((q) => {
    const okDiff = difficulty === "All" || q.difficulty === difficulty;
    const okSearch = !search.trim() || `${q.number} ${q.preview}`.toLowerCase().includes(search.toLowerCase());
    return okDiff && okSearch;
  }), [list, search, difficulty]);

  const random = () => {
    const pool = filtered.length ? filtered : list;
    const q = pool[Math.floor(Math.random() * pool.length)];
    navigate(`/practice/${slug}/${q.id}`);
  };

  return (
    <DashboardLayout>
      <button onClick={() => navigate("/practice")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Practice
      </button>

      <div className="mt-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">{m.category}</p>
            <h1 className="mt-1 text-2xl md:text-3xl font-extrabold">{m.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{list.length} questions available</p>
          </div>
          <Button variant="hero" onClick={random} className="md:w-auto w-full"><Shuffle className="h-4 w-4 mr-2" /> Random Question</Button>
        </div>

        <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="pl-9 bg-secondary/40 border-border" />
          </div>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="h-10 rounded-md bg-background border border-input px-3 text-sm">
            {(["All", "Easy", "Medium", "Hard"] as const).map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((q) => {
            const done = attempted.has(q.id);
            return (
              <button key={q.id} onClick={() => navigate(`/practice/${slug}/${q.id}`)} className="glass rounded-2xl p-4 text-left hover:-translate-y-0.5 transition-all border border-border/60">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold">Question {q.number}</span>
                  {done ? <CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> : <span className={`text-[10px] px-2 py-1 rounded-full ${q.difficulty === "Easy" ? "bg-primary/10 text-accent" : q.difficulty === "Medium" ? "bg-secondary text-muted-foreground" : "bg-destructive/10 text-destructive"}`}>{q.difficulty}</span>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{q.preview}...</p>
                {done && <p className="mt-3 text-xs text-accent font-medium">Attempted</p>}
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

const AudioBanner = ({ text }: { text: string }) => (
  <div className="glass rounded-2xl p-6 flex items-center justify-between gap-4">
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Audio</p>
      <p className="mt-1 text-sm text-muted-foreground">Listen, then write your summary below (50–70 words).</p>
    </div>
    <Button variant="hero" onClick={() => speak(text)}><Volume2 className="h-4 w-4 mr-2" /> Play</Button>
  </div>
);

export default PracticeSession;
