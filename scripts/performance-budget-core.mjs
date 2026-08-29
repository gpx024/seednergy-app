import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export function measureExport(root) {
  const files = walk(root).map((path) => ({ path: relative(root, path), bytes: statSync(path).size }));
  const bundles = files.filter((file) => file.path.endsWith(".hbc"));
  const assets = files.filter((file) => file.path.split(sep).includes("assets"));
  const largestAsset = [...assets].sort((left, right) => right.bytes - left.bytes)[0] ?? null;
  return {
    fileCount: files.length,
    hermesBundleBytes: sum(bundles),
    assetsBytes: sum(assets),
    singleAssetBytes: largestAsset?.bytes ?? 0,
    largestAsset: largestAsset?.path ?? null,
    totalBytes: sum(files)
  };
}

export function evaluatePerformanceBudget(metrics, budget) {
  const comparisons = [
    ["hermesBundleBytes", "hermesBundleBytesMax"],
    ["assetsBytes", "assetsBytesMax"],
    ["singleAssetBytes", "singleAssetBytesMax"],
    ["totalBytes", "totalBytesMax"]
  ];
  const failures = comparisons
    .filter(([metric, limit]) => metrics[metric] > budget[limit])
    .map(([metric, limit]) => `${metric} is ${metrics[metric]} bytes, above ${budget[limit]} bytes.`);
  return { passed: failures.length === 0, failures };
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function sum(files) { return files.reduce((total, file) => total + file.bytes, 0); }
