import type { GenerationRecord } from "@/lib/image-gen/types";

const STORAGE_KEY = "image-gen:history:v1";
const MAX_RECORDS = 24;

/**
 * Storage abstraction for generation history. `localStorageHistoryStore` is
 * the default (zero-config) implementation. To move to a database later
 * (e.g. Supabase), implement this same interface against your API/client
 * and swap the export in `getHistoryStore()` below — no calling code
 * changes.
 */
export interface HistoryStore {
  list(): GenerationRecord[];
  add(record: GenerationRecord): void;
  removeImage(imageId: string): void;
  clear(): void;
}

function readAll(): GenerationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: GenerationRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage full or unavailable (private browsing, quota exceeded) —
    // history is a convenience cache, so fail silently.
  }
}

export const localStorageHistoryStore: HistoryStore = {
  list() {
    return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  add(record) {
    const existing = readAll();
    const next = [record, ...existing].slice(0, MAX_RECORDS);
    writeAll(next);
  },
  removeImage(imageId) {
    const existing = readAll();
    const next = existing
      .map((record) => ({
        ...record,
        images: record.images.filter((image) => image.id !== imageId),
      }))
      .filter((record) => record.images.length > 0);
    writeAll(next);
  },
  clear() {
    writeAll([]);
  },
};

export function getHistoryStore(): HistoryStore {
  return localStorageHistoryStore;
}
