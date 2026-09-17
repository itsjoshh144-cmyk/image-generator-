import { z } from "zod";
import {
  ASPECT_RATIOS,
  IMAGE_QUALITIES,
  MAX_IMAGES_PER_GENERATION,
  MAX_NEGATIVE_PROMPT_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_SOURCE_IMAGE_BYTES,
  STYLE_PRESETS,
} from "@/lib/image-gen/types";
import { parseImageDataUrl } from "@/lib/image-gen/data-url";

const sourceImageSchema = z
  .string()
  .refine((value) => parseImageDataUrl(value) !== null, {
    message: "Uploaded image must be a PNG, JPEG, or WebP file.",
  })
  .refine((value) => (parseImageDataUrl(value)?.byteLength ?? Infinity) <= MAX_SOURCE_IMAGE_BYTES, {
    message: "Uploaded image must be 8MB or smaller.",
  });

export const generationSettingsSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required.").max(MAX_PROMPT_LENGTH),
  negativePrompt: z.string().trim().max(MAX_NEGATIVE_PROMPT_LENGTH).optional(),
  aspectRatio: z.enum(ASPECT_RATIOS),
  quality: z.enum(IMAGE_QUALITIES),
  numImages: z.number().int().min(1).max(MAX_IMAGES_PER_GENERATION),
  seed: z.number().int().min(0).max(2_147_483_647).optional(),
  style: z.enum(STYLE_PRESETS),
  sourceImage: sourceImageSchema.optional(),
});

export const enhancePromptSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required.").max(MAX_PROMPT_LENGTH),
});
