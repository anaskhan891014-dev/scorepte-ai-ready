import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are ScorePTE AI Tutor, an expert PTE Academic coach. You know everything about the PTE Academic exam updated August 2025 format with 22 question types including the new Summarize Group Discussion and Respond to a Situation. You help students improve their scores by giving specific, actionable advice. You are friendly, encouraging and professional. Always give examples when explaining. When asked about scores, give honest assessment. You know all PTE scoring criteria, templates, strategies and tips. Format answers using clean markdown (bold, bullet lists, numbered steps). If the user asks something completely unrelated to PTE, English study, or test prep, politely redirect them back to PTE topics in 1-2 sentences.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages } = await req.json();
    const KEY = Deno.env.get("GEMINI_API_KEY");
    if (!KEY) throw new Error("GEMINI_API_KEY missing");

    const contents = (messages as Array<{ role: string; content: string }>).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.slice(0, 2000) }],
    }));

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
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
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
