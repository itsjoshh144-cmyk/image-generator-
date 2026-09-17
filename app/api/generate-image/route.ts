import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getImageProvider, ProviderError } from "@/lib/image-gen/providers";
import { checkPromptSafety } from "@/lib/image-gen/safety";
import { generationSettingsSchema } from "@/lib/image-gen/validation";
import type { GenerationRecord } from "@/lib/image-gen/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = generationSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }
  const settings = parsed.data;
  const hasSourceImage = Boolean(settings.sourceImage);

  const safety = checkPromptSafety(settings.prompt, { hasSourceImage });
  if (!safety.allowed) {
    return NextResponse.json({ error: safety.reason }, { status: 400 });
  }
  if (settings.negativePrompt) {
    const negativeSafety = checkPromptSafety(settings.negativePrompt, { hasSourceImage });
    if (!negativeSafety.allowed) {
      return NextResponse.json({ error: negativeSafety.reason }, { status: 400 });
    }
  }

  try {
    const provider = getImageProvider();
    const results = await provider.generate(settings);

    const record: GenerationRecord = {
      id: nanoid(),
      createdAt: new Date().toISOString(),
      provider: provider.id,
      settings,
      images: results.map((result) => ({
        id: nanoid(),
        url: result.url,
        seed: result.seed,
      })),
    };

    return NextResponse.json(record, { status: 200 });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Image generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
