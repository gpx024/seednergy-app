import { analysisResultSchema, coachingResultSchema } from "@/src/domain/photoCheck";
import { photoCheckFixtures, type PhotoCheckFixtureId } from "@/src/infrastructure/ai/photoCheckFixtures";
import type { CoachingInput, CoachingProvider } from "@/src/ports/CoachingProvider";
import type { PhotoCheckProvider, PhotoCheckProviderInput } from "@/src/ports/PhotoCheckProvider";
import type { VisionInput, VisionProvider } from "@/src/ports/VisionProvider";

function fixture(id: string) {
  const result = photoCheckFixtures[id as PhotoCheckFixtureId];
  if (!result) throw new Error(`Unknown photo-check fixture: ${id}`);
  return result;
}

export class FixturePhotoCheckProvider implements PhotoCheckProvider, VisionProvider, CoachingProvider {
  async check(input: PhotoCheckProviderInput) {
    if (!input.fixtureId) throw new Error("A fixture ID is required by the deterministic provider.");
    return { result: fixture(input.fixtureId) };
  }

  async analyse(input: VisionInput) {
    const { status, confidence, causes, promptVersion, modelVersion, costEstimate } = fixture(input.fixtureId);
    return analysisResultSchema.parse({ status, confidence, causes, promptVersion, modelVersion, costEstimate });
  }

  async generate(input: CoachingInput) {
    const { headline, explanation, actions, retakeGuidance } = fixture(input.fixtureId);
    return coachingResultSchema.parse({ headline, explanation, actions, retakeGuidance });
  }
}

export const fixturePhotoCheckProvider = new FixturePhotoCheckProvider();
