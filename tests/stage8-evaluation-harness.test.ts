// @ts-nocheck The production evaluator is plain Node ESM and is tested through its public functions.
import { describe, expect, it } from "vitest";

import { calculateCostScenarios, summarizeEvaluation, validateManifest } from "../scripts/stage8-eval-core.mjs";

const manifest = {
  corpusVersion: "test-v1",
  reviewStatus: "expert-reviewed",
  thresholds: { minAgreementRate: 0.75, maxFalseReassuranceRate: 0, maxQuotaMismatchRate: 0, maxMeanCostUsd: 0.01 },
  monthlyCostScenarios: [{ name: "Expected", users: 1000, checksPerUser: 4 }],
  cases: [{ id: "one", image: "one.jpg", seedSlug: "cress", day: 3, checkType: "progress", expectedStatuses: ["on_track"] }]
};

describe("Stage 8 evaluation harness", () => {
  it("validates labelled manifests and rejects invalid statuses", () => {
    expect(validateManifest(manifest)).toBe(manifest);
    expect(() => validateManifest({ ...manifest, cases: [{ ...manifest.cases[0], expectedStatuses: ["invented"] }] })).toThrow(/expectedStatuses/);
  });

  it("calculates agreement, safety, quota, latency and cost evidence", () => {
    const report = summarizeEvaluation(manifest, [
      result("a", ["on_track"], "on_track", true, 0.001, 1000),
      result("b", ["issue_likely"], "issue_likely", true, 0.002, 2000),
      result("c", ["unclear"], "on_track", true, 0.003, 3000),
      result("d", ["rejected"], "rejected", false, 0.004, 4000)
    ]);
    expect(report.metrics.agreementRate).toBe(0.75);
    expect(report.metrics.falseReassuranceRate).toBe(0.25);
    expect(report.metrics.quotaMismatchRate).toBe(0);
    expect(report.metrics.meanCostUsd).toBe(0.0025);
    expect(report.metrics.p50LatencyMs).toBe(2000);
    expect(report.metrics.p95LatencyMs).toBe(4000);
    expect(report.gate.status).toBe("failed");
    expect(report.monthlyCostScenarios[0].estimatedMonthlyCostUsd).toBe(10);
  });

  it("cannot claim a pass from an unreviewed corpus", () => {
    const report = summarizeEvaluation({ ...manifest, reviewStatus: "unreviewed" }, [result("a", ["on_track"], "on_track", true, 0.001, 1000)]);
    expect(report.gate.status).toBe("insufficient_evidence");
  });

  it("models costs from measured mean cost without setting entitlement policy", () => {
    expect(calculateCostScenarios(0.0025, [{ name: "High", users: 10000, checksPerUser: 10 }])).toEqual([
      { name: "High", users: 10000, checksPerUser: 10, monthlyChecks: 100000, estimatedMonthlyCostUsd: 250 }
    ]);
  });
});

function result(id, expectedStatuses, actualStatus, quotaConsumed, costEstimateUsd, latencyMs) {
  return { id, expectedStatuses, actualStatus, quotaConsumed, costEstimateUsd, latencyMs };
}
