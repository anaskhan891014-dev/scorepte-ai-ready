import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Trophy } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Performance = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [mocks, setMocks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("practice_attempts").select("question_name,score,created_at").order("created_at", { ascending: true }).limit(500)
      .then(({ data }) => setAttempts(data || []));
    supabase.from("mock_test_results").select("test_type,overall_score,created_at,duration_seconds").order("created_at", { ascending: true }).limit(50)
      .then(({ data }) => setMocks(data || []));
  }, [user]);

  const practiceAvg = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length) : 0;
  const mockAvg = mocks.length ? Math.round(mocks.reduce((s, m) => s + (m.overall_score || 0), 0) / mocks.length) : 0;
  const chart = useMemo(() => mocks.map((m, i) => ({ name: `Test ${i + 1}`, score: m.overall_score || 0 })), [mocks]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your practice and mock test progress.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Metric icon={Trophy} label="Practice Average" value={practiceAvg ? `${practiceAvg}/90` : "—"} />
          <Metric icon={BarChart3} label="Mock Average" value={mockAvg ? `${mockAvg}/90` : "—"} />
          <Metric icon={TrendingUp} label="Total Attempts" value={attempts.length + mocks.length} />
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Mock Score Trend</h2>
            <span className="text-xs text-muted-foreground">{mocks.length} tests</span>
          </div>
          <div className="mt-4 h-72">
            {chart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 90]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Complete a mock test to see your trend.</div>
            )}
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
