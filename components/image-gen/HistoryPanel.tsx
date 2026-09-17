"use client";

import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerationRecord } from "@/lib/image-gen/types";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  history: GenerationRecord[];
  onSelect: (record: GenerationRecord) => void;
}

export function HistoryPanel({ open, onClose, history, onSelect }: HistoryPanelProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-sm border-l border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">History</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:text-zinc-200"
            aria-label="Close history"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2 overflow-y-auto pb-8" style={{ maxHeight: "calc(100% - 3rem)" }}>
          {history.length === 0 && (
            <p className="pt-8 text-center text-sm text-zinc-500">
              Your past generations will appear here.
            </p>
          )}
          {history.map((record) => (
            <button
              key={record.id}
              onClick={() => {
                onSelect(record);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              {record.images[0] && (
                <img
                  src={record.images[0].url}
                  alt=""
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="line-clamp-2 text-xs font-medium text-zinc-200">
                  {record.settings.prompt}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {new Date(record.createdAt).toLocaleString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
