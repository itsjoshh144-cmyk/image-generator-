"use client";

import * as React from "react";
import { getHistoryStore } from "@/lib/image-gen/history";
import type { AspectRatio, GenerationRecord, GenerationSettings, ImageQuality, StylePreset } from "@/lib/image-gen/types";
import { useToast } from "./toast";

export interface GalleryItem {
  image: GenerationRecord["images"][number];
  record: GenerationRecord;
}

const DEFAULT_SETTINGS: GenerationSettings = {
  prompt: "",
  negativePrompt: "",
  aspectRatio: "1:1",
  quality: "standard",
  numImages: 1,
  seed: undefined,
  style: "none",
};

export function useImageGenerator() {
  const { toast } = useToast();
  const store = React.useMemo(() => getHistoryStore(), []);

  const [settings, setSettings] = React.useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [seedLocked, setSeedLocked] = React.useState(false);
  const [history, setHistory] = React.useState<GenerationRecord[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHistory(store.list());
    setHydrated(true);
  }, [store]);

  const gallery: GalleryItem[] = React.useMemo(
    () =>
      history.flatMap((record) => record.images.map((image) => ({ image, record }))),
    [history],
  );

  function updateSettings(patch: Partial<GenerationSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  async function runGeneration(requestSettings: GenerationSettings) {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestSettings),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Image generation failed.");
      }
      const record = data as GenerationRecord;
      store.add(record);
      setHistory(store.list());
      toast({
        variant: "success",
        title: "Images generated",
        description: `${record.images.length} image${record.images.length > 1 ? "s" : ""} ready.`,
      });
      if (!seedLocked) {
        updateSettings({ seed: undefined });
      }
      return record;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image generation failed.";
      setError(message);
      toast({ variant: "error", title: "Couldn't generate images", description: message });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  async function generate() {
    if (!settings.prompt.trim()) {
      setError("Enter a prompt to generate an image.");
      return;
    }
    await runGeneration(settings);
  }

  async function regenerate(record: GenerationRecord) {
    setSettings(record.settings);
    await runGeneration(record.settings);
  }

  async function enhancePrompt() {
    if (!settings.prompt.trim()) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: settings.prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Prompt enhancement failed.");
      }
      updateSettings({ prompt: data.enhanced });
      toast({ variant: "success", title: "Prompt enhanced" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prompt enhancement failed.";
      toast({ variant: "error", title: "Couldn't enhance prompt", description: message });
    } finally {
      setIsEnhancing(false);
    }
  }

  function deleteImage(imageId: string) {
    store.removeImage(imageId);
    setHistory(store.list());
    toast({ variant: "info", title: "Image deleted" });
  }

  function applyHistoryRecord(record: GenerationRecord) {
    setSettings(record.settings);
  }

  function randomizeSeed() {
    updateSettings({ seed: Math.floor(Math.random() * 2_147_483_647) });
  }

  return {
    settings,
    updateSettings,
    seedLocked,
    setSeedLocked,
    history,
    gallery,
    hydrated,
    isGenerating,
    isEnhancing,
    error,
    generate,
    regenerate,
    enhancePrompt,
    deleteImage,
    applyHistoryRecord,
    randomizeSeed,
  };
}

export type { AspectRatio, ImageQuality, StylePreset };
