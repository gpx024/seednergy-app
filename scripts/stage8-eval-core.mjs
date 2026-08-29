const consumingStatuses = new Set(["on_track", "issue_likely", "harvest_likely", "not_ready"]);
const reassuringStatuses = new Set(["on_track", "harvest_likely"]);
const concernStatuses = new Set(["issue_likely", "not_ready"]);
const validStatuses = new Set([...consumingStatuses, "unclear", "rejected", "provider_error"]);
const validCheckTypes = new Set(["progress", "issue", "stage_review", "harvest_readiness", "follow_up"]);

export function validateManifest(input) {
  if (!input || typeof input !== "object") throw new Error("Evaluation manifest must be an object.");
  if (!Array.isArray(input.cases) || input.cases.length === 0) throw new Error("Evaluation manifest must contain at least one case.");
  const ids = new Set();
  for (const item of input.cases) {
    if (!item.id || ids.has(item.id)) throw new Error(`Evaluation case IDs must be present and unique: ${item.id ?? "missing"}.`);
    ids.add(item.id);
    if (!item.image || !item.seedSlug || !Number.isInteger(item.day) || item.day < 1) throw new Error(`${item.id} is missing image, seedSlug or a valid day.`);
    if (!validCheckTypes.has(item.checkType)) throw new Error(`${item.id} has an invalid checkType.`);
    if (!Array.isArray(item.expectedStatuses) || item.expectedStatuses.length === 0 || item.expectedStatuses.some((status) => !validStatuses.has(status) || status === "provider_error")) {
      throw new Error(`${item.id} must define one or more valid expectedStatuses.`);
    }
  }
  return input;
}

export function summarizeEvaluation(manifest, results) {
  const total = results.length;
  const count = (predicate) => results.filter(predicate).length;
  const rate = (value) => total === 0 ? null : Number((value / total).toFixed(4));
  const costs = results.map((item) => number(item.costEstimateUsd)).filter((value) => value !== null);
  const latencies = results.map((item) => number(item.latencyMs)).filter((value) => value !== null);
  const agreement = count((item) => item.expectedStatuses.includes(item.actualStatus));
  const falseReassurance = count((item) => item.expectedStatuses.every((status) => concernStatuses.has(status) || status === "unclear" || status === "rejected") && reassuringStatuses.has(item.actualStatus));
  const falseAlarm = count((item) => item.expectedStatuses.every((status) => reassuringStatuses.has(status)) && concernStatuses.has(item.actualStatus));
  const quotaMismatch = count((item) => typeof item.quotaConsumed === "boolean" && item.quotaConsumed !== consumingStatuses.has(item.actualStatus));
  const metrics = {
    cases: total,
    agreementRate: rate(agreement),
    falseReassuranceRate: rate(falseReassurance),
    falseAlarmRate: rate(falseAlarm),
    unclearRate: rate(count((item) => item.actualStatus === "unclear")),
    rejectionRate: rate(count((item) => item.actualStatus === "rejected")),
    providerErrorRate: rate(count((item) => item.actualStatus === "provider_error")),
    quotaMismatchRate: rate(quotaMismatch),
    totalCostUsd: sum(costs),
    meanCostUsd: costs.length === 0 ? null : Number((sum(costs) / costs.length).toFixed(8)),
    p50LatencyMs: percentile(latencies, 0.5),
    p95LatencyMs: percentile(latencies, 0.95)
  };
  const thresholdResult = assessThresholds(metrics, manifest.thresholds);
  const gate = manifest.reviewStatus !== "expert-reviewed"
    ? { status: "insufficient_evidence", reasons: ["The corpus is not marked expert-reviewed."] }
    : thresholdResult;
  return {
    corpusVersion: manifest.corpusVersion ?? "unspecified",
    reviewStatus: manifest.reviewStatus ?? "unreviewed",
    generatedAt: new Date().toISOString(),
    gate,
    metrics,
    monthlyCostScenarios: calculateCostScenarios(metrics.meanCostUsd, manifest.monthlyCostScenarios ?? []),
    results
  };
}

export function assessThresholds(metrics, thresholds) {
  if (!thresholds || Object.keys(thresholds).length === 0) return { status: "not_configured", reasons: ["No approved production thresholds are configured."] };
  const checks = [
    ["minAgreementRate", metrics.agreementRate, (actual, limit) => actual >= limit],
    ["maxFalseReassuranceRate", metrics.falseReassuranceRate, (actual, limit) => actual <= limit],
    ["maxFalseAlarmRate", metrics.falseAlarmRate, (actual, limit) => actual <= limit],
    ["maxProviderErrorRate", metrics.providerErrorRate, (actual, limit) => actual <= limit],
    ["maxQuotaMismatchRate", metrics.quotaMismatchRate, (actual, limit) => actual <= limit],
    ["maxMeanCostUsd", metrics.meanCostUsd, (actual, limit) => actual <= limit],
    ["maxP95LatencyMs", metrics.p95LatencyMs, (actual, limit) => actual <= limit]
  ];
  const reasons = [];
  for (const [name, actual, passes] of checks) {
    if (thresholds[name] !== undefined && (actual === null || !passes(actual, thresholds[name]))) reasons.push(`${name} failed: ${actual ?? "no data"} against ${thresholds[name]}.`);
  }
  return { status: reasons.length === 0 ? "passed" : "failed", reasons };
}

export function calculateCostScenarios(meanCostUsd, scenarios) {
  return scenarios.map((scenario) => {
    const monthlyChecks = Math.max(0, Number(scenario.users ?? 0)) * Math.max(0, Number(scenario.checksPerUser ?? 0));
    return {
      name: String(scenario.name ?? "Unnamed"),
      users: Number(scenario.users ?? 0),
      checksPerUser: Number(scenario.checksPerUser ?? 0),
      monthlyChecks,
      estimatedMonthlyCostUsd: meanCostUsd === null ? null : Number((monthlyChecks * meanCostUsd).toFixed(2))
    };
  });
}

function number(value) { const parsed = Number(value); return Number.isFinite(parsed) && parsed >= 0 ? parsed : null; }
function sum(values) { return Number(values.reduce((total, value) => total + value, 0).toFixed(8)); }
function percentile(values, ratio) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)];
}
