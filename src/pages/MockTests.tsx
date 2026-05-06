import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ClipboardList, Layers, Zap, Mic, BookOpen, Headphones, Clock } from "lucide-react";

const MockTests = () => {
  const nav = useNavigate();
  const [section, setSection] = useState<"sw" | "r" | "l">("sw");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Mock Tests</h1>
          <p className="text-sm text-muted-foreground mt-1">Simulate the real PTE Academic exam — AI scored.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <Card
            icon={ClipboardList}
            title="Full Mock Test"
            time="2h 15m"
            desc="All 3 sections in real PTE order with full question counts and timing."
            cta="Start Full Test"
            onClick={() => nav("/mock-tests/run/full")}
            highlight
          />
          <Card
            icon={Layers}
            title="Sectional Mock"
            time="30m – 1h 35m"
            desc="Drill one section at a time with realistic timing."
            cta={`Start ${section.toUpperCase()} section`}
            onClick={() => nav(`/mock-tests/run/sectional-${section}`)}
            extra={
              <div className="mt-4 flex gap-2">
                <SectionPill active={section === "sw"} onClick={() => setSection("sw")} icon={Mic} label="S&W" />
                <SectionPill active={section === "r"} onClick={() => setSection("r")} icon={BookOpen} label="Reading" />
                <SectionPill active={section === "l"} onClick={() => setSection("l")} icon={Headphones} label="Listening" />
              </div>
            }
          />
          <Card
            icon={Zap}
            title="Mini Mock"
            time="30m"
            desc="Quick mixed-type practice. Perfect for daily warm-up."
            cta="Start Mini Test"
            onClick={() => nav("/mock-tests/run/mini")}
          />
        </div>

        <div className="glass rounded-2xl p-5 md:p-6">
          <h3 className="font-semibold">How AI scoring works</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Every response is graded by Google Gemini against the official PTE rubric. You'll get an overall score (10–90),
            communicative skills (Listening, Reading, Speaking, Writing) and enabling skills (Grammar, Oral Fluency,
            Pronunciation, Spelling, Vocabulary, Written Discourse).
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Card = ({ icon: Icon, title, time, desc, cta, onClick, highlight, extra }: any) => (
  <div className={`glass rounded-2xl p-6 flex flex-col ${highlight ? "ring-2 ring-primary/40 shadow-glow" : ""}`}>
    <div className="flex items-center justify-between">
      <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center glow">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> {time}
      </span>
    </div>
    <h3 className="mt-4 text-lg font-bold">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1 flex-1">{desc}</p>
    {extra}
    <Button variant="hero" className="mt-5 w-full" onClick={onClick}>{cta}</Button>
  </div>
);

const SectionPill = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${active ? "bg-gradient-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:text-foreground"}`}>
    <Icon className="h-3.5 w-3.5" /> {label}
  </button>
);

export default MockTests;
