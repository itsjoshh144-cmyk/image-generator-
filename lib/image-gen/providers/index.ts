import { MockImageProvider } from "./mock";
import { OpenAiImageProvider } from "./openai";
import type { ImageProvider } from "./types";

export type { ImageProvider, ProviderGenerateInput, ProviderGeneratedImage } from "./types";
export { ProviderError } from "./types";

/**
 * Resolves which image-generation backend to use.
 *
 * - Set IMAGE_PROVIDER explicitly ("mock" | "openai") to pin a backend.
 * - Otherwise: falls back to "openai" when IMAGE_API_KEY is set, or "mock"
 *   (no network calls, no key required) so the full UI stays testable.
 *
 * To add a new backend: implement `ImageProvider` in its own file under
 * this directory, then add one case below.
 */
export function getImageProvider(): ImageProvider {
  const explicit = process.env.IMAGE_PROVIDER?.toLowerCase();
  const apiKey = process.env.IMAGE_API_KEY;
  const selected = explicit ?? (apiKey ? "openai" : "mock");

  switch (selected) {
    case "openai": {
      if (!apiKey) {
        throw new Error(
          "IMAGE_PROVIDER is set to 'openai' but IMAGE_API_KEY is missing. Set IMAGE_API_KEY in your environment.",
        );
      }
      return new OpenAiImageProvider(apiKey);
    }
    case "mock":
      return new MockImageProvider();
    default:
      throw new Error(`Unknown IMAGE_PROVIDER "${selected}". Use "mock" or "openai".`);
  }
}
