import { supabase } from "@/integrations/supabase/client";
import { FRIENDLY_ERROR, generateGeminiJson } from "@/lib/gemini";

export type ScoreResult = {
  overall: number;
  breakdown: { label: string; score: number }[];
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
};

export type ScoreInput = {
  questionType: string;
  questionPrompt: string;
  userResponse: string;
  criteria: string[];
  modelAnswer?: boolean;
  expected?: any;
};

export async function scorePTE(input: ScoreInput): Promise<ScoreResult> {
  const system = "You are an expert PTE Academic examiner. Score strictly using the official PTE rubric on a 0-90 scale. Be encouraging, concise, and actionable.";
  const prompt = `QUESTION TYPE: ${input.questionType}
QUESTION / PROMPT: ${input.questionPrompt}
${input.expected ? `EXPECTED / CORRECT ANSWER: ${JSON.stringify(input.expected)}\n` : ""}USER RESPONSE: ${input.userResponse || "(no response)"}

Score this response. Use these criteria: ${input.criteria.join(", ")}.
Each criterion is 0-90. Overall is the rounded average unless the prompt says the answer has already been checked for accuracy.
${input.modelAnswer ? "Include a model answer the user can learn from." : "Include a short ideal answer or explanation."}

Return exactly:
{
  "overall": number,
  "breakdown": [{ "label": string, "score": number }],
  "strengths": [string],
  "improvements": [string],
  "modelAnswer": string
}`;

  try {
    const result = await generateGeminiJson<ScoreResult>({ prompt, system, temperature: 0.4, maxOutputTokens: 1800 });
    return normalizeScore(result, input.criteria);
  } catch {
    throw new Error(FRIENDLY_ERROR);
  }
}

const clampScore = (v: unknown) => Math.max(0, Math.min(90, Math.round(Number(v) || 0)));

const normalizeScore = (result: Partial<ScoreResult>, criteria: string[]): ScoreResult => ({
  overall: clampScore(result.overall),
  breakdown: Array.isArray(result.breakdown) && result.breakdown.length
    ? result.breakdown.map((b) => ({ label: String(b.label || "Score"), score: clampScore(b.score) }))
    : criteria.map((label) => ({ label, score: clampScore(result.overall) })),
  strengths: Array.isArray(result.strengths) && result.strengths.length ? result.strengths.map(String).slice(0, 4) : ["You completed the response."],
  improvements: Array.isArray(result.improvements) && result.improvements.length ? result.improvements.map(String).slice(0, 4) : ["Review the model answer and try again."],
  modelAnswer: String(result.modelAnswer || "Review the prompt, answer clearly, and keep your response focused on the task."),
});

export async function saveAttempt(args: {
  slug: string;
  name: string;
  category: "speaking" | "writing" | "reading" | "listening";
  score: number;
  breakdown: { label: string; score: number }[];
  feedback: { strengths: string[]; improvements: string[]; modelAnswer: string };
  userResponse: string;
}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("practice_attempts").insert({
    user_id: u.user.id,
    question_slug: args.slug,
    question_name: args.name,
    category: args.category,
    score: Math.round(args.score),
    breakdown: args.breakdown,
    feedback: args.feedback,
    user_response: args.userResponse,
  });
}
