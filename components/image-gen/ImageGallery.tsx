"use client";

import { CopyIcon, DownloadIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import type { GalleryItem } from "./use-image-generator";
import { EmptyState, ErrorBanner, LoadingSkeletonGrid } from "./states";

interface ImageGalleryProps {
  items: GalleryItem[];
  isGenerating: boolean;
  pendingCount: number;
  error: string | null;
  onOpen: (item: GalleryItem) => void;
  onDownload: (item: GalleryItem) => void;
  onCopyPrompt: (item: GalleryItem) => void;
  onRegenerate: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
}

export function ImageGallery({
  items,
  isGenerating,
  pendingCount,
  error,
  onOpen,
  onDownload,
  onCopyPrompt,
  onRegenerate,
  onDelete,
}: ImageGalleryProps) {
  const showEmpty = items.length === 0 && !isGenerating;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      {isGenerating && <LoadingSkeletonGrid count={pendingCount} />}

      {showEmpty && !error && <EmptyState />}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.image.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="absolute inset-0 h-full w-full cursor-zoom-in"
                aria-label="Open full-screen view"
              >
                <img
                  src={item.image.url}
                  alt={item.record.settings.prompt}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </button>

              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="pointer-events-auto flex justify-end gap-1 p-2">
                  <GalleryIconButton label="Download" onClick={() => onDownload(item)}>
                    <DownloadIcon className="size-3.5" />
                  </GalleryIconButton>
                  <GalleryIconButton label="Copy prompt" onClick={() => onCopyPrompt(item)}>
                    <CopyIcon className="size-3.5" />
                  </GalleryIconButton>
                  <GalleryIconButton label="Regenerate" onClick={() => onRegenerate(item)}>
                    <RefreshCwIcon className="size-3.5" />
                  </GalleryIconButton>
                  <GalleryIconButton label="Delete" onClick={() => onDelete(item)} destructive>
                    <Trash2Icon className="size-3.5" />
                  </GalleryIconButton>
                </div>
                <p className="pointer-events-none line-clamp-2 p-2.5 text-xs text-zinc-200">
                  {item.record.settings.prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryIconButton({
  label,
  onClick,
  children,
  destructive,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex size-7 items-center justify-center rounded-lg border border-white/10 bg-black/50 text-zinc-200 backdrop-blur-sm transition-colors hover:bg-black/70 ${
        destructive ? "hover:text-red-400" : "hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
