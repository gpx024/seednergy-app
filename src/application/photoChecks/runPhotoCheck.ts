import { photoCheckContextSchema, photoCheckResultSchema, type PhotoCheckContext, type PhotoCheckResult, type PhotoCheckType } from "@/src/domain/photoCheck";
import type { CycleView } from "@/src/application/cycles/cycleView";
import type { CoachingProvider } from "@/src/ports/CoachingProvider";
import type { VisionProvider } from "@/src/ports/VisionProvider";

export function buildPhotoCheckContext(cycle: CycleView, lightCondition: string | null): PhotoCheckContext {
  const stage = cycle.seed.stages.find((candidate) => candidate.stage === cycle.stageId);
  if (!stage) throw new Error("The authored stage context is unavailable for this check.");
  return photoCheckContextSchema.parse({
    cycleId: cycle.cycle.id,
    seedId: cycle.seed.id,
    seedName: cycle.seed.commonName,
    seedContentVersion: cycle.seed.contentVersion,
    stageId: cycle.stageId,
    phase: cycle.phase,
    day: cycle.day,
    lightCondition,
    whatGoodLooksLike: stage.whatGoodLooksLike,
    commonProblems: stage.commonProblems,
    authoredPrompt: stage.photoCheckPrompt
  });
}

export async function runPhotoCheck(input: {
  fixtureId: string;
  checkType: PhotoCheckType;
  storagePath: string;
  context: PhotoCheckContext;
  visionProvider: VisionProvider;
  coachingProvider: CoachingProvider;
}): Promise<PhotoCheckResult> {
  const analysis = await input.visionProvider.analyse(input);
  const coaching = await input.coachingProvider.generate({ ...input, analysis });
  return photoCheckResultSchema.parse({ ...analysis, ...coaching });
}
