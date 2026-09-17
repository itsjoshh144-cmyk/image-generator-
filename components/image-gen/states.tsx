import { AlertTriangleIcon, ImagesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-white/5">
        <ImagesIcon className="size-5 text-zinc-500" />
      </div>
      <p className="text-sm font-medium text-zinc-300">No images yet</p>
      <p className="max-w-sm text-sm text-zinc-500">
        Describe what you want to see above and hit Generate. Your creations will show up here.
      </p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
      <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-400" />
      <p className="text-sm text-red-200">{message}</p>
    </div>
  );
}

export function LoadingSkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(
            "aspect-square animate-pulse rounded-xl border border-white/10 bg-linear-to-br from-white/[0.06] to-white/[0.02]",
          )}
        />
      ))}
    </div>
  );
}
