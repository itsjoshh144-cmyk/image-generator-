import { ASPECT_RATIO_DIMENSIONS } from "@/lib/image-gen/aspect-ratio";
import { STYLE_PRESET_LABELS } from "@/lib/image-gen/types";
import type { ImageProvider, ProviderGenerateInput, ProviderGeneratedImage } from "./types";

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hueFromSeed(seed: number): number {
  return seed % 360;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length === 4) break;
  }
  if (current && lines.length < 4) lines.push(current);
  return lines;
}

function buildSvg(input: ProviderGenerateInput, seed: number, index: number): string {
  const { width, height } = ASPECT_RATIO_DIMENSIONS[input.aspectRatio];
  const hue = hueFromSeed(seed + index * 47);
  const hue2 = (hue + 60 + index * 20) % 360;
  const hue3 = (hue + 200) % 360;

  const styleLabel = STYLE_PRESET_LABELS[input.style];
  const lines = wrapText(input.prompt, 34);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue}, 70%, 45%)" />
      <stop offset="55%" stop-color="hsl(${hue2}, 65%, 38%)" />
      <stop offset="100%" stop-color="hsl(${hue3}, 60%, 20%)" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.25)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)" />
  <rect width="${width}" height="${height}" fill="url(#glow)" />
  <circle cx="${(seed * 13) % width}" cy="${(seed * 7) % height}" r="${Math.max(width, height) * 0.18}" fill="rgba(255,255,255,0.06)" />
  <circle cx="${width - ((seed * 11) % width)}" cy="${height - ((seed * 5) % height)}" r="${Math.max(width, height) * 0.12}" fill="rgba(0,0,0,0.12)" />
  <text x="50%" y="${height / 2 - lines.length * 22}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" fill="rgba(255,255,255,0.55)" letter-spacing="2">DEMO PREVIEW</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="50%" y="${height / 2 + i * 40}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32" font-weight="600" fill="rgba(255,255,255,0.92)">${escapeXml(line)}</text>`,
    )
    .join("\n  ")}
  <text x="50%" y="${height - 48}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" fill="rgba(255,255,255,0.6)">${escapeXml(styleLabel)} · ${escapeXml(input.aspectRatio)} · seed ${seed}</text>
</svg>`;
}

function svgToDataUrl(svg: string): string {
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(svg, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * No-network, no-key demo provider. Produces deterministic gradient
 * placeholders so the full UI (gallery, viewer, history, regenerate) can be
 * exercised without any external image API configured.
 */
export class MockImageProvider implements ImageProvider {
  readonly id = "mock";

  async generate(input: ProviderGenerateInput): Promise<ProviderGeneratedImage[]> {
    // Simulate realistic generation latency so loading states are visible.
    await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 700));

    const baseSeed = input.seed ?? hashString(input.prompt + input.style);

    return Array.from({ length: input.numImages }, (_, index) => {
      const seed = baseSeed + index;
      const svg = buildSvg(input, seed, index);
      return { url: svgToDataUrl(svg), seed };
    });
  }
}
