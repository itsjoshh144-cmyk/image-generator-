"use client";

import * as React from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_SOURCE_IMAGE_BYTES } from "@/lib/image-gen/types";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface SourceImageUploadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function SourceImageUpload({ value, onChange, onError, disabled }: SourceImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  function readFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError("Please upload a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      onError("Image must be 8MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.onerror = () => onError("Couldn't read that image. Please try again.");
    reader.readAsDataURL(file);
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-1.5 pr-3">
        <img src={value} alt="Source image to edit" className="size-9 rounded-md object-cover" />
        <span className="text-xs text-zinc-400">Editing this image</span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          disabled={disabled}
          className="ml-1 rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
          aria-label="Remove source image"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) readFile(file);
        }}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white",
          isDragging && "bg-white/10 text-white",
        )}
      >
        <ImagePlusIcon className="size-4" />
        Add image to edit
      </button>
    </>
  );
}
