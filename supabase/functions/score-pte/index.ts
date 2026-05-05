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
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const system = `You are an expert PTE Academic examiner. Score the user's response strictly using the official PTE rubric on a 0-90 scale. Be encouraging but accurate. Always return concise, actionable feedback.`;

    const user = `QUESTION TYPE: ${questionType}
QUESTION / PROMPT: ${questionPrompt}
${expected ? `EXPECTED / CORRECT ANSWER: ${JSON.stringify(expected)}\n` : ""}USER RESPONSE: ${userResponse || "(no response)"}

Score this response. Use the criteria: ${criteria.join(", ")}.
Each criterion is 0-90. Overall is the rounded average.
Return concise feedback.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_pte_response",
              description: "Return PTE-style score with breakdown and feedback.",
              parameters: {
                type: "object",
                properties: {
                  overall: { type: "number", description: "Overall score 0-90" },
                  breakdown: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        score: { type: "number" },
                      },
                      required: ["label", "score"],
                      additionalProperties: false,
                    },
                  },
                  strengths: { type: "array", items: { type: "string" }, description: "2-4 specific strengths" },
                  improvements: { type: "array", items: { type: "string" }, description: "2-4 actionable improvements" },
                  modelAnswer: { type: "string", description: modelAnswer ? "A model answer for the user to learn from" : "A short ideal answer" },
                },
                required: ["overall", "breakdown", "strengths", "improvements", "modelAnswer"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "score_pte_response" } },
      }),
    });

    if (response.status === 429)
      return new Response(JSON.stringify({ error: "Rate limit hit, please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (response.status === 402)
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI scoring failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("No tool call in response");
    const result = JSON.parse(call.function.arguments);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("score-pte error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
