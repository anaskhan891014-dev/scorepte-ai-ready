import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase.functions.invoke("score-pte", { body: input });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as ScoreResult;
}

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
