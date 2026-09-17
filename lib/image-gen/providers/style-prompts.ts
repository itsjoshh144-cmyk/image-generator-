import type { StylePreset } from "@/lib/image-gen/types";

/**
 * Descriptive suffixes appended to the user's prompt so providers without a
 * native "style" parameter still produce on-style results.
 */
export const STYLE_PROMPT_SUFFIXES: Record<StylePreset, string> = {
  none: "",
  photorealistic:
    "photorealistic, shot on a full-frame DSLR, natural lighting, ultra-detailed, sharp focus, 8k",
  cinematic:
    "cinematic still, dramatic lighting, anamorphic lens flare, shallow depth of field, film grain, color graded",
  anime: "anime key visual, cel-shaded, vibrant colors, studio quality, clean line art",
  illustration: "digital illustration, painterly brushwork, rich color palette, concept art",
  "3d": "3D render, octane render, physically based rendering, studio lighting, high detail",
  "product-photography":
    "professional product photography, studio softbox lighting, clean seamless background, commercial quality",
  fashion: "high-fashion editorial photography, glossy magazine quality, dramatic studio lighting",
  fantasy: "epic fantasy art, intricate detail, magical atmosphere, dramatic sky, matte painting",
  cyberpunk: "cyberpunk aesthetic, neon-lit, rain-slicked streets, futuristic, high contrast",
};

export function buildProviderPrompt(prompt: string, style: StylePreset): string {
  const suffix = STYLE_PROMPT_SUFFIXES[style];
  return suffix ? `${prompt.trim()}, ${suffix}` : prompt.trim();
}
