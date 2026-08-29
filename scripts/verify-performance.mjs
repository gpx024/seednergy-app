import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { tmpdir } from "node:os";

import { evaluatePerformanceBudget, measureExport } from "./performance-budget-core.mjs";

const prefix = "seednergy-performance-";
const exportDirectory = mkdtempSync(join(tmpdir(), prefix));
const resolvedTemporaryRoot = resolve(tmpdir());
const resolvedExportDirectory = resolve(exportDirectory);
if (!resolvedExportDirectory.startsWith(resolvedTemporaryRoot) || !basename(resolvedExportDirectory).startsWith(prefix)) throw new Error("Refusing to use an unexpected performance-export directory.");

try {
  const expoCli = resolve("node_modules", "expo", "bin", "cli");
  execFileSync(process.execPath, [expoCli, "export", "--platform", "android", "--output-dir", exportDirectory], {
    cwd: process.cwd(),
    env: { ...process.env, EXPO_NO_TELEMETRY: "1" },
    stdio: "inherit"
  });
  const budget = JSON.parse(readFileSync("performance-budget.json", "utf8")).androidProductionExport;
  const metrics = measureExport(exportDirectory);
  const result = evaluatePerformanceBudget(metrics, budget);
  console.log(JSON.stringify({ platform: "android", metrics, budget, passed: result.passed, failures: result.failures }, null, 2));
  if (!result.passed) process.exitCode = 1;
} finally {
  rmSync(resolvedExportDirectory, { recursive: true, force: true });
}
