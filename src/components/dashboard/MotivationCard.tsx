import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Loader2 } from "lucide-react";

export const MotivationCard = () => {
  const { user } = useAuth();
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const key = `motivation-${user.id}-${new Date().toISOString().slice(0, 10)}`;
    const cached = localStorage.getItem(key);
    if (cached) { setText(cached); setLoading(false); return; }

    (async () => {
      const { data: attempts } = await supabase.from("practice_attempts").select("score,category").limit(50).order("created_at", { ascending: false });
      const avg = attempts?.length ? Math.round(attempts.reduce((s, a: any) => s + (a.score || 0), 0) / attempts.length) : 0;
      const stats = { recentAvg: avg, attempts: attempts?.length || 0 };
      try {
        const { data } = await supabase.functions.invoke("daily-motivation", { body: { stats } });
        const t = data?.text || "Keep practicing — consistency beats intensity!";
        setText(t); localStorage.setItem(key, t);
      } catch {
        setText("Keep practicing — consistency beats intensity!");
      } finally { setLoading(false); }
    })();
  }, [user]);

  return (
    <div className="glass rounded-2xl p-5 gradient-border">
      <div className="flex items-center gap-2 text-xs text-accent font-semibold uppercase tracking-wide">
        <Sparkles className="h-3.5 w-3.5" /> AI Coach · Today
      </div>
      <p className="mt-2 text-sm">
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : text}
      </p>
    </div>
  );
};
