"use client";

import * as React from "react";
import { HistoryIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptBox } from "@/components/image-gen/PromptBox";
import { GenerationControls } from "@/components/image-gen/GenerationControls";
import { ImageGallery } from "@/components/image-gen/ImageGallery";
import { FullscreenViewer } from "@/components/image-gen/FullscreenViewer";
import { HistoryPanel } from "@/components/image-gen/HistoryPanel";
import { useToast } from "@/components/image-gen/toast";
import { useImageGenerator, type GalleryItem } from "@/components/image-gen/use-image-generator";
import { downloadImage, promptToFilename } from "@/lib/image-gen/download";
import type { GenerationRecord } from "@/lib/image-gen/types";

export default function HomePage() {
  const {
    settings,
    updateSettings,
    seedLocked,
    setSeedLocked,
    history,
    gallery,
    isGenerating,
    error,
    generate,
    regenerate,
    enhancePrompt,
    isEnhancing,
    deleteImage,
    applyHistoryRecord,
    randomizeSeed,
  } = useImageGenerator();
  const { toast } = useToast();

  const [viewerItem, setViewerItem] = React.useState<GalleryItem | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  async function handleDownload(item: GalleryItem) {
    try {
      await downloadImage(item.image.url, promptToFilename(item.record.settings.prompt, item.image.id));
    } catch {
      toast({ variant: "error", title: "Download failed", description: "Please try again." });
    }
  }

  async function handleCopyPrompt(item: GalleryItem) {
    await navigator.clipboard.writeText(item.record.settings.prompt);
    toast({ variant: "info", title: "Prompt copied" });
  }

  async function handleRegenerate(item: GalleryItem) {
    setViewerItem(null);
    await regenerate(item.record);
  }

  function handleDelete(item: GalleryItem) {
    setViewerItem(null);
    deleteImage(item.image.id);
  }

  function handleSelectHistory(record: GenerationRecord) {
    applyHistoryRecord(record);
    toast({ variant: "info", title: "Settings restored", description: "Edit and generate again." });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <SparklesIcon className="size-4 text-fuchsia-400" />
          AI Image Generator
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHistoryOpen(true)}
          className="border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/10"
        >
          <HistoryIcon className="size-4" />
          History
          {history.length > 0 && (
            <span className="ml-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">
              {history.length}
            </span>
          )}
        </Button>
      </header>

      <section className="py-8 text-center sm:py-12">
        <h1 className="text-balance bg-linear-to-b from-white to-zinc-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          Describe anything. Create an image.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-sm text-zinc-500 sm:text-base">
          Turn detailed prompts into high-quality AI-generated images in seconds.
        </p>
      </section>

      <div className="mx-auto max-w-3xl">
        <PromptBox
          value={settings.prompt}
          onChange={(prompt) => updateSettings({ prompt })}
          onGenerate={generate}
          onEnhance={enhancePrompt}
          isGenerating={isGenerating}
          isEnhancing={isEnhancing}
          sourceImage={settings.sourceImage}
          onSourceImageChange={(sourceImage) => updateSettings({ sourceImage })}
          onSourceImageError={(message) =>
            toast({ variant: "error", title: "Couldn't add image", description: message })
          }
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <GenerationControls
          settings={settings}
          onChange={updateSettings}
          seedLocked={seedLocked}
          onSeedLockedChange={setSeedLocked}
          onRandomizeSeed={randomizeSeed}
        />

        <ImageGallery
          items={gallery}
          isGenerating={isGenerating}
          pendingCount={settings.numImages}
          error={error}
          onOpen={setViewerItem}
          onDownload={handleDownload}
          onCopyPrompt={handleCopyPrompt}
          onRegenerate={handleRegenerate}
          onDelete={handleDelete}
        />
      </div>

      <FullscreenViewer
        item={viewerItem}
        onOpenChange={(open) => !open && setViewerItem(null)}
        onDownload={handleDownload}
        onCopyPrompt={handleCopyPrompt}
        onRegenerate={handleRegenerate}
        onDelete={handleDelete}
      />

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistory}
      />
    </div>
  );
}
