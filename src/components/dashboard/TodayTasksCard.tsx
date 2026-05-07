import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, Circle, CalendarDays, Flame } from "lucide-react";
import { Link } from "react-router-dom";

type Task = { id: string; slot: string; title: string; minutes: number; difficulty: string };

export const TodayTasksCard = () => {
  const { user } = useAuth();
  const [row, setRow] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("study_plans").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setRow(data));
  }, [user]);

  if (!row) return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /><h3 className="font-semibold">Today's Plan</h3></div>
      <p className="text-sm text-muted-foreground mt-3">No active study plan yet.</p>
      <Link to="/study-plan" className="mt-3 inline-block text-sm gradient-text font-semibold">Generate one →</Link>
    </div>
  );

  const today = new Date().toISOString().slice(0, 10);
  const days = row.plan?.days || [];
  const todayDay = days.find((d: any) => d.date === today) || days[0];
  const tasks: Task[] = todayDay?.tasks || [];
  const completed: string[] = row.completed_tasks || [];
  const dayIdx = days.findIndex((d: any) => d.date === today);
  const dayN = dayIdx >= 0 ? dayIdx + 1 : 1;

  const toggle = async (id: string) => {
    const next = completed.includes(id) ? completed.filter((x) => x !== id) : [...completed, id];
    setRow({ ...row, completed_tasks: next });
    await supabase.from("study_plans").update({ completed_tasks: next }).eq("id", row.id);
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /><h3 className="font-semibold">Today's Plan</h3></div>
        <span className="text-xs inline-flex items-center gap-1 text-accent"><Flame className="h-3 w-3" /> Day {dayN} of {days.length}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {tasks.map((t) => {
          const done = completed.includes(t.id);
          return (
            <li key={t.id}>
              <button onClick={() => toggle(t.id)} className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/40 text-left">
                {done ? <CheckCircle2 className="h-4 w-4 text-accent mt-0.5" /> : <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">{t.slot} · {t.minutes} min</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
