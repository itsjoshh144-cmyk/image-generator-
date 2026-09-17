"use client";

import { SparklesIcon, WandSparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EXAMPLE_PROMPTS } from "@/lib/image-gen/example-prompts";
import { MAX_PROMPT_LENGTH } from "@/lib/image-gen/types";

interface PromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onEnhance: () => void;
  isGenerating: boolean;
  isEnhancing: boolean;
}

export function PromptBox({
  value,
  onChange,
  onGenerate,
  onEnhance,
  isGenerating,
  isEnhancing,
}: PromptBoxProps) {
  const remaining = MAX_PROMPT_LENGTH - value.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onGenerate();
          }
        }}
        placeholder="Describe anything… a bioluminescent forest at midnight, a vintage sports car on a coastal highway, a portrait of a cyberpunk samurai…"
        rows={4}
        className="min-h-32 resize-none border-none bg-transparent p-0 text-lg text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-xs tabular-nums",
              remaining < 100 ? "text-amber-400" : "text-zinc-500",
            )}
          >
            {value.length} / {MAX_PROMPT_LENGTH}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEnhance}
            disabled={!value.trim() || isEnhancing || isGenerating}
            className="text-zinc-300 hover:text-white"
          >
            <WandSparklesIcon className={cn(isEnhancing && "animate-pulse")} />
            {isEnhancing ? "Enhancing…" : "Enhance Prompt"}
          </Button>
        </div>

        <Button
          type="button"
          size="lg"
          onClick={onGenerate}
          disabled={!value.trim() || isGenerating}
          className="min-w-36 bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:from-violet-400 hover:to-fuchsia-400"
        >
          {isGenerating ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Generating…
            </>
          ) : (
            <>
              <SparklesIcon />
              Generate
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onChange(example)}
            className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-200"
          >
            {example.length > 48 ? `${example.slice(0, 48)}…` : example}
          </button>
        ))}
      </div>
    </div>
  );
}
