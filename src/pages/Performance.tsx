import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/lib/practiceBank";
import { generateGeminiText } from "@/lib/gemini";
import { BarChart3, Brain, Clock, Target, TrendingUp, Trophy } from "lucide-react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

const SKILLS = ["Speaking", "Writing", "Reading", "Listening"] as const;
const cap = (n: number) => Math.max(0, Math.min(90, Math.round(n || 0)));
const avg = (xs: number[]) => xs.length ? cap(xs.reduce((s, x) => s + x, 0) / xs.length) : 0;
const skillName = (category: string) => category ? category[0].toUpperCase() + category.slice(1) : "Other";

const Performance = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [mocks, setMocks] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("practice_attempts").select("question_slug,question_name,category,score,created_at,feedback").order("created_at", { ascending: true }).limit(1000)
      .then(({ data }) => setAttempts(data || []));
    supabase.from("mock_test_results").select("test_type,overall_score,communicative,created_at,duration_seconds").order("created_at", { ascending: true }).limit(100)
      .then(({ data }) => setMocks(data || []));
  }, [user]);

  const skillScores = useMemo(() => {
    const base: Record<string, number[]> = { Speaking: [], Writing: [], Reading: [], Listening: [] };
    attempts.forEach((a) => {
      const s = skillName(a.category);
      if (base[s]) base[s].push(a.score || 0);
    });
    mocks.forEach((m) => {
      const c = m.communicative || {};
      if (c.speaking) base.Speaking.push(c.speaking);
      if (c.writing) base.Writing.push(c.writing);
      if (c.reading) base.Reading.push(c.reading);
      if (c.listening) base.Listening.push(c.listening);
    });
    return SKILLS.map((name) => ({ name, score: avg(base[name]) }));
  }, [attempts, mocks]);

  const allScores = [...attempts.map((a) => a.score || 0), ...mocks.map((m) => m.overall_score || 0)];
  const predicted = avg(skillScores.map((s) => s.score).filter(Boolean).length ? skillScores.map((s) => s.score).filter(Boolean) : allScores);
  const best = allScores.length ? Math.max(...allScores) : 0;
  const latest = allScores.length ? allScores[allScores.length - 1] : 0;
  const totalMinutes = Math.round(attempts.length * 1.5 + mocks.reduce((s, m) => s + ((m.duration_seconds || 0) / 60), 0));

  const rows = useMemo(() => Object.entries(meta).map(([slug, info]) => {
    const xs = attempts.filter((a) => a.question_slug === slug);
    const scores = xs.map((a) => a.score || 0);
    const midpoint = Math.max(1, Math.floor(scores.length / 2));
    const early = avg(scores.slice(0, midpoint));
    const recent = avg(scores.slice(midpoint));
    const trend = scores.length < 2 ? "—" : recent > early ? "↑" : recent < early ? "↓" : "→";
    return { slug, name: info.name, category: skillName(info.category), attempts: xs.length, average: avg(scores), trend };
  }), [attempts]);

  const weakest = [...skillScores].filter((s) => s.score > 0).sort((a, b) => a.score - b.score)[0];
  const weakestType = [...rows].filter((r) => r.attempts > 0).sort((a, b) => a.average - b.average)[0];

  useEffect(() => {
    if (!weakest && !weakestType) return;
    const key = `performance-suggestion-${user?.id}-${weakest?.name}-${weakestType?.name}`;
    const cached = localStorage.getItem(key);
    if (cached) { setAiSuggestion(cached); return; }
    generateGeminiText({
      prompt: `You are ScorePTE AI Coach. Write one short suggestion under 22 words in this exact style: Your weakest area is X, practice more Y. Weak skill: ${weakest?.name || "unknown"}. Weak question type: ${weakestType?.name || "unknown"}.`,
    }).then((text) => {
      setAiSuggestion(text.trim());
      localStorage.setItem(key, text.trim());
    }).catch(() => setAiSuggestion(`Your weakest area is ${weakest?.name || "practice accuracy"}, practice more ${weakestType?.name || "mixed PTE questions"}.`));
  }, [user, weakest?.name, weakestType?.name]);

  const heatmap = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    const count = attempts.filter((a) => a.created_at.slice(0, 10) === key).length + mocks.filter((m) => m.created_at.slice(0, 10) === key).length;
    return { label: d.toLocaleDateString("en", { weekday: "short" }), count };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your predicted score, skills, activity, and question-type progress.</p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_2fr] gap-4">
          <div className="glass rounded-2xl p-6 gradient-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall predicted score</span>
              <Trophy className="h-5 w-5 text-accent" />
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-7xl font-display font-extrabold gradient-text tabular-nums">{predicted || "—"}</span>
              <span className="text-muted-foreground mb-3">/ 90</span>
            </div>
            <div className="mt-5 rounded-xl bg-secondary/40 p-4 flex items-start gap-3">
              <Brain className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/90">{aiSuggestion || "Practice a few questions to unlock your AI improvement suggestion."}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Metric icon={Clock} label="Total study time" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`} />
            <Metric icon={Target} label="Best score" value={best ? `${best}/90` : "—"} />
            <Metric icon={TrendingUp} label="Latest score" value={latest ? `${latest}/90` : "—"} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold">Skill scores</h2>
            <div className="mt-4 space-y-4">
              {skillScores.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1.5"><span>{s.name}</span><span className="text-accent font-semibold tabular-nums">{s.score || "—"}/90</span></div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-gradient-primary" style={{ width: `${(s.score / 90) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold">Skill radar</h2>
            <div className="mt-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillScores} outerRadius="72%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 90]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Radar dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold">Weekly activity</h2>
            <span className="text-xs text-muted-foreground">Darker blocks mean more practice</span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {heatmap.map((d) => (
              <div key={d.label} className="text-center">
                <div className={`h-16 rounded-lg border border-border grid place-items-center text-sm font-semibold ${d.count >= 8 ? "bg-primary text-primary-foreground" : d.count >= 4 ? "bg-primary/45 text-foreground" : d.count > 0 ? "bg-primary/20 text-foreground" : "bg-secondary/40 text-muted-foreground"}`}>{d.count}</div>
                <p className="mt-1 text-[11px] text-muted-foreground">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4 text-accent" /><h2 className="font-semibold">Question type breakdown</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead className="text-muted-foreground border-b border-border">
                <tr><th className="text-left py-3 font-medium">Question type</th><th className="text-left py-3 font-medium">Skill</th><th className="text-right py-3 font-medium">Attempts</th><th className="text-right py-3 font-medium">Average</th><th className="text-right py-3 font-medium">Trend</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.slug} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.category}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">{r.attempts}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-accent font-semibold">{r.average || "—"}</td>
                    <td className="py-3 text-right text-lg">{r.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Metric = ({ icon: Icon, label, value }: any) => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-accent" />
    </div>
    <p className="mt-3 text-2xl font-display font-extrabold gradient-text">{value}</p>
  </div>
);

export default Performance;
