import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Download, RefreshCw, CheckCircle2, Circle, Sun, Sunset, Moon, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { FRIENDLY_ERROR, generateGeminiText, parseGeminiJson } from "@/lib/gemini";

type Task = { id: string; slot: string; title: string; type: string; minutes: number; difficulty: string };
type Day = { day: number; date: string; focus: string; tasks: Task[] };
type Plan = { summary: string; days: Day[]; rawText?: string };

const SLOT_ICON: Record<string, any> = { Morning: Sun, Afternoon: Sunset, Evening: Moon };

const StudyPlan = () => {
  const { user } = useAuth();
  const [planRow, setPlanRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [form, setForm] = useState({
    currentScore: "",
    targetScore: "65",
    examDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    dailyHours: "2",
    weakAreas: [] as string[],
    goal: "First attempt",
  });

  useEffect(() => { load(); }, [user]);
  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("study_plans").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setPlanRow(data); setLoading(false);
  };

  const toggleArea = (a: string) => setForm((f) => ({ ...f, weakAreas: f.weakAreas.includes(a) ? f.weakAreas.filter((x) => x !== a) : [...f.weakAreas, a] }));

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    setErrorText("");
    try {
      const days = Math.max(1, Math.min(60, Math.ceil((new Date(form.examDate).getTime() - Date.now()) / 86400000)));
      const text = await generateGeminiText({
        system: "You are ScorePTE AI Coach. Build personalized PTE Academic study plans covering all 22 question types. Focus more time on weak areas.",
        prompt: `Build a ${days}-day PTE study plan.
Current score: ${form.currentScore || "Never taken"}
Target score: ${form.targetScore}
Daily hours available: ${form.dailyHours}
Weak areas: ${form.weakAreas.join(", ") || "balanced"}
Goal: ${form.goal}

Return JSON exactly when possible:
{
  "summary": "2-3 sentence overview",
  "days": [{
    "day": 1,
    "date": "YYYY-MM-DD",
    "focus": "main theme",
    "tasks": [
      { "id": "d1-m", "slot": "Morning", "title": "Read Aloud x5", "type": "Read Aloud", "minutes": 30, "difficulty": "Easy|Medium|Hard" },
      { "id": "d1-a", "slot": "Afternoon", "title": "...", "type": "...", "minutes": 45, "difficulty": "..." },
      { "id": "d1-e", "slot": "Evening", "title": "...", "type": "...", "minutes": 30, "difficulty": "..." }
    ]
  }]
}
Generate exactly ${days} days starting from ${new Date().toISOString().slice(0, 10)}. Each day should have Morning, Afternoon, and Evening tasks. Total daily minutes should be about ${parseInt(form.dailyHours) * 60}.`,
        temperature: 0.6,
        maxOutputTokens: 8000,
      });
      let plan: Plan;
      try {
        plan = parseGeminiJson<Plan>(text);
      } catch {
        plan = { summary: "Your personalized study plan is ready.", days: [], rawText: text };
      }
      if (planRow) await supabase.from("study_plans").update({ is_active: false }).eq("id", planRow.id);
      const { data: row, error: insErr } = await supabase.from("study_plans")
        .insert({ user_id: user.id, inputs: form, plan, completed_tasks: [], is_active: true })
        .select().single();
      if (insErr) throw insErr;
      setPlanRow(row);
      toast.success("Your study plan is ready!");
    } catch {
      setErrorText(FRIENDLY_ERROR);
    } finally { setGenerating(false); }
  };

  const toggleTask = async (taskId: string) => {
    if (!planRow) return;
    const completed: string[] = planRow.completed_tasks || [];
    const next = completed.includes(taskId) ? completed.filter((x) => x !== taskId) : [...completed, taskId];
    setPlanRow({ ...planRow, completed_tasks: next });
    await supabase.from("study_plans").update({ completed_tasks: next, updated_at: new Date().toISOString() }).eq("id", planRow.id);
  };

  const downloadPDF = () => {
    if (!planRow) return;
    const plan: Plan = planRow.plan;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("ScorePTE — Your Study Plan", 14, 18);
    doc.setFontSize(10); doc.text(doc.splitTextToSize(plan.summary || "", 180), 14, 28);
    let y = 50;
    if (plan.rawText) {
      doc.text(doc.splitTextToSize(plan.rawText, 180), 14, y);
      doc.save("scorepte-study-plan.pdf");
      return;
    }
    (plan.days || []).forEach((d) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(12); doc.setTextColor(16, 185, 129);
      doc.text(`Day ${d.day} — ${d.date}  ·  ${d.focus}`, 14, y); y += 6;
      doc.setFontSize(10); doc.setTextColor(40);
      (d.tasks || []).forEach((t) => {
        const line = `  • ${t.slot}: ${t.title} (${t.minutes} min · ${t.difficulty})`;
        doc.text(doc.splitTextToSize(line, 180), 14, y); y += 6;
      });
      y += 4;
    });
    doc.save("scorepte-study-plan.pdf");
  };

  if (loading) return <DashboardLayout><div className="grid place-items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></DashboardLayout>;

  if (!planRow) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">AI Study Plan</h1>
            <p className="text-sm text-muted-foreground mt-1">Tell us about you. We'll build a day-by-day plan tailored to your goal.</p>
          </div>
          <div className="glass rounded-2xl p-5 md:p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Current PTE score</Label><Input value={form.currentScore} onChange={(e) => setForm({ ...form, currentScore: e.target.value })} placeholder="Never taken" /></div>
              <div><Label>Target score</Label>
                <select value={form.targetScore} onChange={(e) => setForm({ ...form, targetScore: e.target.value })} className="w-full mt-1 h-10 rounded-md bg-background border border-input px-3 text-sm">
                  {["50","58","65","70","79","85","90"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><Label>Target exam date</Label><Input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} /></div>
              <div><Label>Daily study hours</Label>
                <select value={form.dailyHours} onChange={(e) => setForm({ ...form, dailyHours: e.target.value })} className="w-full mt-1 h-10 rounded-md bg-background border border-input px-3 text-sm">
                  {["1","2","3","4"].map((s) => <option key={s} value={s}>{s} hr{s !== "1" ? "s" : ""}{s === "4" ? "+" : ""}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Weakest areas</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Speaking","Writing","Reading","Listening"].map((a) => (
                  <button key={a} onClick={() => toggleArea(a)} className={`px-3 py-1.5 rounded-full text-sm border transition ${form.weakAreas.includes(a) ? "bg-gradient-primary text-primary-foreground border-transparent" : "border-border hover:bg-secondary/60"}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Goal</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["First attempt","Improving score","Retaking exam"].map((g) => (
                  <button key={g} onClick={() => setForm({ ...form, goal: g })} className={`px-3 py-1.5 rounded-full text-sm border transition ${form.goal === g ? "bg-gradient-primary text-primary-foreground border-transparent" : "border-border hover:bg-secondary/60"}`}>{g}</button>
                ))}
              </div>
            </div>
            <Button onClick={generate} disabled={generating} className="w-full bg-gradient-primary text-primary-foreground" size="lg">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> AI is building your personalized plan...</> : <><Sparkles className="h-4 w-4" /> Generate My Study Plan</>}
            </Button>
            {errorText && <p className="text-sm text-destructive text-center">{errorText}</p>}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const plan: Plan = planRow.plan;
  const allTasks = (plan.days || []).flatMap((d) => d.tasks || []);
  const completed: string[] = planRow.completed_tasks || [];
  const pct = allTasks.length ? Math.round((completed.length / allTasks.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Your Study Plan</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{plan.summary}</p>
            {plan.rawText && <pre className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground glass rounded-2xl p-5 max-w-3xl">{plan.rawText}</pre>}
          </div>
          <div className="flex gap-2">
            <Button variant="glass" onClick={downloadPDF} size="sm"><Download className="h-4 w-4" /> PDF</Button>
            <Button variant="glass" onClick={() => setPlanRow(null)} size="sm"><RefreshCw className="h-4 w-4" /> Regenerate</Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Overall completion</span>
            <span className="gradient-text font-bold">{pct}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid gap-4">
          {(plan.days || []).map((d) => {
            const dayDone = d.tasks.every((t) => completed.includes(t.id));
            return (
              <div key={d.day} className={`glass rounded-2xl p-5 ${dayDone ? "ring-1 ring-accent/40" : ""}`}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  <h3 className="font-semibold">Day {d.day}</h3>
                  <span className="text-xs text-muted-foreground">· {d.date}</span>
                  <span className="ml-auto text-xs text-accent">{d.focus}</span>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {d.tasks.map((t) => {
                    const Icon = SLOT_ICON[t.slot] || Sun;
                    const done = completed.includes(t.id);
                    return (
                      <button key={t.id} onClick={() => toggleTask(t.id)} className={`text-left p-3 rounded-xl border transition ${done ? "bg-primary/10 border-accent/40" : "border-border hover:bg-secondary/40"}`}>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {t.slot}</div>
                        <div className="mt-1 flex items-start gap-2">
                          {done ? <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                          <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                        </div>
                        <div className="mt-2 flex gap-2 text-[10px]">
                          <span className="px-2 py-0.5 rounded-full bg-secondary">{t.minutes} min</span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary">{t.difficulty}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudyPlan;
