export type GeminiMessage = { role: "user" | "assistant"; content: string };

export const FRIENDLY_ERROR = "Something went wrong, please try again";
export const CHAT_ERROR = "Please try again";

const stripJsonFences = (text: string) => text.replace(/^```json\s*|^```\s*|\s*```$/g, "").trim();

export const parseGeminiJson = <T>(text: string): T => {
  const cleaned = stripJsonFences(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("Invalid Gemini JSON");
  }
};

export async function generateGeminiText({
  prompt,
  system,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error(FRIENDLY_ERROR);

  const finalPrompt = system ? `${system}\n\n${prompt}` : prompt;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      })
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(FRIENDLY_ERROR);
  const result = data.candidates[0].content.parts[0].text;
  return result as string;
}

export async function generateGeminiChat({
  messages,
  system,
}: {
  messages: GeminiMessage[];
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const conversation = messages
    .map((m) => `${m.role === "assistant" ? "Tutor" : "Student"}: ${m.content.slice(0, 3000)}`)
    .join("\n");
  return generateGeminiText({ prompt: conversation, system });
}

export async function generateGeminiJson<T>({
  prompt,
  system,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const text = await generateGeminiText({
    prompt: `${prompt}\n\nReturn valid JSON only. Do not wrap it in markdown fences.`,
    system,
  });
  return parseGeminiJson<T>(text);
}
