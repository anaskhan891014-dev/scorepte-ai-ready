import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Brain, ClipboardList, MessageCircle, Trophy, Flame, ListChecks, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const stats = [
  { label: "Overall Score", value: "72", hint: "+4 this week", icon: Trophy },
  { label: "Practice Streak", value: "12 days", hint: "Keep it up!", icon: Flame },
  { label: "Questions Attempted", value: "248", hint: "across 22 types", icon: ListChecks },
  { label: "Weak Areas", value: "3", hint: "Re-tell, Essay, RO", icon: AlertTriangle },
];

const data = [
  { d: "Mon", s: 58 }, { d: "Tue", s: 62 }, { d: "Wed", s: 65 },
  { d: "Thu", s: 64 }, { d: "Fri", s: 70 }, { d: "Sat", s: 71 }, { d: "Sun", s: 72 },
];

const recent = [
  { type: "Read Aloud", score: 82, when: "2h ago" },
  { type: "Write Essay", score: 68, when: "Yesterday" },
  { type: "Summarize Spoken Text", score: 75, when: "Yesterday" },
  { type: "Repeat Sentence", score: 88, when: "2 days ago" },
];

const Dashboard = () => (
  <DashboardLayout>
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold">Your Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's where you stand today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-display font-extrabold gradient-text">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Score Progress</h3>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="hsl(160 84% 39%)" />
                    <stop offset="100%" stopColor="hsl(156 72% 60%)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(220 30% 18%)" strokeDasharray="3 3" />
                <XAxis dataKey="d" stroke="hsl(215 20% 70%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 70%)" fontSize={12} tickLine={false} axisLine={false} domain={[40, 90]} />
                <Tooltip contentStyle={{ background: "hsl(224 50% 10%)", border: "1px solid hsl(220 30% 18%)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="s" stroke="url(#g)" strokeWidth={3} dot={{ r: 4, fill: "hsl(156 72% 60%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold">Recent Activity</h3>
          <ul className="mt-4 space-y-3">
            {recent.map((r) => (
              <li key={r.type + r.when} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/40">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.type}</p>
                  <p className="text-xs text-muted-foreground">{r.when}</p>
                </div>
                <span className="text-sm font-bold gradient-text tabular-nums">{r.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default Dashboard;
