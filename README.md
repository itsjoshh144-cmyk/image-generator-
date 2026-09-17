# AI Image Generator

A polished, production-ready AI image generator: describe anything, get a
high-quality image back. Dark, modern UI with full generation controls,
prompt enhancement, a full-screen gallery, and local history.

## Features

- Large prompt box with character counter, example prompts, and an
  **Enhance Prompt** button that expands a short idea into a detailed prompt
- **Upload an image to edit it**: attach a photo and describe the change
  ("add a sunset sky", "make it a watercolor painting") instead of
  generating from scratch
- Aspect ratio, quality, image count (1-4), negative prompt, seed, and 9
  style presets (photorealistic, cinematic, anime, illustration, 3D,
  product photography, fashion, fantasy, cyberpunk)
- Gallery with full-screen viewer, download, copy prompt, regenerate, and
  delete, with generation settings shown alongside each image
- Locally-stored history (no database required) so you can revisit past
  generations
- A pluggable image-provider abstraction, so swapping backends later is a
  one-file change

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local`.
3. To use a real image provider, set `IMAGE_API_KEY` (an OpenAI API key by
   default — see `lib/image-gen/providers/openai.ts`). **Leave it unset to
   run in mock mode**: a fully functional UI with generated placeholder
   images, no network calls or key required.
4. (Optional) Set `GEMINI_API_KEY` to power "Enhance Prompt" with an LLM.
   Without it, enhancement falls back to a local template expander.
5. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Architecture

- `lib/image-gen/providers/` — the `ImageProvider` interface plus a `mock`
  and an `openai` implementation. Swap providers via the `IMAGE_PROVIDER`
  env var, or add a new file here and register it in `providers/index.ts`.
- `app/api/generate-image` and `app/api/enhance-prompt` — server-side API
  routes; API keys never reach the client.
- `lib/image-gen/safety.ts` — a lightweight pre-filter that blocks clearly
  illegal/abusive requests (e.g. sexual content involving minors,
  instructions for serious wrongdoing) without censoring ordinary creative,
  fictional, or edgy prompts. The configured provider's own mandatory
  moderation still applies on top of this.
- `lib/image-gen/history.ts` — a `HistoryStore` interface backed by
  `localStorage` today. Implement the same interface against Supabase (or
  any other backend) and swap it in `getHistoryStore()` to persist history
  server-side later, with no changes needed elsewhere.
- `components/image-gen/` — the UI: prompt box, generation controls,
  gallery, full-screen viewer, history panel, toasts.
- `components/ui/` — small reusable primitives (button, input, select,
  dialog, etc.) built on Radix UI + Tailwind.

## Deploy to Vercel

```bash
vercel
```

Set `IMAGE_API_KEY` (and optionally `IMAGE_PROVIDER`, `GEMINI_API_KEY`) as
environment variables in the Vercel project settings.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Radix UI
