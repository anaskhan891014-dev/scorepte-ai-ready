import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, RotateCw, ChevronDown, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const MockResult = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("mock_test_results").select("*").eq("id", id).maybeSingle();
      setR(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <DashboardLayout><div className="p-8 text-muted-foreground">Loading…</div></DashboardLayout>;
  if (!r) return (
    <DashboardLayout>
      <div className="glass rounded-2xl p-8 text-center max-w-lg mx-auto">
        <h1 className="text-xl font-bold">Result not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong, please try again</p>
        <Button variant="hero" className="mt-5" onClick={() => nav("/mock-tests")}>Back to Mock Tests</Button>
      </div>
    </DashboardLayout>
  );

  const c = r.communicative || {};
  const e = r.enabling || {};
  const radarData = [
    { skill: "Listening", v: c.listening || 0 },
    { skill: "Reading", v: c.reading || 0 },
    { skill: "Speaking", v: c.speaking || 0 },
    { skill: "Writing", v: c.writing || 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="glass rounded-2xl p-6 md:p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center glow">
            <Trophy className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground uppercase tracking-widest">Overall Score</p>
          <p className="mt-1 text-6xl md:text-7xl font-display font-extrabold gradient-text tabular-nums">{r.overall_score}</p>
          <p className="text-sm text-muted-foreground">out of 90 · {labelFor(r.test_type)}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Communicative Skills</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(220 30% 22%)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215 20% 70%)", fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 90]} tick={{ fill: "hsl(215 20% 50%)", fontSize: 10 }} stroke="transparent" />
                  <Radar dataKey="v" stroke="hsl(160 84% 39%)" fill="hsl(160 84% 39%)" fillOpacity={0.45} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {radarData.map((d) => (
                <div key={d.skill} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
                  <span className="text-sm">{d.skill}</span>
                  <span className="font-bold gradient-text tabular-nums">{d.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Enabling Skills</h3>
            <div className="space-y-3">
              {[
                ["Grammar", e.grammar],
                ["Oral Fluency", e.oral_fluency],
                ["Pronunciation", e.pronunciation],
                ["Spelling", e.spelling],
                ["Vocabulary", e.vocabulary],
                ["Written Discourse", e.written_discourse],
              ].map(([label, v]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{label}</span>
                    <span className="font-semibold tabular-nums">{v || 0}</span>
                  </div>
                  <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-primary" style={{ width: `${((v as number) || 0) / 90 * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 gradient-border">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">AI Feedback</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.ai_summary}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Detailed Review</h3>
          <ul className="divide-y divide-border">
            {(r.details || []).map((d: any, i: number) => (
              <li key={i} className="py-3">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground tabular-nums w-6">{i + 1}</span>
                    <span className="text-sm font-medium truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold gradient-text tabular-nums">{d.score}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${open === i ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open === i && (
                  <div className="mt-3 ml-9 space-y-2 text-sm">
                    {d.userResponse && <p className="text-muted-foreground"><b className="text-foreground">Your answer:</b> {d.userResponse}</p>}
                    {d.strengths?.length > 0 && <p className="text-emerald-400">✓ {d.strengths.join(" · ")}</p>}
                    {d.improvements?.length > 0 && <p className="text-amber-400">→ {d.improvements.join(" · ")}</p>}
                    {d.modelAnswer && <p className="text-muted-foreground"><b className="text-foreground">Model:</b> {d.modelAnswer}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="hero" onClick={() => nav("/mock-tests")}>
            <RotateCw className="h-4 w-4 mr-2" /> Take Another Test
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

const labelFor = (t: string) => {
  if (t === "full") return "Full Mock Test";
  if (t === "mini") return "Mini Mock Test";
  if (t.startsWith("sectional-")) return "Sectional Mock";
  return t;
};

export default MockResult;
