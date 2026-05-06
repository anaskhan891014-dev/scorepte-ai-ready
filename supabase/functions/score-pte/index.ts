import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { questionType, questionPrompt, userResponse, criteria, modelAnswer, expected } = await req.json();
    const KEY = Deno.env.get("GEMINI_API_KEY");
    if (!KEY) throw new Error("GEMINI_API_KEY missing");

    const system = `You are an expert PTE Academic examiner. Score the user's response strictly using the official PTE rubric on a 0-90 scale. Be encouraging but accurate. Always return concise, actionable feedback. Respond ONLY with valid JSON matching the requested schema, no markdown fences.`;

    const user = `QUESTION TYPE: ${questionType}
QUESTION / PROMPT: ${questionPrompt}
${expected ? `EXPECTED / CORRECT ANSWER: ${JSON.stringify(expected)}\n` : ""}USER RESPONSE: ${userResponse || "(no response)"}

Score this response. Use the criteria: ${criteria.join(", ")}.
Each criterion is 0-90. Overall is the rounded average.
${modelAnswer ? "Include a model answer the user can learn from." : "Include a short ideal answer."}

Return JSON with this exact shape:
{
  "overall": number (0-90),
  "breakdown": [{ "label": string, "score": number }],
  "strengths": [string, ...] (2-4 items),
  "improvements": [string, ...] (2-4 items),
  "modelAnswer": string
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini error", response.status, t);
      return new Response(
        JSON.stringify({ error: `Gemini API error (${response.status})` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty Gemini response");
    const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
    const result = JSON.parse(cleaned);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("score-pte error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
