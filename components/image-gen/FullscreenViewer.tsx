"use client";

import { CopyIcon, DownloadIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STYLE_PRESET_LABELS } from "@/lib/image-gen/types";
import type { GalleryItem } from "./use-image-generator";

interface FullscreenViewerProps {
  item: GalleryItem | null;
  onOpenChange: (open: boolean) => void;
  onDownload: (item: GalleryItem) => void;
  onCopyPrompt: (item: GalleryItem) => void;
  onRegenerate: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
}

export function FullscreenViewer({
  item,
  onOpenChange,
  onDownload,
  onCopyPrompt,
  onRegenerate,
  onDelete,
}: FullscreenViewerProps) {
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-4xl border-white/10 bg-zinc-950/95 p-0 sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">Generated image preview</DialogTitle>
        {item && (
          <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
            <div className="flex items-center justify-center bg-black/40 p-2">
              <img
                src={item.image.url}
                alt={item.record.settings.prompt}
                className="max-h-[75vh] w-full rounded-lg object-contain"
              />
            </div>
            <div className="flex flex-col gap-4 p-5">
              <div>
                <p className="text-xs font-medium text-zinc-500">Prompt</p>
                <p className="mt-1 text-sm text-zinc-200">{item.record.settings.prompt}</p>
              </div>

              {item.record.settings.negativePrompt && (
                <div>
                  <p className="text-xs font-medium text-zinc-500">Negative prompt</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {item.record.settings.negativePrompt}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="border-white/10 text-zinc-300">
                  {STYLE_PRESET_LABELS[item.record.settings.style]}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-300">
                  {item.record.settings.aspectRatio}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-300 capitalize">
                  {item.record.settings.quality}
                </Badge>
                {item.image.seed !== undefined && (
                  <Badge variant="outline" className="border-white/10 text-zinc-300">
                    seed {item.image.seed}
                  </Badge>
                )}
                <Badge variant="outline" className="border-white/10 text-zinc-300">
                  {item.record.provider}
                </Badge>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/[0.02] text-zinc-200 hover:bg-white/10"
                  onClick={() => onDownload(item)}
                >
                  <DownloadIcon /> Download
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/[0.02] text-zinc-200 hover:bg-white/10"
                  onClick={() => onCopyPrompt(item)}
                >
                  <CopyIcon /> Copy prompt
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/[0.02] text-zinc-200 hover:bg-white/10"
                  onClick={() => onRegenerate(item)}
                >
                  <RefreshCwIcon /> Regenerate
                </Button>
                <Button variant="destructive" onClick={() => onDelete(item)}>
                  <Trash2Icon /> Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
