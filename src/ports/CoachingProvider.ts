import type { AnalysisResult, CoachingResult, PhotoCheckContext, PhotoCheckType } from "@/src/domain/photoCheck";

export interface CoachingInput {
  fixtureId: string;
  checkType: PhotoCheckType;
  analysis: AnalysisResult;
  context: PhotoCheckContext;
}

export interface CoachingProvider { generate(input: CoachingInput): Promise<CoachingResult>; }
