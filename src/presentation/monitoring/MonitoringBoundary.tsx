import { initializeMonitoring, wrapWithMonitoring } from "@/src/infrastructure/monitoring/sentry";

initializeMonitoring();

export const withMonitoring = wrapWithMonitoring;
