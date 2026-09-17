import { buildProviderPrompt } from "./style-prompts";
import { ProviderError, type ImageProvider, type ProviderGenerateInput, type ProviderGeneratedImage } from "./types";

const OPENAI_IMAGE_SIZES = ["1024x1024", "1536x1024", "1024x1536"] as const;
type OpenAiImageSize = (typeof OPENAI_IMAGE_SIZES)[number];

const SIZE_RATIOS: Record<OpenAiImageSize, number> = {
  "1024x1024": 1,
  "1536x1024": 1536 / 1024,
  "1024x1536": 1024 / 1536,
};

const ASPECT_RATIO_VALUE: Record<ProviderGenerateInput["aspectRatio"], number> = {
  "1:1": 1,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
};

function nearestOpenAiSize(aspectRatio: ProviderGenerateInput["aspectRatio"]): OpenAiImageSize {
  const target = ASPECT_RATIO_VALUE[aspectRatio];
  return OPENAI_IMAGE_SIZES.reduce((best, size) =>
    Math.abs(SIZE_RATIOS[size] - target) < Math.abs(SIZE_RATIOS[best] - target) ? size : best,
  );
}

function mapQuality(quality: ProviderGenerateInput["quality"]): "medium" | "high" {
  return quality === "high" ? "high" : "medium";
}

/**
 * OpenAI (gpt-image-1) backed provider. Requires IMAGE_API_KEY. The images
 * endpoint enforces OpenAI's own mandatory content-safety restrictions on
 * top of this app's pre-filter — we surface a clean error when it declines
 * a prompt rather than attempting to route around it.
 */
export class OpenAiImageProvider implements ImageProvider {
  readonly id = "openai";

  constructor(private readonly apiKey: string) {}

  async generate(input: ProviderGenerateInput): Promise<ProviderGeneratedImage[]> {
    const prompt = buildProviderPrompt(input.prompt, input.style);
    const fullPrompt = input.negativePrompt
      ? `${prompt}. Avoid the following in the image: ${input.negativePrompt}.`
      : prompt;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: fullPrompt,
        n: input.numImages,
        size: nearestOpenAiSize(input.aspectRatio),
        quality: mapQuality(input.quality),
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message = body?.error?.message ?? `Image provider request failed (${response.status}).`;
      const status = response.status === 400 || response.status === 422 ? 400 : 502;
      throw new ProviderError(message, status);
    }

    const body = (await response.json()) as { data?: Array<{ b64_json?: string }> };
    const images = body.data ?? [];

    if (images.length === 0) {
      throw new ProviderError("The image provider returned no images.", 502);
    }

    return images.map((image) => {
      if (!image.b64_json) {
        throw new ProviderError("The image provider returned an unexpected response shape.", 502);
      }
      return { url: `data:image/png;base64,${image.b64_json}`, seed: input.seed };
    });
  }
}
