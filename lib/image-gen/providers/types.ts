import type { AspectRatio, ImageQuality, StylePreset } from "@/lib/image-gen/types";

export interface ProviderGenerateInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  numImages: number;
  seed?: number;
  style: StylePreset;
}

export interface ProviderGeneratedImage {
  /** Either a data: URL or an https URL the browser can load directly. */
  url: string;
  seed?: number;
}

/**
 * Implement this interface to plug in a new image-generation backend
 * (Stability, Replicate, Vercel AI Gateway, etc). Register it in
 * `lib/image-gen/providers/index.ts` and it becomes selectable via the
 * IMAGE_PROVIDER environment variable — nothing else in the app needs to
 * change.
 */
export interface ImageProvider {
  readonly id: string;
  generate(input: ProviderGenerateInput): Promise<ProviderGeneratedImage[]>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
