const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/;

export interface ParsedDataUrl {
  mimeType: string;
  base64: string;
  byteLength: number;
}

/** Parses and validates a `data:image/...;base64,...` URL. Returns null if malformed or an unsupported type. */
export function parseImageDataUrl(dataUrl: string): ParsedDataUrl | null {
  const match = DATA_URL_PATTERN.exec(dataUrl.trim());
  if (!match) return null;
  const [, mimeType, base64] = match;
  // Base64 encodes 3 bytes per 4 chars; padding chars don't count.
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const byteLength = (base64.length / 4) * 3 - padding;
  return { mimeType, base64, byteLength };
}
