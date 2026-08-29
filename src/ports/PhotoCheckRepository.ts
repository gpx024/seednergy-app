import type { PhotoCheckConfidence, PhotoCheckResult, PhotoCheckStatus, PhotoCheckType } from "@/src/domain/photoCheck";

export interface PhotoCheckRecord {
  id: string;
  cycleId: string;
  checkType: PhotoCheckType;
  storagePath: string | null;
  submittedAt: string;
  status: PhotoCheckStatus;
  confidence: PhotoCheckConfidence;
  result: PhotoCheckResult;
  quotaConsumed: boolean;
  retentionExpiresAt: string | null;
  errorCode: string | null;
}

export interface SavePhotoCheckInput {
  cycleId: string;
  checkType: PhotoCheckType;
  storagePath: string;
  result: PhotoCheckResult;
  occurredAt: string;
  clientEventId: string;
}

export interface PhotoCheckRepository {
  get(id: string): Promise<PhotoCheckRecord | null>;
  getHistory(cycleId: string): Promise<readonly PhotoCheckRecord[]>;
  delete(id: string): Promise<void>;
  save(input: SavePhotoCheckInput): Promise<PhotoCheckRecord>;
}
