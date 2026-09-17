"use client";

import { ChevronDownIcon, LockIcon, LockOpenIcon, ShuffleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  ASPECT_RATIOS,
  MAX_IMAGES_PER_GENERATION,
  MAX_NEGATIVE_PROMPT_LENGTH,
  STYLE_PRESETS,
  STYLE_PRESET_LABELS,
  type AspectRatio,
  type GenerationSettings,
  type ImageQuality,
} from "@/lib/image-gen/types";

const ASPECT_RATIO_ICON_SIZE: Record<AspectRatio, string> = {
  "1:1": "size-4",
  "16:9": "h-2.5 w-4",
  "9:16": "h-4 w-2.5",
  "4:3": "h-3 w-4",
  "3:4": "h-4 w-3",
};

interface GenerationControlsProps {
  settings: GenerationSettings;
  onChange: (patch: Partial<GenerationSettings>) => void;
  seedLocked: boolean;
  onSeedLockedChange: (locked: boolean) => void;
  onRandomizeSeed: () => void;
}

export function GenerationControls({
  settings,
  onChange,
  seedLocked,
  onSeedLockedChange,
  onRandomizeSeed,
}: GenerationControlsProps) {
  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-xl shadow-black/30 backdrop-blur-xl sm:p-6">
      <h2 className="text-sm font-semibold text-zinc-200">Generation settings</h2>

      {/* Style presets */}
      <div>
        <label className="mb-2 block text-xs font-medium text-zinc-400">Style</label>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3">
          {STYLE_PRESETS.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onChange({ style })}
              className={cn(
                "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                settings.style === style
                  ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-200"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200",
              )}
            >
              {STYLE_PRESET_LABELS[style]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Aspect ratio */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">Aspect ratio</label>
          <Select
            value={settings.aspectRatio}
            onValueChange={(value) => onChange({ aspectRatio: value as AspectRatio })}
          >
            <SelectTrigger className="w-full border-white/10 bg-white/[0.02] text-zinc-200">
              <div className="flex items-center gap-2">
                <span
                  className={cn("rounded-[2px] border border-current", ASPECT_RATIO_ICON_SIZE[settings.aspectRatio])}
                />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((ratio) => (
                <SelectItem key={ratio} value={ratio}>
                  {ratio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">Quality</label>
          <div className="flex rounded-md border border-white/10 bg-white/[0.02] p-0.5">
            {(["standard", "high"] as ImageQuality[]).map((quality) => (
              <button
                key={quality}
                type="button"
                onClick={() => onChange({ quality })}
                className={cn(
                  "flex-1 rounded-[5px] py-1.5 text-xs font-medium capitalize transition-colors",
                  settings.quality === quality
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Number of images */}
      <div>
        <label className="mb-2 block text-xs font-medium text-zinc-400">Number of images</label>
        <div className="flex gap-1.5">
          {Array.from({ length: MAX_IMAGES_PER_GENERATION }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ numImages: n })}
              className={cn(
                "flex h-9 flex-1 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                settings.numImages === n
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Seed */}
      <div>
        <label className="mb-2 block text-xs font-medium text-zinc-400">Seed</label>
        <div className="flex gap-1.5">
          <Input
            type="number"
            placeholder="Random"
            value={settings.seed ?? ""}
            onChange={(e) =>
              onChange({ seed: e.target.value === "" ? undefined : Number(e.target.value) })
            }
            className="border-white/10 bg-white/[0.02] text-zinc-200 placeholder:text-zinc-600"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onRandomizeSeed}
            title="Randomize seed"
            className="shrink-0 border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/10"
          >
            <ShuffleIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onSeedLockedChange(!seedLocked)}
            title={seedLocked ? "Seed locked" : "Seed unlocked"}
            className={cn(
              "shrink-0 border-white/10 bg-white/[0.02] hover:bg-white/10",
              seedLocked ? "text-fuchsia-300" : "text-zinc-300",
            )}
          >
            {seedLocked ? <LockIcon /> : <LockOpenIcon />}
          </Button>
        </div>
      </div>

      {/* Negative prompt */}
      <Collapsible defaultOpen={Boolean(settings.negativePrompt)}>
        <CollapsibleTrigger className="group flex w-full items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-200">
          Negative prompt (optional)
          <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <Textarea
            value={settings.negativePrompt ?? ""}
            onChange={(e) =>
              onChange({ negativePrompt: e.target.value.slice(0, MAX_NEGATIVE_PROMPT_LENGTH) })
            }
            placeholder="blurry, low quality, watermark, extra fingers…"
            rows={2}
            className="min-h-16 border-white/10 bg-white/[0.02] text-sm text-zinc-200 placeholder:text-zinc-600"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
