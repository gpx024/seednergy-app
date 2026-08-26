export function calculateGardenCardWidth(containerWidth: number, gap: number): number {
  if (!Number.isFinite(containerWidth) || !Number.isFinite(gap) || containerWidth <= 0 || gap < 0) return 0;
  return Math.max(0, (containerWidth - gap) / 2);
}
