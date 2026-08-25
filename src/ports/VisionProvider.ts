import type { AnalysisResult, PhotoCheckContext, PhotoCheckType } from "@/src/domain/photoCheck";

export interface VisionInput {
  fixtureId: string;
  checkType: PhotoCheckType;
  storagePath: string;
  context: PhotoCheckContext;
}

export interface VisionProvider { analyse(input: VisionInput): Promise<AnalysisResult>; }
