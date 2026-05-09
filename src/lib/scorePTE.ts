import { supabase } from "@/integrations/supabase/client";
import { FRIENDLY_ERROR, generateGeminiText, parseGeminiJson } from "@/lib/gemini";

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

const speakingTypes = new Set([
  "Read Aloud",
  "Repeat Sentence",
  "Describe Image",
  "Re-tell Lecture",
  "Answer Short Question",
  "Summarize Group Discussion",
  "Respond to a Situation",
]);

const writingTypes = new Set(["Summarize Written Text", "Write Essay", "Summarize Spoken Text"]);

export async function scorePTE(input: ScoreInput): Promise<ScoreResult> {
  const prompt = buildPrompt(input);

  try {
    const text = await generateGeminiText({ prompt });
    let parsed: Partial<ScoreResult>;
    try {
      parsed = parseGeminiJson<ScoreResult>(text);
    } catch {
      parsed = fallbackFromText(text, input.criteria);
    }
    return normalizeScore(parsed, input.criteria);
  } catch {
    throw new Error(FRIENDLY_ERROR);
  }
}

const buildPrompt = (input: ScoreInput) => {
  const schema = `Return JSON exactly like this:
{
  "overall": number,
  "breakdown": [{ "label": string, "score": number }],
  "strengths": [string],
  "improvements": [string],
  "modelAnswer": string
}`;

  if (speakingTypes.has(input.questionType) || input.criteria.some((c) => /pronunciation|fluency/i.test(c))) {
    return `You are a PTE examiner. Score this ${input.questionType} response: ${input.userResponse || "(no speech detected)"}
Original text/question: ${input.questionPrompt}
Give score out of 90, pronunciation feedback, fluency feedback, content feedback and model answer.
Format as JSON.
${schema}`;
  }

  if (writingTypes.has(input.questionType) || input.criteria.some((c) => /grammar|vocabulary|structure/i.test(c))) {
    return `You are a PTE examiner. Score this ${input.questionType} written response: ${input.userResponse || "(empty response)"}
Original text/question: ${input.questionPrompt}
Score grammar, vocabulary, content, structure out of 90. Give concise feedback and a model answer.
Format as JSON.
${schema}`;
  }

  return `You are a PTE examiner. Compare selected answers to correct answers for this ${input.questionType} question.
Original text/question: ${input.questionPrompt}
Selected answer: ${input.userResponse || "(empty response)"}
Correct answer: ${JSON.stringify(input.expected ?? "See prompt")}
Give score out of 90 and explain why the answer is correct or incorrect.
Format as JSON.
${schema}`;
};

const clampScore = (v: unknown) => Math.max(0, Math.min(90, Math.round(Number(v) || 0)));

const fallbackFromText = (text: string, criteria: string[]): Partial<ScoreResult> => {
  const match = text.match(/\b([0-8]?\d|90)\b/);
  const overall = match ? Number(match[1]) : 0;
  return {
    overall,
    breakdown: criteria.map((label) => ({ label, score: overall })),
    strengths: ["Your response was reviewed by AI."],
    improvements: ["Review the feedback and try again with a clearer, more complete answer."],
    modelAnswer: text || "Review the prompt and answer clearly.",
  };
};

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
  feedback: { strengths: string[]; improvements: string[]; modelAnswer: string; questionId?: string };
  userResponse: string;
}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const parts = typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean) : [];
  const questionId = parts[0] === "practice" && parts[2] ? parts[2] : args.feedback.questionId;
  await supabase.from("practice_attempts").insert({
    user_id: u.user.id,
    question_slug: args.slug,
    question_name: args.name,
    category: args.category,
    score: Math.round(args.score),
    breakdown: args.breakdown,
    feedback: { ...args.feedback, questionId },
    user_response: args.userResponse,
  });
}
