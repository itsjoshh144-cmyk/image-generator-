const ENHANCE_SYSTEM_PROMPT = `You expand short, casual image ideas into vivid, detailed prompts for an AI image generator.
Rules:
- Preserve the user's original subject and intent exactly. Never change what they asked for.
- Add concrete visual detail: composition, lighting, camera/lens or medium, mood, color palette, and level of detail.
- Output ONLY the rewritten prompt as plain text. No preamble, no quotes, no explanations, no markdown.
- Keep it to 2-4 sentences.
- Do not add safety disclaimers or refuse ordinary creative, fictional, or artistic requests.`;

async function enhanceWithGemini(basicPrompt: string): Promise<string> {
  const { getGeminiModel } = await import("@/lib/gemini");
  const model = getGeminiModel("gemini-2.5-flash");

  const result = await model.generateContent([
    { text: `${ENHANCE_SYSTEM_PROMPT}\n\nUser idea: "${basicPrompt}"\n\nRewritten prompt:` },
  ]);

  const text = result.response.text().trim();
  if (!text) throw new Error("Empty enhancement response");
  return text.replace(/^["']|["']$/g, "");
}

const DETAIL_BANK = [
  "captured with dramatic natural lighting and rich, balanced contrast",
  "rendered in sharp focus with intricate, believable detail",
  "framed with a strong sense of depth and cinematic composition",
  "with a carefully considered color palette that reinforces the mood",
];

function enhanceLocally(basicPrompt: string): string {
  const trimmed = basicPrompt.trim().replace(/\.$/, "");
  const detail = DETAIL_BANK[Math.abs(hashString(trimmed)) % DETAIL_BANK.length];
  return `${trimmed}, ${detail}. Ultra-detailed, professional quality, atmospheric and immersive.`;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Expands a short prompt into a more descriptive one. Uses Gemini when
 * GEMINI_API_KEY is configured; otherwise falls back to a deterministic
 * local template so the "Enhance Prompt" button still works with zero
 * configuration.
 */
export async function enhancePrompt(basicPrompt: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await enhanceWithGemini(basicPrompt);
    } catch {
      // Fall through to the local enhancer if Gemini is unavailable/misconfigured.
    }
  }
  return enhanceLocally(basicPrompt);
}
