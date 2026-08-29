// @ts-nocheck The production checker is plain Node ESM and is tested through its public function.
import { describe, expect, it } from "vitest";

import { evaluatePerformanceBudget } from "../scripts/performance-budget-core.mjs";

const budget = { hermesBundleBytesMax: 100, assetsBytesMax: 200, singleAssetBytesMax: 80, totalBytesMax: 300 };

describe("release performance budget", () => {
  it("passes an export inside every budget", () => {
    expect(evaluatePerformanceBudget({ hermesBundleBytes: 90, assetsBytes: 180, singleAssetBytes: 70, totalBytes: 270 }, budget)).toEqual({ passed: true, failures: [] });
  });

  it("reports every exceeded budget", () => {
    const result = evaluatePerformanceBudget({ hermesBundleBytes: 101, assetsBytes: 201, singleAssetBytes: 81, totalBytes: 301 }, budget);
    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(4);
  });
});
