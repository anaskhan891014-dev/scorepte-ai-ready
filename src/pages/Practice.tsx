import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Mic, MessageSquare, BookOpen, Headphones, PencilLine, ImageIcon,
  Megaphone, HelpCircle, FileText, Users, MessagesSquare, Shuffle,
  ListChecks, CheckSquare, Volume2, Type, AlignLeft, ArrowLeft, Sparkles,
} from "lucide-react";

type Difficulty = "Easy" | "Medium" | "Hard";
type Card = { slug: string; name: string; icon: any; difficulty: Difficulty; count: number; isNew?: boolean };

const sw: Card[] = [
  { slug: "read-aloud", name: "Read Aloud", icon: Mic, difficulty: "Easy", count: 240 },
  { slug: "repeat-sentence", name: "Repeat Sentence", icon: Volume2, difficulty: "Medium", count: 180 },
  { slug: "describe-image", name: "Describe Image", icon: ImageIcon, difficulty: "Hard", count: 120 },
  { slug: "retell-lecture", name: "Re-tell Lecture", icon: Megaphone, difficulty: "Hard", count: 100 },
  { slug: "answer-short-question", name: "Answer Short Question", icon: HelpCircle, difficulty: "Easy", count: 200 },
  { slug: "summarize-written-text", name: "Summarize Written Text", icon: FileText, difficulty: "Medium", count: 140 },
  { slug: "write-essay", name: "Write Essay", icon: PencilLine, difficulty: "Hard", count: 100 },
  { slug: "summarize-group-discussion", name: "Summarize Group Discussion", icon: Users, difficulty: "Hard", count: 100, isNew: true },
  { slug: "respond-to-situation", name: "Respond to a Situation", icon: MessagesSquare, difficulty: "Medium", count: 100, isNew: true },
];
const reading: Card[] = [
  { slug: "rw-fib", name: "R&W Fill in the Blanks", icon: Type, difficulty: "Medium", count: 160 },
  { slug: "r-mcq-multi", name: "Multiple Choice (Multiple)", icon: CheckSquare, difficulty: "Hard", count: 100 },
  { slug: "reorder", name: "Re-order Paragraphs", icon: Shuffle, difficulty: "Hard", count: 110 },
  { slug: "r-fib", name: "Reading Fill in the Blanks", icon: AlignLeft, difficulty: "Medium", count: 150 },
  { slug: "r-mcq-single", name: "Multiple Choice (Single)", icon: ListChecks, difficulty: "Easy", count: 120 },
];
const listening: Card[] = [
  { slug: "sst", name: "Summarize Spoken Text", icon: FileText, difficulty: "Hard", count: 100 },
  { slug: "l-mcq-multi", name: "Multiple Choice (Multiple)", icon: CheckSquare, difficulty: "Hard", count: 100 },
  { slug: "l-fib", name: "Fill in the Blanks", icon: Type, difficulty: "Medium", count: 130 },
  { slug: "hcs", name: "Highlight Correct Summary", icon: AlignLeft, difficulty: "Hard", count: 100 },
  { slug: "l-mcq-single", name: "Multiple Choice (Single)", icon: ListChecks, difficulty: "Easy", count: 100 },
  { slug: "smw", name: "Select Missing Word", icon: HelpCircle, difficulty: "Medium", count: 100 },
  { slug: "hiw", name: "Highlight Incorrect Words", icon: PencilLine, difficulty: "Medium", count: 100 },
  { slug: "wfd", name: "Write from Dictation", icon: Volume2, difficulty: "Easy", count: 220 },
];

const tabs = [
  { key: "sw", label: "Speaking & Writing", icon: MessageSquare, items: sw },
  { key: "r", label: "Reading", icon: BookOpen, items: reading },
  { key: "l", label: "Listening", icon: Headphones, items: listening },
];

const diffStyles: Record<Difficulty, string> = {
  Easy: "bg-emerald-500/15 text-emerald-400",
  Medium: "bg-amber-500/15 text-amber-400",
  Hard: "bg-rose-500/15 text-rose-400",
};

const Practice = () => {
  const [active, setActive] = useState("sw");
  const navigate = useNavigate();
  const current = tabs.find((t) => t.key === active)!;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Practice</h1>
          <p className="text-sm text-muted-foreground mt-1">All 22 PTE Academic question types — updated August 2025.</p>
        </div>

        <div className="flex justify-center md:justify-start">
          <div className="glass rounded-full p-1.5 inline-flex gap-1 overflow-x-auto max-w-full">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`px-4 md:px-5 py-2.5 rounded-full text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {current.items.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.slug}
                className="glass rounded-2xl p-5 flex flex-col animate-fade-in hover:-translate-y-0.5 transition-all"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="h-11 w-11 rounded-xl bg-secondary grid place-items-center ring-1 ring-primary/30">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${diffStyles[c.difficulty]}`}>
                      {c.difficulty}
                    </span>
                    {c.isNew && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-primary text-primary-foreground">
                        NEW 2025
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{c.count} questions available</p>
                <Button variant="hero" className="mt-5 w-full" onClick={() => navigate(`/practice/${c.slug}`)}>
                  Practice Now
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export const PracticeSession = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const all = [...sw, ...reading, ...listening];
  const item = all.find((c) => c.slug === slug);

  return (
    <DashboardLayout>
      <button onClick={() => navigate("/practice")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Practice
      </button>

      <div className="mt-6 max-w-3xl mx-auto text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-primary grid place-items-center glow">
          <Sparkles className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-5 text-3xl md:text-4xl font-extrabold">{item?.name || "Practice"}</h1>
        <p className="mt-3 text-muted-foreground">
          AI-powered practice for this question type is coming next. We'll plug in real-time scoring,
          feedback and adaptive difficulty here.
        </p>

        <div className="mt-8 gradient-border rounded-2xl">
          <div className="glass-strong rounded-2xl p-8 text-left">
            <p className="text-sm text-muted-foreground">Coming soon in this practice screen:</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Real PTE-style question delivery</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Live AI scoring with detailed metrics</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Personalized improvement feedback</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Progress tracking against your target score</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Practice;
