import { photoCheckContextSchema, photoCheckResultSchema, type PhotoCheckContext, type PhotoCheckType } from "@/src/domain/photoCheck";
import type { CycleView } from "@/src/application/cycles/cycleView";
import type { PhotoCheckExecution, PhotoCheckProvider } from "@/src/ports/PhotoCheckProvider";

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
  requestId: string;
  fixtureId?: string;
  checkType: PhotoCheckType;
  storagePath: string;
  context: PhotoCheckContext;
  provider: PhotoCheckProvider;
}): Promise<PhotoCheckExecution> {
  const execution = await input.provider.check(input);
  return { ...execution, result: photoCheckResultSchema.parse(execution.result) };
}
