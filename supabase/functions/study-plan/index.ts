import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { inputs } = await req.json();
    const KEY = Deno.env.get("GEMINI_API_KEY");
    if (!KEY) throw new Error("GEMINI_API_KEY missing");

    const days = Math.max(
      1,
      Math.min(
        60,
        Math.ceil(
          (new Date(inputs.examDate).getTime() - Date.now()) / 86400000,
        ),
      ),
    );

    const system = `You are ScorePTE AI Coach. Build a personalized PTE Academic study plan covering all 22 question types (August 2025 format). Focus more time on the user's weak areas. Each task is concrete, time-bounded, and references real PTE question types. Return STRICT JSON only.`;

    const user = `Build a ${days}-day PTE study plan.
Current score: ${inputs.currentScore || "Never taken"}
Target score: ${inputs.targetScore}
Daily hours available: ${inputs.dailyHours}
Weak areas: ${(inputs.weakAreas || []).join(", ") || "balanced"}
Goal: ${inputs.goal}

Return JSON exactly:
{
  "summary": "2-3 sentence overview",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "focus": "main theme",
      "tasks": [
        { "id": "d1-m", "slot": "Morning", "title": "Read Aloud x5", "type": "Read Aloud", "minutes": 30, "difficulty": "Easy|Medium|Hard" },
        { "id": "d1-a", "slot": "Afternoon", "title": "...", "type": "...", "minutes": 45, "difficulty": "..." },
        { "id": "d1-e", "slot": "Evening", "title": "...", "type": "...", "minutes": 30, "difficulty": "..." }
      ]
    }
  ]
}
Generate exactly ${days} days starting from ${new Date().toISOString().slice(0, 10)}. Each day MUST have 3 tasks (Morning/Afternoon/Evening). Total daily minutes ~ ${parseInt(inputs.dailyHours) * 60}.`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.6, responseMimeType: "application/json", maxOutputTokens: 8000 },
        }),
      },
    );
    if (!r.ok) {
      const t = await r.text();
      console.error("Gemini error", r.status, t);
      return new Response(JSON.stringify({ error: `Gemini ${r.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const plan = JSON.parse(text.replace(/^```json\s*|\s*```$/g, "").trim());
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
