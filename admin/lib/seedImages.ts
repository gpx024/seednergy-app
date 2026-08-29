import { z } from "zod";

export const cmsSeedImageSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("bundled"), key: z.string().min(1) }),
  z.object({ kind: z.literal("remote"), url: z.url() })
]);

export type CmsSeedImage = z.infer<typeof cmsSeedImageSchema>;

export function parseSeedImages(value: unknown): CmsSeedImage[] {
  const result = z.array(cmsSeedImageSchema).safeParse(value);
  return result.success ? result.data : [];
}

export function addPrimarySeedImage(images: readonly CmsSeedImage[], url: string): CmsSeedImage[] {
  return [{ kind: "remote", url }, ...images.filter((image) => image.kind !== "remote" || image.url !== url)];
}

export function makePrimarySeedImage(images: readonly CmsSeedImage[], index: number): CmsSeedImage[] {
  const selected = images[index];
  if (!selected) return [...images];
  return [selected, ...images.filter((_, imageIndex) => imageIndex !== index)];
}

export function removeSeedImage(images: readonly CmsSeedImage[], index: number): CmsSeedImage[] {
  return images.filter((_, imageIndex) => imageIndex !== index);
}

export function getSeedContentStoragePath(url: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/seed-content/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    const path = decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
    return path.length > 0 && !path.startsWith("/") && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}
