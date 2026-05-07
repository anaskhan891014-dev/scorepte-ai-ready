import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { stats } = await req.json();
    const KEY = Deno.env.get("GEMINI_API_KEY");
    if (!KEY) throw new Error("GEMINI_API_KEY missing");

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{
              text: `You are ScorePTE AI Coach. Write ONE short motivational message (max 2 sentences, no markdown) for a PTE student. Reference their stats naturally. Stats: ${JSON.stringify(stats)}.`,
            }],
          }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 120 },
        }),
      },
    );
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "Keep going — every practice question gets you closer to your target score!";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
