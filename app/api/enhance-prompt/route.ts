import { NextRequest, NextResponse } from "next/server";
import { enhancePrompt } from "@/lib/image-gen/enhance";
import { checkPromptSafety } from "@/lib/image-gen/safety";
import { enhancePromptSchema } from "@/lib/image-gen/validation";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = enhancePromptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const safety = checkPromptSafety(parsed.data.prompt);
  if (!safety.allowed) {
    return NextResponse.json({ error: safety.reason }, { status: 400 });
  }

  try {
    const enhanced = await enhancePrompt(parsed.data.prompt);
    return NextResponse.json({ enhanced }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Prompt enhancement failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
