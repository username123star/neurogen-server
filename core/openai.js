// core/openai.js
import fetch from "node-fetch";

/**
 * Low-level OpenAI caller
 * Engines prepare prompts — this only executes
 */
export async function callOpenAI({
  systemPrompt,
  userPrompt,
  memory = [],
  env,
}) {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...memory,
    { role: "user", content: userPrompt },
  ];

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6,
        max_tokens: 600,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${errText}`);
  }

  const data = await response.json();

  return (
    data?.choices?.[0]?.message?.content ??
    "I could not generate a response."
  );
}
