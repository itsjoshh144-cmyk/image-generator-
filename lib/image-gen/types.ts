export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const IMAGE_QUALITIES = ["standard", "high"] as const;
export type ImageQuality = (typeof IMAGE_QUALITIES)[number];

export const STYLE_PRESETS = [
  "none",
  "photorealistic",
  "cinematic",
  "anime",
  "illustration",
  "3d",
  "product-photography",
  "fashion",
  "fantasy",
  "cyberpunk",
] as const;
export type StylePreset = (typeof STYLE_PRESETS)[number];

export const STYLE_PRESET_LABELS: Record<StylePreset, string> = {
  none: "None",
  photorealistic: "Photorealistic",
  cinematic: "Cinematic",
  anime: "Anime",
  illustration: "Illustration",
  "3d": "3D Render",
  "product-photography": "Product Photography",
  fashion: "Fashion",
  fantasy: "Fantasy",
  cyberpunk: "Cyberpunk",
};

export const MAX_IMAGES_PER_GENERATION = 4;
export const MAX_PROMPT_LENGTH = 2000;
export const MAX_NEGATIVE_PROMPT_LENGTH = 500;
export const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;

export interface GenerationSettings {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  numImages: number;
  seed?: number;
  style: StylePreset;
  /** Optional data: URL of an uploaded image to edit instead of generating from scratch. */
  sourceImage?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  seed?: number;
}

export interface GenerationRecord {
  id: string;
  createdAt: string;
  provider: string;
  settings: GenerationSettings;
  images: GeneratedImage[];
}
