import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Brain, ClipboardList, MessageCircle, Trophy, Flame, ListChecks, AlertTriangle, ArrowRight, TrendingUp, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MockHistoryCard } from "@/components/dashboard/MockHistoryCard";
import { TodayTasksCard } from "@/components/dashboard/TodayTasksCard";
import { MotivationCard } from "@/components/dashboard/MotivationCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SPEAKING = ["read-aloud","repeat-sentence","describe-image","retell-lecture","answer-short-question","respond-to-situation"];
const WRITING = ["summarize-written-text","write-essay","summarize-group-discussion"];
const READING = ["fib-rw","mcq-multiple-r","reorder","fib-r","mcq-single-r"];
const LISTENING = ["summarize-spoken-text","mcq-multiple-l","fib-l","highlight-correct-summary","mcq-single-l","select-missing-word","highlight-incorrect-words","write-from-dictation"];

const skillOf = (slug: string) =>
  SPEAKING.includes(slug) ? "Speaking" :
  WRITING.includes(slug) ? "Writing" :
  READING.includes(slug) ? "Reading" :
  LISTENING.includes(slug) ? "Listening" : "Other";

const Dashboard = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("practice_attempts").select("*").order("created_at", { ascending: false }).limit(500)
      .then(({ data }) => setAttempts(data || []));
  }, [user]);

  const total = attempts.length;
  const overall = total ? Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / total) : 0;

  const skillScore = (slugs: string[]) => {
    const xs = attempts.filter((a) => slugs.includes(a.question_slug));
    return xs.length ? Math.round(xs.reduce((s, a) => s + (a.score || 0), 0) / xs.length) : 0;
  };
  const skills = [
    { name: "Listening", v: skillScore(LISTENING) },
    { name: "Reading", v: skillScore(READING) },
    { name: "Speaking", v: skillScore(SPEAKING) },
    { name: "Writing", v: skillScore(WRITING) },
  ];

  // by question type
  const byType = new Map<string, { sum: number; count: number; name: string }>();
  attempts.forEach((a) => {
    const cur = byType.get(a.question_slug) || { sum: 0, count: 0, name: a.question_name };
    cur.sum += a.score || 0; cur.count += 1; byType.set(a.question_slug, cur);
  });
  const ranked = [...byType.values()].filter((x) => x.count >= 1).map((x) => ({ name: x.name, avg: Math.round(x.sum / x.count) }));
  const top3 = [...ranked].sort((a, b) => b.avg - a.avg).slice(0, 3);
  const bottom3 = [...ranked].sort((a, b) => a.avg - b.avg).slice(0, 3);

  // streak
  const days = new Set(attempts.map((a) => new Date(a.created_at).toISOString().slice(0, 10)));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (days.has(d)) streak++; else if (i > 0) break;
  }

  // 7-day chart
  const chart = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    const xs = attempts.filter((a) => a.created_at.slice(0, 10) === key);
    return { d: d.toLocaleDateString("en", { weekday: "short" }), s: xs.length ? Math.round(xs.reduce((s, a) => s + (a.score || 0), 0) / xs.length) : null };
  });
  const filled = chart.map((c, i, arr) => ({ ...c, s: c.s ?? (arr.slice(0, i).reverse().find((x) => x.s != null)?.s ?? overall) }));

  const todayCount = attempts.filter((a) => a.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
  const weekMins = Math.round(attempts.filter((a) => Date.now() - new Date(a.created_at).getTime() < 7 * 86400000).length * 1.5);

  const stats = [
    { label: "Predicted Score", value: overall || "—", hint: "based on practice", icon: Trophy },
    { label: "Practice Streak", value: `${streak} day${streak === 1 ? "" : "s"}`, hint: "Keep it up!", icon: Flame },
    { label: "Questions Done", value: total, hint: "across 22 types", icon: ListChecks },
    { label: "This Week", value: `${weekMins}m`, hint: "study time", icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Your Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Here's where you stand today.</p>
          </div>
          <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" /> Today: {todayCount} / 10 questions
          </div>
        </div>

        <MotivationCard />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, hint, icon: Icon }) => (
            <div key={label} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{label}</span><Icon className="h-4 w-4 text-accent" /></div>
              <div className="mt-3 text-2xl md:text-3xl font-display font-extrabold gradient-text">{value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {skills.map((s) => (
            <div key={s.name} className="glass rounded-2xl p-5">
              <p className="text-xs text-muted-foreground">{s.name}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-bold gradient-text">{s.v || "—"}</span>
                <span className="text-[11px] text-muted-foreground">/ 90</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: `${(s.v / 90) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Link to="/practice" className="glass rounded-2xl p-5 group hover:-translate-y-0.5 transition-all">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center glow"><Brain className="h-5 w-5 text-primary-foreground" /></div>
            <h3 className="mt-4 font-semibold">Start Practice</h3>
            <p className="text-sm text-muted-foreground mt-1">Pick any of 22 question types.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-accent">Go <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/mock-tests" className="glass rounded-2xl p-5 group hover:-translate-y-0.5 transition-all">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center glow"><ClipboardList className="h-5 w-5 text-primary-foreground" /></div>
            <h3 className="mt-4 font-semibold">Take Mock Test</h3>
            <p className="text-sm text-muted-foreground mt-1">Full 2h 15m sectioned simulation.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-accent">Start <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
          </Link>
          <Link to="/ai-tutor" className="glass rounded-2xl p-5 group hover:-translate-y-0.5 transition-all">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center glow"><MessageCircle className="h-5 w-5 text-primary-foreground" /></div>
            <h3 className="mt-4 font-semibold">Ask AI Tutor</h3>
            <p className="text-sm text-muted-foreground mt-1">Get instant strategies and feedback.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-accent">Chat <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-2xl p-5">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Score Progress</h3><span className="text-xs text-muted-foreground inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" />Last 7 days</span></div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filled} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="hsl(160 84% 39%)" /><stop offset="100%" stopColor="hsl(156 72% 60%)" /></linearGradient></defs>
                  <CartesianGrid stroke="hsl(220 30% 18%)" strokeDasharray="3 3" />
                  <XAxis dataKey="d" stroke="hsl(215 20% 70%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215 20% 70%)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 90]} />
                  <Tooltip contentStyle={{ background: "hsl(224 50% 10%)", border: "1px solid hsl(220 30% 18%)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="s" stroke="url(#g)" strokeWidth={3} dot={{ r: 4, fill: "hsl(156 72% 60%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <TodayTasksCard />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Strongest Question Types</h3>
            <ul className="mt-3 space-y-2">
              {top3.length === 0 && <p className="text-sm text-muted-foreground">Practice a few questions to see insights.</p>}
              {top3.map((r) => (
                <li key={r.name} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40">
                  <span className="text-sm">{r.name}</span>
                  <span className="text-sm font-bold text-accent tabular-nums">{r.avg}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Focus Areas</h3>
            <ul className="mt-3 space-y-2">
              {bottom3.length === 0 && <p className="text-sm text-muted-foreground">Practice a few questions to see insights.</p>}
              {bottom3.map((r) => (
                <li key={r.name} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40">
                  <span className="text-sm">{r.name}</span>
                  <span className="text-sm font-bold text-destructive tabular-nums">{r.avg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <MockHistoryCard />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
