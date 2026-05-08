import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", target_score: "", target_exam_date: "" });
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,target_score,target_exam_date").eq("id", user.id).maybeSingle()
      .then(({ data }) => setForm({
        full_name: data?.full_name || "",
        target_score: data?.target_score ? String(data.target_score) : "",
        target_exam_date: data?.target_exam_date || "",
      }));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setErrorText("");
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name,
      target_score: form.target_score ? Number(form.target_score) : null,
      target_exam_date: form.target_exam_date || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { setErrorText("Something went wrong, please try again"); return; }
    toast.success("Settings saved");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your ScorePTE profile and target.</p>
        </div>

        <div className="glass rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <SettingsIcon className="h-4 w-4 text-accent" /> Profile
          </div>
          <div>
            <Label>Full name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5 bg-secondary/40 border-border" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Target score</Label>
              <Input type="number" min="10" max="90" value={form.target_score} onChange={(e) => setForm({ ...form, target_score: e.target.value })} className="mt-1.5 bg-secondary/40 border-border" />
            </div>
            <div>
              <Label>Target exam date</Label>
              <Input type="date" value={form.target_exam_date} onChange={(e) => setForm({ ...form, target_exam_date: e.target.value })} className="mt-1.5 bg-secondary/40 border-border" />
            </div>
          </div>
          {errorText && <p className="text-sm text-destructive">{errorText}</p>}
          <Button onClick={save} disabled={saving} variant="hero" className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
