import type { PhotoCheckContext, PhotoCheckResult, PhotoCheckType } from "@/src/domain/photoCheck";

export interface PhotoCheckProviderInput {
  requestId: string;
  fixtureId?: string;
  checkType: PhotoCheckType;
  storagePath: string;
  context: PhotoCheckContext;
}

export interface PhotoCheckExecution {
  result: PhotoCheckResult;
  persistedCheckId?: string;
}

export interface PhotoCheckProvider {
  check(input: PhotoCheckProviderInput): Promise<PhotoCheckExecution>;
}
