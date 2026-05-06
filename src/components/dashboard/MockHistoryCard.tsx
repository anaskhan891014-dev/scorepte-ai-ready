import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatTime } from "@/lib/practiceUtils";

type Row = { id: string; test_type: string; overall_score: number; duration_seconds: number; created_at: string };

const labelFor = (t: string) =>
  t === "full" ? "Full" : t === "mini" ? "Mini" : t.startsWith("sectional-") ? `Sectional · ${t.split("-")[1].toUpperCase()}` : t;

export const MockHistoryCard = () => {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("mock_test_results")
        .select("id, test_type, overall_score, duration_seconds, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      setRows(data || []);
    })();
  }, []);

  const trend = [...rows].reverse().map((r, i) => ({ d: `#${i + 1}`, s: r.overall_score }));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-accent" />
          <h3 className="font-semibold">Mock Test History</h3>
        </div>
        <Link to="/mock-tests" className="text-xs text-accent inline-flex items-center gap-1 hover:underline">
          New test <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No mock tests yet. Take your first one to see history and trends here.</p>
      ) : (
        <>
          <div className="mt-4 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: -25, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="hsl(220 30% 18%)" strokeDasharray="3 3" />
                <XAxis dataKey="d" stroke="hsl(215 20% 70%)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 70%)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 90]} />
                <Tooltip contentStyle={{ background: "hsl(224 50% 10%)", border: "1px solid hsl(220 30% 18%)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="s" stroke="hsl(160 84% 39%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(156 72% 60%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="text-left">
                  <th className="py-2 font-medium">Date</th>
                  <th className="font-medium">Type</th>
                  <th className="font-medium text-right">Score</th>
                  <th className="font-medium text-right">Time</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2.5 text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="text-foreground">{labelFor(r.test_type)}</td>
                    <td className="text-right font-bold gradient-text tabular-nums">{r.overall_score}</td>
                    <td className="text-right text-muted-foreground tabular-nums">{formatTime(r.duration_seconds)}</td>
                    <td className="text-right">
                      <Link to={`/mock-tests/result/${r.id}`} className="text-xs text-accent hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
