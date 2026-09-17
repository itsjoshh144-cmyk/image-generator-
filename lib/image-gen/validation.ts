import { z } from "zod";
import {
  ASPECT_RATIOS,
  IMAGE_QUALITIES,
  MAX_IMAGES_PER_GENERATION,
  MAX_NEGATIVE_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
  STYLE_PRESETS,
} from "@/lib/image-gen/types";

export const generationSettingsSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required.").max(MAX_PROMPT_LENGTH),
  negativePrompt: z.string().trim().max(MAX_NEGATIVE_PROMPT_LENGTH).optional(),
  aspectRatio: z.enum(ASPECT_RATIOS),
  quality: z.enum(IMAGE_QUALITIES),
  numImages: z.number().int().min(1).max(MAX_IMAGES_PER_GENERATION),
  seed: z.number().int().min(0).max(2_147_483_647).optional(),
  style: z.enum(STYLE_PRESETS),
});

export const enhancePromptSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required.").max(MAX_PROMPT_LENGTH),
});
